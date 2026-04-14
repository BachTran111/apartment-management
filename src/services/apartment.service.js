import { CanHo, Phong } from "../models/index.js";

class ApartmentService {
  /**
   * Search and Filter Apartments (CanHo)
   * @param {Object} filters 
   * @param {String} filters.q - Tìm theo Tên hoặc Địa chỉ
   * @param {String} filters.location - Tìm theo Vị trí (Quận)
   * @param {Number} filters.roomCount - Số lượng phòng (1, 2, 3+)
   * @param {String} filters.status - Trạng thái căn hộ (active, maintenance, inactive)
   * @param {String} filters.sort - Sắp xếp theo thời gian (newest, oldest)
   */
  async searchApartments(filters = {}) {
    const { q, location, roomCount, status, sort } = filters;

    // 1. Xây dựng Query cho CanHo
    let canHoQuery = {};
    
    // Tìm theo tên hoặc địa chỉ (q)
    if (q) {
      canHoQuery.$or = [
        { ten: { $regex: q.trim(), $options: "i" } },
        { dia_chi: { $regex: q.trim(), $options: "i" } },
      ];
    }

    // Tìm theo vị trí (location - ví dụ Quận 1, Quận 7...)
    if (location) {
      const locationRegex = { $regex: location.trim(), $options: "i" };
      if (canHoQuery.$or) {
        // Nếu đã có q, ta kết hợp thêm điều kiện AND cho location
        canHoQuery = { $and: [ { $or: canHoQuery.$or }, { dia_chi: locationRegex } ] };
      } else {
        canHoQuery.dia_chi = locationRegex;
      }
    }

    // Lọc theo trạng thái căn hộ (Đảm bảo giá trị khớp với DB)
    if (status) {
        canHoQuery.trang_thai = status;
    }

    // Lọc theo số lượng phòng
    if (roomCount) {
        const count = Number(roomCount);
        if (count >= 3) {
            canHoQuery.tong_so_phong = { $gte: 3 };
        } else {
            canHoQuery.tong_so_phong = count;
        }
    }

    // 2. Xử lý sắp xếp (Sort)
    let sortOptions = { createdAt: -1 }; // Mặc định mới nhất trước
    if (sort === "oldest") {
        sortOptions.createdAt = 1;
    } else if (sort === "newest") {
        sortOptions.createdAt = -1;
    }

    // 3. Thực thi query
    const results = await CanHo.find(canHoQuery).sort(sortOptions).lean();
    
    // 4. Bổ sung thông tin phòng (Phong) cho từng căn hộ
    const enrichedResults = await Promise.all(results.map(async (canho) => {
        // Tìm phòng theo can_ho_id (xem xét cả kiểu dữ liệu String hoặc ObjectId)
        const rooms = await Phong.find({ 
            $or: [
                { can_ho_id: canho._id },
                { can_ho_id: canho._id.toString() }
            ]
        }).lean();
        return { ...canho, rooms };
    }));

    return enrichedResults;
  }

  async getApartmentById(id) {
    const canho = await CanHo.findById(id).lean();
    if (!canho) return null;

    const rooms = await Phong.find({
      $or: [
        { can_ho_id: canho._id },
        { can_ho_id: canho._id.toString() }
      ]
    }).lean();

    return { ...canho, rooms };
  }

  async updateApartment(id, data) {
    const updated = await CanHo.findByIdAndUpdate(id, data, { new: true }).lean();
    return updated;
  }
}

export default new ApartmentService();
