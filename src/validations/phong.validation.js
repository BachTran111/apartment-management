import Joi from "joi";
import mongoose from "mongoose";

const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('"can_ho_id" phải là một MongoDB ObjectId hợp lệ');
    }
    return value;
};

export const phongCreateSchema = Joi.object({
    can_ho_id: Joi.string().custom(objectIdValidator).required().messages({
        "any.required": '"can_ho_id" là bắt buộc',
        "string.empty": '"can_ho_id" không được để trống'
    }),
    so_phong: Joi.string().trim().required().messages({
        "string.empty": '"so_phong" (Số phòng) không được để trống',
        "any.required": '"so_phong" (Số phòng) là bắt buộc'
    }),
    gia: Joi.number().min(0).required().messages({
        "number.base": '"gia" (Giá thuê) phải là một số',
        "number.min": '"gia" (Giá thuê) phải lớn hơn hoặc bằng 0',
        "any.required": '"gia" (Giá thuê) là bắt buộc'
    }),
    dien_tich: Joi.number().greater(0).required().messages({
        "number.base": '"dien_tich" (Diện tích) phải là một số',
        "number.greater": '"dien_tich" (Diện tích) phải lớn hơn 0',
        "any.required": '"dien_tich" (Diện tích) là bắt buộc'
    }),
    trang_thai: Joi.string().valid("Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng").required().messages({
        "any.only": '"trang_thai" (Trạng thái) phải là một trong các giá trị: [Phòng Trống, Đang Có Người Ở, Đang Bảo Trì, Không Sử Dụng]',
        "any.required": '"trang_thai" (Trạng thái) là bắt buộc'
    })
});

export const phongUpdateSchema = Joi.object({
    can_ho_id: Joi.string().custom(objectIdValidator),
    so_phong: Joi.string().trim(),
    gia: Joi.number().min(0),
    dien_tich: Joi.number().greater(0),
    trang_thai: Joi.string().valid("Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng")
});