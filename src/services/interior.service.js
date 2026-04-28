import Interior from "../models/interior.model.js";

class InteriorService {
  /**
   * Lấy danh sách nội thất có phân trang
   */
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    return Interior.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate("phong_id")
      .lean();
  }

  /**
   * Lấy chi tiết nội thất theo ID
   */
  async getById(id) {
    if (!id) return null;
    return Interior.findById(id).populate("phong_id").lean();
  }

  /**
   * Tạo mới nội thất
   */
  async create(data) {
    const doc = await Interior.create(data);
    return doc.toObject(); // Chuyển đổi thành plain object
  }

  /**
   * Cập nhật thông tin nội thất
   */
  async update(id, updateData) {
    return Interior.findByIdAndUpdate(id, updateData, {
      new: true, // Trả về document sau khi đã update
    }).lean();
  }

  /**
   * Xóa nội thất
   */
  async remove(id) {
    return Interior.findByIdAndDelete(id).lean();
  }

  // ==========================================
  // QUẢN LÝ QUAN HỆ VỚI PHÒNG
  // ==========================================

  /**
   * Gán nội thất vào một phòng cụ thể
   */
  async assignToPhong(interiorId, roomId) {
    return Interior.findByIdAndUpdate(
      interiorId,
      { phong_id: roomId },
      { new: true },
    ).lean();
  }

  /**
   * Gỡ nội thất khỏi phòng (set phong_id về null/undefined)
   */
  async removeFromPhong(interiorId) {
    return Interior.findByIdAndUpdate(
      interiorId,
      { $unset: { phong_id: "" } }, // Xóa field phong_id
      { new: true },
    ).lean();
  }

  /**
   * Lấy tất cả nội thất thuộc về một phòng
   */
  async getAllByPhong(roomId, { skip = 0, limit = 100 } = {}) {
    if (!roomId) return [];

    return Interior.find({ phong_id: roomId })
      .skip(skip)
      .limit(limit)
      .populate("phong_id")
      .lean();
  }
}

export default new InteriorService();
