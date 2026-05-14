// views/dashboard/js/app.js
import { fetchDashboardSummary } from "./api.js";
import {
  renderStats,
  renderOverdueBills,
  renderRecentActivities,
} from "./ui.js";
import { renderChart } from "./chart.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Gọi API lấy toàn bộ data (1 request duy nhất)
  const data = await fetchDashboardSummary();

  if (data) {
    // Đổ data vào UI
    renderStats(data.stats);
    renderChart(data.chartData);
    renderOverdueBills(data.overdue);
    renderRecentActivities(data.activities);
  } else {
    console.error(
      "Không thể tải dữ liệu Dashboard, vui lòng kiểm tra lại Backend!",
    );
  }
});
