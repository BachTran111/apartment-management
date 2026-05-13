import HopDongService from "../services/hopDong.service.js";
import { OK } from "../handler/success-response.js";

class HopDongController {
  // POST /api/hop-dong - Tạo hợp đồng
  createContract = async (req, res, next) => {
    try {
      const createdContract = await HopDongService.createContract(req.body);

      res.status(201).json(
        new OK({
          message: "Contract created successfully",
          metadata: createdContract,
        }),
      );
    } catch (err) {
      const isValidationError =
        err?.name === "ValidationError" || err?.name === "CastError";

      if (isValidationError) {
        return res.status(400).json({
          status: "ERROR",
          message: err.message,
        });
      }

      return res.status(500).json({
        status: "ERROR",
        message: "Internal server error",
      });
    }
  };

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

  // POST /api/hop-dong/:id/terminate - Thanh lý hợp đồng
  terminateContract = async (req, res, next) => {
    try {
      // Validate contract ID format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          status: "ERROR",
          message: "ID hợp đồng không hợp lệ",
        });
      }

      const terminatedContract = await HopDongService.terminateContract(
        req.params.id,
        req.body,
      );

      res.status(200).json(
        new OK({
          message: "Hợp đồng thanh lý thành công",
          metadata: terminatedContract,
        }),
      );
    } catch (err) {
      const isValidationError =
        err?.name === "ValidationError" || err?.name === "CastError";

      if (err?.name === "NotFoundError") {
        return res.status(404).json({
          status: "ERROR",
          message: err.message,
        });
      }

      if (isValidationError) {
        return res.status(400).json({
          status: "ERROR",
          message: err.message,
        });
      }

      return res.status(500).json({
        status: "ERROR",
        message: "Internal server error",
      });
    }
  };
}

export default new HopDongController();
