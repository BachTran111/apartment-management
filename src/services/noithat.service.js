import mongoose from "mongoose";
import NoiThatModel from "../models/noithat.model.js";

class NoiThatService {
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    return NoiThatModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate("phong_id")
      .lean();
  }

  async getById(id) {
    if (!id) return null;
    return NoiThatModel.findById(id).populate("phong_id").lean();
  }

  async create(data) {
    const doc = await NoiThatModel.create(data);
    return doc.toObject();
  }

  async update(id, update) {
    return NoiThatModel.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();
  }

  async remove(id) {
    return NoiThatModel.findByIdAndDelete(id).lean();
  }

  async assignToPhong(noiThatId, phongId) {
    return NoiThatModel.findByIdAndUpdate(
      noiThatId,
      { phong_id: phongId },
      { new: true },
    ).lean();
  }

  async removeFromPhong(noiThatId) {
    return NoiThatModel.findByIdAndUpdate(
      noiThatId,
      { $unset: { phong_id: "" } },
      { new: true },
    ).lean();
  }

  async getAllByPhong(phongId, { skip = 0, limit = 100 } = {}) {
    if (!phongId) return [];

    return NoiThatModel.find({ phong_id: phongId })
      .skip(skip)
      .limit(limit)
      .populate("phong_id")
      .lean();
  }
}

export default new NoiThatService();
