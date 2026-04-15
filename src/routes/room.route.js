import express from "express";
import { CanHo } from "../models/model.cjs";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const canHos = await CanHo.find();
    const rooms = [];
    
    canHos.forEach((canHo) => {
      canHo.phong.forEach((phong) => {
        rooms.push({
          _id: phong._id,
          so_phong: phong.so_phong,
          gia: phong.gia,
          trang_thai: phong.trang_thai,
          can_ho: canHo.ten,
        });
      });
    });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

router.get("/available", async (req, res) => {
  try {
    const canHos = await CanHo.find();
    const rooms = [];
    
    canHos.forEach((canHo) => {
      canHo.phong.forEach((phong) => {
        if (phong.trang_thai === "available") {
          rooms.push({
            _id: phong._id,
            so_phong: phong.so_phong,
            gia: phong.gia,
            can_ho: canHo.ten,
          });
        }
      });
    });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ status: "ERROR", message: err.message });
  }
});

export default router;
