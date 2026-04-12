import mongoose from "mongoose";
const { Schema } = mongoose;

const QuanTriVienSchema = new Schema(
  {
    ten_dang_nhap: String,
    mat_khau: String,
  },
  { collection: "QuanTriVien" },
);

export default mongoose.model("QuanTriVien", QuanTriVienSchema);
