import mongoose from "mongoose";

const { Schema } = mongoose;

const interiorSchema = new Schema(
  {
    phong_id: {
      type: Schema.Types.ObjectId,
      ref: "Phong",
      default: null,
    },
    ten_noi_that: {
      type: String,
      required: [true, "Tên nội thất không được để trống"],
      trim: true,
    },
    tinh_trang: {
      type: String,
      enum: ["Mới", "Đang Sử Dụng", "Hư Hỏng", "Cần Thay Thế"],
      default: "Mới",
    },
    // ... Thêm các trường khác của bạn tại đây (ví dụ: gia_tri, hinh_anh, v.v.)
  },
  {
    timestamps: true,
    // Chỉ định chính xác tên collection trên MongoDB Atlas
    collection: "NoiThat",
  },
);

// Tạo index nếu cần truy xuất nội thất theo phòng thường xuyên
interiorSchema.index({ phong_id: 1 });

const Interior = mongoose.model("NoiThat", interiorSchema);

export default Interior;
