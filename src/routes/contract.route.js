import express from "express";
import ContractController from "../controllers/contract.controller.js";

const router = express.Router();

// ==========================================
// TÌM KIẾM VÀ THỐNG KÊ (Đặt lên trên cùng)
// ==========================================
// Lấy thống kê tổng quan
router.get("/stats", ContractController.getStatistics);

// Lấy hợp đồng sắp hết hạn
router.get("/expiring", ContractController.getExpiringContracts);

// Lấy danh sách hợp đồng (hỗ trợ phân trang: ?page=1&limit=10)
router.get("/", ContractController.getAllContracts);

// Lấy hợp đồng theo trạng thái cụ thể (Ví dụ: /status/KHẢ DỤNG)
router.get("/status/:status", ContractController.getContractsByStatus);

// ==========================================
// QUẢN LÝ THÔNG TIN HỢP ĐỒNG (CRUD)
// ==========================================
// Tạo hợp đồng mới
router.post("/", ContractController.create);

// Lấy chi tiết 1 hợp đồng
router.get("/:id", ContractController.getById);

// Cập nhật hợp đồng
router.put("/:id", ContractController.update);

// Xóa hợp đồng
router.delete("/:id", ContractController.remove);

export default router;
