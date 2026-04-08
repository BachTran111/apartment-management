import PhongService from "../services/phong.service.js";
import NoiThatService from "../services/noithat.service.js";
import { OK } from "../handler/success-response.js";

class PhongController {
  getAll = async (req, res, next) => {
    try {
      const { skip, limit } = req.query;
      const phongs = await PhongService.getAll(
        {},
        { skip: Number(skip) || 0, limit: Number(limit) || 50 },
      );
      res.status(200).json(new OK({ metadata: phongs }));
    } catch (err) {
      res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;

      const [phong, noiThat] = await Promise.all([
        PhongService.getById(id),
        NoiThatService.getAllByPhong(id).catch(() => []), // fallback
      ]);

      if (!phong) {
        return res.status(404).json({
          status: "ERROR",
          message: "Phong not found",
        });
      }

      // Chưa có API → fallback null / []
      const nguoiThue = null;
      const hopDong = [];

      const result = {
        phong,
        noiThat: noiThat || [],
        nguoiThue, // null để FE biết là chưa có
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

  // Return all furniture for a room
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
}

export default new PhongController();
