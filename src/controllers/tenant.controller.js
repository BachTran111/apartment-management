import * as tenantService from "../services/tenant.service.js";

/**
 * Lấy tất cả người thuê
 * GET /api/tenants
 */
export const getAllTenants = async (req, res, next) => {
  try {
    const { trang_thai } = req.query;

    let filter = {};
    if (trang_thai) {
      filter.trang_thai = trang_thai;
    }

    const tenants = await tenantService.getAllTenants(filter);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách người thuê thành công",
      data: tenants,
      total: tenants.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết người thuê
 * GET /api/tenants/:id
 */
export const getTenantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tenant = await tenantService.getTenantById(id);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin người thuê thành công",
      data: tenant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tìm kiếm người thuê
 * GET /api/tenants/search?q=xxx
 */
export const searchTenants = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập từ khóa tìm kiếm",
      });
    }

    const tenants = await tenantService.searchTenants(q);

    return res.status(200).json({
      success: true,
      message: "Tìm kiếm người thuê thành công",
      data: tenants,
      total: tenants.length,
    });
  } catch (error) {
    next(error);
  }
};
