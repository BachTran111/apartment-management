import * as tenantService from "../services/tenant-mock.service.js";
import { inMemoryDB, mockRooms } from "../mockData.js";

/**
 * Tạo người thuê mới
 * POST /api/tenants
 */
export const createTenant = async (req, res, next) => {
  try {
    const {
      fullName,
      age,
      idNumber,
      hometown,
      phone,
      room,
      startDate,
      endDate,
      rentPrice,
      emergencyContact,
    } = req.body;

    // Validate dữ liệu bắt buộc
    if (
      !fullName ||
      !age ||
      !idNumber ||
      !hometown ||
      !phone ||
      !room ||
      !startDate ||
      !endDate ||
      !rentPrice ||
      !emergencyContact
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Validate ngày
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày bắt đầu phải trước ngày kết thúc",
      });
    }

    const tenantData = {
      fullName,
      age: parseInt(age),
      idNumber,
      hometown,
      phone,
      room,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rentPrice: parseFloat(rentPrice),
      emergencyContact,
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
    const { status } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
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
      fullName,
      age,
      idNumber,
      hometown,
      phone,
      room,
      startDate,
      endDate,
      rentPrice,
      emergencyContact,
      status,
    } = req.body;

    // Validate ngày nếu cập nhật
    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({
          success: false,
          message: "Ngày bắt đầu phải trước ngày kết thúc",
        });
      }
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (age) updateData.age = parseInt(age);
    if (idNumber) updateData.idNumber = idNumber;
    if (hometown) updateData.hometown = hometown;
    if (phone) updateData.phone = phone;
    if (room) updateData.room = room;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (rentPrice) updateData.rentPrice = parseFloat(rentPrice);
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (status) updateData.status = status;

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

/**
 * Lấy danh sách phòng trống
 * GET /api/tenants/rooms/available
 */
export const getAvailableRooms = async (req, res, next) => {
  try {
    const availableRooms = inMemoryDB.rooms.filter(
      (room) => room.status === "empty"
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách phòng trống thành công",
      data: availableRooms,
      total: availableRooms.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy tất cả phòng
 * GET /api/tenants/rooms
 */
export const getAllRooms = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách phòng thành công",
      data: inMemoryDB.rooms,
      total: inMemoryDB.rooms.length,
    });
  } catch (error) {
    next(error);
  }
};
