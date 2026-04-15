import Tenant from "../models/tenant.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary-upload.js";

/**
 * Tạo người thuê mới
 */
export const createTenant = async (tenantData, files) => {
  try {
    const newTenant = { ...tenantData };

    // Upload avatar nếu có
    if (files?.anh_dai_dien || files?.avatar) {
      const fileData = files.anh_dai_dien || files.avatar;
      const avatarUrl = await uploadToCloudinary(
        fileData.data,
        `avatar-${Date.now()}`,
        "tenants/avatars"
      );
      newTenant.anh_dai_dien = avatarUrl;
    }

    // Upload hợp đồng nếu có
    if (files?.anh_hop_dong || files?.contractImages) {
      const filesData = files.anh_hop_dong || files.contractImages;
      const contractUrls = [];
      const contracts = Array.isArray(filesData) ? filesData : [filesData];

      for (let i = 0; i < contracts.length; i++) {
        const url = await uploadToCloudinary(
          contracts[i].data,
          `contract-${Date.now()}-${i}`,
          "tenants/contracts"
        );
        contractUrls.push(url);
      }
      newTenant.anh_hop_dong = contractUrls;
    }

    const tenant = await Tenant.create(newTenant);
    return await tenant.populate("phong_id");
  } catch (error) {
    throw new Error(`Lỗi tạo người thuê: ${error.message}`);
  }
};

/**
 * Lấy tất cả người thuê
 */
export const getAllTenants = async (filter = {}) => {
  try {
    const tenants = await Tenant.find(filter)
      .populate("phong_id")
      .sort({ createdAt: -1 });
    return tenants;
  } catch (error) {
    throw new Error(`Lỗi lấy danh sách người thuê: ${error.message}`);
  }
};

/**
 * Lấy chi tiết người thuê
 */
export const getTenantById = async (id) => {
  try {
    const tenant = await Tenant.findById(id).populate("phong_id");
    if (!tenant) {
      throw new Error("Không tìm thấy người thuê");
    }
    return tenant;
  } catch (error) {
    throw new Error(`Lỗi lấy thông tin người thuê: ${error.message}`);
  }
};

/**
 * Cập nhật thông tin người thuê
 */
export const updateTenant = async (id, updateData, files) => {
  try {
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      throw new Error("Không tìm thấy người thuê");
    }

    // Cập nhật avatar nếu có file mới
    if (files?.anh_dai_dien || files?.avatar) {
      const fileData = files.anh_dai_dien || files.avatar;
      if (tenant.anh_dai_dien) {
        const publicId = tenant.anh_dai_dien.split("/").pop().split(".")[0];
        await deleteFromCloudinary(`tenants/avatars/${publicId}`);
      }

      const avatarUrl = await uploadToCloudinary(
        fileData.data,
        `avatar-${Date.now()}`,
        "tenants/avatars"
      );
      updateData.anh_dai_dien = avatarUrl;
    }

    // Cập nhật hợp đồng nếu có file mới
    if (files?.anh_hop_dong || files?.contractImages) {
      const filesData = files.anh_hop_dong || files.contractImages;
      if (tenant.anh_hop_dong && tenant.anh_hop_dong.length > 0) {
        for (const url of tenant.anh_hop_dong) {
          const publicId = url.split("/").pop().split(".")[0];
          await deleteFromCloudinary(`tenants/contracts/${publicId}`);
        }
      }

      const contractUrls = [];
      const contracts = Array.isArray(filesData) ? filesData : [filesData];

      for (let i = 0; i < contracts.length; i++) {
        const url = await uploadToCloudinary(
          contracts[i].data,
          `contract-${Date.now()}-${i}`,
          "tenants/contracts"
        );
        contractUrls.push(url);
      }
      updateData.anh_hop_dong = contractUrls;
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("phong_id");

    return updatedTenant;
  } catch (error) {
    throw new Error(`Lỗi cập nhật người thuê: ${error.message}`);
  }
};

/**
 * Xóa người thuê
 */
export const deleteTenant = async (id) => {
  try {
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      throw new Error("Không tìm thấy người thuê");
    }

    // Xóa avatar
    if (tenant.anh_dai_dien) {
      const publicId = tenant.anh_dai_dien.split("/").pop().split(".")[0];
      await deleteFromCloudinary(`tenants/avatars/${publicId}`);
    }

    // Xóa tất cả hợp đồng
    if (tenant.anh_hop_dong && tenant.anh_hop_dong.length > 0) {
      for (const url of tenant.anh_hop_dong) {
        const publicId = url.split("/").pop().split(".")[0];
        await deleteFromCloudinary(`tenants/contracts/${publicId}`);
      }
    }

    await Tenant.findByIdAndDelete(id);
    return { message: "Xóa người thuê thành công" };
  } catch (error) {
    throw new Error(`Lỗi xóa người thuê: ${error.message}`);
  }
};

/**
 * Tìm kiếm người thuê
 */
export const searchTenants = async (searchQuery) => {
  try {
    const tenants = await Tenant.find({
      $or: [
        { ho_ten: { $regex: searchQuery, $options: "i" } },
        { so_dien_thoai: { $regex: searchQuery, $options: "i" } },
        { cmnd_cccd: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .populate("phong_id")
      .sort({ createdAt: -1 });

    return tenants;
  } catch (error) {
    throw new Error(`Lỗi tìm kiếm người thuê: ${error.message}`);
  }
};

/**
 * Lấy danh sách người thuê theo trạng thái
 */
export const getTenantsByStatus = async (trang_thai) => {
  try {
    const tenants = await Tenant.find({ trang_thai })
      .populate("phong_id")
      .sort({ createdAt: -1 });

    return tenants;
  } catch (error) {
    throw new Error(
      `Lỗi lấy danh sách người thuê theo trạng thái: ${error.message}`
    );
  }
};
