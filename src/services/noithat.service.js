import mongoose from "mongoose";
import NoiThatModel from "../models/noithat.model.js";
import PhongModel from "../models/phong.model.js";

// const { Types } = mongoose;

// class NoiThatService {
//   async getAll(
//     filter = {},
//     { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
//   ) {
//     return NoiThatModel.find(filter)
//       .skip(skip)
//       .limit(limit)
//       .sort(sort)
//       .populate("phong_ids")
//       .lean();
//   }

//   async getById(id) {
//     if (!id) return null;
//     return isNaN(id)
//       ? NoiThatModel.findById(id).populate("phong_ids").lean()
//       : NoiThatModel.findOne({ noi_that_id: String(id) })
//           .populate("phong_ids")
//           .lean();
//   }

//   async create(data) {
//     const doc = await NoiThatModel.create(data);
//     return doc.toObject();
//   }

//   async update(id, update) {
//     const doc = isNaN(id)
//       ? await NoiThatModel.findById(id)
//       : await NoiThatModel.findOne({ noi_that_id: String(id) });

//     if (!doc) return null;
//     Object.assign(doc, update);
//     await doc.save();
//     return doc.toObject();
//   }

//   async remove(id) {
//     return isNaN(id)
//       ? await NoiThatModel.findByIdAndDelete(id).lean()
//       : await NoiThatModel.findOneAndDelete({ noi_that_id: String(id) }).lean();
//   }

//   // bi-directional association
//   async assignToPhong(noiThatId, phongId) {
//     const nId = Types.ObjectId(noiThatId);
//     const pId = Types.ObjectId(phongId);

//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const noiThat = await NoiThatModel.findByIdAndUpdate(
//         nId,
//         { $addToSet: { phong_ids: pId } },
//         { new: true, session },
//       ).exec();

//       await PhongModel.findByIdAndUpdate(
//         pId,
//         { $addToSet: { noi_that_ids: nId } },
//         { session },
//       ).exec();

//       await session.commitTransaction();
//       session.endSession();
//       return noiThat;
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       throw err;
//     }
//   }

//   async removeFromPhong(noiThatId, phongId) {
//     const nId = Types.ObjectId(noiThatId);
//     const pId = Types.ObjectId(phongId);

//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const noiThat = await NoiThatModel.findByIdAndUpdate(
//         nId,
//         { $pull: { phong_ids: pId } },
//         { new: true, session },
//       ).exec();

//       await PhongModel.findByIdAndUpdate(
//         pId,
//         { $pull: { noi_that_ids: nId } },
//         { session },
//       ).exec();

//       await session.commitTransaction();
//       session.endSession();
//       return noiThat;
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       throw err;
//     }
//   }

//   // Return all furniture that belong to a given room (accepts numeric `phong_id` or Mongo _id)
//   async getAllByPhong(phongIdentifier, { skip = 0, limit = 100 } = {}) {
//     if (!phongIdentifier) return [];

//     let phong = null;
//     if (isNaN(phongIdentifier)) {
//       // treat as ObjectId
//       phong = await PhongModel.findById(phongIdentifier).select("_id").lean();
//     } else {
//       // treat as numeric phong_id
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

// export default new NoiThatService();

import { readData, writeData, getNextId } from "../utils/fileDb.js";

class NoiThatService {
  async getAll(filter = {}) {
    const db = await readData();
    return (db.noithats || []).filter(n => {
      for (const k of Object.keys(filter)) if (n[k] !== filter[k]) return false;
      return true;
    });
  }

  async getById(id) {
    const db = await readData();
    return isNaN(id)
      ? db.noithats.find(n => n.noi_that_id === id || n.id === id)
      : db.noithats.find(n => n.noi_that_id === String(id));
  }

  async create(payload) {
    const db = await readData();
    const id = await getNextId("noithats");
    const doc = { ...payload, id, noi_that_id: payload.noi_that_id ?? `NT-${id}`, phong_ids: payload.phong_ids || [] };
    db.noithats = db.noithats || [];
    db.noithats.push(doc);
    // update phongs' noi_that_ids
    for (const pid of doc.phong_ids) {
      const p = (db.phongs || []).find(x => x.phong_id === pid);
      if (p) p.noi_that_ids = p.noi_that_ids || [], p.noi_that_ids.push(doc.noi_that_id);
    }
    await writeData(db);
    return doc;
  }

  async update(id, update) {
    const db = await readData();
    const idx = db.noithats.findIndex(n => n.noi_that_id === id || n.id === Number(id));
    if (idx === -1) return null;
    db.noithats[idx] = { ...db.noithats[idx], ...update };
    await writeData(db);
    return db.noithats[idx];
  }

  async remove(id) {
    const db = await readData();
    const idx = db.noithats.findIndex(n => n.noi_that_id === id || n.id === Number(id));
    if (idx === -1) return null;
    const removed = db.noithats.splice(idx, 1)[0];
    // remove from phongs
    db.phongs = (db.phongs || []).map(p => ({ ...p, noi_that_ids: (p.noi_that_ids || []).filter(nid => nid !== removed.noi_that_id) }));
    await writeData(db);
    return removed;
  }

  async assignToPhong(noiThatId, phongId) {
    const db = await readData();
    const n = db.noithats.find(x => x.noi_that_id === noiThatId);
    const p = db.phongs.find(x => x.phong_id === Number(phongId));
    if (!n || !p) throw new Error("Not found");
    n.phong_ids = Array.from(new Set([...(n.phong_ids||[]), p.phong_id]));
    p.noi_that_ids = Array.from(new Set([...(p.noi_that_ids||[]), n.noi_that_id]));
    await writeData(db);
    return n;
  }

  async getAllByPhong(phongIdentifier) {
    const db = await readData();
    const pid = isNaN(phongIdentifier) ? null : Number(phongIdentifier);
    if (pid == null) return [];
    return (db.noithats || []).filter(n => (n.phong_ids || []).includes(pid));
  }
}

export default new NoiThatService();