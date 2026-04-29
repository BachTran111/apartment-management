import express from "express";
import TenantController from "../controllers/tenant.controller.js"; // Đã cập nhật cách import chuẩn

const router = express.Router();

// ==========================================
// TÌM KIẾM NGƯỜI THUÊ
// (Bắt buộc phải đặt /search lên trước /:id để tránh bị nhận nhầm params)
// ==========================================
// GET /api/tenants/search?q=...
router.get("/search", TenantController.search);

// ==========================================
// QUẢN LÝ THÔNG TIN NGƯỜI THUÊ (CRUD)
// ==========================================

// 1. Lấy danh sách tất cả người thuê (hỗ trợ phân trang và lọc)
// GET /api/tenants
router.get("/", TenantController.getAll);

// 2. Thêm mới một người thuê
// POST /api/tenants
router.post("/", TenantController.create);

// 3. Lấy thông tin chi tiết của 1 người thuê cụ thể
// GET /api/tenants/:id
router.get("/:id", TenantController.getById);

// 4. Cập nhật thông tin người thuê
// PUT /api/tenants/:id
router.put("/:id", TenantController.update);

// 5. Xóa người thuê khỏi hệ thống
// DELETE /api/tenants/:id
router.delete("/:id", TenantController.remove);

export default router;
