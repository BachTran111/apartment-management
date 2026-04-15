import * as tenantService from "../services/tenant.service.js";

/**
 * Tạo người thuê mới
 * POST /api/tenants
 */
export const createTenant = async (req, res, next) => {
  try {
    const {
      ho_ten,
      tuoi,
      cmnd_cccd,
      que_quan,
      so_dien_thoai,
      phong_id,
      ngay_bat_dau,
      ngay_ket_thuc,
      tien_phong,
      lien_he_khan_cap,
      email,
    } = req.body;

    // Validate dữ liệu bắt buộc
    if (
      !ho_ten ||
      !tuoi ||
      !cmnd_cccd ||
      !que_quan ||
      !so_dien_thoai ||
      !ngay_bat_dau ||
      !ngay_ket_thuc ||
      !tien_phong ||
      !lien_he_khan_cap
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Validate ngày
    if (new Date(ngay_bat_dau) >= new Date(ngay_ket_thuc)) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu phải trước ngày kết thúc",
      });
    }

    const tenantData = {
      ho_ten,
      tuoi: parseInt(tuoi),
      cmnd_cccd,
      que_quan,
      so_dien_thoai,
      phong_id,
      ngay_bat_dau: new Date(ngay_bat_dau),
      ngay_ket_thuc: new Date(ngay_ket_thuc),
      tien_phong: parseFloat(tien_phong),
      lien_he_khan_cap,
      email,
    };

    const tenant = await tenantService.createTenant(tenantData, req.files);

    return res.status(201).json({
      success: true,
      message: "Tạo người thuê thành công",
      data: tenant,
    });
  } catch (error) {
    next(error);
  }
};

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
 * Cập nhật thông tin người thuê
 * PUT /api/tenants/:id
 */
export const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      ho_ten,
      tuoi,
      cmnd_cccd,
      que_quan,
      so_dien_thoai,
      phong_id,
      ngay_bat_dau,
      ngay_ket_thuc,
      tien_phong,
      lien_he_khan_cap,
      trang_thai,
      email,
    } = req.body;

    // Validate ngày nếu cập nhật
    if (ngay_bat_dau && ngay_ket_thuc) {
      if (new Date(ngay_bat_dau) >= new Date(ngay_ket_thuc)) {
        return res.status(400).json({
          success: false,
          message: "Ngày bắt đầu phải trước ngày kết thúc",
        });
      }
    }

    const updateData = {};
    if (ho_ten) updateData.ho_ten = ho_ten;
    if (tuoi) updateData.tuoi = parseInt(tuoi);
    if (cmnd_cccd) updateData.cmnd_cccd = cmnd_cccd;
    if (que_quan) updateData.que_quan = que_quan;
    if (so_dien_thoai) updateData.so_dien_thoai = so_dien_thoai;
    if (phong_id) updateData.phong_id = phong_id;
    if (ngay_bat_dau) updateData.ngay_bat_dau = new Date(ngay_bat_dau);
    if (ngay_ket_thuc) updateData.ngay_ket_thuc = new Date(ngay_ket_thuc);
    if (tien_phong) updateData.tien_phong = parseFloat(tien_phong);
    if (lien_he_khan_cap) updateData.lien_he_khan_cap = lien_he_khan_cap;
    if (trang_thai) updateData.trang_thai = trang_thai;
    if (email) updateData.email = email;

    const tenant = await tenantService.updateTenant(id, updateData, req.files);

    return res.status(200).json({
      success: true,
      message: "Cập nhật người thuê thành công",
      data: tenant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa người thuê
 * DELETE /api/tenants/:id
 */
export const deleteTenant = async (req, res, next) => {
  try {
    const { id } = req.params;

    await tenantService.deleteTenant(id);

    return res.status(200).json({
      success: true,
      message: "Xóa người thuê thành công",
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
