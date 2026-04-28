import mongoose from "mongoose";

const { Schema } = mongoose;

const apartmentSchema = new Schema(
  {
    ten: {
      type: String,
      required: [true, "Tên căn hộ không được để trống"],
      trim: true,
      minlength: [3, "Tên căn hộ phải có ít nhất 3 ký tự"],
      maxlength: [255, "Tên căn hộ không được vượt quá 255 ký tự"],
    },
    dia_chi: {
      type: String,
      required: [true, "Địa chỉ không được để trống"],
      trim: true,
      minlength: [5, "Địa chỉ phải có ít nhất 5 ký tự"],
    },
    tong_so_phong: {
      type: Number,
      required: [true, "Tổng số phòng không được để trống"],
      min: [1, "Tổng số phòng phải lớn hơn hoặc bằng 1"],
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} không phải là số nguyên hợp lệ",
      },
    },
    so_dien_thoai: {
      type: String,
      trim: true,
      match: [
        /^0[0-9]{9,10}$/,
        "Số điện thoại không hợp lệ (phải bắt đầu bằng số 0 và có 10-11 chữ số)",
      ],
    },
    email: {
      type: String,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email không đúng định dạng"],
    },
    ghi_chu: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    // Chỉ định chính xác tên collection trên MongoDB Atlas
    collection: "CanHo",
  },
);

const Apartment = mongoose.model("CanHo", apartmentSchema);

export default Apartment;
