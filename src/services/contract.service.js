import Contract from "../models/contract.model.js";
import contractRepository from "../repositories/contract.repository.js";

class ContractService {
  /**
   * 1. Lấy danh sách hợp đồng (Tối ưu hóa phân trang trực tiếp từ Database)
   */
  async getAll(
    filter = {},
    { page = 1, limit = 10, sort = { createdAt: -1 } } = {},
  ) {
    const skip = (page - 1) * limit;

    // Chạy song song 2 luồng: 1 luồng đếm tổng số, 1 luồng lấy dữ liệu (Tăng tốc độ x2)
    const [contracts, total] = await Promise.all([
      Contract.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate("phong_id nguoi_thue_id") // Tự động nối thông tin Phòng và Người thuê
        .lean(),
      Contract.countDocuments(filter), // Chỉ đếm số lượng, không tải data về RAM
    ]);

    return {
      contracts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * 2. Lấy hợp đồng theo trạng thái
   */
  async getContractsByStatus(status) {
    const validStatuses = ["KHẢ DỤNG", "HẾT HẠN"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(", ")}`,
      );
    }

    return Contract.find({ trang_thai: status })
      .populate("phong_id nguoi_thue_id")
      .lean();
  }

  /**
   * 3. Lấy hợp đồng sắp hết hạn (Mặc định là trong vòng 30 ngày tới)
   */
  async getExpiringContracts(daysUntilExpiration = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysUntilExpiration);

    return Contract.find({
      trang_thai: "KHẢ DỤNG", // Chỉ tìm những hợp đồng chưa hết hạn
      ngay_ket_thuc: {
        $gte: today, // Ngày kết thúc >= hôm nay
        $lte: futureDate, // Ngày kết thúc <= 30 ngày tới
      },
    })
      .populate("phong_id nguoi_thue_id")
      .lean();
  }

  /**
   * 4. Lấy thống kê tổng quan (Tối ưu hiệu năng đếm)
   */
  async getStatistics() {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30); // Tính sắp hết hạn trong 30 ngày

    // Dùng countDocuments: Bắt MongoDB đếm thay vì tải dữ liệu về Node.js đếm
    const [total, active, expiring] = await Promise.all([
      Contract.countDocuments(),
      Contract.countDocuments({ trang_thai: "KHẢ DỤNG" }),
      Contract.countDocuments({
        trang_thai: "KHẢ DỤNG",
        ngay_ket_thuc: {
          $gte: today,
          $lte: futureDate,
        },
      }),
    ]);

    return {
      total,
      active,
      expiring,
    };
  }

  // ==========================================
  // CÁC HÀM CRUD CƠ BẢN (Bổ sung để hoàn thiện vòng đời)
  // ==========================================

  async getById(id) {
    if (!id) return null;
    return Contract.findById(id).populate("phong_id nguoi_thue_id").lean();
  }

  async create(data) {
    const doc = await Contract.create(data);
    return doc.toObject();
  }

  async update(id, updateData) {
    return Contract.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async remove(id) {
    return Contract.findByIdAndDelete(id).lean();
  }
  // Tạo hợp đồng mới
  async createContract(contractData) {
    if (!contractData || typeof contractData !== "object") {
      const validationError = new Error("Invalid contract payload");
      validationError.name = "ValidationError";
      throw validationError;
    }

    return await contractRepository.createContract(contractData);
  }

  // Lấy tất cả hợp đồng với phân trang
  async getAllContracts(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;

      const contracts = await contractRepository.getAllContracts(filters);
      const total = contracts.length;

      const paginatedContracts = contracts.slice(skip, skip + limit);

      return {
        contracts: paginatedContracts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }

  // Lấy hợp đồng theo trạng thái
  async getContractsByStatus(status) {
    try {
      const validStatuses = ["active", "expired"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      return await contractRepository.getContractsByStatus(status);
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }

  // Lấy hợp đồng sắp hết hạn
  async getExpiringContracts() {
    try {
      return await contractRepository.getExpiringContracts();
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }

  // Lấy thống kê
  async getStatistics() {
    try {
      const allContracts = await contractRepository.getAllContracts();
      const activeContracts =
        await contractRepository.getContractsByStatus("active");
      const expiringContracts = await contractRepository.getExpiringContracts();

      return {
        total: allContracts.length,
        active: activeContracts.length,
        expiring: expiringContracts.length,
      };
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }

  // Thanh lý hợp đồng
  async terminateContract(contractId, terminationData) {
    try {
      // Validation: check payload
      if (!terminationData || typeof terminationData !== "object") {
        const validationError = new Error("Invalid termination payload");
        validationError.name = "ValidationError";
        throw validationError;
      }

      // Validation: check ngay_thanh_ly is provided
      if (!terminationData.ngay_thanh_ly) {
        const validationError = new Error("ngay_thanh_ly is required");
        validationError.name = "ValidationError";
        throw validationError;
      }

      // Validation: parse and validate termination date
      const ngayThanhLy = new Date(terminationData.ngay_thanh_ly);
      if (isNaN(ngayThanhLy.getTime())) {
        const validationError = new Error(
          "ngay_thanh_ly định dạng không hợp lệ",
        );
        validationError.name = "ValidationError";
        throw validationError;
      }

      // Get contract first to validate date range
      const contract = await contractRepository.getContractById(contractId);

      if (!contract) {
        const notFoundError = new Error("Hợp đồng không được tìm thấy");
        notFoundError.name = "NotFoundError";
        throw notFoundError;
      }

      // Validation: check if already terminated
      if (contract.trang_thai === "terminated") {
        const validationError = new Error(
          "Hợp đồng đã thanh lý trước đó, không thể thanh lý lại",
        );
        validationError.name = "ValidationError";
        throw validationError;
      }

      // Validation: ngay_thanh_ly must be between ngay_bat_dau and ngay_ket_thuc
      const ngayBatDau = new Date(contract.ngay_bat_dau);
      const ngayKetThuc = new Date(contract.ngay_ket_thuc);
      const ngayThanhLyCompare = new Date(ngayThanhLy);

      // Normalize all dates to compare only date part (not time)
      ngayBatDau.setHours(0, 0, 0, 0);
      ngayKetThuc.setHours(0, 0, 0, 0);
      ngayThanhLyCompare.setHours(0, 0, 0, 0);

      if (ngayThanhLyCompare < ngayBatDau) {
        const validationError = new Error(
          "ngay_thanh_ly phải sau hoặc bằng ngay_bat_dau",
        );
        validationError.name = "ValidationError";
        throw validationError;
      }

      if (ngayThanhLyCompare > ngayKetThuc) {
        const validationError = new Error(
          "ngay_thanh_ly phải trước hoặc bằng ngay_ket_thuc",
        );
        validationError.name = "ValidationError";
        throw validationError;
      }

      // Validation: chi_phi_phat_sinh validation
      const chiPhi = parseFloat(terminationData.chi_phi_phat_sinh);

      if (isNaN(chiPhi)) {
        const validationError = new Error(
          "chi_phi_phat_sinh phải là một số hợp lệ",
        );
        validationError.name = "ValidationError";
        throw validationError;
      }

      if (chiPhi < 0) {
        const validationError = new Error(
          "chi_phi_phat_sinh không thể là giá trị âm",
        );
        validationError.name = "ValidationError";
        throw validationError;
      }

      // Prepare termination data
      const updateData = {
        ngay_thanh_ly: ngayThanhLyCompare,
        chi_phi_phat_sinh: chiPhi,
      };

      if (terminationData.ghi_chu) {
        updateData.ghi_chu = terminationData.ghi_chu;
      }

      return await contractRepository.terminateContract(contractId, updateData);
    } catch (err) {
      throw err;
    }
  }
}

export default new ContractService();
