import express from "express";
import RoomController from "../controllers/room.controller.js"; // Cập nhật tên import theo chuẩn

const router = express.Router();

// ==========================================
// TÌM KIẾM VÀ THỐNG KÊ
// (Nên đặt các route này lên trên để tránh xung đột với route /:id ở dưới)
// ==========================================
router.get("/apartment/:canHoId/filter", RoomController.filterByTrangThai);
router.get("/apartment/:canHoId/count-all", RoomController.countAllTrangThai);
router.get("/apartment/:canHoId/sophong/:soPhong", RoomController.getBySoPhong);
router.get("/apartment/:canHoId", RoomController.getAll);

// ==========================================
// QUẢN LÝ THÔNG TIN PHÒNG
// ==========================================
router.post("/", RoomController.create);
router.get("/:id", RoomController.getById); // Đã đổi :phongId thành :id để khớp với Controller
router.put("/:id", RoomController.update); // Đã đổi :phongId thành :id
router.delete("/:id", RoomController.remove); // Đã đổi :phongId thành :id

// ==========================================
// QUẢN LÝ NỘI THẤT TRONG PHÒNG
// ==========================================
router.get("/:id/feature", RoomController.getAllNoiThat); // Đã đổi :phongId thành :id
router.post("/:id/feature", RoomController.addNoiThat); // Đã đổi :phongId thành :id

export default router;
