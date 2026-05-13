import mongoose from "mongoose";
import Contract from "../models/contract.model.js";
import NoiThatModel from "../models/interior.model.js";
import Room from "../models/room.model.js";

class RoomService {
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    const rooms = await Room.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    return this.attachContractSummaries(rooms);
  }

  async getById(id) {
    if (!id) return null;
    return Room.findById(id).lean();
  }

  async getContractsByPhongId(phongId) {
    if (!phongId) {
      return [];
    }

    return Contract.find({ phong_id: phongId })
      .sort({ ngay_bat_dau: -1, ngay_ket_thuc: -1 })
      .populate({
        path: "nguoi_thue_id",
        select: "ho_ten so_dien_thoai email",
      })
      .lean();
  }

  async create(data) {
    const exists = await Room.findOne({
      can_ho_id: data.can_ho_id,
      so_phong: data.so_phong,
    }).lean();

    if (exists) {
      throw new Error("So phong nay da ton tai trong can ho");
    }

    const doc = await Room.create(data);
    return doc.toObject();
  }

  async update(id, updateData) {
    if (updateData.so_phong || updateData.can_ho_id) {
      const existingRoom = await Room.findById(id).lean();
      if (!existingRoom) throw new Error("Khong tim thay phong");

      const canHoId = updateData.can_ho_id || existingRoom.can_ho_id;
      const soPhong = updateData.so_phong || existingRoom.so_phong;

      const exists = await Room.findOne({
        can_ho_id: canHoId,
        so_phong: soPhong,
        _id: { $ne: id },
      }).lean();

      if (exists) {
        throw new Error("So phong nay da ton tai trong can ho");
      }
    }

    return Room.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async remove(id) {
    return Room.findByIdAndDelete(id).lean();
  }

  async getAllNoiThat(phongId, { skip = 0, limit = 100 } = {}) {
    if (!phongId) return [];

    return NoiThatModel.find({ phong_id: phongId })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async addNoiThat(phongId, data) {
    if (!phongId) throw new Error("Thieu phongId");

    return NoiThatModel.create({
      ...data,
      phong_id: phongId,
    });
  }

  async removeNoiThat(noiThatId) {
    return NoiThatModel.findByIdAndDelete(noiThatId).lean();
  }

  async findBySoPhong(canHoId, soPhong) {
    return Room.findOne({
      can_ho_id: canHoId,
      so_phong: soPhong,
    }).lean();
  }

  async countAllTrangThai(canHoId) {
    return Room.aggregate([
      {
        $match: {
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

  async attachContractSummaries(rooms = []) {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return [];
    }

    const roomIds = rooms.map((room) => room?._id).filter(Boolean);
    if (!roomIds.length) {
      return rooms;
    }

    const contracts = await Contract.find({
      phong_id: { $in: roomIds },
    })
      .sort({ ngay_bat_dau: -1, ngay_ket_thuc: -1 })
      .populate({
        path: "nguoi_thue_id",
        select: "ho_ten so_dien_thoai email",
      })
      .lean();

    const contractsByRoomId = new Map(
      roomIds.map((roomId) => [String(roomId), []]),
    );

    contracts.forEach((contract) => {
      const roomId = String(contract.phong_id || "");
      if (!roomId) {
        return;
      }

      const bucket = contractsByRoomId.get(roomId) || [];
      bucket.push(contract);
      contractsByRoomId.set(roomId, bucket);
    });

    return rooms.map((room) => {
      const roomContracts = this.sortContractsByPriority(
        contractsByRoomId.get(String(room._id)) || [],
      );
      const currentContract = roomContracts[0] || null;

      return {
        ...room,
        hop_dong_hien_tai: currentContract,
        nguoi_thue_hien_tai: currentContract?.nguoi_thue_id || null,
        tong_hop_dong: roomContracts.length,
      };
    });
  }

  sortContractsByPriority(contracts = []) {
    const statusPriority = {
      active: 0,
      expired: 1,
      terminated: 2,
    };

    return [...contracts].sort((left, right) => {
      const leftPriority = statusPriority[left?.trang_thai] ?? 99;
      const rightPriority = statusPriority[right?.trang_thai] ?? 99;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return (
        new Date(right?.ngay_bat_dau || 0).getTime() -
        new Date(left?.ngay_bat_dau || 0).getTime()
      );
    });
  }
}

export default new RoomService();
