import express from "express";
import * as roomController from "../controllers/room.controller.js";

const router = express.Router();

router.get("/", roomController.getAllRooms);

export default router;
