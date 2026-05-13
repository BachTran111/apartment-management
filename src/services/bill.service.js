import Bill from "../models/bill.model.js";

class BillService {
  /**
   * Lấy danh sách hóa đơn (Có phân trang, bộ lọc và tự động nối thông tin hợp đồng)
   */
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { ngay_lap: -1 } } = {},
  ) {
    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate("hop_dong_id") // Tự động lấy thông tin hợp đồng đi kèm
        .lean(),
      Bill.countDocuments(filter),
    ]);

    return {
      bills,
      total,
    };
  }

  /**
   * Lấy chi tiết một hóa đơn
   */
  async getById(id) {
    if (!id) return null;
    return Bill.findById(id).populate("hop_dong_id").lean();
  }

  /**
   * Thêm hóa đơn mới
   */
  async create(data) {
    const doc = await Bill.create(data);
    return doc.toObject();
  }

  /**
   * Cập nhật thông tin hóa đơn (ví dụ: Đổi trạng thái sang ĐÃ THANH TOÁN)
   */
  async update(id, updateData) {
    return Bill.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  /**
   * Xóa hóa đơn
   */
  async remove(id) {
    return Bill.findByIdAndDelete(id).lean();
  }
}

export default new BillService();
