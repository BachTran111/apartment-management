import express from "express";
import InteriorController from "../controllers/interior.controller.js";

const router = express.Router();

router.get("/room/:roomId", InteriorController.getAllByPhong);
router.get("/", InteriorController.getAll);
router.post("/", InteriorController.create);
router.get("/:id", InteriorController.getById);
router.put("/:id", InteriorController.update);
router.delete("/:id", InteriorController.remove);

export default router;
