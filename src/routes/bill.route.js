import express from "express";
import BillController from "../controllers/bill.controller.js";

const router = express.Router();

router.get("/seed-test", BillController.magicSeedTestData);

// Lấy danh sách hóa đơn (hỗ trợ phân trang và lọc: ?trang_thai=ĐÃ THANH TOÁN&hop_dong_id=...)
router.get("/", BillController.getAll);

// Thêm hóa đơn mới
router.post("/", BillController.create);

// Lấy chi tiết 1 hóa đơn
router.get("/:id", BillController.getById);

// Cập nhật hóa đơn (đổi trạng thái, số tiền...)
router.put("/:id", BillController.update);

// Xóa hóa đơn
router.delete("/:id", BillController.remove);

export default router;