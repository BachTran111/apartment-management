const LABELS = {
  all: "Tất cả",
  occupied: "Đang có người ở",
  available: "Phòng trống",
  maintenance: "Đang bảo trì",
  inactive: "Không sử dụng",
};

const DEFAULT_STATS = [
  { key: "occupied", markerClass: "filled", label: LABELS.occupied, value: 0 },
  {
    key: "available",
    markerClass: "outline",
    label: LABELS.available,
    value: 0,
  },
  {
    key: "maintenance",
    markerClass: "filled accent",
    label: LABELS.maintenance,
    value: 0,
  },
];

const bodyDataset = document.body.dataset;
const params = new URLSearchParams(window.location.search);
const roomSearch = document.getElementById("roomSearch");
const roomStatus = document.getElementById("roomStatus");
const statGrid = document.getElementById("statGrid");
const roomTableBody = document.getElementById("roomTableBody");
const roomListNotice = document.getElementById("roomListNotice");
const btnAddRoom = document.getElementById("btnAddRoom");

const apiBase = (bodyDataset.apiBase || params.get("apiBase") || "").trim();
const canHoId = (bodyDataset.canHoId || params.get("canHoId") || "").trim();
const resolvedApiBase = apiBase || resolveApiBase();
let allRooms = [];

boot();

function resolveApiBase() {
  const explicitBase = params.get("apiBase");
  if (explicitBase) {
    return explicitBase.replace(/\/$/, "");
  }

  const currentHost = window.location.hostname || "localhost";
  if (window.location.port === "5000") {
    return `${window.location.origin}/api/rooms`;
  }

  if (window.location.protocol.startsWith("http")) {
    return `${window.location.protocol}//${currentHost}:5000/api/rooms`;
  }

  return "http://localhost:5000/api/rooms";
}

async function boot() {
  renderStats(DEFAULT_STATS);
  renderTableMessage("Đang tải danh sách phòng...");

  if (!canHoId) {
    setNotice("Cần thêm canHoId trong URL, ví dụ: ?canHoId=<mongo-id>", true);
    renderTableMessage("Chưa có canHoId để tải dữ liệu.");
    return;
  }

  if (btnAddRoom) {
    btnAddRoom.addEventListener("click", () => {
      window.location.href = `RoomForm.html?canHoId=${canHoId}`;
    });
  }

  roomSearch.addEventListener("input", debounce(loadRooms, 300));
  roomStatus.addEventListener("change", loadRooms);

  const [, roomsLoaded] = await Promise.all([loadStats(), fetchAllRooms()]);
  if (roomsLoaded) {
    loadRooms();
  }
}

async function loadStats() {
  try {
    const response = await fetch(
      `${resolvedApiBase}/apartment/${canHoId}/count-all`,
    );
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload.message || "Không thể tải thống kê");
    }

    const counts = Array.isArray(payload.metadata) ? payload.metadata : [];
    const mapped = DEFAULT_STATS.map((item) => {
      const found = counts.find(
        (entry) => normalizeStatus(entry._id).key === item.key,
      );
      return { ...item, value: found?.count || 0 };
    });

    renderStats(mapped);
  } catch (error) {
    setNotice(error.message, true);
  }
}

async function fetchAllRooms() {
  try {
    setNotice(`Đang tải dữ liệu phòng cho căn hộ ${canHoId}...`);
    renderTableMessage("Đang tải danh sách phòng...");

    const response = await fetch(`${resolvedApiBase}/apartment/${canHoId}`);
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload.message || "Không thể tải danh sách phòng");
    }

    allRooms = Array.isArray(payload.metadata)
      ? payload.metadata
      : payload.metadata
        ? [payload.metadata]
        : [];
    return true;
  } catch (error) {
    renderTableMessage(error.message);
    setNotice(error.message, true);
    return false;
  }
}

