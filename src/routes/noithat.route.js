import express from "express";
import NoiThatController from "../controllers/noithat.controller.js";

const router = express.Router();

router.get("/", NoiThatController.getAll);
router.get("/phong/:phongId", NoiThatController.getAllByPhong);

router.get("/:noiThatId", NoiThatController.getById);
router.post("/", NoiThatController.create);
router.put("/:noiThatId", NoiThatController.update);
router.delete("/:noiThatId", NoiThatController.remove);

export default router;
