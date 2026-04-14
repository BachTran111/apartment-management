import PhongService from "../services/phong.service.js";
import NoiThatService from "../services/noithat.service.js";
import mongoose from "mongoose";
import { OK } from "../handler/success-response.js";

class PhongController {
  getAll = async (req, res, next) => {
    try {
      const { canHoId } = req.params;
      const { skip = 0, limit = 50 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(canHoId)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Invalid can_ho_id",
        });
      }

      const phongs = await PhongService.getAll(
        { can_ho_id: canHoId },
        {
          skip: Number(skip),
          limit: Number(limit),
        },
      );

      return res.status(200).json({
        status: "OK",
        metadata: phongs,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  getById = async (req, res, next) => {
    try {
      const { phongId } = req.params;

      const [phong, noiThat] = await Promise.all([
        PhongService.getById(phongId),
        NoiThatService.getAllByPhong(phongId).catch(() => []),
      ]);

      if (!phong) {
        return res.status(404).json({
          status: "ERROR",
          message: "Phong not found",
        });
      }

      const nguoiThue = null;
      const hopDong = [];

      const result = {
        phong,
        noiThat: noiThat || [],
        nguoiThue,
        hopDong, // [] để tránh crash khi map
      };

      res.status(200).json({
        status: "OK",
        metadata: result,
      });
    } catch (err) {
      res.status(400).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  create = async (req, res, next) => {
    try {
      const payload = req.body;
      const phong = await PhongService.create(payload);
      res
        .status(201)
        .json(new OK({ message: "Phong created", metadata: phong }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const phong = await PhongService.update(id, payload);
      if (!phong)
        return res
          .status(404)
          .json({ status: "ERROR", message: "Phong not found" });
      res
        .status(200)
        .json(new OK({ message: "Phong updated", metadata: phong }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  remove = async (req, res, next) => {
    try {
      const { id } = req.params;
      const removed = await PhongService.remove(id);
      if (!removed)
        return res
          .status(404)
          .json({ status: "ERROR", message: "Phong not found" });
      res
        .status(200)
        .json(new OK({ message: "Phong removed", metadata: removed }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  getAllNoiThat = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { skip, limit } = req.query;
      const items = await PhongService.getAllNoiThat(id, {
        skip: Number(skip) || 0,
        limit: Number(limit) || 100,
      });
      res.status(200).json(new OK({ metadata: items }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  addNoiThat = async (req, res, next) => {
    try {
      const { id } = req.params; // phong_id (số)
      const { noi_that_id } = req.body;
      if (!noi_that_id) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "noi_that_id is required" });
      }
      const updated = await NoiThatService.assignToPhong(noi_that_id, id);
      res
        .status(200)
        .json(
          new OK({ message: "NoiThat assigned to Phong", metadata: updated }),
        );
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  getBySoPhong = async (req, res) => {
    try {
      const { canHoId, soPhong } = req.params;

      // validate
      if (!mongoose.Types.ObjectId.isValid(canHoId)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Invalid can_ho_id",
        });
      }

      const phong = await PhongService.findBySoPhong(canHoId, soPhong);

      if (!phong) {
        return res.status(404).json({
          status: "ERROR",
          message: "Phong not found",
        });
      }

      return res.status(200).json({
        status: "OK",
        metadata: phong,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  countAllTrangThai = async (req, res) => {
    try {
      const { canHoId } = req.params;

      const result = await PhongService.countAllTrangThai(canHoId);

      return res.status(200).json({
        status: "OK",
        metadata: result,
      });
    } catch (err) {
      return res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  filterByTrangThai = async (req, res) => {
    try {
      const { canHoId } = req.params;
      const { trang_thai, skip = 0, limit = 50 } = req.query;

      // validate
      if (!mongoose.Types.ObjectId.isValid(canHoId)) {
        return res.status(400).json({
          status: "ERROR",
          message: "Invalid can_ho_id",
        });
      }

      if (!trang_thai) {
        return res.status(400).json({
          status: "ERROR",
          message: "trang_thai is required",
        });
      }

      const filter = {
        can_ho_id: canHoId,
        trang_thai: trang_thai,
      };

      const phongs = await PhongService.getAll(filter, {
        skip: Number(skip),
        limit: Number(limit),
      });

      return res.status(200).json({
        status: "OK",
        metadata: phongs,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };
}

export default new PhongController();
