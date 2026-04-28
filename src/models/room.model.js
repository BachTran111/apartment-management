import mongoose from "mongoose";

const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    can_ho_id: {
      type: Schema.Types.ObjectId,
      ref: "CanHo",
      required: [true, "Phải liên kết với một căn hộ"],
      index: true,
    },
    anh_phong: {
      type: String,
      default: "",
    },
    so_phong: {
      type: String,
      required: [true, "Số phòng không được để trống"],
      trim: true,
    },
    dien_tich: {
      type: Number,
      required: [true, "Diện tích không được để trống"],
      min: [0.1, "Diện tích phải lớn hơn 0"],
    },
    gia: {
      type: Number,
      required: [true, "Giá thuê không được để trống"],
      min: [0, "Giá thuê phải lớn hơn hoặc bằng 0"],
    },
    trang_thai: {
      type: String,
      enum: {
        values: [
          "Phòng Trống",
          "Đang Có Người Ở",
          "Đang Bảo Trì",
          "Không Sử Dụng",
        ],
        message: "{VALUE} không phải là trạng thái hợp lệ",
      },
      required: true,
      default: "Phòng Trống",
    },
    // Quan hệ (Relations)
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
  {
    timestamps: true,
    // Chỉ định chính xác tên collection trên MongoDB Atlas
    collection: "Phong",
  },
);

// Tạo index để tối ưu hóa truy vấn theo số phòng trong từng căn hộ
roomSchema.index({ can_ho_id: 1, so_phong: 1 }, { unique: true });

const Room = mongoose.model("Phong", roomSchema);

export default Room;
