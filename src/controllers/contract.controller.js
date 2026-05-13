import mongoose from "mongoose";
import ContractService from "../services/contract.service.js"; // Cập nhật tên import
import { OK } from "../handler/success-response.js";

class ContractController {
  // ==========================================
  // TÌM KIẾM VÀ THỐNG KÊ
  // ==========================================

  getAllContracts = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filter = status ? { trang_thai: status } : {};

      const result = await ContractService.getAll(filter, {
        page: Number(page),
        limit: Number(limit),
      });

      return res.status(200).json(new OK({ metadata: result }));
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  getContractsByStatus = async (req, res) => {
    try {
      const { status } = req.params;
      const contracts = await ContractService.getContractsByStatus(status);

      return res.status(200).json(
        new OK({
          message: `Lấy danh sách hợp đồng trạng thái: ${status}`,
          metadata: contracts,
        }),
      );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
    }
  };

  getExpiringContracts = async (req, res) => {
    try {
      const contracts = await ContractService.getExpiringContracts();

      return res.status(200).json(
        new OK({
          message: "Danh sách hợp đồng sắp hết hạn",
          metadata: contracts,
        }),
      );
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  getStatistics = async (req, res) => {
    try {
      const stats = await ContractService.getStatistics();

      return res.status(200).json(new OK({ metadata: stats }));
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err.message });
    }
  };

  // ==========================================
  // CRUD CƠ BẢN
  // ==========================================

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

  create = async (req, res) => {
    try {
      // Bỏ qua bước Joi validation, truyền thẳng req.body xuống Service
      const newContract = await ContractService.create(req.body);

      return res
        .status(201)
        .json(
          new OK({ message: "Tạo hợp đồng thành công", metadata: newContract }),
        );
    } catch (err) {
      return res.status(400).json({ status: "ERROR", message: err.message });
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
}

export default new ContractController();
