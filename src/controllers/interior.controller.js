import mongoose from "mongoose";
import InteriorService from "../services/interior.service.js"; // Cập nhật tên file service
import { OK } from "../handler/success-response.js";

class InteriorController {
  getAll = async (req, res) => {
    try {
      const { skip = 0, limit = 50 } = req.query;

      const items = await InteriorService.getAll(
        {},
        {
          skip: Number(skip),
          limit: Math.min(100, Number(limit)), // Giới hạn tối đa 100 record/lần
        },
      );

      return res.status(200).json(new OK({ metadata: items }));
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params; // Chuẩn hóa thành id

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID nội thất không hợp lệ" });
      }

      const item = await InteriorService.getById(id);

      if (!item) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy nội thất" });
      }

      return res.status(200).json(new OK({ metadata: item }));
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  create = async (req, res) => {
    try {
      const payload = req.body;
      const item = await InteriorService.create(payload);

      return res
        .status(201)
        .json(new OK({ message: "Thêm nội thất thành công", metadata: item }));
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID nội thất không hợp lệ" });
      }

      const payload = req.body;
      const item = await InteriorService.update(id, payload);

      if (!item) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy nội thất" });
      }

      return res
        .status(200)
        .json(
          new OK({ message: "Cập nhật nội thất thành công", metadata: item }),
        );
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  remove = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID nội thất không hợp lệ" });
      }

      const removed = await InteriorService.remove(id);

      if (!removed) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy nội thất" });
      }

      return res
        .status(200)
        .json(
          new OK({ message: "Xóa nội thất thành công", metadata: removed }),
        );
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  getAllByPhong = async (req, res) => {
    try {
      const { roomId } = req.params; // Chuẩn hóa tên param thành roomId
      const { skip = 0, limit = 100 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID phòng không hợp lệ" });
      }

      const items = await InteriorService.getAllByPhong(roomId, {
        skip: Number(skip),
        limit: Math.min(200, Number(limit)),
      });

      return res.status(200).json(new OK({ metadata: items }));
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new InteriorController();
