import Joi from "joi";
import mongoose from "mongoose";

const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message('"can_ho_id" must be a valid MongoDB ObjectId');
    }
    return value;
};

export const phongCreateSchema = Joi.object({
    can_ho_id: Joi.string().custom(objectIdValidator).required().messages({
        "any.required": '"can_ho_id" is required',
        "string.empty": '"can_ho_id" cannot be empty'
    }),
    so_phong: Joi.string().trim().required().messages({
        "string.empty": '"so_phong" cannot be empty',
        "any.required": '"so_phong" is required'
    }),
    gia: Joi.number().min(0).required().messages({
        "number.base": '"gia" must be a number',
        "number.min": '"gia" must be greater than or equal to 0',
        "any.required": '"gia" is required'
    }),
    dien_tich: Joi.number().greater(0).required().messages({
        "number.base": '"dien_tich" must be a number',
        "number.greater": '"dien_tich" must be greater than 0',
        "any.required": '"dien_tich" is required'
    }),
    trang_thai: Joi.string().valid("Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng").required().messages({
        "any.only": '"trang_thai" must be one of [Phòng Trống, Đang Có Người Ở, Đang Bảo Trì, Không Sử Dụng]',
        "any.required": '"trang_thai" is required'
    })
});

export const phongUpdateSchema = Joi.object({
    can_ho_id: Joi.string().custom(objectIdValidator),
    so_phong: Joi.string().trim(),
    gia: Joi.number().min(0),
    dien_tich: Joi.number().greater(0),
    trang_thai: Joi.string().valid("Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng")
});