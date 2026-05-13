import mongoose from "mongoose";
import { OK } from "../handler/success-response.js";
import NoiThatService from "../services/interior.service.js";
import RoomService from "../services/room.service.js";
import {
  roomCreateSchema,
  roomUpdateSchema,
} from "../utils/validations/room.validation.js";

class RoomController {
  getAll = async (req, res) => {
    try {
      const { canHoId } = req.params;
      const { skip = 0, limit = 50 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(canHoId)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID can ho khong hop le" });
      }

      const phongs = await RoomService.getAll(
        { can_ho_id: canHoId },
        {
          skip: Number(skip),
          limit: Number(limit),
        },
      );

      return res.status(200).json(new OK({ metadata: phongs }));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;

      const [phong, noiThat, hopDong] = await Promise.all([
        RoomService.getById(id),
        NoiThatService.getAllByPhong(id).catch(() => []),
        RoomService.getContractsByPhongId(id).catch(() => []),
      ]);

      if (!phong) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Khong tim thay phong" });
      }

      return res.status(200).json(
        new OK({
          metadata: {
            phong,
            noiThat: Array.isArray(noiThat) ? noiThat : [],
            nguoiThue: hopDong[0]?.nguoi_thue_id || null,
            hopDong: Array.isArray(hopDong) ? hopDong : [],
          },
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  create = async (req, res) => {
    try {
      const payload = { ...req.body };

      if (
        payload.can_ho_id &&
        typeof payload.can_ho_id === "object" &&
        payload.can_ho_id.$oid
      ) {
        payload.can_ho_id = payload.can_ho_id.$oid;
      }

      const { error, value } = roomCreateSchema.validate(payload, {
        abortEarly: false,
      });

      if (error) {
        const errorMessage = error.details.map((err) => err.message).join(", ");
        return res.status(400).json({ status: "ERROR", message: errorMessage });
      }

      const phong = await RoomService.create(value);

      return res
        .status(201)
        .json(new OK({ message: "Tao phong thanh cong", metadata: phong }));
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;

      const { error, value } = roomUpdateSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errorMessage = error.details.map((err) => err.message).join(", ");
        return res.status(400).json({ status: "ERROR", message: errorMessage });
      }

      const phong = await RoomService.update(id, value);

      if (!phong) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Khong tim thay phong" });
      }

      return res.status(200).json(
        new OK({ message: "Cap nhat phong thanh cong", metadata: phong }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  remove = async (req, res) => {
    try {
      const { id } = req.params;
      const removed = await RoomService.remove(id);

      if (!removed) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Khong tim thay phong" });
      }

      return res.status(200).json(
        new OK({ message: "Xoa phong thanh cong", metadata: removed }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  getAllNoiThat = async (req, res) => {
    try {
      const { id } = req.params;
      const { skip = 0, limit = 100 } = req.query;

      const items = await RoomService.getAllNoiThat(id, {
        skip: Number(skip),
        limit: Number(limit),
      });

      return res.status(200).json(new OK({ metadata: items }));
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  addNoiThat = async (req, res) => {
    try {
      const { id: phong_id } = req.params;
      const { noi_that_id } = req.body;

      if (!noi_that_id) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "Thieu noi_that_id" });
      }

      const updated = await NoiThatService.assignToPhong(noi_that_id, phong_id);

      return res.status(200).json(
        new OK({
          message: "Da them noi that vao phong",
          metadata: updated,
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  getBySoPhong = async (req, res) => {
    try {
      const { canHoId, soPhong } = req.params;

      if (!mongoose.Types.ObjectId.isValid(canHoId)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID can ho khong hop le" });
      }

      const phong = await RoomService.findBySoPhong(canHoId, soPhong);

      if (!phong) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Khong tim thay phong" });
      }

      return res.status(200).json(new OK({ metadata: phong }));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  countAllTrangThai = async (req, res) => {
    try {
      const { canHoId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(canHoId)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID can ho khong hop le" });
      }

      const result = await RoomService.countAllTrangThai(canHoId);

      return res.status(200).json(new OK({ metadata: result }));
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  filterByTrangThai = async (req, res) => {
    try {
      const { canHoId } = req.params;
      const { trang_thai, skip = 0, limit = 50 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(canHoId)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID can ho khong hop le" });
      }

      if (!trang_thai) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "Thieu trang thai de loc" });
      }

      const phongs = await RoomService.getAll(
        {
          can_ho_id: canHoId,
          trang_thai,
        },
        {
          skip: Number(skip),
          limit: Number(limit),
        },
      );

      return res.status(200).json(new OK({ metadata: phongs }));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new RoomController();
