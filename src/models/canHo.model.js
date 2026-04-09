const mongoose = require("mongoose");
const { Schema } = mongoose;

const CanHoSchema = new Schema(
  {
    ten: String,
    dia_chi: String,
    tong_so_phong: Number,
  },
  { collection: "CanHo" },
);

module.exports = mongoose.model("CanHo", CanHoSchema);
