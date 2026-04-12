import hopDongModel from "../models/hopDong.model.js";

class HopDongRepository {
  async getAllContracts(filters = {}) {
    try {
      const query = hopDongModel
        .find(filters)
        .populate("nguoi_thue_id", "ho_ten email so_dien_thoai")
        .populate("phong_id", "so_phong gia");

      return await query.exec();
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async getContractById(contractId) {
    try {
      return await hopDongModel
        .findById(contractId)
        .populate("nguoi_thue_id")
        .populate("phong_id");
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async getContractsByStatus(status) {
    try {
      return await hopDongModel
        .find({ trang_thai: status })
        .populate("nguoi_thue_id")
        .populate("phong_id");
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async getExpiringContracts() {
    try {
      const today = new Date();
      const thirtyDaysLater = new Date(
        today.getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      return await hopDongModel
        .find({
          ngay_ket_thuc: { $gte: today, $lte: thirtyDaysLater },
          trang_thai: "active",
        })
        .populate("nguoi_thue_id")
        .populate("phong_id");
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async createContract(contractData) {
    try {
      const contract = new hopDongModel(contractData);
      return await contract.save();
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async updateContract(contractId, updateData) {
    try {
      return await hopDongModel.findByIdAndUpdate(contractId, updateData, {
        new: true,
      });
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async deleteContract(contractId) {
    try {
      return await hopDongModel.findByIdAndDelete(contractId);
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

export default new HopDongRepository();
