import RoomModel from "../models/room.model.js";
import TenantModel from "../models/tenant.model.js";
import BillModel from "../models/bill.model.js";
import ContractModel from "../models/contract.model.js";

class DashboardService {
  static async getDashboardData() {
    // Fetch all non-blocking independent queries simultaneously
    const [stats, chartData, overdue, activities] = await Promise.all([
      this.getStats(),
      this.getChartData(),
      this.getOverdueBills(),
      this.getRecentActivities(),
    ]);

    return { stats, chartData, overdue, activities };
  }

  static async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [totalRooms, occupiedRooms, totalTenants, revenueResult] =
      await Promise.all([
        RoomModel.countDocuments(),
        RoomModel.countDocuments({ trang_thai: "Đang Có Người Ở" }),
        TenantModel.countDocuments({ trang_thai: "active" }),
        BillModel.aggregate([
          {
            $match: {
              trang_thai: "ĐÃ THANH TOÁN",
              // Match with ngay_lap properly derived from schema
              ngay_lap: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$so_tien" },
            },
          },
        ]),
      ]);

    const monthlyRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const occupancyRate =
      totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

    return {
      totalRooms,
      occupancyRate: parseFloat(occupancyRate),
      totalTenants,
      monthlyRevenue,
    };
  }

  static async getChartData() {
    const now = new Date();
    // Go exactly 5 full months back from the 1st of the current month to get 6 months total
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const revenueData = await BillModel.aggregate([
      {
        $match: {
          trang_thai: "ĐÃ THANH TOÁN",
          ngay_lap: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$ngay_lap" },
            year: { $year: "$ngay_lap" },
          },
          total: { $sum: "$so_tien" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const labels = [];
    const data = [];

    // Loop guarantees proper order & fallback for empty months in the past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`Tháng ${d.getMonth() + 1}`);

      // Find the aggregate result matching this specific month and year
      const record = revenueData.find(
        (r) =>
          r._id.month === d.getMonth() + 1 && r._id.year === d.getFullYear(),
      );

      // Push exact monetary value or 0 fallback guaranteeing 6 items
      data.push(record ? record.total : 0);
    }

    return { labels, data };
  }

  static async getOverdueBills() {
    const now = new Date();

    // Assuming bills over 30 days old are overdue if still "CHƯA THANH TOÁN" or explicitly marked "QUÁ HẠN"
    // Adjust the $lt threshold or rely purely on "QUÁ HẠN" depending on exact business rules
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const overdueBills = await BillModel.find({
      $or: [
        { trang_thai: "QUÁ HẠN" },
        { trang_thai: "CHƯA THANH TOÁN", ngay_lap: { $lt: thirtyDaysAgo } },
      ],
    })
      .populate({
        path: "hop_dong_id",
        populate: [
          { path: "phong_id", select: "so_phong" },
          { path: "nguoi_thue_id", select: "ho_ten" },
        ],
      })
      .limit(10)
      .lean();

    return overdueBills.map((bill) => {
      const billDate = new Date(bill.ngay_lap);
      // Overdue days starts counting ~30 days past ngay_lap
      const dueDate = new Date(billDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const diffTime = Math.max(0, now - dueDate);
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        roomNumber: bill.hop_dong_id?.phong_id?.so_phong || "Unknown",
        tenantName: bill.hop_dong_id?.nguoi_thue_id?.ho_ten || "Unknown",
        daysOverdue: daysOverdue || 0,
        amount: bill.so_tien,
      };
    });
  }

  static async getRecentActivities() {
    const activities = await BillModel.find()
      .sort({ ngay_lap: -1 })
      .populate({
        path: "hop_dong_id",
        populate: [
          { path: "phong_id", select: "so_phong" },
          { path: "nguoi_thue_id", select: "ho_ten" },
        ],
      })
      .limit(5)
      .lean();

    return activities.map((bill) => ({
      renterName: bill.hop_dong_id?.nguoi_thue_id?.ho_ten || "Unknown",
      roomNumber: bill.hop_dong_id?.phong_id?.so_phong || "Unknown",
      feeType: "Hóa Đơn", // Adjust if you end up creating multiple fee types in Schema
      date: bill.ngay_lap
        ? new Date(bill.ngay_lap).toISOString().split("T")[0]
        : "N/A",
      amount: bill.so_tien,
      status: bill.trang_thai,
    }));
  }
}

export default DashboardService;
