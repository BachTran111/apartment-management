document.addEventListener("DOMContentLoaded", () => {
  const detailContainer = document.getElementById("apartment-detail");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnRoomManagement = document.getElementById("btnRoomManagement");
  const btnToggleEdit = document.getElementById("btnToggleEdit");

  const urlParams = new URLSearchParams(window.location.search);
  const apartmentId = urlParams.get("id");
  const initialMode = urlParams.get("mode") === "edit";

  const API_BASE = resolveApiBase();
  const ROOM_LIST_URL = "/rooms/RoomList.html";

  let currentApartment = null;
  let isEditMode = initialMode;

  if (!apartmentId) {
    renderError("ID căn hộ không hợp lệ.");
    disableActionButtons();
    return;
  }

  btnCloseModal.addEventListener("click", goBackToList);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      goBackToList();
    }
  });

  fetchDetail();

  function disableActionButtons() {
    btnRoomManagement.classList.add("disabled");
    btnRoomManagement.setAttribute("aria-disabled", "true");
    btnRoomManagement.href = "#";
    btnToggleEdit.disabled = true;
    btnToggleEdit.style.opacity = "0.6";
    btnToggleEdit.style.cursor = "not-allowed";
  }

  function enableActionButtons() {
    btnToggleEdit.disabled = false;
    btnToggleEdit.style.opacity = "1";
    btnToggleEdit.style.cursor = "pointer";
  }

  function goBackToList() {
    window.location.href = "/apartments/apartment-list.html";
  }

  async function fetchDetail() {
    try {
      renderLoading();

      const response = await fetch(
        `${API_BASE}/apartments/${encodeURIComponent(apartmentId)}`,
      );
      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "Không thể tải thông tin căn hộ.");
      }

      currentApartment = data.metadata;
      if (!currentApartment) {
        renderNoResult("Không tìm thấy thông tin căn hộ.");
        disableActionButtons();
        return;
      }

      btnRoomManagement.href = `${ROOM_LIST_URL}?canHoId=${encodeURIComponent(currentApartment._id)}`;
      enableActionButtons();

      renderCurrentMode();
    } catch (error) {
      renderError(error.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      disableActionButtons();
    }
  }

  function renderCurrentMode() {
    if (isEditMode) {
      renderEditMode(currentApartment);
      btnToggleEdit.innerHTML = '<i class="fa-solid fa-eye"></i> Xem chi tiết';
      btnToggleEdit.onclick = () => {
        isEditMode = false;
        renderCurrentMode();
      };
    } else {
      renderViewMode(currentApartment);
      btnToggleEdit.innerHTML =
        '<i class="fa-solid fa-pen-to-square"></i> Chỉnh sửa';
      btnToggleEdit.onclick = () => {
        isEditMode = true;
        renderCurrentMode();
      };
    }
  }

  function renderLoading() {
    detailContainer.innerHTML = `
      <div class="section-card">
        <div class="loading-box">Đang tải thông tin căn hộ...</div>
      </div>
    `;
  }

  function renderError(message) {
    detailContainer.innerHTML = `<div class="error-msg">⚠️ Lỗi: ${escapeHtml(message)}</div>`;
  }

  function renderNoResult(message) {
    detailContainer.innerHTML = `<div class="no-results">${escapeHtml(message)}</div>`;
  }

  function renderViewMode(apt) {
    const imageUrl =
      apt.hinh_anh || `https://picsum.photos/seed/${apt._id}/800/280`;

    detailContainer.innerHTML = `
      <h2 class="page-title">Chi tiết căn hộ: ${escapeHtml(apt.ten || "")}</h2>

      <div class="section-card">
        <div class="section-header">
          <div class="icon-circle">1</div> THÔNG TIN CHUNG
        </div>

        <div style="width:100%; height:220px; overflow:hidden; border-radius: 12px; margin-bottom: 18px; border:1px solid var(--border-color);">
          <img
            src="${escapeAttribute(imageUrl)}"
            alt="${escapeAttribute(apt.ten || "Apartment")}"
            style="width:100%; height:100%; object-fit:cover;"
            onerror="this.src='https://via.placeholder.com/800x280?text=Apartment+Image'"
          />
        </div>

        <div class="info-group">
          <div class="info-row">
            <span class="info-label">TÊN CĂN HỘ:</span>
            <div class="info-value">${escapeHtml(apt.ten || "")}</div>
          </div>

          <div class="info-row">
            <span class="info-label">ĐỊA CHỈ:</span>
            <div class="info-value">${escapeHtml(apt.dia_chi || "")}</div>
          </div>

          <div class="info-row">
            <span class="info-label">TỔNG SỐ PHÒNG:</span>
            <div class="info-value">${formatNumber(apt.tong_so_phong)}</div>
          </div>

          <div class="info-row">
            <span class="info-label">SỐ ĐIỆN THOẠI:</span>
            <div class="info-value">${escapeHtml(apt.so_dien_thoai || "Chưa có")}</div>
          </div>

          <div class="info-row">
            <span class="info-label">EMAIL:</span>
            <div class="info-value">${escapeHtml(apt.email || "Chưa có")}</div>
          </div>

          <div class="info-row">
            <span class="info-label">GHI CHÚ:</span>
            <div class="info-value">${escapeHtml(apt.ghi_chu || "Chưa có")}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEditMode(apt) {
    detailContainer.innerHTML = `
      <h2 class="page-title">Chỉnh sửa căn hộ: ${escapeHtml(apt.ten || "")}</h2>

      <div class="section-card">
        <div class="section-header">
          <div class="icon-circle">2</div> CẬP NHẬT THÔNG TIN
        </div>

        <form id="editApartmentForm">
          <div class="form-grid">
            <div class="form-field full">
              <label for="editTen">Tên căn hộ</label>
              <input id="editTen" class="form-control" type="text" value="${escapeAttribute(apt.ten || "")}" />
            </div>

            <div class="form-field full">
              <label for="editDiaChi">Địa chỉ</label>
              <input id="editDiaChi" class="form-control" type="text" value="${escapeAttribute(apt.dia_chi || "")}" />
            </div>

            <div class="form-field">
              <label for="editTongSoPhong">Tổng số phòng</label>
              <input id="editTongSoPhong" class="form-control" type="number" min="1" step="1" value="${escapeAttribute(String(apt.tong_so_phong ?? ""))}" />
            </div>

            <div class="form-field">
              <label for="editSoDienThoai">Số điện thoại</label>
              <input id="editSoDienThoai" class="form-control" type="text" value="${escapeAttribute(apt.so_dien_thoai || "")}" />
            </div>

            <div class="form-field full">
              <label for="editEmail">Email</label>
              <input id="editEmail" class="form-control" type="email" value="${escapeAttribute(apt.email || "")}" />
            </div>

            <div class="form-field full">
              <label for="editGhiChu">Ghi chú</label>
              <input id="editGhiChu" class="form-control" type="text" value="${escapeAttribute(apt.ghi_chu || "")}" />
            </div>
          </div>

          <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:18px; flex-wrap:wrap;">
            <button type="button" id="btnCancelEdit" class="btn btn-outline">
              <i class="fa-solid fa-xmark"></i> Hủy
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    `;

    const form = document.getElementById("editApartmentForm");
    const btnCancelEdit = document.getElementById("btnCancelEdit");

    btnCancelEdit.addEventListener("click", () => {
      isEditMode = false;
      renderCurrentMode();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const payload = {
        ten: document.getElementById("editTen").value.trim(),
        dia_chi: document.getElementById("editDiaChi").value.trim(),
        tong_so_phong: Number(document.getElementById("editTongSoPhong").value),
        so_dien_thoai:
          document.getElementById("editSoDienThoai").value.trim() || null,
        email: document.getElementById("editEmail").value.trim() || null,
        ghi_chu: document.getElementById("editGhiChu").value.trim() || "",
      };

      try {
        const response = await fetch(
          `${API_BASE}/apartments/${encodeURIComponent(apt._id)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        const result = await safeJson(response);

        if (!response.ok) {
          throw new Error(result?.message || "Lỗi khi cập nhật căn hộ.");
        }

        currentApartment = result.metadata || {
          ...apt,
          ...payload,
        };

        btnRoomManagement.href = `${ROOM_LIST_URL}?canHoId=${encodeURIComponent(currentApartment._id)}`;

        alert("Cập nhật căn hộ thành công!");
        isEditMode = false;
        renderCurrentMode();
      } catch (error) {
        alert(error.message || "Không thể cập nhật căn hộ.");
      }
    });
  }

  function resolveApiBase() {
    const explicitBase =
      document.body.dataset.apiBase ||
      new URLSearchParams(window.location.search).get("apiBase");
    if (explicitBase) {
      return explicitBase.replace(/\/$/, "");
    }

    const host = window.location.hostname || "localhost";
    if (window.location.port === "5000") {
      return `${window.location.origin}/api`;
    }

    if (window.location.protocol.startsWith("http")) {
      return `${window.location.protocol}//${host}:5000/api`;
    }

    return "http://localhost:5000/api";
  }

  async function safeJson(response) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return {
        status: "ERROR",
        message: `API ${response.url} không trả JSON hợp lệ.`,
      };
    }
  }

  function formatNumber(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return "Chưa có";
    return n.toLocaleString("vi-VN");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
});
