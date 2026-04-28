import mongoose from "mongoose";
import RoomService from "../services/room.service.js"; // Cập nhật tên import
import NoiThatService from "../services/interior.service.js";
import { OK } from "../handler/success-response.js";
import {
  roomCreateSchema,
  roomUpdateSchema,
} from "../utils/validations/room.validation.js";

class RoomController {
  // ==========================================
  // QUẢN LÝ THÔNG TIN PHÒNG
  // ==========================================

  getAll = async (req, res) => {
    try {
      const { canHoId } = req.params;
      const { skip = 0, limit = 50 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(canHoId)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID căn hộ không hợp lệ" });
      }

      const phongs = await RoomService.getAll(
        { can_ho_id: canHoId },
        {
          skip: Number(skip),
          limit: Number(limit),
        },
      );

      // Đồng bộ sử dụng object OK cho tất cả success response
      return res.status(200).json(new OK({ metadata: phongs }));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params; // Chuẩn hóa tham số thành `id`

      const [phong, noiThat] = await Promise.all([
        RoomService.getById(id),
        NoiThatService.getAllByPhong(id).catch(() => []), // Fallback nếu lỗi
      ]);

      if (!phong) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy phòng" });
      }

      const result = {
        phong,
        noiThat: noiThat || [],
        nguoiThue: null,
        hopDong: [], // Tránh crash khi frontend map()
      };

      return res.status(200).json(new OK({ metadata: result }));
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  create = async (req, res) => {
    try {
      // 1. Lấy dữ liệu từ body
      const payload = { ...req.body };

      // 2. TIỀN XỬ LÝ (PRE-PROCESS): Xử lý định dạng MongoDB Extended JSON
      // Nếu can_ho_id được gửi lên là một object chứa $oid, ta bóc tách lấy chuỗi bên trong
      if (
        payload.can_ho_id &&
        typeof payload.can_ho_id === "object" &&
        payload.can_ho_id.$oid
      ) {
        payload.can_ho_id = payload.can_ho_id.$oid;
      }

      // Dùng `value` từ Joi để lấy dữ liệu đã được làm sạch (strip unknown, type casting)
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
        .json(new OK({ message: "Tạo phòng thành công", metadata: phong }));
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params; // Chuẩn hóa lấy trực tiếp từ `id`

      const { error, value } = phongUpdateSchema.validate(req.body, {
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
          .json({ status: "ERROR", message: "Không tìm thấy phòng" });
      }

      return res
        .status(200)
        .json(
          new OK({ message: "Cập nhật phòng thành công", metadata: phong }),
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
          .json({ status: "ERROR", message: "Không tìm thấy phòng" });
      }

      return res
        .status(200)
        .json(new OK({ message: "Xóa phòng thành công", metadata: removed }));
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  // ==========================================
  // QUẢN LÝ NỘI THẤT TRONG PHÒNG
  // ==========================================

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
      const { id: phong_id } = req.params; // Lấy `id` từ params và đổi tên thành `phong_id`
      const { noi_that_id } = req.body;

      if (!noi_that_id) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "Thiếu noi_that_id" });
      }

      const updated = await NoiThatService.assignToPhong(noi_that_id, phong_id);

      return res.status(200).json(
        new OK({
          message: "Đã thêm nội thất vào phòng",
          metadata: updated,
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  // ==========================================
  // TÌM KIẾM VÀ THỐNG KÊ
  // ==========================================

  getBySoPhong = async (req, res) => {
    try {
      const { canHoId, soPhong } = req.params;

      if (!mongoose.Types.ObjectId.isValid(canHoId)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID căn hộ không hợp lệ" });
      }

      const phong = await RoomService.findBySoPhong(canHoId, soPhong);

      if (!phong) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy phòng" });
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
          .json({ status: "ERROR", message: "ID căn hộ không hợp lệ" });
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
          .json({ status: "ERROR", message: "ID căn hộ không hợp lệ" });
      }

      if (!trang_thai) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "Thiếu trạng thái để lọc" });
      }

      const filter = {
        can_ho_id: canHoId,
        trang_thai: trang_thai,
      };

      const phongs = await RoomService.getAll(filter, {
        skip: Number(skip),
        limit: Number(limit),
      });

      return res.status(200).json(new OK({ metadata: phongs }));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new RoomController();
