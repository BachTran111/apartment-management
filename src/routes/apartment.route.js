import express from "express";
import ApartmentController from "../controllers/apartment.controller.js";

const router = express.Router();

router.get("/search", ApartmentController.search);
router.get("/", ApartmentController.getAll);

// Thêm mới căn hộ
router.post("/", ApartmentController.create);

// Lấy thông tin chi tiết một căn hộ theo ID
router.get("/:id", ApartmentController.getById);

// Cập nhật thông tin căn hộ
router.put("/:id", ApartmentController.update);

// Xóa căn hộ
router.delete("/:id", ApartmentController.remove);

export default router;
