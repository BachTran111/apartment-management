import Joi from "joi";
import mongoose from "mongoose";

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message(
      `"${helpers.state.path[0]}" phai la mot MongoDB ObjectId hop le`,
    );
  }
  return value;
};

export const roomCreateSchema = Joi.object({
  can_ho_id: Joi.string().custom(objectIdValidator).required().messages({
    "any.required": "ID can ho (can_ho_id) la bat buoc",
    "string.empty": "ID can ho (can_ho_id) khong duoc de trong",
  }),
  anh_phong: Joi.string().allow("").optional(),
  so_phong: Joi.string().trim().required().messages({
    "string.empty": "So phong khong duoc de trong",
    "any.required": "So phong la bat buoc",
  }),
  dien_tich: Joi.number().greater(0).required().messages({
    "number.base": "Dien tich phai la mot so",
    "number.greater": "Dien tich phai lon hon 0",
    "any.required": "Dien tich la bat buoc",
  }),
  gia: Joi.number().min(0).required().messages({
    "number.base": "Gia thue phai la mot so",
    "number.min": "Gia thue phai lon hon hoac bang 0",
    "any.required": "Gia thue la bat buoc",
  }),
  trang_thai: Joi.string()
    .valid("Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng")
    .default("Phòng Trống")
    .messages({
      "any.only":
        "Trang thai phai la: Phòng Trống, Đang Có Người Ở, Đang Bảo Trì, hoặc Không Sử Dụng",
    }),
}).options({ stripUnknown: true });

export const roomUpdateSchema = Joi.object({
  can_ho_id: Joi.string().custom(objectIdValidator),
  anh_phong: Joi.string().allow(""),
  so_phong: Joi.string().trim(),
  dien_tich: Joi.number().greater(0).messages({
    "number.base": "Dien tich phai la mot so",
    "number.greater": "Dien tich phai lon hon 0",
  }),
  gia: Joi.number().min(0).messages({
    "number.base": "Gia thue phai la mot so",
    "number.min": "Gia thue phai lon hon hoac bang 0",
  }),
  trang_thai: Joi.string()
    .valid("Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng")
    .messages({
      "any.only":
        "Trang thai phai la: Phòng Trống, Đang Có Người Ở, Đang Bảo Trì, hoặc Không Sử Dụng",
    }),
}).options({ stripUnknown: true });
