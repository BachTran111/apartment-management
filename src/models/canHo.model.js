import mongoose from "mongoose";
const { Schema } = mongoose;

const CanHoSchema = new Schema(
  {
    ten: String,
    dia_chi: String,
    tong_so_phong: Number,
  },
  { 
    collection: "CanHo",
    timestamps: true 
  },
);

export default mongoose.model("CanHo", CanHoSchema);
