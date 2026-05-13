import mongoose from "mongoose";

const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    can_ho_id: {
      type: Schema.Types.ObjectId,
      ref: "CanHo",
      required: [true, "Phai lien ket voi mot can ho"],
      index: true,
    },
    anh_phong: {
      type: String,
      default: "",
    },
    so_phong: {
      type: String,
      required: [true, "So phong khong duoc de trong"],
      trim: true,
    },
    dien_tich: {
      type: Number,
      required: [true, "Dien tich khong duoc de trong"],
      min: [0.1, "Dien tich phai lon hon 0"],
    },
    gia: {
      type: Number,
      required: [true, "Gia thue khong duoc de trong"],
      min: [0, "Gia thue phai lon hon hoac bang 0"],
    },
    trang_thai: {
      type: String,
      enum: {
        values: [
          "Phòng Trống",
          "Đang Có Người Ở",
          "Đang Bảo Trì",
          "Không Sử Dụng",
        ],
        message: "{VALUE} khong phai la trang thai hop le",
      },
      required: true,
      default: "Phòng Trống",
    },
  },
  {
    timestamps: true,
    collection: "Phong",
  },
);

roomSchema.index({ can_ho_id: 1, so_phong: 1 }, { unique: true });

const Room = mongoose.model("Phong", roomSchema);

export default Room;
