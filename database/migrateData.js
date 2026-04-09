const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const {
  CanHo,
  Phong,
  NguoiThue,
  HopDong,
  HoaDon,
  QuanTriVien,
  NoiThat,
  LichSuSuaChua,
} = require("../src/models");

/**
 * MIGRATION TOOL - Cập nhật dữ liệu khi thêm trường mới vào model
 *
 * Ví dụ sử dụng:
 * 1. Thêm trường mới vào model (ví dụ: thêm "ghi_chu" vào Phong)
 * 2. Chạy migration để cập nhật tất cả documents
 *
 * Các migration có sẵn:
 * - addFieldToAllDocuments: Thêm trường mới với giá trị mặc định
 * - updateAllDocuments: Cập nhật tất cả documents
 * - deleteFieldFromAllDocuments: Xóa trường khỏi tất cả documents
 */

const migrations = {
  // Ví dụ: Thêm trường "ghi_chu" cho Phong
  addPhongGhiChu: async () => {
    console.log("  Migration: Thêm trường 'ghi_chu' cho Phong");
    const result = await Phong.updateMany({}, { $set: { ghi_chu: "" } });
    console.log(` Cập nhật ${result.modifiedCount} documents`);
  },

  // Ví dụ: Thêm trường "trang_thai_hd" cho HopDong
  addHopDongStatus: async () => {
    console.log(
      "⚙️  Migration: Thêm trường 'trang_thai_thanh_toan' cho HopDong",
    );
    const result = await HopDong.updateMany(
      {},
      { $set: { trang_thai_thanh_toan: "active" } },
    );
    console.log(`Cập nhật ${result.modifiedCount} documents`);
  },

  // Ví dụ: Thêm trường "so_thang_con_lai" cho HopDong (tính toán dự toán)
  addDuToanHopDong: async () => {
    console.log("  Migration: Thêm trường dự toán cho HopDong");
    const hopDongs = await HopDong.find();
    for (const hd of hopDongs) {
      const months = Math.ceil(
        (new Date(hd.ngay_ket_thuc) - new Date(hd.ngay_bat_dau)) /
          (1000 * 60 * 60 * 24 * 30),
      );
      await HopDong.updateOne(
        { _id: hd._id },
        { $set: { so_thang_con_lai: months } },
      );
    }
    console.log(` Cập nhật ${hopDongs.length} documents`);
  },

  // Ví dụ: Rename trường
  renamePhongField: async () => {
    console.log("  Migration: Đổi tên trường 'so_phong' thành 'ma_phong'");
    const result = await Phong.updateMany({}, [
      { $set: { ma_phong: "$so_phong", so_phong: "$$REMOVE" } },
    ]);
    console.log(` Cập nhật ${result.modifiedCount} documents`);
  },

  // Ví dụ: Thêm timestamp (createdAt, updatedAt)
  addTimestamps: async () => {
    console.log("⚙️  Migration: Thêm timestamps cho tất cả collections");
    const now = new Date();

    await QuanTriVien.updateMany(
      {},
      { $set: { createdAt: now, updatedAt: now } },
    );
    await CanHo.updateMany({}, { $set: { createdAt: now, updatedAt: now } });
    await Phong.updateMany({}, { $set: { createdAt: now, updatedAt: now } });
    await NguoiThue.updateMany(
      {},
      { $set: { createdAt: now, updatedAt: now } },
    );
    await HopDong.updateMany({}, { $set: { createdAt: now, updatedAt: now } });
    await HoaDon.updateMany({}, { $set: { createdAt: now, updatedAt: now } });
    await NoiThat.updateMany({}, { $set: { createdAt: now, updatedAt: now } });
    await LichSuSuaChua.updateMany(
      {},
      { $set: { createdAt: now, updatedAt: now } },
    );

    console.log("✅ Cập nhật timestamps cho tất cả collections");
  },

  // Ví dụ: Thêm trường "is_active" cho NguoiThue
  addNguoiThueActive: async () => {
    console.log("⚙️  Migration: Thêm trường 'is_active' cho NguoiThue");
    const result = await NguoiThue.updateMany(
      {},
      { $set: { is_active: true } },
    );
    console.log(`✅ Cập nhật ${result.modifiedCount} documents`);
  },

  // Ví dụ: Thêm trường "giá cập nhật" cho Phong
  addPhongGiaCho: async () => {
    console.log("⚙️  Migration: Thêm trường 'gia_trong_may' cho Phong");
    const phongs = await Phong.find();
    for (const phong of phongs) {
      await Phong.updateOne(
        { _id: phong._id },
        { $set: { gia_trong_may: phong.gia } },
      );
    }
    console.log(`✅ Cập nhật ${phongs.length} documents`);
  },

  // Generic: Thêm trường tùy chỉnh vào collection
  addCustomField: async (collectionName, fieldName, defaultValue) => {
    const models = {
      CanHo,
      Phong,
      NguoiThue,
      HopDong,
      HoaDon,
      QuanTriVien,
      NoiThat,
      LichSuSuaChua,
    };
    const Model = models[collectionName];

    if (!Model) {
      console.error(`❌ Collection không tồn tại: ${collectionName}`);
      return;
    }

    console.log(
      `⚙️  Migration: Thêm trường '${fieldName}' vào ${collectionName}`,
    );
    const updateData = {};
    updateData[fieldName] = defaultValue;

    const result = await Model.updateMany({}, { $set: updateData });
    console.log(`✅ Cập nhật ${result.modifiedCount} documents`);
  },
};

async function runMigration(migrationName) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công\n");

    if (!migrations[migrationName]) {
      console.log("📋 Các migration có sẵn:");
      Object.keys(migrations).forEach((key, i) => {
        console.log(`${i + 1}. ${key}`);
      });
      console.log(
        "\n✍️  Sử dụng: node database/migrateData.js <migration_name>",
      );
      process.exit(0);
    }

    await migrations[migrationName]();

    console.log("\n✅ Migration hoàn tất");
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi migration:", error.message);
    process.exit(1);
  }
}

// Chạy migration
const migrationName = process.argv[2];
if (!migrationName) {
  console.log("📖 MIGRATION TOOL - Cập nhật dữ liệu MongoDB\n");
  console.log("Các migration có sẵn:");
  Object.keys(migrations).forEach((key, i) => {
    console.log(`${i + 1}. ${key}`);
  });
  console.log("\n✍️  Cách dùng:");
  console.log("   node database/migrateData.js <tên_migration>");
  console.log("\n📌 Ví dụ:");
  console.log("   node database/migrateData.js addPhongGhiChu");
  console.log("   node database/migrateData.js addTimestamps");
  process.exit(0);
}

runMigration(migrationName);
