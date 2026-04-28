import Tenant from "../models/tenant.model.js";

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
