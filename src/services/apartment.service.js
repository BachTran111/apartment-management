import Apartment from "../models/apartment.model.js"; // Cập nhật import theo chuẩn

class ApartmentService {
  /**
   * Lấy danh sách căn hộ (có hỗ trợ phân trang và bộ lọc)
   */
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    return Apartment.find(filter).skip(skip).limit(limit).sort(sort).lean();
  }

  /**
   * Lấy chi tiết căn hộ theo ID
   */
  async getById(id) {
    if (!id) return null;
    return Apartment.findById(id).lean();
  }

  /**
   * Tạo mới căn hộ
   */
  async create(payload) {
    // Kiểm tra trùng lặp tên căn hộ
    const existingCanHo = await Apartment.findOne({ ten: payload.ten }).lean();
    if (existingCanHo) {
      throw new Error("Tên căn hộ này đã tồn tại");
    }

    // Truyền thẳng payload vào thay vì map từng field (Validation và Schema sẽ lo phần lọc dữ liệu rác)
    const doc = await Apartment.create(payload);
    return doc.toObject();
  }

  /**
   * Cập nhật thông tin căn hộ
   */
  async update(id, payload) {
    // Nếu có update tên, cần kiểm tra xem tên mới có trùng với căn hộ khác không
    if (payload.ten) {
      const existingCanHo = await Apartment.findOne({
        ten: payload.ten,
        _id: { $ne: id },
      }).lean();

      if (existingCanHo) {
        throw new Error("Tên căn hộ này đã tồn tại");
      }
    }

    return Apartment.findByIdAndUpdate(id, payload, {
      new: true,
    }).lean();
  }

  /**
   * Xóa căn hộ
   */
  async remove(id) {
    return Apartment.findByIdAndDelete(id).lean();
  }
}

export default new ApartmentService();
