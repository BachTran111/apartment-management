import mongoose from "mongoose";

const PhongSchema = new mongoose.Schema(
  {
    can_ho_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CanHo",
    },
    so_phong: String,
    dien_tich: Number,
    gia: Number,
    building: String,
    trang_thai: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
    },
  },
  { collection: "Phong" }
);

export default mongoose.model("Phong", PhongSchema);
