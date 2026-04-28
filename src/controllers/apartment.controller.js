import mongoose from "mongoose";
import {
  apartmentCreateSchema,
  apartmentUpdateSchema,
} from "../utils/validations/apartment.validation.js";
import ApartmentService from "../services/apartment.service.js";
import RoomService from "../services/room.service.js"; // Import thêm RoomService
import { OK } from "../handler/success-response.js";

class ApartmentController {
  getAll = async (req, res) => {
    try {
      const { skip = 0, limit = 50 } = req.query;

      const items = await ApartmentService.getAll(
        {},
        {
          skip: Number(skip),
          limit: Number(limit),
        },
      );

      return res.status(200).json(new OK({ metadata: items }));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID căn hộ không hợp lệ" });
      }

      // XỬ LÝ LIÊN KẾT: Lấy thông tin Căn hộ và Danh sách Phòng song song
      const [apartment, rooms] = await Promise.all([
        ApartmentService.getById(id),

        // SỬA Ở ĐÂY 1: Ép kiểu id sang ObjectId thủ công để đảm bảo Mongoose query đúng
        RoomService.getAll(
          { can_ho_id: new mongoose.Types.ObjectId(id) },
          { limit: 1000 },
        ).catch((err) => {
          // SỬA Ở ĐÂY 2: Log lỗi ra màn hình thay vì im lặng trả về mảng rỗng
          console.error("❌ Lỗi khi lấy danh sách phòng:", err);
          return [];
        }),
      ]);

      if (!apartment) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy căn hộ" });
      }

      const result = {
        ...apartment,
        danh_sach_phong: rooms || [],
        so_luong_phong_thuc_te: rooms?.length || 0,
      };

      return res.status(200).json(new OK({ metadata: result }));
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  create = async (req, res) => {
    try {
      const { error, value } = apartmentCreateSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errorMessage = error.details.map((err) => err.message).join(", ");
        return res.status(400).json({ status: "ERROR", message: errorMessage });
      }

      const newItem = await ApartmentService.create(value);

      return res.status(201).json(
        new OK({
          message: "Tạo căn hộ thành công",
          metadata: newItem,
        }),
      );
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
          .json({ status: "ERROR", message: "ID căn hộ không hợp lệ" });
      }

      const { error, value } = apartmentUpdateSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errorMessage = error.details.map((err) => err.message).join(", ");
        return res.status(400).json({ status: "ERROR", message: errorMessage });
      }

      const updatedItem = await ApartmentService.update(id, value);

      if (!updatedItem) {
        return res.status(404).json({
          status: "ERROR",
          message: "Không tìm thấy căn hộ để cập nhật",
        });
      }

      return res.status(200).json(
        new OK({
          message: "Cập nhật căn hộ thành công",
          metadata: updatedItem,
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  remove = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID căn hộ không hợp lệ" });
      }

      const deletedItem = await ApartmentService.remove(id);

      if (!deletedItem) {
        return res.status(404).json({
          status: "ERROR",
          message: "Không tìm thấy căn hộ để xóa",
        });
      }

      return res.status(200).json(
        new OK({
          message: "Xóa căn hộ thành công",
          metadata: deletedItem,
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new ApartmentController();
