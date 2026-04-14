const mongoose = require("mongoose");
const { Schema } = mongoose;

const NoiThatSchema = new Schema({
  phong_id: {
    type: Schema.Types.ObjectId,
    ref: "Phong",
    required: true,
  },
  ten: String,
  so_luong: Number,
  tinh_trang: String,
});

module.exports = mongoose.model("NoiThat", NoiThatSchema);
