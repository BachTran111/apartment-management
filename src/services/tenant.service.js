import Tenant from "../models/tenant.model.js";

class TenantService {
  /**
   * 1. Lấy tất cả người thuê (Có phân trang & đếm tổng số)
   */
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    // Chạy song song truy vấn lấy dữ liệu và đếm tổng số document
    const [tenants, total] = await Promise.all([
      Tenant.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate("phong_id")
        .lean(), // Trả về Plain JS Object giúp tăng tốc độ phản hồi
      Tenant.countDocuments(filter),
    ]);

    return {
      tenants,
      total,
    };
  }

  /**
   * 2. Lấy chi tiết người thuê
   */
  async getById(id) {
    if (!id) return null;
    return Tenant.findById(id).populate("phong_id").lean();
  }

  /**
   * 3. Tìm kiếm người thuê đa trường (Hỗ trợ phân trang)
   */
  async search(
    searchQuery,
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    const filter = {
      $or: [
        { ho_ten: { $regex: searchQuery, $options: "i" } }, // options: "i" giúp không phân biệt hoa thường
        { so_dien_thoai: { $regex: searchQuery, $options: "i" } },
        { cmnd_cccd: { $regex: searchQuery, $options: "i" } },
      ],
    };

    // Tận dụng lại hàm getAll để không phải viết lại code phân trang
    return this.getAll(filter, { skip, limit, sort });
  }

  /**
   * 4. Lấy danh sách người thuê theo trạng thái
   */
  async getByStatus(trang_thai, { skip = 0, limit = 50 } = {}) {
    // Tận dụng lại hàm getAll
    return this.getAll({ trang_thai }, { skip, limit });
  }

  // ==========================================
  // BỔ SUNG CÁC HÀM CRUD CÒN THIẾU
  // ==========================================

  /**
   * 5. Thêm người thuê mới
   */
  async create(data) {
    // Nếu có logic kiểm tra trùng CCCD hoặc SĐT, bạn có thể gọi findOne() ở đây
    const doc = await Tenant.create(data);
    return doc.toObject();
  }

  /**
   * 6. Cập nhật thông tin người thuê
   */
  async update(id, updateData) {
    return Tenant.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  /**
   * 7. Xóa người thuê
   */
  async remove(id) {
    return Tenant.findByIdAndDelete(id).lean();
  }
}

export default new TenantService();
