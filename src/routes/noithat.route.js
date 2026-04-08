import express from "express";
import NoiThatController from "../controllers/noithat.controller.js";

const router = express.Router();

router.get("/", NoiThatController.getAll);
router.get("/:id", NoiThatController.getById);
router.post("/", NoiThatController.create);
router.put("/:id", NoiThatController.update);
router.delete("/:id", NoiThatController.remove);

// get all furniture for a room
router.get("/phong/:id", NoiThatController.getAllByPhong);

export default router;
