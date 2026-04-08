import mongoose from "mongoose";
import PhongModel from "../models/phong.model.js";
import NoiThatModel from "../models/noithat.model.js";

// const { Types } = mongoose;

// class PhongService {
//   async getAll(
//     filter = {},
//     { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
//   ) {
//     return PhongModel.find(filter)
//       .skip(skip)
//       .limit(limit)
//       .sort(sort)
//       .populate("noi_that_ids")
//       .lean();
//   }

//   async getById(id) {
//     if (!id) return null;
//     return isNaN(id)
//       ? PhongModel.findById(id).populate("noi_that_ids").lean()
//       : PhongModel.findOne({ phong_id: Number(id) })
//           .populate("noi_that_ids")
//           .lean();
//   }

//   async create(data) {
//     const doc = await PhongModel.create(data);
//     return doc.toObject();
//   }

//   async update(id, update) {
//     const doc = isNaN(id)
//       ? await PhongModel.findById(id)
//       : await PhongModel.findOne({ phong_id: Number(id) });

//     if (!doc) return null;
//     Object.assign(doc, update);
//     await doc.save();
//     return doc.toObject();
//   }

//   async remove(id) {
//     return isNaN(id)
//       ? await PhongModel.findByIdAndDelete(id).lean()
//       : await PhongModel.findOneAndDelete({ phong_id: Number(id) }).lean();
//   }

//   // Add a furniture reference to a room (bi-directional)
//   async addNoiThat(noiThatId, phongId) {
//     const nId = Types.ObjectId(noiThatId);
//     const pId = Types.ObjectId(phongId);

//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const phong = await PhongModel.findByIdAndUpdate(
//         pId,
//         { $addToSet: { noi_that_ids: nId } },
//         { new: true, session },
//       ).exec();
//       await NoiThatModel.findByIdAndUpdate(
//         nId,
//         { $addToSet: { phong_ids: pId } },
//         { session },
//       ).exec();

//       await session.commitTransaction();
//       session.endSession();
//       return phong;
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       throw err;
//     }
//   }

//   async removeNoiThat(noiThatId, phongId) {
//     const nId = Types.ObjectId(noiThatId);
//     const pId = Types.ObjectId(phongId);

//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const phong = await PhongModel.findByIdAndUpdate(
//         pId,
//         { $pull: { noi_that_ids: nId } },
//         { new: true, session },
//       ).exec();
//       await NoiThatModel.findByIdAndUpdate(
//         nId,
//         { $pull: { phong_ids: pId } },
//         { session },
//       ).exec();

//       await session.commitTransaction();
//       session.endSession();
//       return phong;
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       throw err;
//     }
//   }

//   // Return all furniture for a given room identifier (numeric `phong_id` or Mongo _id)
//   async getAllNoiThat(phongIdentifier, { skip = 0, limit = 100 } = {}) {
//     if (!phongIdentifier) return [];

//     let phong = null;
//     if (isNaN(phongIdentifier)) {
//       phong = await PhongModel.findById(phongIdentifier).select("_id").lean();
//     } else {
//       phong = await PhongModel.findOne({ phong_id: Number(phongIdentifier) })
//         .select("_id")
//         .lean();
//     }
//     if (!phong) return [];

//     return NoiThatModel.find({ phong_ids: phong._id })
//       .skip(skip)
//       .limit(limit)
//       .populate("phong_ids")
//       .lean();
//   }
// }

// export default new PhongService();

import { readData, writeData, getNextId } from "../utils/fileDb.js";

class PhongService {
  async getAll(filter = {}) {
    const db = await readData();
    return (db.phongs || []).filter((p) => {
      for (const k of Object.keys(filter)) if (p[k] !== filter[k]) return false;
      return true;
    });
  }

  async getById(id) {
    const db = await readData();
    return isNaN(id)
      ? db.phongs.find((p) => p.id === Number(id) || p._id === id) // fallback
      : db.phongs.find((p) => p.phong_id === Number(id));
  }

  async create(payload) {
    const db = await readData();
    const id = await getNextId("phongs");
    const phong = {
      ...payload,
      id,
      phong_id: payload.phong_id ?? id,
      noi_that_ids: payload.noi_that_ids || [],
    };
    db.phongs = db.phongs || [];
    db.phongs.push(phong);
    await writeData(db);
    return phong;
  }

  async update(id, update) {
    const db = await readData();
    const idx = db.phongs.findIndex(
      (p) => p.phong_id === Number(id) || p.id === Number(id),
    );
    if (idx === -1) return null;
    db.phongs[idx] = { ...db.phongs[idx], ...update };
    await writeData(db);
    return db.phongs[idx];
  }

  async remove(id) {
    const db = await readData();
    const key = (p) => p.phong_id === Number(id) || p.id === Number(id);
    const idx = db.phongs.findIndex(key);
    if (idx === -1) return null;
    const removed = db.phongs.splice(idx, 1)[0];
    // optionally remove references in noithats
    db.noithats = (db.noithats || []).map((n) => ({
      ...n,
      phong_ids: (n.phong_ids || []).filter((pid) => pid !== removed.phong_id),
    }));
    await writeData(db);
    return removed;
  }

  async getAllNoiThat(phongIdentifier) {
    const db = await readData();
    let phong = null;
    if (isNaN(phongIdentifier))
      phong = db.phongs.find(
        (p) => p.id === Number(phongIdentifier) || p._id === phongIdentifier,
      );
    else phong = db.phongs.find((p) => p.phong_id === Number(phongIdentifier));
    if (!phong) return [];
    return (db.noithats || []).filter((n) =>
      (n.phong_ids || []).includes(phong.phong_id),
    );
  }

  // add methods to maintain bi-directional relation if needed (update both phongs and noithats arrays)
}

export default new PhongService();
