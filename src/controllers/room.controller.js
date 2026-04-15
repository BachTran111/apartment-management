import Phong from "../models/phong-api.model.js";

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Phong.find({ trang_thai: "available" });
    
    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Lỗi lấy danh sách phòng: ${error.message}`,
    });
  }
};
