import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    ho_ten: {
      type: String,
      required: true,
      trim: true,
    },
    tuoi: {
      type: Number,
      min: 18,
    },
    cmnd_cccd: {
      type: String,
      trim: true,
    },
    que_quan: {
      type: String,
    },
    so_dien_thoai: {
      type: String,
      match: /^[0-9]{10,11}$/,
    },
    anh_dai_dien: {
      type: String,
      default: null,
    },
    phong_id: {
      type: mongoose.Schema.Types.ObjectId,
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
      min: 0,
    },
    lien_he_khan_cap: {
      type: String,
      match: /^[0-9]{10,11}$/,
    },
    anh_hop_dong: [
      {
        type: String,
      },
    ],
    trang_thai: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "NguoiThue"
  }
);

export default mongoose.model("NguoiThue", tenantSchema);