function loadRooms() {
  const keyword = roomSearch.value.trim().toLowerCase();
  const selectedStatus = roomStatus.value;

  const filteredRooms = allRooms.filter((room) => {
    const roomNumber = String(room.so_phong || "").toLowerCase();
    const normalizedStatus = normalizeStatus(room.trang_thai).label;
    const matchKeyword = !keyword || roomNumber.includes(keyword);
    const matchStatus =
      selectedStatus === LABELS.all || normalizedStatus === selectedStatus;
    return matchKeyword && matchStatus;
  });

  renderRooms(filteredRooms);

  const label =
    selectedStatus === LABELS.all ? "tất cả trạng thái" : selectedStatus;
  setNotice(
    `Đã tải ${filteredRooms.length}/${allRooms.length} phòng (${label}${keyword ? `, từ khóa: ${keyword}` : ""}).`,
  );
}

function renderStats(stats) {
  statGrid.innerHTML = stats
    .map(
      (item) => `
        <article class="stat-card">
          <span class="marker ${item.markerClass}"></span>
          <strong>${item.value}</strong>
          <span>${item.label}</span>
        </article>
      `,
    )
    .join("");
}

function renderRooms(rooms) {
  if (!rooms.length) {
    renderTableMessage("Không tìm thấy phòng phù hợp.");
    return;
  }

  roomTableBody.innerHTML = rooms
    .map((room) => {
      const status = normalizeStatus(room.trang_thai);
      const detailUrl = buildDetailUrl(room._id);
      return `
        <tr>
          <td class="room-number">${escapeHtml(room.so_phong || "-")}</td>
          <td class="price">${formatCurrency(room.gia)}</td>
          <td><span class="badge ${status.key}">${status.label}</span></td>
          <td class="contract-text">${formatContract(room)}</td>
          <td>
            <div class="actions">
              <button class="table-action" type="button" data-room-id="${room._id || ""}" data-detail-url="${escapeAttribute(detailUrl)}">Chi tiết</button>
              <button class="table-action" type="button" data-room-id="${room._id || ""}">Sửa</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-room-id");
      window.location.href = `RoomForm.html?canHoId=${canHoId}&phongId=${id}`;
    });
  });
}

roomTableBody.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-detail-url]");
  if (!detailButton) {
    return;
  }

  window.location.href = detailButton.dataset.detailUrl;
});

function renderTableMessage(message) {
  roomTableBody.innerHTML = `<tr><td class="table-message" colspan="5">${escapeHtml(message)}</td></tr>`;
}

function formatCurrency(value) {
  const rawValue =
    typeof value === "object" && value !== null && "$numberDecimal" in value
      ? value.$numberDecimal
      : value;

  const amount = Number(rawValue);
  if (Number.isNaN(amount)) {
    return "Chưa rõ";
  }

  return `${amount.toLocaleString("vi-VN")} đ`;
}

function formatContract(room) {
  if (Array.isArray(room.hop_dong_ids) && room.hop_dong_ids.length) {
    return `${room.hop_dong_ids.length} hợp đồng`;
  }

  return "Không có";
}

function normalizeStatus(rawStatus) {
  const source = String(rawStatus || "").toLowerCase();
  const compact = source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (
    compact.includes("bao tri") ||
    source.includes("bảo trì") ||
    source.includes("maintenance")
  ) {
    return { key: "maintenance", label: LABELS.maintenance };
  }

  if (
    compact.includes("co nguoi") ||
    compact.includes("nguoi o") ||
    source.includes("người ở") ||
    source.includes("rented")
  ) {
    return { key: "occupied", label: LABELS.occupied };
  }

  if (compact.includes("khong su dung") || source.includes("không sử dụng")) {
    return { key: "available", label: LABELS.inactive };
  }

  return { key: "available", label: LABELS.available };
}

function setNotice(message, isError = false) {
  roomListNotice.textContent = message;
  roomListNotice.classList.toggle("error", isError);
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

function escapeAttribute(value) {
  return escapeHtml(value);
}

function buildDetailUrl(phongId) {
  const detailUrl = new URL("./RoomDetail.html", window.location.href);
  if (phongId) {
    detailUrl.searchParams.set("phongId", phongId);
  }
  if (canHoId) {
    detailUrl.searchParams.set("canHoId", canHoId);
  }
  if (apiBase) {
    detailUrl.searchParams.set("apiBase", apiBase);
  }
  return detailUrl.toString();
}

async function parseJsonResponse(response) {
  const rawText = await response.text();

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new Error(
      `API ${response.url} không trả JSON hợp lệ. Hãy kiểm tra lại apiBase hoặc cổng backend.`,
    );
  }
}
