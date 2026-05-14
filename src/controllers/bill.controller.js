import mongoose from "mongoose";
import BillService from "../services/bill.service.js";
import { OK } from "../handler/success-response.js";

// Import trực tiếp Model để dùng cho hàm test nạp data (Sửa đường dẫn nếu cần)
import BillModel from "../models/bill.model.js";
import RoomModel from "../models/room.model.js";
import TenantModel from "../models/tenant.model.js";
import ContractModel from "../models/contract.model.js";

class BillController {
  // ==========================================
  // HÀM TEST: NẠP DỮ LIỆU GIẢ CHO DASHBOARD
  // ==========================================
  magicSeedTestData = async (req, res) => {
    try {
      // Lấy đại 1 phòng có sẵn để mượn ID (tránh lỗi ObjectId)
      const room = await RoomModel.findOne();

      if (!room) {
        return res.status(400).json({
          status: "ERROR",
          message: "Cần ít nhất 1 phòng trong DB để tạo dữ liệu giả!"
        });
      }

      const mockBills = [];
      const now = new Date(); // Lấy thời gian hiện tại

      // 1. TẠO BILL ĐÃ THANH TOÁN (CHO CHART)
      // Vòng lặp rải data về quá khứ 6 tháng
      for (let i = 0; i < 6; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 15);

        mockBills.push({
          hop_dong_id: new mongoose.Types.ObjectId(), // Dùng id mock vì aggreagte chart chỉ cần trang_thai & ngay_lap
          loai_phi: "Hóa Đơn Test Demo", // (Trường ngoài, lờ đi cũng đc)
          so_tien: Math.floor(Math.random() * 5 + 3) * 1000000,
          trang_thai: "ĐÃ THANH TOÁN",
          ngay_lap: targetDate,
        });
      }


      // 2. TẠO TENANT VÀ BILL QUÁ HẠN (CHO OVERDUE)
      const mockTenantsData = [
        { ho_ten: "Nguyễn Minh Tuấn", so_dien_thoai: "0901234567" },
        { ho_ten: "Trần Thị Mai", so_dien_thoai: "0912345678" },
        { ho_ten: "Lê Hoàng Bách", so_dien_thoai: "0923456789" }
      ];

      const createdTenants = await TenantModel.insertMany(mockTenantsData);

      // Ngày trễ: Lùi về 35, 38, và 42 ngày trước (Vì logic Dashboard đếm >30 ngày là trễ)
      const overdueOffsets = [35, 38, 42];

      for (let i = 0; i < createdTenants.length; i++) {
        const tenant = createdTenants[i];
        const overdueDate = new Date(now.getTime() - (overdueOffsets[i] * 24 * 60 * 60 * 1000));

        // Tạo Hợp đồng giả (Bắt buộc vì Dashboard dựa vào Hợp đồng để móc Phong & Tenant)
        const mockContract = await ContractModel.create({
          nguoi_thue_id: tenant._id,
          phong_id: room._id,
          ngay_bat_dau: new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)), // 2 tháng trước
          ngay_ket_thuc: new Date(now.getTime() + (300 * 24 * 60 * 60 * 1000)), // 10 tháng sau
          trang_thai: "active"
        });

        mockBills.push({
          hop_dong_id: mockContract._id, // Phải liên kết hợp đồng để populate ra dc Tenant
          so_tien: Math.floor(Math.random() * 3 + 2) * 1000000, // 2-5 củ
          trang_thai: "CHƯA THANH TOÁN", // Ghi đúng chuẩn
          ngay_lap: overdueDate,
        });
      }

      // Nhồi toàn bộ bill (Đã Thanh Toán & Chưa Thanh Toán) vào DB
      const insertedBills = await BillModel.insertMany(mockBills);

      return res.status(200).json(
        new OK({
          message: "Đã nạp dữ liệu Dashboard thành công! Rải 6 bill ĐÃ THANH TOÁN và 3 bill QUÁ HẠN.",
          metadata: insertedBills,
        })
      );
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  // ==========================================
  // LẤY DANH SÁCH & CHI TIẾT
  // ==========================================

  getAll = async (req, res) => {
    try {
      const { skip = 0, limit = 50, trang_thai, hop_dong_id } = req.query;

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