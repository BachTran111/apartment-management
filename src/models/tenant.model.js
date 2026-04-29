import mongoose from "mongoose";

const { Schema } = mongoose;

const tenantSchema = new Schema(
  {
    ho_ten: {
      type: String,
      required: [true, "Họ tên không được để trống"],
      trim: true,
    },
    tuoi: {
      type: Number,
      min: [18, "Tuổi người thuê phải từ 18 trở lên"],
    },
    cmnd_cccd: {
      type: String,
      trim: true,
    },
    que_quan: {
      type: String,
      trim: true,
    },
    so_dien_thoai: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,11}$/, "Số điện thoại phải chứa 10-11 chữ số"],
    },
    anh_dai_dien: {
      type: String,
      default: "", // Tối ưu: Dùng chuỗi rỗng thay vì null cho kiểu String
    },
    phong_id: {
      type: Schema.Types.ObjectId,
      ref: "Phong",
    },
    ngay_bat_dau: {
      type: Date,
    },
    ngay_ket_thuc: {
      type: Date,
    },
    tien_phong: {
      type: Number,
      min: [0, "Tiền phòng phải lớn hơn hoặc bằng 0"],
    },
    lien_he_khan_cap: {
      type: String,
      trim: true,
      match: [
        /^[0-9]{10,11}$/,
        "Số điện thoại liên hệ khẩn cấp phải chứa 10-11 chữ số",
      ],
    },
    anh_hop_dong: [
      {
        type: String,
      },
    ],
    trang_thai: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "{VALUE} không phải là trạng thái hợp lệ",
      },
      default: "active",
    },
    email: {
      type: String,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không đúng định dạng"],
    },
  },
  {
    timestamps: true,
    // Chỉ định chính xác tên collection trên MongoDB Atlas
    collection: "NguoiThue",
  },
);

// ==========================================
// INDEXES TỐI ƯU TRUY VẤN
// ==========================================
// Đánh index để tăng tốc khi tìm kiếm người thuê theo phòng, CCCD hoặc SĐT
tenantSchema.index({ phong_id: 1 });
tenantSchema.index({ cmnd_cccd: 1 });
tenantSchema.index({ so_dien_thoai: 1 });

const Tenant = mongoose.model("NguoiThue", tenantSchema);

export default Tenant;
