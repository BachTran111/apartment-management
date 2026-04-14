import mongoose from "mongoose";

const { Schema } = mongoose;

const phongSchema = new Schema(
  {
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
      trim: true,
    },
    dien_tich: {
      type: Number,
      required: true,
      min: [0.1, "Diện tích phải lớn hơn 0"],
    },
    gia: {
      type: Number,
      required: true,
      min: [0, "Giá thuê phải lớn hơn hoặc bằng 0"],
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
