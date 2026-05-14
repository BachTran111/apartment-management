// views/dashboard/js/api.js
const BASE_URL = "http://localhost:5000/api"; // Chú ý đổi port nếu Backend của ông dùng port khác

export const fetchDashboardSummary = async () => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/summary`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Cấu trúc chuẩn của ông là return res.status(200).json(new OK({ metadata: data }))
    return data.metadata;
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu Dashboard:", error);
    return null;
  }
};
