import mongoose from "mongoose";

const { Schema } = mongoose;

const billSchema = new Schema(
  {
    hop_dong_id: {
      type: Schema.Types.ObjectId,
      ref: "HopDong", // Tham chiếu chính xác tới model Hợp Đồng
      required: [true, "ID Hợp đồng không được để trống"],
    },
    so_tien: {
      type: Number,
      required: [true, "Số tiền hóa đơn không được để trống"],
      min: [0, "Số tiền không được nhỏ hơn 0"],
    },
    ngay_lap: {
      type: Date,
      default: Date.now,
      required: [true, "Ngày lập hóa đơn là bắt buộc"],
    },
    trang_thai: {
      type: String,
      enum: {
        // Thuần Việt tương tự như các module trước
        values: ["CHƯA THANH TOÁN", "ĐÃ THANH TOÁN", "QUÁ HẠN"],
        message: "{VALUE} không phải là trạng thái hợp lệ",
      },
      default: "CHƯA THANH TOÁN",
    },
    ghi_chu: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "HoaDon", // Tên chính xác trên MongoDB
  },
);

// Đánh chỉ mục (Index) để tối ưu hóa truy vấn khi lọc theo hợp đồng hoặc trạng thái
billSchema.index({ hop_dong_id: 1 });
billSchema.index({ trang_thai: 1 });
billSchema.index({ ngay_lap: -1 }); // Lọc hóa đơn theo tháng nhanh hơn

const Bill = mongoose.model("HoaDon", billSchema);

export default Bill;
