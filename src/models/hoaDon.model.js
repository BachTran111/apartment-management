const mongoose = require("mongoose");
const { Schema } = mongoose;

const HoaDonSchema = new Schema(
  {
    hop_dong_id: {
      type: Schema.Types.ObjectId,
      ref: "HopDong",
    },
    so_tien: Number,
    ngay_lap: Date,
    trang_thai: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
  },
  { collection: "HoaDon" },
);

module.exports = mongoose.model("HoaDon", HoaDonSchema);
