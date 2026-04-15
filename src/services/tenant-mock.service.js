import { inMemoryDB, mockRooms, mockTenants } from "../mockData.js";

/**
 * Tạo người thuê mới (Mock)
 */
export const createTenant = async (tenantData, files) => {
  try {
    const newTenant = {
      _id: `507f1f77bcf86cd7994390${Math.random().toString().slice(2, 4)}`,
      ...tenantData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryDB.tenants.push(newTenant);
    return newTenant;
  } catch (error) {
    throw new Error(`Lỗi tạo người thuê: ${error.message}`);
  }
};

/**
 * Lấy tất cả người thuê
 */
export const getAllTenants = async (filter = {}) => {
  try {
    let tenants = inMemoryDB.tenants;

    if (filter.status) {
      tenants = tenants.filter((t) => t.status === filter.status);
    }

    return tenants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    throw new Error(`Lỗi lấy danh sách người thuê: ${error.message}`);
  }
};

/**
 * Lấy chi tiết người thuê
 */
export const getTenantById = async (id) => {
  try {
    const tenant = inMemoryDB.tenants.find((t) => t._id === id);
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
    const tenantIndex = inMemoryDB.tenants.findIndex((t) => t._id === id);
    if (tenantIndex === -1) {
      throw new Error("Không tìm thấy người thuê");
    }

    inMemoryDB.tenants[tenantIndex] = {
      ...inMemoryDB.tenants[tenantIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    return inMemoryDB.tenants[tenantIndex];
  } catch (error) {
    throw new Error(`Lỗi cập nhật người thuê: ${error.message}`);
  }
};

/**
 * Xóa người thuê
 */
export const deleteTenant = async (id) => {
  try {
    const index = inMemoryDB.tenants.findIndex((t) => t._id === id);
    if (index === -1) {
      throw new Error("Không tìm thấy người thuê");
    }

    inMemoryDB.tenants.splice(index, 1);
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
    const lowerQuery = searchQuery.toLowerCase();
    return inMemoryDB.tenants.filter(
      (tenant) =>
        tenant.fullName.toLowerCase().includes(lowerQuery) ||
        tenant.phone.includes(lowerQuery) ||
        tenant.idNumber.includes(lowerQuery)
    );
  } catch (error) {
    throw new Error(`Lỗi tìm kiếm người thuê: ${error.message}`);
  }
};

/**
 * Lấy danh sách người thuê theo trạng thái
 */
export const getTenantsByStatus = async (status) => {
  try {
    return inMemoryDB.tenants
      .filter((t) => t.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    throw new Error(
      `Lỗi lấy danh sách người thuê theo trạng thái: ${error.message}`
    );
  }
};
