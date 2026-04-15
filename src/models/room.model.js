import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    area: {
      type: Number,
      required: true,
      min: 0,
    },
    rentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["empty", "occupied", "maintenance"],
      default: "empty",
    },
    description: {
      type: String,
      default: "",
    },
    amenities: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
