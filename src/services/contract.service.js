import Contract from "../models/contract.model.js";

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
}

export default new ContractService();
