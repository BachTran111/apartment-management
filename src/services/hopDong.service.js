import HopDongRepository from "../repositories/hopDong.repository.js";

class HopDongService {
  // Lấy tất cả hợp đồng với phân trang
  async getAllContracts(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;

      const contracts = await HopDongRepository.getAllContracts(filters);
      const total = contracts.length;

      const paginatedContracts = contracts.slice(skip, skip + limit);

      return {
        contracts: paginatedContracts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }

  // Lấy hợp đồng theo trạng thái
  async getContractsByStatus(status) {
    try {
      const validStatuses = ["active", "expired", "pending"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      return await HopDongRepository.getContractsByStatus(status);
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }

  // Lấy hợp đồng sắp hết hạn
  async getExpiringContracts() {
    try {
      return await HopDongRepository.getExpiringContracts();
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }

  // Lấy thống kê
  async getStatistics() {
    try {
      const allContracts = await HopDongRepository.getAllContracts();
      const activeContracts = await HopDongRepository.getContractsByStatus("active");
      const expiringContracts = await HopDongRepository.getExpiringContracts();

      return {
        total: allContracts.length,
        active: activeContracts.length,
        expiring: expiringContracts.length,
      };
    } catch (err) {
      throw new Error(`Service error: ${err.message}`);
    }
  }
}

export default new HopDongService();
