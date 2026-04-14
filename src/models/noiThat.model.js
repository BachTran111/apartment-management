import mongoose from "mongoose";
const { Schema } = mongoose;

const NoiThatSchema = new Schema(
  {
    phong_id: {
      type: Schema.Types.ObjectId,
      ref: "Phong",
      required: true,
    },
    ten: String,
    so_luong: Number,
    tinh_trang: String,
  },
  { collection: "NoiThat" },
);

export default mongoose.model("NoiThat", NoiThatSchema);
