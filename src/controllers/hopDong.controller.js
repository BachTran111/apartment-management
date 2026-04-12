import HopDongService from "../services/hopDong.service.js";
import { OK } from "../handler/success-response.js";

class HopDongController {
  // GET /api/hop-dong - Lấy danh sách hợp đồng
  getAllContracts = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filters = status ? { trang_thai: status } : {};

      const result = await HopDongService.getAllContracts(
        parseInt(page),
        parseInt(limit),
        filters,
      );

      res.status(200).json(
        new OK({
          message: "Contracts retrieved successfully",
          metadata: result,
        }),
      );
    } catch (err) {
      res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  // GET /api/hop-dong/status/:status - Lấy hợp đồng theo trạng thái
  getContractsByStatus = async (req, res, next) => {
    try {
      const { status } = req.params;
      const contracts = await HopDongService.getContractsByStatus(status);

      res.status(200).json(
        new OK({
          message: `Contracts with status '${status}' retrieved`,
          metadata: contracts,
        }),
      );
    } catch (err) {
      res.status(400).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  // GET /api/hop-dong/expiring - Lấy hợp đồng sắp hết hạn
  getExpiringContracts = async (req, res, next) => {
    try {
      const contracts = await HopDongService.getExpiringContracts();

      res.status(200).json(
        new OK({
          message: "Expiring contracts retrieved",
          metadata: {
            count: contracts.length,
            contracts,
          },
        }),
      );
    } catch (err) {
      res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };

  // GET /api/hop-dong/stats - Lấy thống kê
  getStatistics = async (req, res, next) => {
    try {
      const stats = await HopDongService.getStatistics();

      res.status(200).json(
        new OK({
          message: "Statistics retrieved",
          metadata: stats,
        }),
      );
    } catch (err) {
      res.status(500).json({
        status: "ERROR",
        message: err.message,
      });
    }
  };
}

export default new HopDongController();
