const mongoose = require("mongoose");

const { Schema } = mongoose;

const LichSuSuaChuaSchema = new Schema({
  ngay_sua: { type: Date, required: true },
  mo_ta: String,
  chi_phi: Number,
});

const NoiThatSchema = new Schema({
  ten: String,
  so_luong: Number,
  tinh_trang: String,
  lich_su_sua_chua: [LichSuSuaChuaSchema],
});

const PhongSchema = new Schema({
  so_phong: String,
  dien_tich: Number,
  gia: Number,
  trang_thai: {
    type: String,
    enum: ["available", "occupied"],
    default: "available",
  },
  noi_that: [NoiThatSchema],
  nguoi_thue_id: { type: Schema.Types.ObjectId, ref: "NguoiThue" },
  hop_dong_id: { type: Schema.Types.ObjectId, ref: "HopDong" },
});

const CanHoSchema = new Schema({
  ten: String,
  dia_chi: String,
  tong_so_phong: Number,
  phong: [PhongSchema],
});

const NguoiThueSchema = new Schema({
  ho_ten: { type: String, required: true },
  so_dien_thoai: { type: String, required: true },
  email: { type: String },
  cmnd_cccd: { type: String },
  ngay_sinh: { type: Date },
  que_quan: { type: String },
  anh_tai_lieu: [{ type: String }],
  ghi_chu: { type: String },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

const HopDongSchema = new Schema({
  nguoi_thue_id: {
    type: Schema.Types.ObjectId,
    ref: "NguoiThue",
    required: true,
  },
  phong_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  ngay_bat_dau: Date,
  ngay_ket_thuc: Date,
  tien_dat_coc: Number,
  trang_thai: {
    type: String,
    enum: ["active", "expired"],
    default: "active",
  },
});

const HoaDonSchema = new Schema({
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
});

const QuanTriVienSchema = new Schema({
  ten_dang_nhap: String,
  mat_khau: String,
});

module.exports = {
  CanHo: mongoose.model("CanHo", CanHoSchema),
  NguoiThue: mongoose.model("NguoiThue", NguoiThueSchema),
  HopDong: mongoose.model("HopDong", HopDongSchema),
  HoaDon: mongoose.model("HoaDon", HoaDonSchema),
  QuanTriVien: mongoose.model("QuanTriVien", QuanTriVienSchema),
};
