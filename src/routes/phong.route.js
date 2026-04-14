import express from "express";
import PhongController from "../controllers/phong.controller.js";

const router = express.Router();

router.get("/canho/:canHoId/filter", PhongController.filterByTrangThai);
router.get("/canho/:canHoId/count-all", PhongController.countAllTrangThai);
router.get("/canho/:canHoId/sophong/:soPhong", PhongController.getBySoPhong);
router.get("/canho/:canHoId", PhongController.getAll);
router.get("/:phongId", PhongController.getById);

router.post("/", PhongController.create);
router.put("/:phongId", PhongController.update);
router.delete("/:phongId", PhongController.remove);

router.get("/:phongId/noithat", PhongController.getAllNoiThat);
router.post("/:phongId/noithat", PhongController.addNoiThat);

export default router;
