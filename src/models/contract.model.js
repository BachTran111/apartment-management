import mongoose from "mongoose";

const { Schema } = mongoose;

const contractSchema = new Schema(
  {
    nguoi_thue_id: {
      type: Schema.Types.ObjectId,
      ref: "NguoiThue",
      required: [true, "ID Người thuê không được để trống"],
    },
    phong_id: {
      type: Schema.Types.ObjectId,
      ref: "Phong",
      required: [true, "ID Phòng không được để trống"],
    },
    ngay_bat_dau: {
      type: Date,
      required: [true, "Ngày bắt đầu hợp đồng không được để trống"],
    },
    ngay_ket_thuc: {
      type: Date,
      required: [true, "Ngày kết thúc hợp đồng không được để trống"],
    },
    tien_dat_coc: {
      type: Number,
      required: [true, "Tiền đặt cọc không được để trống"],
      min: [0, "Tiền đặt cọc phải lớn hơn hoặc bằng 0"],
    },
    trang_thai: {
      type: String,
      enum: {
        values: ["KHẢ DỤNG", "HẾT HẠN"],
        message: "{VALUE} không phải là trạng thái hợp lệ",
      },
      default: "KHẢ DỤNG",
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
    // Chỉ định chính xác tên collection trên MongoDB Atlas
    collection: "HopDong",
  },
);

// ==========================================
// INDEXES TỐI ƯU TRUY VẤN
// ==========================================
// Đánh index để tăng tốc khi tìm kiếm hợp đồng theo phòng hoặc theo người thuê
contractSchema.index({ phong_id: 1 });
contractSchema.index({ nguoi_thue_id: 1 });

const Contract = mongoose.model("HopDong", contractSchema);

export default Contract;
