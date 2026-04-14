import mongoose from "mongoose";
const { Schema } = mongoose;

const PhongSchema = new Schema(
  {
    can_ho_id: {
      type: Schema.Types.ObjectId,
      ref: "CanHo",
      required: true,
    },
    so_phong: String,
    dien_tich: Number,
    gia: Number,
    trang_thai: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
    },
  },
  { collection: "Phong" },
);

export default mongoose.model("Phong", PhongSchema);
