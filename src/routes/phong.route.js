import express from "express";
import PhongController from "../controllers/phong.controller.js";

const router = express.Router();

router.get("/", PhongController.getAll);
router.get("/:id", PhongController.getById);
router.post("/", PhongController.create);
router.put("/:id", PhongController.update);
router.delete("/:id", PhongController.remove);

//furniture
router.get("/:id/noithat", PhongController.getAllNoiThat);
router.post("/:id/noithat", PhongController.addNoiThat);

export default router;
