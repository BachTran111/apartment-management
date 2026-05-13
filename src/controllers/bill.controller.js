import mongoose from "mongoose";
import BillService from "../services/bill.service.js";
import { OK } from "../handler/success-response.js";

class BillController {
  // ==========================================
  // LẤY DANH SÁCH & CHI TIẾT
  // ==========================================

  getAll = async (req, res) => {
    try {
      const { skip = 0, limit = 50, trang_thai, hop_dong_id } = req.query;

      // Xây dựng bộ lọc động
      const filter = {};
      if (trang_thai) filter.trang_thai = trang_thai;
      if (hop_dong_id) filter.hop_dong_id = hop_dong_id;

      const result = await BillService.getAll(filter, {
        skip: Number(skip),
        limit: Number(limit),
      });

      return res.status(200).json(
        new OK({
          message: "Lấy danh sách hóa đơn thành công",
          metadata: result,
        }),
      );
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID hóa đơn không hợp lệ" });
      }

      const bill = await BillService.getById(id);

      if (!bill) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy hóa đơn" });
      }

      return res.status(200).json(
        new OK({
          message: "Lấy chi tiết hóa đơn thành công",
          metadata: bill,
        }),
      );
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  // ==========================================
  // THÊM / SỬA / XÓA (CRUD)
  // ==========================================

  create = async (req, res) => {
    try {
      // Truyền trực tiếp payload vào hàm create
      const newBill = await BillService.create(req.body);

      return res.status(201).json(
        new OK({
          message: "Tạo hóa đơn thành công",
          metadata: newBill,
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
          .json({ status: "ERROR", message: "ID hóa đơn không hợp lệ" });
      }

      const updatedBill = await BillService.update(id, req.body);

      if (!updatedBill) {
        return res.status(404).json({
          status: "ERROR",
          message: "Không tìm thấy hóa đơn để cập nhật",
        });
      }

      return res.status(200).json(
        new OK({
          message: "Cập nhật hóa đơn thành công",
          metadata: updatedBill,
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
          .json({ status: "ERROR", message: "ID hóa đơn không hợp lệ" });
      }

      const deletedBill = await BillService.remove(id);

      if (!deletedBill) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy hóa đơn để xóa" });
      }

      return res.status(200).json(
        new OK({
          message: "Xóa hóa đơn thành công",
          metadata: deletedBill,
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new BillController();
