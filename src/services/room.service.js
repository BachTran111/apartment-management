import mongoose from "mongoose";
import Room from "../models/room.model.js"; // Cập nhật import theo tên file mới
import NoiThatModel from "../models/interior.model.js";

class RoomService {
  /**
   * Lấy danh sách phòng với phân trang và sắp xếp
   */
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    return Room.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate({
        path: "hop_dong_ids", // Lớp 1: Lấy danh sách hợp đồng
        populate: {
          path: "nguoi_thue_id", // Lớp 2: Lấy thông tin người thuê bên trong hợp đồng đó
          select: "ho_ten so_dien_thoai email", // (Tùy chọn) Chỉ lấy các trường cần thiết
        },
      })
      .lean();
  }

  /**
   * Lấy chi tiết một phòng
   */
  async getById(id) {
    if (!id) return null;
    return Room.findById(id)
      .populate({
        path: "hop_dong_ids",
        populate: {
          path: "nguoi_thue_id",
        },
      })
      .lean();
  }

  /**
   * Tạo phòng mới
   */
  async create(data) {
    const exists = await Room.findOne({
      can_ho_id: data.can_ho_id,
      so_phong: data.so_phong,
    }).lean();

    if (exists) {
      throw new Error("Số phòng này đã tồn tại trong căn hộ");
    }

    const doc = await Room.create(data);
    return doc.toObject();
  }

  /**
   * Cập nhật thông tin phòng
   */
  async update(id, updateData) {
    if (updateData.so_phong || updateData.can_ho_id) {
      const existingPhong = await Room.findById(id).lean();
      if (!existingPhong) throw new Error("Không tìm thấy phòng");

      const canHoId = updateData.can_ho_id || existingPhong.can_ho_id;
      const soPhong = updateData.so_phong || existingPhong.so_phong;

      // Kiểm tra trùng lặp số phòng nếu có sự thay đổi
      const exists = await Room.findOne({
        can_ho_id: canHoId,
        so_phong: soPhong,
        _id: { $ne: id },
      }).lean();

      if (exists) {
        throw new Error("Số phòng này đã tồn tại trong căn hộ");
      }
    }

    return Room.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  /**
   * Xóa phòng
   */
  async remove(id) {
    return Room.findByIdAndDelete(id).lean();
  }

  // ==========================================
  // QUẢN LÝ NỘI THẤT
  // ==========================================

  async getAllNoiThat(phongId, { skip = 0, limit = 100 } = {}) {
    if (!phongId) return [];

    return NoiThatModel.find({ phong_id: phongId })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async addNoiThat(phongId, data) {
    if (!phongId) throw new Error("Thiếu phongId");

    return NoiThatModel.create({
      ...data,
      phong_id: phongId,
    });
  }

  async removeNoiThat(noiThatId) {
    return NoiThatModel.findByIdAndDelete(noiThatId).lean();
  }

  // ==========================================
  // CÁC HÀM TIỆN ÍCH BỔ SUNG
  // ==========================================

  /**
   * Tìm phòng theo số phòng và ID căn hộ
   */
  async findBySoPhong(canHoId, soPhong) {
    return Room.findOne({
      can_ho_id: canHoId,
      so_phong: soPhong,
    }).lean();
  }

  /**
   * Thống kê số lượng phòng theo từng trạng thái trong một căn hộ
   */
  async countAllTrangThai(canHoId) {
    return Room.aggregate([
      {
        $match: {
          // Ép kiểu thủ công ở $match aggregation để đảm bảo chính xác
          can_ho_id: new mongoose.Types.ObjectId(canHoId),
        },
      },
      {
        $group: {
          _id: "$trang_thai",
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

export default new RoomService();
