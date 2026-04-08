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
});

const CanHoSchema = new Schema({
  ten: String,
  dia_chi: String,
  tong_so_phong: Number,
  phong: [PhongSchema],
});

const NguoiThueSchema = new Schema({
  ho_ten: String,
  so_dien_thoai: String,
  email: String,
  cmnd_cccd: String,
});

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
