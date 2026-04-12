import mongoose from "mongoose";
import NoiThatModel from "../models/noithat.model.js";
import PhongModel from "../models/phong.model.js";

const { Types } = mongoose;

class NoiThatService {
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    return NoiThatModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate("phong_ids")
      .lean();
  }

  async getById(id) {
    if (!id) return null;
    return isNaN(id)
      ? NoiThatModel.findById(id).populate("phong_ids").lean()
      : NoiThatModel.findOne({ noi_that_id: String(id) })
          .populate("phong_ids")
          .lean();
  }

  async create(data) {
    const doc = await NoiThatModel.create(data);
    return doc.toObject();
  }

  async update(id, update) {
    const doc = isNaN(id)
      ? await NoiThatModel.findById(id)
      : await NoiThatModel.findOne({ noi_that_id: String(id) });

    if (!doc) return null;
    Object.assign(doc, update);
    await doc.save();
    return doc.toObject();
  }

  async remove(id) {
    return isNaN(id)
      ? await NoiThatModel.findByIdAndDelete(id).lean()
      : await NoiThatModel.findOneAndDelete({ noi_that_id: String(id) }).lean();
  }

  // bi-directional association
  async assignToPhong(noiThatId, phongId) {
    const nId = Types.ObjectId(noiThatId);
    const pId = Types.ObjectId(phongId);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const noiThat = await NoiThatModel.findByIdAndUpdate(
        nId,
        { $addToSet: { phong_ids: pId } },
        { new: true, session },
      ).exec();

      await PhongModel.findByIdAndUpdate(
        pId,
        { $addToSet: { noi_that_ids: nId } },
        { session },
      ).exec();

      await session.commitTransaction();
      session.endSession();
      return noiThat;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async removeFromPhong(noiThatId, phongId) {
    const nId = Types.ObjectId(noiThatId);
    const pId = Types.ObjectId(phongId);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const noiThat = await NoiThatModel.findByIdAndUpdate(
        nId,
        { $pull: { phong_ids: pId } },
        { new: true, session },
      ).exec();

      await PhongModel.findByIdAndUpdate(
        pId,
        { $pull: { noi_that_ids: nId } },
        { session },
      ).exec();

      await session.commitTransaction();
      session.endSession();
      return noiThat;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // Return all furniture that belong to a given room (accepts numeric `phong_id` or Mongo _id)
  async getAllByPhong(phongIdentifier, { skip = 0, limit = 100 } = {}) {
    if (!phongIdentifier) return [];

    let phong = null;
    if (isNaN(phongIdentifier)) {
      // treat as ObjectId
      phong = await PhongModel.findById(phongIdentifier).select("_id").lean();
    } else {
      // treat as numeric phong_id
      phong = await PhongModel.findOne({ phong_id: Number(phongIdentifier) })
        .select("_id")
        .lean();
    }
    if (!phong) return [];

    return NoiThatModel.find({ phong_ids: phong._id })
      .skip(skip)
      .limit(limit)
      .populate("phong_ids")
      .lean();
  }
}

export default new NoiThatService();

