import Joi from "joi";
import mongoose from "mongoose";

/**
 * Custom Validator: Kiểm tra định dạng MongoDB ObjectId hợp lệ
 * Đã được tối ưu để tự động lấy tên trường (field name) đang bị lỗi thay vì hardcode.
 */
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    // helpers.state.path[0] sẽ tự động lấy tên trường (ví dụ: can_ho_id, noi_that_ids)
    return helpers.message(
      `"${helpers.state.path[0]}" phải là một MongoDB ObjectId hợp lệ`,
    );
  }
  return value;
};

// ==========================================
// SCHEMA: TẠO PHÒNG MỚI
// ==========================================
export const roomCreateSchema = Joi.object({
  can_ho_id: Joi.string().custom(objectIdValidator).required().messages({
    "any.required": "ID căn hộ (can_ho_id) là bắt buộc",
    "string.empty": "ID căn hộ (can_ho_id) không được để trống",
  }),

  anh_phong: Joi.string().allow("").optional(),

  so_phong: Joi.string().trim().required().messages({
    "string.empty": "Số phòng không được để trống",
    "any.required": "Số phòng là bắt buộc",
  }),

  dien_tich: Joi.number().greater(0).required().messages({
    "number.base": "Diện tích phải là một số",
    "number.greater": "Diện tích phải lớn hơn 0",
    "any.required": "Diện tích là bắt buộc",
  }),

  gia: Joi.number().min(0).required().messages({
    "number.base": "Giá thuê phải là một số",
    "number.min": "Giá thuê phải lớn hơn hoặc bằng 0",
    "any.required": "Giá thuê là bắt buộc",
  }),

  trang_thai: Joi.string()
    .valid("Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng")
    .default("Phòng Trống")
    .messages({
      "any.only":
        "Trạng thái phải là: Phòng Trống, Đang Có Người Ở, Đang Bảo Trì, hoặc Không Sử Dụng",
    }),

  // Cho phép nhận vào mảng các ID nếu tạo phòng kèm sẵn các thông tin này
  nguoi_thue_ids: Joi.array()
    .items(Joi.string().custom(objectIdValidator))
    .optional(),
  noi_that_ids: Joi.array()
    .items(Joi.string().custom(objectIdValidator))
    .optional(),
  hop_dong_ids: Joi.array()
    .items(Joi.string().custom(objectIdValidator))
    .optional(),
}).options({ stripUnknown: true }); // CỰC KỲ QUAN TRỌNG: Tự động loại bỏ các trường rác không có trong schema gửi từ Client

// ==========================================
// SCHEMA: CẬP NHẬT PHÒNG
// ==========================================
export const roomUpdateSchema = Joi.object({
  can_ho_id: Joi.string().custom(objectIdValidator),
  anh_phong: Joi.string().allow(""),
  so_phong: Joi.string().trim(),
  dien_tich: Joi.number().greater(0).messages({
    "number.base": "Diện tích phải là một số",
    "number.greater": "Diện tích phải lớn hơn 0",
  }),
  gia: Joi.number().min(0).messages({
    "number.base": "Giá thuê phải là một số",
    "number.min": "Giá thuê phải lớn hơn hoặc bằng 0",
  }),
  trang_thai: Joi.string()
    .valid("Phòng Trống", "Đang Có Người Ở", "Đang Bảo Trì", "Không Sử Dụng")
    .messages({
      "any.only":
        "Trạng thái phải là: Phòng Trống, Đang Có Người Ở, Đang Bảo Trì, hoặc Không Sử Dụng",
    }),

  nguoi_thue_ids: Joi.array().items(Joi.string().custom(objectIdValidator)),
  noi_that_ids: Joi.array().items(Joi.string().custom(objectIdValidator)),
  hop_dong_ids: Joi.array().items(Joi.string().custom(objectIdValidator)),
}).options({ stripUnknown: true });
