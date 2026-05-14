import mongoose from "mongoose";
import TenantService from "../services/tenant.service.js"; // Cập nhật import Class Service
import { OK } from "../handler/success-response.js";

class TenantController {
  // ==========================================
  // LẤY DANH SÁCH & TÌM KIẾM
  // ==========================================

  getAll = async (req, res) => {
    try {
      const { skip = 0, limit = 50, trang_thai } = req.query;

      const filter = {};
      if (trang_thai) {
        filter.trang_thai = trang_thai;
      }

      // Gọi hàm getAll từ Service mới (đã bao gồm trả về tổng số)
      const result = await TenantService.getAll(filter, {
        skip: Number(skip),
        limit: Number(limit),
      });

      return res.status(200).json(
        new OK({
          message: "Lấy danh sách người thuê thành công",
          metadata: result,
        }),
      );
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  search = async (req, res) => {
    try {
      const { q, skip = 0, limit = 50 } = req.query;

      if (!q || q.trim() === "") {
        return res.status(400).json({
          status: "ERROR",
          message: "Vui lòng nhập từ khóa tìm kiếm",
        });
      }

      const result = await TenantService.search(q, {
        skip: Number(skip),
        limit: Number(limit),
      });

      return res.status(200).json(
        new OK({
          message: "Tìm kiếm người thuê thành công",
          metadata: result,
        }),
      );
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  // ==========================================
  // CRUD CƠ BẢN
  // ==========================================

  getById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID người thuê không hợp lệ" });
      }

      const tenant = await TenantService.getById(id);

      if (!tenant) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy người thuê" });
      }

      return res.status(200).json(
        new OK({
          message: "Lấy thông tin người thuê thành công",
          metadata: tenant,
        }),
      );
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  create = async (req, res) => {
    try {
      const newTenant = await TenantService.create(req.body);

      return res.status(201).json(
        new OK({
          message: "Thêm người thuê thành công",
          metadata: newTenant,
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
          .json({ status: "ERROR", message: "ID người thuê không hợp lệ" });
      }

      const updatedTenant = await TenantService.update(id, req.body);

      if (!updatedTenant) {
        return res.status(404).json({
          status: "ERROR",
          message: "Không tìm thấy người thuê để cập nhật",
        });
      }

      return res.status(200).json(
        new OK({
          message: "Cập nhật thông tin người thuê thành công",
          metadata: updatedTenant,
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
          .json({ status: "ERROR", message: "ID người thuê không hợp lệ" });
      }

      const deletedTenant = await TenantService.remove(id);

      if (!deletedTenant) {
        return res
          .status(404)
          .json({
            status: "ERROR",
            message: "Không tìm thấy người thuê để xóa",
          });
      }

      return res.status(200).json(
        new OK({
          message: "Xóa người thuê thành công",
          metadata: deletedTenant,
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };
}

export default new TenantController();
