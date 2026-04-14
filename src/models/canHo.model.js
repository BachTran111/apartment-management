import mongoose from "mongoose";
const { Schema } = mongoose;

const CanHoSchema = new Schema(
  {
    ten: { type: String, required: true, trim: true, minlength: 3, maxlength: 255 },
    dia_chi: { type: String, required: true, trim: true, minlength: 5 },
    tong_so_phong: { type: Number, required: true, min: 1, validate: { validator: Number.isInteger, message: '{VALUE} is not an integer value' } },
    so_dien_thoai: { type: String, trim: true, match: /^0[0-9]{9,10}$/ },
    email: { type: String, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    ghi_chu: { type: String, trim: true },
  },
  { collection: "CanHo", timestamps: true }
);

export default mongoose.model("CanHo", CanHoSchema);