const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuanTriVienSchema = new Schema(
  {
    ten_dang_nhap: String,
    mat_khau: String,
  },
  { collection: "QuanTriVien" },
);

module.exports = mongoose.model("QuanTriVien", QuanTriVienSchema);
