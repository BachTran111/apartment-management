import CanHoModel from "../models/canHo.model.js";

class CanHoService {
    getAll = async () => {
        return await CanHoModel.find().lean();
    };

    getById = async (id) => {
        return await CanHoModel.findById(id).lean();
    };

    create = async (payload) => {
        const existingCanHo = await CanHoModel.findOne({ ten: payload.ten });
        if (existingCanHo) {
            throw new Error("Tên căn hộ này đã tồn tại");
        }

        return await CanHoModel.create({
            ten: payload.ten,
            dia_chi: payload.dia_chi,
            tong_so_phong: payload.tong_so_phong || 1,
            so_dien_thoai: payload.so_dien_thoai,
            email: payload.email,
            ghi_chu: payload.ghi_chu,
        });
    };

    update = async (id, payload) => {
        if (payload.ten) {
            const existingCanHo = await CanHoModel.findOne({ ten: payload.ten, _id: { $ne: id } });
            if (existingCanHo) {
                throw new Error("Tên căn hộ này đã tồn tại");
            }
        }
        return await CanHoModel.findByIdAndUpdate(id, payload, { new: true });
    };

    remove = async (id) => {
        return await CanHoModel.findByIdAndDelete(id);
    };
}

export default new CanHoService();