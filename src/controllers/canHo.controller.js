import CanHoModel from "../models/canHo.model.js";
import { OK } from "../handler/success-response.js";

class CanHoController {
    getAll = async (req, res, next) => {
        try {
            const canHos = await CanHoModel.find().lean();
            return res.status(200).json({
                status: "OK",
                metadata: canHos,
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ status: "ERROR", message: err.message });
        }
    };

    getById = async (req, res, next) => {
        try {
            const { canHoId } = req.params;
            const canHo = await CanHoModel.findById(canHoId).lean();

            if (!canHo) {
                return res.status(404).json({ status: "ERROR", message: "Không tìm thấy Căn hộ" });
            }

            return res.status(200).json({
                status: "OK",
                metadata: canHo,
            });
        } catch (err) {
            return res.status(400).json({ status: "ERROR", message: err.message });
        }
    };

    create = async (req, res, next) => {
        try {
            const { ten, dia_chi, tong_so_phong } = req.body;

            if (!ten || !dia_chi) {
                return res.status(400).json({ status: "ERROR", message: "Tên và địa chỉ không được để trống" });
            }

            const newCanHo = await CanHoModel.create({
                ten,
                dia_chi,
                tong_so_phong: tong_so_phong || 0,
            });

            return res.status(201).json(new OK({
                message: "Tạo Căn hộ thành công!",
                metadata: newCanHo
            }));
        } catch (err) {
            return res.status(400).json({ status: "ERROR", message: err.message });
        }
    };

    update = async (req, res, next) => {
        try {
            const { canHoId } = req.params;
            const payload = req.body;

            const updatedCanHo = await CanHoModel.findByIdAndUpdate(canHoId, payload, { new: true });

            if (!updatedCanHo) {
                return res.status(404).json({ status: "ERROR", message: "Không tìm thấy Căn hộ để cập nhật" });
            }

            return res.status(200).json(new OK({
                message: "Cập nhật Căn hộ thành công",
                metadata: updatedCanHo
            }));
        } catch (err) {
            return res.status(400).json({ status: "ERROR", message: err.message });
        }
    };

    remove = async (req, res, next) => {
        try {
            const { canHoId } = req.params;
            const deletedCanHo = await CanHoModel.findByIdAndDelete(canHoId);

            if (!deletedCanHo) {
                return res.status(404).json({ status: "ERROR", message: "Không tìm thấy Căn hộ để xóa" });
            }

            return res.status(200).json(new OK({
                message: "Xóa Căn hộ thành công",
                metadata: deletedCanHo
            }));
        } catch (err) {
            return res.status(400).json({ status: "ERROR", message: err.message });
        }
    };
}

export default new CanHoController();