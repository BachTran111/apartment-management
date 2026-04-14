import mongoose from "mongoose";
const { Schema } = mongoose;

const LichSuSuaChuaSchema = new Schema(
  {
    noi_that_id: {
      type: Schema.Types.ObjectId,
      ref: "NoiThat",
      required: true,
    },
    ngay_sua: { type: Date, required: true },
    mo_ta: String,
    chi_phi: Number,
  },
  { collection: "LichSuSuaChua" },
);

export default mongoose.model("LichSuSuaChua", LichSuSuaChuaSchema);
