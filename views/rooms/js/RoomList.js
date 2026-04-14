const DEFAULT_STATS = [
  { key: "occupied", markerClass: "filled", label: "Dang co nguoi o", value: 0 },
  { key: "available", markerClass: "outline", label: "Phong trong", value: 0 },
  { key: "maintenance", markerClass: "filled accent", label: "Dang bao tri", value: 0 }
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
    return `${window.location.origin}/api/phongs`;
  }

  if (window.location.protocol.startsWith("http")) {
    return `${window.location.protocol}//${currentHost}:5000/api/phongs`;
  }

  return "http://localhost:5000/api/phongs";
}

async function boot() {
  renderStats(DEFAULT_STATS);
  renderTableMessage("Dang tai danh sach phong...");

  if (!canHoId) {
    setNotice("Can them canHoId trong URL, vi du: ?canHoId=<mongo-id>", true);
    renderTableMessage("Chua co canHoId de tai du lieu.");
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
    const response = await fetch(`${resolvedApiBase}/canho/${canHoId}/count-all`);
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload.message || "Khong the tai thong ke");
    }

    const counts = Array.isArray(payload.metadata) ? payload.metadata : [];
    const mapped = DEFAULT_STATS.map((item) => {
      const found = counts.find((entry) => normalizeStatus(entry._id).key === item.key);
      return { ...item, value: found?.count || 0 };
    });

    renderStats(mapped);
  } catch (error) {
    setNotice(error.message, true);
  }
}

async function fetchAllRooms() {
  try {
    setNotice(`Dang tai du lieu phong cho can ho ${canHoId}...`);
    renderTableMessage("Dang tai danh sach phong...");

    const response = await fetch(`${resolvedApiBase}/canho/${canHoId}`);
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload.message || "Khong the tai danh sach phong");
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
      selectedStatus === "Tat ca" || normalizedStatus === selectedStatus;

    return matchKeyword && matchStatus;
  });

  renderRooms(filteredRooms);

  const label = selectedStatus === "Tat ca" ? "tat ca trang thai" : selectedStatus;
  setNotice(`Da tai ${filteredRooms.length}/${allRooms.length} phong (${label}${keyword ? `, tu khoa: ${keyword}` : ""}).`);
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
      `
    )
    .join("");
}

function renderRooms(rooms) {
  if (!rooms.length) {
    renderTableMessage("Khong tim thay phong phu hop.");
    return;
  }

  roomTableBody.innerHTML = rooms
    .map((room) => {
      const status = normalizeStatus(room.trang_thai);
      return `
        <tr>
          <td class="room-number">${escapeHtml(room.so_phong || "-")}</td>
          <td class="price">${formatCurrency(room.gia)}</td>
          <td><span class="badge ${status.key}">${status.label}</span></td>
          <td class="contract-text">${formatContract(room)}</td>
          <td>
            <div class="actions">
              <button class="table-action" type="button" data-room-id="${room._id || ""}">Chi tiet</button>
              <button class="table-action btn-edit" type="button" data-room-id="${room._id || ""}">Sua</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-room-id');
      window.location.href = `RoomForm.html?canHoId=${canHoId}&phongId=${id}`;
    });
  });
}

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
    return "Khong ro";
  }

  return `${amount.toLocaleString("vi-VN")} d`;
}

function formatContract(room) {
  if (Array.isArray(room.hop_dong_ids) && room.hop_dong_ids.length) {
    return `${room.hop_dong_ids.length} hop dong`;
  }

  return "Khong co";
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
    source.includes("báº£o") ||
    source.includes("bao tri")
  ) {
    return { key: "maintenance", label: "Dang bao tri" };
  }

  if (
    compact.includes("co nguoi") ||
    compact.includes("nguoi o") ||
    source.includes("ngÆ°")
  ) {
    return { key: "occupied", label: "Dang co nguoi o" };
  }

  if (
    compact.includes("khong su dung") ||
    source.includes("sá»­ dá»¥ng")
  ) {
    return { key: "available", label: "Khong su dung" };
  }

  return { key: "available", label: "Phong trong" };
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

async function parseJsonResponse(response) {
  const rawText = await response.text();

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new Error(
      `API ${response.url} khong tra JSON hop le. Hay kiem tra lai apiBase hoac cong backend.`,
    );
  }
}