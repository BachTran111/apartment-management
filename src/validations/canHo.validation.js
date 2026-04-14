import Joi from "joi";

export const canHoCreateSchema = Joi.object({
    ten: Joi.string().trim().min(3).max(255).required().messages({
        "string.empty": "Tên căn hộ không được để trống",
        "string.min": "Tên căn hộ phải có ít nhất 3 ký tự",
        "string.max": "Tên căn hộ không được vượt quá 255 ký tự",
        "any.required": "Tên căn hộ là bắt buộc",
    }),
    dia_chi: Joi.string().trim().min(5).required().messages({
        "string.empty": "Địa chỉ không được để trống",
        "string.min": "Địa chỉ phải có ít nhất 5 ký tự",
        "any.required": "Địa chỉ là bắt buộc",
    }),
    tong_so_phong: Joi.number().integer().min(1).required().messages({
        "number.base": "Tổng số phòng phải là số",
        "number.integer": "Tổng số phòng phải là số nguyên",
        "number.min": "Tổng số phòng phải lớn hơn hoặc bằng 1",
        "any.required": "Tổng số phòng là bắt buộc",
    }),
    so_dien_thoai: Joi.string()
        .pattern(/^0[0-9]{9,10}$/)
        .allow(null, "")
        .messages({
            "string.pattern.base": "Số điện thoại phải chứa 10-11 số và bắt đầu bằng số 0",
        }),
    email: Joi.string().email().allow(null, "").messages({
        "string.email": "Email sai định dạng",
    }),
    ghi_chu: Joi.string().allow(null, ""),
});

export const canHoUpdateSchema = Joi.object({
    ten: Joi.string().trim().min(3).max(255).messages({
        "string.empty": "Tên căn hộ không được để trống",
        "string.min": "Tên căn hộ phải có ít nhất 3 ký tự",
        "string.max": "Tên căn hộ không được vượt quá 255 ký tự",
    }),
    dia_chi: Joi.string().trim().min(5).messages({
        "string.empty": "Địa chỉ không được để trống",
        "string.min": "Địa chỉ phải có ít nhất 5 ký tự",
    }),
    tong_so_phong: Joi.number().integer().min(1).messages({
        "number.base": "Tổng số phòng phải là số",
        "number.integer": "Tổng số phòng phải là số nguyên",
        "number.min": "Tổng số phòng phải lớn hơn hoặc bằng 1",
    }),
    so_dien_thoai: Joi.string()
        .pattern(/^0[0-9]{9,10}$/)
        .allow(null, "")
        .messages({
            "string.pattern.base": "Số điện thoại phải chứa 10-11 số và bắt đầu bằng số 0",
        }),
    email: Joi.string().email().allow(null, "").messages({
        "string.email": "Email sai định dạng",
    }),
    ghi_chu: Joi.string().allow(null, ""),
});
