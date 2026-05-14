// views/dashboard/js/ui.js

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export const renderStats = (stats) => {
    if (!stats) return;
    const statElements = document.querySelectorAll('.stat-value');
    if (statElements.length >= 4) {
        statElements[0].innerText = stats.totalRooms || 0;
        statElements[1].innerText = (stats.occupancyRate || 0) + "%";
        statElements[2].innerText = stats.totalTenants || 0;

        // Chia 1 triệu để ra chữ "Tr" như UI của ông
        const revenue = stats.monthlyRevenue || 0;
        statElements[3].innerText = revenue > 0 ? (revenue / 1000000).toFixed(1) + "Tr" : "0Tr";
    }
};

export const renderOverdueBills = (overdueList) => {
    const container = document.querySelector('.overdue-list');
    if (!container || !overdueList) return;

    container.innerHTML = ""; // Xóa sạch data cứng đi

    if (overdueList.length === 0) {
        container.innerHTML = `<div class="overdue-item"><p style="color: #666; font-size: 0.9rem;">Không có dữ liệu (No data available)</p></div>`;
        return;
    }

    overdueList.forEach(item => {
        const html = `
            <div class="overdue-item">
                <div class="room-tag">${item.roomNumber || 'N/A'}</div>
                <div class="overdue-info">
                    <p class="renter-name">${item.tenantName || 'N/A'}</p>
                    <p class="amount">Trễ ${item.daysOverdue || 0} ngày - ${formatCurrency(item.amount)}</p>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
};

export const renderRecentActivities = (activities) => {
    const tbody = document.querySelector('.activity-table tbody');
    if (!tbody || !activities) return;

    tbody.innerHTML = ""; // Xóa sạch data cứng đi

    if (activities.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666;">Không có dữ liệu (No data available)</td></tr>`;
        return;
    }

    activities.forEach(item => {
        // Render màu badge tùy theo trạng thái
        const statusStr = (item.status || "").toUpperCase();
        const badgeClass = statusStr === 'ĐÃ THANH TOÁN' ? 'badge-success' : 'badge-warning';

        const html = `
            <tr>
                <td><strong>${item.renterName || 'N/A'}</strong></td>
                <td>${item.roomNumber || 'N/A'}</td>
                <td>${item.feeType || 'N/A'}</td>
                <td>${item.date || 'N/A'}</td>
                <td>${formatCurrency(item.amount)}</td>
                <td><span class="badge ${badgeClass}">${item.status || 'N/A'}</span></td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', html);
    });
};