import mongoose from "mongoose";
import PhongModel from "../models/phong.model.js";
import NoiThatModel from "../models/noithat.model.js";

class PhongService {
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    return PhongModel.find(filter).skip(skip).limit(limit).sort(sort).lean();
  }

  async getById(id) {
    if (!id) return null;
    return PhongModel.findById(id).lean();
  }

  async create(data) {
    const doc = await PhongModel.create(data);
    return doc.toObject();
  }

  async update(id, update) {
    const doc = await PhongModel.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();
    return doc;
  }

  async remove(id) {
    return PhongModel.findByIdAndDelete(id).lean();
  }

  async getAllNoiThat(phongId, { skip = 0, limit = 100 } = {}) {
    if (!phongId) return [];

    return NoiThatModel.find({ phong_id: phongId })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async addNoiThat(phongId, data) {
    if (!phongId) throw new Error("Missing phongId");

    return NoiThatModel.create({
      ...data,
      phong_id: phongId,
    });
  }

  async removeNoiThat(noiThatId) {
    return NoiThatModel.findByIdAndDelete(noiThatId).lean();
  }

  async findBySoPhong(canHoId, soPhong) {
    return PhongModel.findOne({
      can_ho_id: canHoId,
      so_phong: soPhong,
    }).lean();
  }

  async countAllTrangThai(canHoId) {
    return PhongModel.aggregate([
      { $match: { can_ho_id: new mongoose.Types.ObjectId(canHoId) } },
      {
        $group: {
          _id: "$trang_thai",
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

export default new PhongService();
