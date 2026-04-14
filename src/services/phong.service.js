import mongoose from "mongoose";
import PhongModel from "../models/phong.model.js";
import NoiThatModel from "../models/noithat.model.js";

class PhongService {
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    const mongoFilter = this.buildMongoFilter(filter);
    return PhongModel.collection
      .find(mongoFilter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .toArray();
  }

  async getById(id) {
    if (!id) return null;
    return PhongModel.findById(id).lean();
  }

  async create(data) {
    const exists = await PhongModel.findOne({ can_ho_id: data.can_ho_id, so_phong: data.so_phong }).lean();
    if (exists) {
      throw new Error("Số phòng này đã tồn tại trong căn hộ");
    }
    const doc = await PhongModel.create(data);
    return doc.toObject();
  }

  async update(id, update) {
    if (update.so_phong || update.can_ho_id) {
      const existingPhong = await PhongModel.findById(id).lean();
      if (!existingPhong) throw new Error("Phong not found");

      const canHoId = update.can_ho_id || existingPhong.can_ho_id;
      const soPhong = update.so_phong || existingPhong.so_phong;

      const exists = await PhongModel.findOne({
        can_ho_id: canHoId,
        so_phong: soPhong,
        _id: { $ne: id }
      }).lean();

      if (exists) {
        throw new Error("Số phòng này đã tồn tại trong căn hộ");
      }
    }

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
    return PhongModel.collection.findOne(
      this.buildMongoFilter({
        can_ho_id: canHoId,
        so_phong: soPhong,
      }),
    );
  }

  async countAllTrangThai(canHoId) {
    return PhongModel.collection
      .aggregate([
        { $match: this.buildMongoFilter({ can_ho_id: canHoId }) },
        {
          $group: {
            _id: "$trang_thai",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
  }

  buildMongoFilter(filter = {}) {
    const mongoFilter = { ...filter };

    if (mongoFilter.can_ho_id) {
      const canHoId = String(mongoFilter.can_ho_id);
      const canHoCandidates = [canHoId];

      if (mongoose.Types.ObjectId.isValid(canHoId)) {
        canHoCandidates.push(new mongoose.Types.ObjectId(canHoId));
      }

      delete mongoFilter.can_ho_id;
      mongoFilter.can_ho_id = { $in: canHoCandidates };
    }

    return mongoFilter;
  }
}

export default new PhongService();
