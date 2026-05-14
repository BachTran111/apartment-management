import mongoose from "mongoose";
const { Schema } = mongoose;

const ContractSchema = new Schema(
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
    ngay_bat_dau: {
      type: Date,
      required: [true, "ngay_bat_dau is required"],
    },
    ngay_ket_thuc: {
      type: Date,
      required: [true, "ngay_ket_thuc is required"],
      validate: {
        validator(value) {
          if (!this.ngay_bat_dau || !value) {
            return true;
          }
          return this.ngay_bat_dau < value;
        },
        message: "ngay_bat_dau must be before ngay_ket_thuc",
      },
    },
    tien_dat_coc: {
      type: Number,
      min: [0, "tien_dat_coc cannot be negative"],
    },
    trang_thai: {
      type: String,
      enum: ["active", "expired", "terminated"],
      default: "active",
    },
    ngay_thanh_ly: {
      type: Date,
      default: null,
    },
    chi_phi_phat_sinh: {
      type: Number,
      min: [0, "chi_phi_phat_sinh cannot be negative"],
      default: 0,
    },
    ghi_chu: {
      type: String,
      default: null,
    },
  },
  { collection: "HopDong" },
);

export default mongoose.model("HopDong", ContractSchema);
