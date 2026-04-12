import mongoose from "mongoose";
const { Schema } = mongoose;

const HopDongSchema = new Schema(
  {
    nguoi_thue_id: {
      type: Schema.Types.ObjectId,
      ref: "NguoiThue",
      required: true,
    },
    phong_id: {
      type: Schema.Types.ObjectId,
      ref: "Phong",
      required: true,
    },
    ngay_bat_dau: Date,
    ngay_ket_thuc: Date,
    tien_dat_coc: Number,
    trang_thai: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
  },
  { collection: "HopDong" },
);

export default mongoose.model("HopDong", HopDongSchema);
