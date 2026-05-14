import mongoose from "mongoose";
import ContractService from "../services/contract.service.js"; // Cập nhật tên import
import { OK } from "../handler/success-response.js";
import contractService from "../services/contract.service.js";

class ContractController {
  getById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID hợp đồng không hợp lệ" });
      }

      const contract = await ContractService.getById(id);

      if (!contract) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy hợp đồng" });
      }

      return res.status(200).json(new OK({ metadata: contract }));
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID hợp đồng không hợp lệ" });
      }

      // Bỏ qua bước Joi validation, truyền thẳng req.body xuống Service
      const updatedContract = await ContractService.update(id, req.body);

      if (!updatedContract) {
        return res.status(404).json({
          status: "ERROR",
          message: "Không tìm thấy hợp đồng để cập nhật",
        });
      }

      return res.status(200).json(
        new OK({
          message: "Cập nhật hợp đồng thành công",
          metadata: updatedContract,
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  remove = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "ID hợp đồng không hợp lệ" });
      }

      const deletedContract = await ContractService.remove(id);

      if (!deletedContract) {
        return res
          .status(404)
          .json({ status: "ERROR", message: "Không tìm thấy hợp đồng để xóa" });
      }

      return res.status(200).json(
        new OK({
          message: "Xóa hợp đồng thành công",
          metadata: deletedContract,
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };
  // POST /api/contracts - Tạo hợp đồng
  createContract = async (req, res, next) => {
    try {
      const createdContract = await contractService.createContract(req.body);

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

  // GET
  // - Lấy danh sách hợp đồng
  getAllContracts = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filters = status ? { trang_thai: status } : {};

      const result = await contractService.getAllContracts(
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

  // GET /api/contracts/status/:status - Lấy hợp đồng theo trạng thái
  getContractsByStatus = async (req, res, next) => {
    try {
      const { status } = req.params;
      const contracts = await contractService.getContractsByStatus(status);

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

  // GET /api/contracts/expiring - Lấy hợp đồng sắp hết hạn
  getExpiringContracts = async (req, res, next) => {
    try {
      const contracts = await contractService.getExpiringContracts();

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

  // GET /api/contracts/stats - Lấy thống kê
  getStatistics = async (req, res, next) => {
    try {
      const stats = await contractService.getStatistics();

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

  // POST /api/contracts/:id/terminate - Thanh lý hợp đồng
  terminateContract = async (req, res, next) => {
    try {
      // Validate contract ID format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          status: "ERROR",
          message: "ID hợp đồng không hợp lệ",
        });
      }

      const terminatedContract = await contractService.terminateContract(
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

export default new ContractController();
