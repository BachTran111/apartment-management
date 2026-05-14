document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("apartment-list");
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  const locationFilter = document.getElementById("location-filter");
  const paginationContainer = document.querySelector(".pagination");
  const footerTable = document.querySelector(".footer-table");
  const errorMsgContainer = document.getElementById("error-message");

  let currentPage = 1;
  const itemsPerPage = 6;
  let allApartments = [];

  const fetchApartments = async (page = 1) => {
    currentPage = page;

    errorMsgContainer.style.display = "none";
    listContainer.innerHTML =
      '<tr><td colspan="6"><div class="spinner"></div></td></tr>';

    footerTable.style.display = "none";

    const keyword = searchInput.value.trim();
    const locationValue = locationFilter.value.trim();

    const params = new URLSearchParams();

    if (keyword) params.append("q", keyword);
    if (locationValue) params.append("location", locationValue);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/apartments/search?${params.toString()}`,
      );

      const data = await response.json();

      allApartments = filterApartments(data.metadata || []);

      // =========================
      // PAGINATION
      // =========================
      const totalPages = Math.ceil(allApartments.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;

      const paginated = allApartments.slice(
        startIndex,
        startIndex + itemsPerPage,
      );

      renderApartments(paginated);
      renderPagination(totalPages);

      footerTable.style.display = "flex";
      footerTable.querySelector("div:first-child").textContent =
        `Hiển thị ${startIndex + 1}-${Math.min(
          startIndex + itemsPerPage,
          allApartments.length,
        )} / ${allApartments.length}`;
    } catch (error) {
      errorMsgContainer.style.display = "block";
      errorMsgContainer.textContent = error.message;
    }
  };

  const filterApartments = (apartments) => {
    const keyword = normalizeText(searchInput.value.trim());
    const selectedLocation = normalizeText(locationFilter.value.trim());

    return (apartments || []).filter((apt) => {
      const name = normalizeText(apt.ten || "");
      const address = normalizeText(apt.dia_chi || "");

      const matchName = !keyword || name.includes(keyword);
      const matchLocation =
        !selectedLocation || address.includes(selectedLocation);

      return matchName && matchLocation;
    });
  };

  const renderFilteredList = (apartments, page = 1) => {
    currentPage = page;

    if (!allApartments.length) {
      listContainer.innerHTML =
        '<tr><td colspan="6" class="no-data-msg"> Không có căn hộ nào</td></tr>';
      footerTable.style.display = "none";
      return;
    }

    const totalPages = Math.ceil(apartments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedApartments = apartments.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    renderApartments(paginatedApartments);
    renderPagination(totalPages);

    footerTable.style.display = "flex";
    const currentRange = `${startIndex + 1}-${Math.min(
      startIndex + itemsPerPage,
      apartments.length,
    )}`;
    footerTable.querySelector("div:first-child").textContent =
      `Hiển thị ${currentRange} trên tổng số ${apartments.length} căn hộ`;
  };

  const renderApartments = (apartments) => {
    listContainer.innerHTML = apartments
      .map((apt) => {
        const rooms = Array.isArray(apt.rooms) ? apt.rooms : [];
        const totalRooms = rooms.length;

        const availableRooms = rooms.filter((r) =>
          isAvailableRoomStatus(r.trang_thai),
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
            <td class="location">${escapeHtml(apt.dia_chi || "")}</td>
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
  };

  const renderPagination = (totalPages) => {
    let paginationHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `<div class="page-btn ${i === currentPage ? "active" : ""}" onclick="window.goToPage(${i})">${i}</div>`;
    }
    paginationContainer.innerHTML = paginationHTML;
  };

  window.goToPage = (page) => {
    renderFilteredList(allApartments, page);
  };

  searchBtn.addEventListener("click", () => fetchApartments(1));
  searchInput.addEventListener(
    "input",
    debounce(() => fetchApartments(1), 300),
  );
  locationFilter.addEventListener("change", () => fetchApartments(1));

  fetchApartments(1);

  function getApartmentStatus(apt) {
    const rooms = Array.isArray(apt.rooms) ? apt.rooms : [];
    const hasActiveRoom = rooms.some(
      (r) =>
        isAvailableRoomStatus(r.trang_thai) ||
        isOccupiedRoomStatus(r.trang_thai),
    );

    if (hasActiveRoom) {
      return { className: "status-active", label: "Hoạt động" };
    }

    return { className: "status-inactive", label: "Không hoạt động" };
  }

  function isAvailableRoomStatus(status) {
    const value = normalizeText(status || "");
    return value === normalizeText("Phòng Trống");
  }

  function isOccupiedRoomStatus(status) {
    const value = normalizeText(status || "");
    return value === normalizeText("Đang Có Người Ở");
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
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
});
