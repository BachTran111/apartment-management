import CanHoModel from "../models/canHo.model.js";

class CanHoService {
    getAll = async () => {
        return await CanHoModel.find().lean();
    };

    getById = async (id) => {
        return await CanHoModel.findById(id).lean();
    };

    create = async (payload) => {
        return await CanHoModel.create({
            ten: payload.ten,
            dia_chi: payload.dia_chi,
            tong_so_phong: payload.tong_so_phong || 0,
        });
    };

    update = async (id, payload) => {
        return await CanHoModel.findByIdAndUpdate(id, payload, { new: true });
    };

    remove = async (id) => {
        return await CanHoModel.findByIdAndDelete(id);
    };
}

export default new CanHoService();