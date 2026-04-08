const mongoose = require("mongoose");
const { CanHo, NguoiThue, HopDong, HoaDon } = require("./models");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/quanlycanho");

  console.log(" Connected MongoDB");

  // Tạo căn hộ
  const canHo = await CanHo.create({
    ten: "Căn hộ A",
    dia_chi: "Huế",
    tong_so_phong: 1,
    phong: [
      {
        so_phong: "101",
        dien_tich: 25,
        gia: 2000000,
        trang_thai: "available",
        noi_that: [
          {
            ten: "Giường",
            so_luong: 1,
            tinh_trang: "tốt",
          },
        ],
      },
    ],
  });

  // Tạo người thuê
  const nguoi = await NguoiThue.create({
    ho_ten: "Nguyễn Văn A",
    so_dien_thoai: "0123456789",
  });

  // Tạo hợp đồng
  const hopDong = await HopDong.create({
    nguoi_thue_id: nguoi._id,
    phong_id: canHo.phong[0]._id,
    ngay_bat_dau: new Date(),
    tien_dat_coc: 1000000,
  });

  // Tạo hóa đơn
  await HoaDon.create({
    hop_dong_id: hopDong._id,
    so_tien: 2500000,
    ngay_lap: new Date(),
  });

  console.log(" Done seed data");

  mongoose.disconnect();
}

main();
