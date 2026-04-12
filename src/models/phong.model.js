import mongoose from "mongoose";

const { Schema } = mongoose;

const phongSchema = new Schema(
  {
    phong_id: {
      type: Number,
      required: true,
      unique: true,
    },
    can_ho_id: {
      type: Schema.Types.ObjectId,
      ref: "CanHo",
      required: true,
    },
    anh_phong: {
      type: String,
    },
    so_phong: {
      type: String,
      required: true,
    },
    dien_tich: {
      type: Number,
      required: true,
    },
    gia: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    trang_thai: {
      type: String,
      enum: ["Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng"],
      required: true,
      default: "Phòng Trống",
    },
    // Relations
    nguoi_thue_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "NguoiThue",
      },
    ],
    noi_that_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "NoiThat",
      },
    ],
    hop_dong_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "HopDong",
      },
    ],
  },
  { timestamps: true },
);

const PhongModel = mongoose.model("Phong", phongSchema);
export default PhongModel;
