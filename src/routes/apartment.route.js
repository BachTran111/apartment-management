import express from "express";
import ApartmentController from "../controllers/apartment.controller.js";

const router = express.Router();

// ==========================================
// LẤY DANH SÁCH & TÌM KIẾM
// ==========================================
// Lấy danh sách căn hộ (Hỗ trợ phân trang và filter qua req.query)
// Ví dụ: GET /api/apartments?skip=0&limit=10&ten=Sunrise
router.get("/search", ApartmentController.search);
router.get("/", ApartmentController.getAll);

// ==========================================
// QUẢN LÝ THÔNG TIN CĂN HỘ (CRUD)
// ==========================================
// Thêm mới căn hộ
router.post("/", ApartmentController.create);

// Lấy thông tin chi tiết một căn hộ theo ID
router.get("/:id", ApartmentController.getById);

// Cập nhật thông tin căn hộ
router.put("/:id", ApartmentController.update);

// Xóa căn hộ
router.delete("/:id", ApartmentController.remove);

export default router;
