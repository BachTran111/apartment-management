import mongoose from "mongoose";
const { Schema } = mongoose;

const CanHoSchema = new Schema(
  {
    ten: { type: String, required: true },
    dia_chi: { type: String, required: true },
    tong_so_phong: { type: Number, default: 0 },
    so_dien_thoai: { type: String },
    email: { type: String },
    ghi_chu: { type: String },
  },
  { collection: "CanHo", timestamps: true }
);

export default mongoose.model("CanHo", CanHoSchema);