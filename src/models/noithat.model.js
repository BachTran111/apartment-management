import mongoose from "mongoose";

const { Schema } = mongoose;

const noiThatSchema = new Schema(
  {
    noi_that_id: {
      type: String,
      required: true,
      unique: true,
    },
    phong_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Phong",
      },
    ],
    ten: {
      type: String,
      required: true,
    },
    so_luong: {
      type: Number,
      required: true,
      default: 1,
    },
    tinh_trang: {
      type: String,
      enum: ["Tốt", "Hỏng", "Cần sửa"],
      required: true,
      default: "Tốt",
    },
  },
  { timestamps: true },
);

const NoiThatModel = mongoose.model("NoiThat", noiThatSchema);
export default NoiThatModel;
