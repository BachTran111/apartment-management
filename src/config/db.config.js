import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  CanHo,
  Phong,
  NguoiThue,
  HopDong,
  HoaDon,
  QuanTriVien,
  NoiThat,
  LichSuSuaChua,
} from "../models/index.js";

dotenv.config({ quiet: true });

export default async function instanceMongoDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  try {
    mongoose.set("debug", false);
    // mongoose.set("debug", { color: true });
    mongoose.set?.("strictQuery", false);

    mongoose.connect(process.env.MONGO_URI);
    console.log(" Connected to MongoDB");
    return mongoose;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
