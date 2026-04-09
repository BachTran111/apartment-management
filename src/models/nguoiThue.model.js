const mongoose = require("mongoose");
const { Schema } = mongoose;

const NguoiThueSchema = new Schema(
  {
    ho_ten: String,
    so_dien_thoai: String,
    email: String,
    cmnd_cccd: String,
  },
  { collection: "NguoiThue" },
);

module.exports = mongoose.model("NguoiThue", NguoiThueSchema);
