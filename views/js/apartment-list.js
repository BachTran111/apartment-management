document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.getElementById("apartment-list");
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");
    const locationFilter = document.getElementById("location-filter");
    const timeFilter = document.getElementById("time-filter");
    const paginationContainer = document.querySelector(".pagination");
    const footerTable = document.querySelector(".footer-table");
    const errorMsgContainer = document.getElementById("error-message");

    let currentPage = 1;
    const itemsPerPage = 6;

    const fetchApartments = async (page = 1) => {
        currentPage = page;
        errorMsgContainer.style.display = "none";
        listContainer.innerHTML = '<tr><td colspan="6"><div class="spinner"></div><p style="text-align:center">Đang tải dữ liệu...</p></td></tr>';
        footerTable.style.display = "none";
        
        const params = new URLSearchParams();
        if (searchInput.value) params.append("q", searchInput.value);
        if (statusFilter.value) params.append("status", statusFilter.value);
        if (locationFilter.value) params.append("location", locationFilter.value);
        if (timeFilter.value) params.append("sort", timeFilter.value);

        try {
            const response = await fetch(`/api/apartments/search?${params.toString()}`);
            if (!response.ok) throw new Error(`Lỗi từ máy chủ (${response.status})! Vui lòng thử lại.`);

            const data = await response.json();
            const allApartments = data.metadata || [];

            if (allApartments.length === 0) {
                listContainer.innerHTML = '<tr><td colspan="6" class="no-data-msg">📭 Không có căn hộ nào khớp với tìm kiếm.</td></tr>';
                return;
            }

            // Pagination Logic
            const totalPages = Math.ceil(allApartments.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedApartments = allApartments.slice(startIndex, startIndex + itemsPerPage);

            renderApartments(paginatedApartments);
            renderPagination(totalPages);
            
            footerTable.style.display = "flex";
            const currentRange = `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, allApartments.length)}`;
            footerTable.querySelector("div:first-child").textContent = `Hiển thị ${currentRange} trên tổng số ${allApartments.length} căn hộ`;

        } catch (error) {
            console.error("Fetch error:", error);
            listContainer.innerHTML = '';
            errorMsgContainer.textContent = `⚠️ Lỗi hệ thống: ${error.message}`;
            errorMsgContainer.style.display = "block";
        }
    };

    const renderApartments = (apartments) => {
        listContainer.innerHTML = apartments.map(apt => {
            const totalRooms = apt.rooms ? apt.rooms.length : 0;
            // Normalize status for counting: support both "available" and "Phòng Trống"
            const availableRooms = apt.rooms ? apt.rooms.filter(r => 
                r.trang_thai === 'available' || r.trang_thai === 'Phòng Trống'
            ).length : 0;
            
            const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0;
            const progressColor = occupancyRate > 80 ? '#dc3545' : (occupancyRate > 50 ? '#ffc107' : '#007bff');
            const imageUrl = apt.hinh_anh || `https://picsum.photos/seed/${apt._id}/40/40`;

            let statusClass = 'status-active';
            let statusText = 'Hoạt động';
            if (apt.trang_thai === 'maintenance' || apt.trang_thai === 'Bảo trì') {
                statusClass = 'status-maintenance';
                statusText = 'Bảo trì';
            } else if (apt.trang_thai === 'inactive' || apt.trang_thai === 'Ngừng hoạt động') {
                statusClass = 'status-inactive';
                statusText = 'Ngừng hoạt động';
            }

            return `
                <tr>
                    <td>
                        <div class="apartment-info">
                            <img src="${imageUrl}" class="apartment-img" alt="${apt.ten}" onerror="this.src='https://via.placeholder.com/40'">
                            <span class="apartment-name">${apt.ten}</span>
                        </div>
                    </td>
                    <td class="location">${apt.dia_chi}</td>
                    <td>${totalRooms} phòng</td>
                    <td>
                        <div class="progress-container">
                            <span style="color: ${progressColor}; font-weight: bold;">${availableRooms}</span>
                            <div class="progress-bar"><div class="progress-fill" style="width: ${100 - (totalRooms > 0 ? (availableRooms / totalRooms * 100) : 0)}%; background: ${progressColor};"></div></div>
                        </div>
                    </td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="actions">
                            <a href="apartment-detail.html?id=${apt._id}" style="color: inherit;"><i class="fa-regular fa-eye"></i></a>
                            <a href="apartment-detail.html?id=${apt._id}&mode=edit" style="color: inherit;"><i class="fa-solid fa-pencil"></i></a>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    };

    const renderPagination = (totalPages) => {
        let paginationHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<div class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.goToPage(${i})">${i}</div>`;
        }
        paginationContainer.innerHTML = paginationHTML;
    };

    window.goToPage = (page) => {
        fetchApartments(page);
    };

    searchBtn.addEventListener("click", () => fetchApartments(1));
    fetchApartments(1);
});