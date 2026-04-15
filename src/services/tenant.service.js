import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CanHo, NguoiThue, HopDong } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "uploads", "tenants");

class TenantService {
  async createTenant(data, files = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { phong_id, ngay_bat_dau, ngay_ket_thuc, gia_thue, tien_dat_coc, ...tenantData } = data;

      const canHo = await CanHo.findOne({ "phong._id": phong_id }).session(session);
      if (!canHo) {
        throw new Error("Room not found");
      }

      const phong = canHo.phong.id(phong_id);
      if (!phong) {
        throw new Error("Room not found");
      }

      if (phong.trang_thai === "occupied") {
        throw new Error("Room is already occupied");
      }

      const nguoiThueData = { ...tenantData, deleted: false };

      if (files.anh_dai_dien && files.anh_dai_dien[0]) {
        nguoiThueData.anh_dai_dien = `/uploads/tenants/${files.anh_dai_dien[0].filename}`;
      }

      if (files.anh_hop_dong && files.anh_hop_dong.length > 0) {
        nguoiThueData.anh_hop_dong = files.anh_hop_dong.map(
          (file) => `/uploads/tenants/${file.filename}`
        );
      }

      const [nguoiThue] = await NguoiThue.create(
        [{ ...nguoiThueData }],
        { session }
      );

      const [hopDong] = await HopDong.create(
        [
          {
            nguoi_thue_id: nguoiThue._id,
            phong_id: phong._id,
            ngay_bat_dau: new Date(ngay_bat_dau),
            ngay_ket_thuc: ngay_ket_thuc ? new Date(ngay_ket_thuc) : null,
            gia_thue: gia_thue || phong.gia,
            tien_dat_coc: tien_dat_coc || 0,
            trang_thai: "active",
          },
        ],
        { session }
      );

      phong.trang_thai = "occupied";
      phong.nguoi_thue_id = nguoiThue._id;
      phong.hop_dong_id = hopDong._id;
      await canHo.save({ session });

      await session.commitTransaction();

      return {
        nguoi_thue: nguoiThue,
        hop_dong: hopDong,
        phong: { id: phong._id, so_phong: phong.so_phong, gia_goc: phong.gia },
      };
    } catch (error) {
      await session.abortTransaction();

      const allFiles = [
        ...(files.anh_dai_dien || []),
        ...(files.anh_hop_dong || []),
      ];
      allFiles.forEach((file) => {
        const filePath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateTenant(id, data, files = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tenant = await NguoiThue.findById(id).session(session);
      if (!tenant || tenant.deleted) {
        throw new Error("Tenant not found");
      }

      const { phong_id, gia_thue, ngay_ket_thuc, tien_dat_coc, ...tenantData } = data;

      Object.assign(tenant, tenantData);

      if (files.anh_dai_dien && files.anh_dai_dien[0]) {
        if (tenant.anh_dai_dien) {
          const oldPath = path.join(__dirname, "..", "..", tenant.anh_dai_dien.replace(/^\//, ""));
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        tenant.anh_dai_dien = `/uploads/tenants/${files.anh_dai_dien[0].filename}`;
      }

      if (files.anh_hop_dong && files.anh_hop_dong.length > 0) {
        const newImages = files.anh_hop_dong.map((file) => `/uploads/tenants/${file.filename}`);
        tenant.anh_hop_dong = [...(tenant.anh_hop_dong || []), ...newImages];
      }

      await tenant.save({ session });

      if (phong_id && phong_id !== tenant.phong_id?.toString()) {
        const oldCanHo = await CanHo.findOne({ "phong.nguoi_thue_id": id }).session(session);
        if (oldCanHo) {
          const oldPhong = oldCanHo.phong.find((p) => p.nguoi_thue_id?.toString() === id);
          if (oldPhong) {
            oldPhong.trang_thai = "available";
            oldPhong.nguoi_thue_id = undefined;
            oldPhong.hop_dong_id = undefined;
            await oldCanHo.save({ session });
          }
        }

        const newCanHo = await CanHo.findOne({ "phong._id": phong_id }).session(session);
        if (!newCanHo) {
          throw new Error("New room not found");
        }

        const newPhong = newCanHo.phong.id(phong_id);
        if (!newPhong) {
          throw new Error("New room not found");
        }

        if (newPhong.trang_thai === "occupied") {
          throw new Error("New room is already occupied");
        }

        newPhong.trang_thai = "occupied";
        newPhong.nguoi_thue_id = tenant._id;
        await newCanHo.save({ session });

        const oldHopDong = await HopDong.findOne({
          nguoi_thue_id: id,
          trang_thai: "active",
        }).session(session);
        if (oldHopDong) {
          oldHopDong.trang_thai = "expired";
          await oldHopDong.save({ session });
        }

        const [newHopDong] = await HopDong.create(
          [
            {
              nguoi_thue_id: tenant._id,
              phong_id: newPhong._id,
              ngay_bat_dau: new Date(),
              gia_thue: gia_thue || newPhong.gia,
              tien_dat_coc: tien_dat_coc || 0,
              trang_thai: "active",
            },
          ],
          { session }
        );

        newPhong.hop_dong_id = newHopDong._id;
        await newCanHo.save({ session });
      } else {
        const hopDong = await HopDong.findOne({
          nguoi_thue_id: id,
          trang_thai: "active",
        }).session(session);

        if (hopDong) {
          if (gia_thue !== undefined) hopDong.gia_thue = gia_thue;
          if (ngay_ket_thuc !== undefined) hopDong.ngay_ket_thuc = new Date(ngay_ket_thuc);
          if (tien_dat_coc !== undefined) hopDong.tien_dat_coc = tien_dat_coc;
          await hopDong.save({ session });
        }
      }

      await session.commitTransaction();

      return tenant;
    } catch (error) {
      await session.abortTransaction();

      const allFiles = [
        ...(files.anh_dai_dien || []),
        ...(files.anh_hop_dong || []),
      ];
      allFiles.forEach((file) => {
        const filePath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteTenant(id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tenant = await NguoiThue.findById(id).session(session);
      if (!tenant || tenant.deleted) {
        throw new Error("Tenant not found");
      }

      tenant.deleted = true;
      await tenant.save({ session });

      const hopDong = await HopDong.findOne({
        nguoi_thue_id: id,
        trang_thai: "active",
      }).session(session);

      if (hopDong) {
        hopDong.trang_thai = "expired";
        await hopDong.save({ session });
      }

      const canHo = await CanHo.findOne({ "phong.nguoi_thue_id": id }).session(session);
      if (canHo) {
        const phong = canHo.phong.find((p) => p.nguoi_thue_id?.toString() === id);
        if (phong) {
          phong.trang_thai = "available";
          phong.nguoi_thue_id = undefined;
          phong.hop_dong_id = undefined;
          await canHo.save({ session });
        }
      }

      await session.commitTransaction();

      return { message: "Tenant deleted successfully" };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async removeTenantImage(tenantId, imagePath, imageType = "anh_hop_dong") {
    const tenant = await NguoiThue.findById(tenantId);
    if (!tenant || tenant.deleted) {
      throw new Error("Tenant not found");
    }

    if (imageType === "anh_dai_dien") {
      if (tenant.anh_dai_dien !== imagePath) {
        throw new Error("Image not found");
      }
      tenant.anh_dai_dien = undefined;
    } else {
      const imageIndex = (tenant.anh_hop_dong || []).indexOf(imagePath);
      if (imageIndex === -1) {
        throw new Error("Image not found");
      }
      tenant.anh_hop_dong.splice(imageIndex, 1);
    }

    await tenant.save();

    const fullPath = path.join(__dirname, "..", "..", imagePath.replace(/^\//, ""));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return { message: "Image removed successfully" };
  }
}

export default new TenantService();
