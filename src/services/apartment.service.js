import Apartment from "../models/apartment.model.js"; // Cập nhật import theo chuẩn
import Room from "../models/room.model.js";

class ApartmentService {
  async searchApartments(filters = {}, { skip = 0, limit = 50 } = {}) {
    const { q, location, roomCount, status, sort } = filters;

    // 1. Xây dựng Query cho Apartment
    const query = {};
    const andConditions = [];

    // Tìm theo tên hoặc địa chỉ (q)
    if (q) {
      andConditions.push({
        $or: [
          { ten: { $regex: q.trim(), $options: "i" } },
          { dia_chi: { $regex: q.trim(), $options: "i" } },
        ],
      });
    }

    // Tìm theo vị trí (location)
    if (location) {
      andConditions.push({
        dia_chi: { $regex: location.trim(), $options: "i" },
      });
    }

    // Gộp điều kiện $and nếu có q hoặc location
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Lọc theo trạng thái căn hộ
    if (status) {
      query.trang_thai = status;
    }

    // Lọc theo số lượng phòng
    if (roomCount) {
      const count = Number(roomCount);
      if (!isNaN(count)) {
        // Nếu chọn 3, tìm từ 3 phòng trở lên. Ngược lại tìm chính xác số phòng
        query.tong_so_phong = count >= 3 ? { $gte: 3 } : count;
      }
    }

    // 2. Xử lý sắp xếp (Sort)
    let sortOptions = { createdAt: -1 }; // Mặc định mới nhất trước
    if (sort === "oldest") sortOptions.createdAt = 1;
    if (sort === "newest") sortOptions.createdAt = -1;

    // 3. Thực thi query lấy danh sách Căn hộ (Hỗ trợ phân trang)
    const apartments = await Apartment.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Trả về ngay nếu không tìm thấy gì để đỡ tốn tài nguyên
    if (apartments.length === 0) return [];

    // ==========================================
    // 4. TỐI ƯU HÓA: Bổ sung thông tin Phòng (Giải quyết N+1 Query)
    // ==========================================

    // Bước 4.1: Gom tất cả ID của các căn hộ vừa tìm được thành 1 mảng
    const apartmentIds = apartments.map((apt) => apt._id);

    // Bước 4.2: Gọi DB ĐÚNG 1 LẦN để lấy toàn bộ phòng thuộc các căn hộ trên
    const allRooms = await Room.find({
      can_ho_id: { $in: apartmentIds },
    }).lean();

    // Bước 4.3: Gom nhóm phòng theo can_ho_id bằng Hash Map (Tra cứu O(1))
    const roomsByApartment = allRooms.reduce((acc, room) => {
      const aptId = room.can_ho_id.toString();
      if (!acc[aptId]) {
        acc[aptId] = [];
      }
      acc[aptId].push(room);
      return acc;
    }, {});

    // Bước 4.4: Lắp danh sách phòng vào từng căn hộ tương ứng
    const enrichedResults = apartments.map((apt) => ({
      ...apt,
      rooms: roomsByApartment[apt._id.toString()] || [], // Trả về mảng rỗng nếu chưa có phòng
    }));

    return enrichedResults;
  }

  /**
   * Lấy danh sách căn hộ (có hỗ trợ phân trang và bộ lọc)
   */
  async getAll(
    filter = {},
    { skip = 0, limit = 50, sort = { createdAt: -1 } } = {},
  ) {
    return Apartment.find(filter).skip(skip).limit(limit).sort(sort).lean();
  }

  /**
   * Lấy chi tiết căn hộ theo ID
   */
  async getById(id) {
    if (!id) return null;
    return Apartment.findById(id).lean();
  }

  /**
   * Tạo mới căn hộ
   */
  async create(payload) {
    // Kiểm tra trùng lặp tên căn hộ
    const existingCanHo = await Apartment.findOne({ ten: payload.ten }).lean();
    if (existingCanHo) {
      throw new Error("Tên căn hộ này đã tồn tại");
    }

    // Truyền thẳng payload vào thay vì map từng field (Validation và Schema sẽ lo phần lọc dữ liệu rác)
    const doc = await Apartment.create(payload);
    return doc.toObject();
  }

  /**
   * Cập nhật thông tin căn hộ
   */
  async update(id, payload) {
    // Nếu có update tên, cần kiểm tra xem tên mới có trùng với căn hộ khác không
    if (payload.ten) {
      const existingCanHo = await Apartment.findOne({
        ten: payload.ten,
        _id: { $ne: id },
      }).lean();

      if (existingCanHo) {
        throw new Error("Tên căn hộ này đã tồn tại");
      }
    }

    return Apartment.findByIdAndUpdate(id, payload, {
      new: true,
    }).lean();
  }

  /**
   * Xóa căn hộ
   */
  async remove(id) {
    return Apartment.findByIdAndDelete(id).lean();
  }
}

export default new ApartmentService();
