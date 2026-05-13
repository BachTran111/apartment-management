import HopDongRepository from "../repositories/hopDong.repository.js";

class HopDongService {
  // Tạo hợp đồng mới
  async createContract(contractData) {
    if (!contractData || typeof contractData !== "object") {
      const validationError = new Error("Invalid contract payload");
      validationError.name = "ValidationError";
      throw validationError;
    }

    return await HopDongRepository.createContract(contractData);
  }

  // Lấy tất cả hợp đồng với phân trang
  async getAllContracts(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;

      const contracts = await HopDongRepository.getAllContracts(filters);
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

      return await HopDongRepository.getContractsByStatus(status);
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }

  // Lấy hợp đồng sắp hết hạn
  async getExpiringContracts() {
    try {
      return await HopDongRepository.getExpiringContracts();
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }

  // Lấy thống kê
  async getStatistics() {
    try {
      const allContracts = await HopDongRepository.getAllContracts();
      const activeContracts =
        await HopDongRepository.getContractsByStatus("active");
      const expiringContracts = await HopDongRepository.getExpiringContracts();

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
      const contract = await HopDongRepository.getContractById(contractId);

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

      return await HopDongRepository.terminateContract(contractId, updateData);
    } catch (err) {
      throw err;
    }
  }
}

export default new HopDongService();
