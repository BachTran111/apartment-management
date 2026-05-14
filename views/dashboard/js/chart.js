// views/dashboard/js/chart.js

let revenueChartInstance = null;

export const renderChart = (chartData) => {
    if (!chartData || !chartData.labels || !chartData.data) return;

    const canvas = document.getElementById("revenueChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Nếu biểu đồ đã vẽ rồi thì hủy đi vẽ lại để tránh lỗi overlap khi hover
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: "Doanh thu",
                    data: chartData.data,
                    borderColor: "#1e293b",
                    backgroundColor: "rgba(30, 41, 59, 0.05)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4, // Clean modern curve
                    pointRadius: 0, // No point dots
                    pointHoverRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { borderDash: [4, 4] } } // Dashed Y-axis grid
            },
        },
    });
};