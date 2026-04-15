import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Import models
const PhongSchema = new mongoose.Schema(
  {
    can_ho_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CanHo",
      required: true,
    },
    so_phong: String,
    dien_tich: Number,
    gia: Number,
    building: String,
    trang_thai: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
    },
  },
  { collection: "Phong" }
);

const Phong = mongoose.model("Phong", PhongSchema);

const CanHoSchema = new mongoose.Schema(
  {
    ten: String,
    dia_chi: String,
    tong_so_phong: Number,
  },
  { collection: "CanHo" }
);

const CanHo = mongoose.model("CanHo", CanHoSchema);

async function insertPhong() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Kết nối MongoDB thành công\n");

    // Get first CanHo
    const canHo = await CanHo.findOne();
    if (!canHo) {
      console.error("❌ Không tìm thấy CanHo nào");
      process.exit(1);
    }

    console.log(`📍 Tòa nhà: ${canHo.ten} (ID: ${canHo._id})\n`);

    // Insert 2 phòng
    const phongData = [
      {
        can_ho_id: canHo._id,
        so_phong: "101",
        dien_tich: 50,
        gia: 5000000,
        building: "A",
        trang_thai: "available",
      },
      {
        can_ho_id: canHo._id,
        so_phong: "102",
        dien_tich: 55,
        gia: 5500000,
        building: "A",
        trang_thai: "available",
      },
      {
        can_ho_id: canHo._id,
        so_phong: "201",
        dien_tich: 50,
        gia: 5200000,
        building: "B",
        trang_thai: "available",
      },
    ];

    const result = await Phong.insertMany(phongData);
    console.log(`✓ Đã thêm ${result.length} phòng:`);
    result.forEach((phong, i) => {
      console.log(`  ${i + 1}. Phòng ${phong.so_phong} - ${phong.dien_tich}m² - ${phong.gia.toLocaleString('vi-VN')} VNĐ`);
    });

    console.log("\n====== DANH SÁCH PHÒNG ======");
    const allPhong = await Phong.find().populate("can_ho_id");
    allPhong.forEach((phong) => {
      console.log(`Phòng ${phong.so_phong} (ID: ${phong._id})`);
      console.log(`  - Tòa: ${phong.can_ho_id?.ten}`);
      console.log(`  - Diện tích: ${phong.dien_tich}m²`);
      console.log(`  - Giá: ${phong.gia.toLocaleString('vi-VN')} VNĐ`);
      console.log(`  - Trạng thái: ${phong.trang_thai}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

insertPhong();
