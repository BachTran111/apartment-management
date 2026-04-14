import express from "express";
import CanHoController from "../controllers/canHo.controller.js";

const router = express.Router();

router.get("/", CanHoController.getAll);
router.get("/:canHoId", CanHoController.getById);
router.post("/", CanHoController.create);
router.put("/:canHoId", CanHoController.update);
router.delete("/:canHoId", CanHoController.remove);

export default router;