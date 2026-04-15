import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Import models nếu có file index.js
// import { CanHo, Phong, NguoiThue, HopDong, HoaDon, QuanTriVien, NoiThat, LichSuSuaChua } from "../src/models/index.js";

async function viewAllData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Ket noi MongoDB thanh cong\n");

    console.log("==================== QUAN TRI VIEN ====================");
    const admins = await QuanTriVien.find();
    console.log(`Tong: ${admins.length}`);
    admins.forEach((admin, i) => {
      console.log(`\n${i + 1}. ${admin.ten_dang_nhap}`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Mat khau: ${admin.mat_khau}`);
    });

    console.log("\n\n==================== CAN HO ====================");
    const canHos = await CanHo.find();
    console.log(`Tong: ${canHos.length}`);
    canHos.forEach((canHo, i) => {
      console.log(`\n${i + 1}. ${canHo.ten}`);
      console.log(`   ID: ${canHo._id}`);
      console.log(`   Dia chi: ${canHo.dia_chi}`);
      console.log(`   Tong phong: ${canHo.tong_so_phong}`);
    });

    console.log("\n\n==================== PHONG ====================");
    const phongs = await Phong.find().populate("can_ho_id");
    console.log(`Tong: ${phongs.length}`);
    phongs.forEach((phong, i) => {
      console.log(`\n${i + 1}. ${phong.so_phong}`);
      console.log(`   ID: ${phong._id}`);
      console.log(`   Toa: ${phong.can_ho_id?.ten || "N/A"}`);
      console.log(`   Dien tich: ${phong.dien_tich}m2`);
      console.log(`   Gia: ${phong.gia.toLocaleString()}d`);
      console.log(`   Trang thai: ${phong.trang_thai}`);
    });

    console.log("\n\n==================== NOI THAT ====================");
    const noiThats = await NoiThat.find().populate("phong_id");
    console.log(`Tong: ${noiThats.length}`);
    noiThats.forEach((noiThat, i) => {
      console.log(`\n${i + 1}. ${noiThat.ten}`);
      console.log(`   ID: ${noiThat._id}`);
      console.log(`   Phong: ${noiThat.phong_id?.so_phong || "N/A"}`);
      console.log(`   So luong: ${noiThat.so_luong}`);
      console.log(`   Tinh trang: ${noiThat.tinh_trang}`);
    });

    console.log("\n\n==================== LICH SU SUA CHUA ====================");
    const lichSu = await LichSuSuaChua.find().populate("noi_that_id");
    console.log(`Tong: ${lichSu.length}`);
    lichSu.forEach((item, i) => {
      console.log(`\n${i + 1}. Sua chua ${item.noi_that_id?.ten || "N/A"}`);
      console.log(`   ID: ${item._id}`);
      console.log(`   Ngay: ${new Date(item.ngay_sua).toLocaleDateString("vi-VN")}`);
      console.log(`   Mo ta: ${item.mo_ta}`);
      console.log(`   Chi phi: ${item.chi_phi?.toLocaleString()}d`);
    });

    console.log("\n\n==================== NGUOI THUE ====================");
    const nguoiThues = await NguoiThue.find();
    console.log(`Tong: ${nguoiThues.length}`);
    nguoiThues.forEach((nt, i) => {
      console.log(`\n${i + 1}. ${nt.ho_ten}`);
      console.log(`   ID: ${nt._id}`);
      console.log(`   Dien thoai: ${nt.so_dien_thoai}`);
      console.log(`   Email: ${nt.email}`);
      console.log(`   CMND/CCCD: ${nt.cmnd_cccd}`);
    });

    console.log("\n\n==================== HOP DONG ====================");
    const hopDongs = await HopDong.find().populate("nguoi_thue_id").populate("phong_id");
    console.log(`Tong: ${hopDongs.length}`);
    hopDongs.forEach((hd, i) => {
      console.log(`\n${i + 1}. Hop dong #${i + 1}`);
      console.log(`   ID: ${hd._id}`);
      console.log(`   Nguoi thue: ${hd.nguoi_thue_id?.ho_ten || "N/A"}`);
      console.log(`   Phong: ${hd.phong_id?.so_phong || "N/A"}`);
      console.log(`   Ngay bat dau: ${new Date(hd.ngay_bat_dau).toLocaleDateString("vi-VN")}`);
      console.log(`   Ngay ket thuc: ${new Date(hd.ngay_ket_thuc).toLocaleDateString("vi-VN")}`);
      console.log(`   Tien dat coc: ${hd.tien_dat_coc.toLocaleString()}d`);
      console.log(`   Trang thai: ${hd.trang_thai}`);
    });

    console.log("\n\n==================== HOA DON ====================");
    const hoaDons = await HoaDon.find().populate({
      path: "hop_dong_id",
      populate: [{ path: "nguoi_thue_id" }, { path: "phong_id" }],
    });
    console.log(`Tong: ${hoaDons.length}`);
    let totalRevenue = 0;
    hoaDons.forEach((hd, i) => {
      totalRevenue += hd.so_tien;
      console.log(`\n${i + 1}. Hoa don #${i + 1}`);
      console.log(`   ID: ${hd._id}`);
      console.log(`   Nguoi thue: ${hd.hop_dong_id?.nguoi_thue_id?.ho_ten || "N/A"}`);
      console.log(`   Phong: ${hd.hop_dong_id?.phong_id?.so_phong || "N/A"}`);
      console.log(`   So tien: ${hd.so_tien.toLocaleString()}d`);
      console.log(`   Ngay lap: ${new Date(hd.ngay_lap).toLocaleDateString("vi-VN")}`);
      console.log(`   Trang thai: ${hd.trang_thai}`);
    });

    console.log("\n\n==================== THONG KE TONG ====================");
    console.log(`Quan tri vien: ${admins.length}`);
    console.log(`Can ho: ${canHos.length}`);
    console.log(`Phong: ${phongs.length}`);
    console.log(`Noi that: ${noiThats.length}`);
    console.log(`Lich su sua chua: ${lichSu.length}`);
    console.log(`Nguoi thue: ${nguoiThues.length}`);
    console.log(`Hop dong: ${hopDongs.length}`);
    console.log(`Hoa don: ${hoaDons.length}`);
    console.log(`\nTong doanh thu: ${totalRevenue.toLocaleString()}d`);
    const paidTotal = hoaDons.filter(h => h.trang_thai === "paid").reduce((sum, h) => sum + h.so_tien, 0);
    const unpaidTotal = hoaDons.filter(h => h.trang_thai === "unpaid").reduce((sum, h) => sum + h.so_tien, 0);
    console.log(`Da thanh toan: ${paidTotal.toLocaleString()}d`);
    console.log(`Chua thanh toan: ${unpaidTotal.toLocaleString()}d`);
    console.log(`\nPhong trong: ${phongs.filter(p => p.trang_thai === "available").length}/${phongs.length}`);
    console.log(`Phong co nguoi: ${phongs.filter(p => p.trang_thai === "occupied").length}/${phongs.length}`);

    await mongoose.connection.close();
    console.log("\nDa dong ket noi MongoDB");
  } catch (error) {
    console.error("Loi:", error.message);
    process.exit(1);
  }
}

viewAllData();
