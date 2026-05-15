document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("apartment-list");
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  const locationFilter = document.getElementById("location-filter");
  const statusFilter = document.getElementById("status-filter");
  const paginationContainer = document.querySelector(".pagination");
  const footerTable = document.querySelector(".footer-table");
  const errorMsgContainer = document.getElementById("error-message");

  let currentPage = 1;
  const itemsPerPage = 6;
  let allApartments = [];

  async function fetchApartments(page = 1) {
    currentPage = page;

    errorMsgContainer.style.display = "none";
    listContainer.innerHTML =
      '<tr><td colspan="6"><div class="spinner"></div></td></tr>';
    footerTable.style.display = "none";

    const keyword = searchInput.value.trim();
    const params = new URLSearchParams();

    if (keyword) {
      params.append("q", keyword);
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/apartments/search?${params.toString()}`,
      );
      const data = await response.json();

      allApartments = Array.isArray(data.metadata) ? data.metadata : [];
      populateLocationOptions(allApartments);

      const filteredApartments = filterApartments(allApartments);
      renderFilteredList(filteredApartments, page);
    } catch (error) {
      errorMsgContainer.style.display = "block";
      errorMsgContainer.textContent = error.message;
    }
  }

  function filterApartments(apartments) {
    const keyword = normalizeText(searchInput.value.trim());
    const selectedLocation = normalizeText(locationFilter.value.trim());
    const selectedStatus = statusFilter.value.trim();

    return (apartments || []).filter((apt) => {
      const name = normalizeText(apt.ten || "");
      const address = normalizeText(apt.dia_chi || "");
      const area = normalizeText(extractAreaLabel(apt.dia_chi || ""));
      const apartmentStatus = getApartmentStatus(apt).key;

      const matchKeyword =
        !keyword || name.includes(keyword) || address.includes(keyword);
      const matchLocation =
        !selectedLocation ||
        area.includes(selectedLocation) ||
        address.includes(selectedLocation);
      const matchStatus = !selectedStatus || apartmentStatus === selectedStatus;

      return matchKeyword && matchLocation && matchStatus;
    });
  }

  function renderFilteredList(apartments, page = 1) {
    currentPage = page;

    if (!apartments.length) {
      listContainer.innerHTML =
        '<tr><td colspan="6" class="no-data-msg">Không có căn hộ nào phù hợp</td></tr>';
      footerTable.style.display = "none";
      paginationContainer.innerHTML = "";
      return;
    }

    const totalPages = Math.ceil(apartments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedApartments = apartments.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    renderApartments(paginatedApartments);
    renderPagination(totalPages, apartments);

    footerTable.style.display = "flex";
    const currentRange = `${startIndex + 1}-${Math.min(
      startIndex + itemsPerPage,
      apartments.length,
    )}`;
    footerTable.querySelector("div:first-child").textContent =
      `Hiển thị ${currentRange} trên tổng số ${apartments.length} căn hộ`;
  }

  function renderApartments(apartments) {
    listContainer.innerHTML = apartments
      .map((apt) => {
        const rooms = Array.isArray(apt.rooms) ? apt.rooms : [];
        const totalRooms = rooms.length || Number(apt.tong_so_phong || 0);
        const availableRooms = rooms.filter((room) =>
          isAvailableRoomStatus(room.trang_thai),
        ).length;

        const availablePercent =
          totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0;
        const progressColor =
          availablePercent <= 20
            ? "#dc3545"
            : availablePercent <= 50
              ? "#ffc107"
              : "#28a745";
        const imageUrl =
          apt.hinh_anh || `https://picsum.photos/seed/${apt._id}/40/40`;
        const apartmentStatus = getApartmentStatus(apt);

        return `
          <tr>
            <td>
              <div class="apartment-info">
                <img src="${imageUrl}" class="apartment-img" alt="${escapeHtml(apt.ten || "")}" onerror="this.src='https://via.placeholder.com/40'">
                <span class="apartment-name">${escapeHtml(apt.ten || "")}</span>
              </div>
            </td>
            <td class="location">${escapeHtml(extractAreaLabel(apt.dia_chi || ""))}</td>
            <td>${totalRooms} phòng</td>
            <td>
              <div class="progress-container">
                <span style="color: ${progressColor}; font-weight: bold;">
                  ${availableRooms} phòng trống
                </span>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    style="width: ${availablePercent}%; background: ${progressColor};"
                  ></div>
                </div>
              </div>
            </td>
            <td><span class="status ${apartmentStatus.className}">${apartmentStatus.label}</span></td>
            <td>
              <div class="actions">
                <a href="apartment-detail.html?id=${apt._id}" style="color: inherit;"><i class="fa-regular fa-eye"></i></a>
                <a href="apartment-detail.html?id=${apt._id}&mode=edit" style="color: inherit;"><i class="fa-solid fa-pencil"></i></a>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function renderPagination(totalPages, apartments) {
    let paginationHTML = "";
    for (let i = 1; i <= totalPages; i += 1) {
      paginationHTML += `<div class="page-btn ${i === currentPage ? "active" : ""}" onclick="window.goToPage(${i})">${i}</div>`;
    }
    paginationContainer.innerHTML = paginationHTML;

    window.goToPage = (page) => {
      renderFilteredList(apartments, page);
    };
  }

  function populateLocationOptions(apartments) {
    const currentValue = locationFilter.value;
    const areaSet = new Set();

    apartments.forEach((apt) => {
      const area = extractAreaLabel(apt.dia_chi || "");
      if (area) {
        areaSet.add(area);
      }
    });

    const sortedAreas = [...areaSet].sort((left, right) =>
      left.localeCompare(right, "vi"),
    );

    locationFilter.innerHTML =
      '<option value="">Khu vực</option>' +
      sortedAreas
        .map((area) => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`)
        .join("");

    if (sortedAreas.includes(currentValue)) {
      locationFilter.value = currentValue;
    }
  }

  function extractAreaLabel(address) {
    const source = String(address || "").trim();
    if (!source) return "";

    const parts = source
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }

    return parts[0] || source;
  }

  function getApartmentStatus(apt) {
    const rooms = Array.isArray(apt.rooms) ? apt.rooms : [];

    if (!rooms.length) {
      return { key: "inactive", className: "status-inactive", label: "Không hoạt động" };
    }

    const hasOccupied = rooms.some((room) =>
      isOccupiedRoomStatus(room.trang_thai),
    );
    const hasAvailable = rooms.some((room) =>
      isAvailableRoomStatus(room.trang_thai),
    );
    const hasMaintenance = rooms.some((room) =>
      isMaintenanceRoomStatus(room.trang_thai),
    );

    if (hasOccupied || hasAvailable) {
      return { key: "active", className: "status-active", label: "Hoạt động" };
    }

    if (hasMaintenance) {
      return {
        key: "maintenance",
        className: "status-maintenance",
        label: "Bảo trì",
      };
    }

    return { key: "inactive", className: "status-inactive", label: "Không hoạt động" };
  }

  function isAvailableRoomStatus(status) {
    return normalizeText(status || "") === normalizeText("Phòng Trống");
  }

  function isOccupiedRoomStatus(status) {
    return normalizeText(status || "") === normalizeText("Đang Có Người Ở");
  }

  function isMaintenanceRoomStatus(status) {
    return normalizeText(status || "") === normalizeText("Đang Bảo Trì");
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function debounce(callback, delay) {
    let timeoutId = 0;
    return () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => callback(), delay);
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  searchBtn.addEventListener("click", () => fetchApartments(1));
  searchInput.addEventListener("input", debounce(() => fetchApartments(1), 300));
  locationFilter.addEventListener("change", () =>
    renderFilteredList(filterApartments(allApartments), 1),
  );
  statusFilter.addEventListener("change", () =>
    renderFilteredList(filterApartments(allApartments), 1),
  );

  fetchApartments(1);
});
