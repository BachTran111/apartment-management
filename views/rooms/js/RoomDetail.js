const DETAIL_LABELS = {
  empty: "Chưa có",
  loading: "Đang tải...",
  contractActive: "Hiệu lực",
  contractExpired: "Hết hạn",
  unknown: "Chưa rõ"
};

const bodyDataset = document.body.dataset;
const params = new URLSearchParams(window.location.search);

const roomTitle = document.getElementById("roomTitle");
const detailNotice = document.getElementById("detailNotice");
const summaryGrid = document.getElementById("summaryGrid");
const tenantInfo = document.getElementById("tenantInfo");
const historyBody = document.getElementById("historyBody");
const inventoryList = document.getElementById("inventoryList");
const galleryGrid = document.getElementById("galleryGrid");
const backToListButton = document.getElementById("backToListButton");
const tenantDetailButton = document.getElementById("tenantDetailButton");

const apiBase = (bodyDataset.apiBase || params.get("apiBase") || "").trim();
let currentCanHoId = (bodyDataset.canHoId || params.get("canHoId") || "").trim();
const phongId = (params.get("phongId") || "").trim();
const resolvedApiBase = apiBase || resolveApiBase();
const resolvedNoiThatApiBase = resolveNoiThatApiBase();

bindEvents();
boot();

function bindEvents() {
  backToListButton.addEventListener("click", () => {
    const listUrl = buildListUrl();

    if (document.referrer.includes("RoomList.html")) {
      window.history.back();
      return;
    }

    window.location.href = listUrl;
  });

  tenantDetailButton.addEventListener("click", () => {
    setNotice("Thông tin chi tiết người thuê hiện chưa được kết nối.", false);
  });
}

async function boot() {
  renderLoadingState();

  if (!phongId) {
    setNotice("Cần thêm phongId trong URL để tải chi tiết phòng.", true);
    renderEmptyState();
    return;
  }

  try {
    const response = await fetch(`${resolvedApiBase}/${encodeURIComponent(phongId)}`);
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload.message || "Không thể tải chi tiết phòng");
    }

    await renderDetail(payload.metadata || {});
    setNotice(`Đã tải chi tiết phòng ${phongId}.`);
  } catch (error) {
    setNotice(error.message, true);
    renderEmptyState();
  }
}

function renderLoadingState() {
  roomTitle.textContent = "Đang tải chi tiết phòng...";
  summaryGrid.innerHTML = buildInfoCards([
    { label: "Giá thuê", value: DETAIL_LABELS.loading },
    { label: "Diện tích", value: DETAIL_LABELS.loading },
    { label: "Kết thúc hợp đồng", value: DETAIL_LABELS.loading },
    { label: "Tình trạng", value: DETAIL_LABELS.loading }
  ]);
  tenantInfo.innerHTML = buildTenantFields([
    { label: "Họ và tên", value: DETAIL_LABELS.loading },
    { label: "Loại hợp đồng", value: DETAIL_LABELS.loading },
    { label: "Thời hạn hợp đồng", value: DETAIL_LABELS.loading },
    { label: "Số điện thoại", value: DETAIL_LABELS.loading }
  ]);
  historyBody.innerHTML = `<tr><td class="empty-state" colspan="4">Đang tải lịch sử hợp đồng...</td></tr>`;
  inventoryList.innerHTML = `<div class="empty-state">Đang tải nội thất...</div>`;
  galleryGrid.innerHTML = `<div class="gallery-empty">Đang tải hình ảnh...</div>`;
}

function renderEmptyState() {
  roomTitle.textContent = "Chi tiết phòng";
  summaryGrid.innerHTML = buildInfoCards([
    { label: "Giá thuê", value: DETAIL_LABELS.empty },
    { label: "Diện tích", value: DETAIL_LABELS.empty },
    { label: "Kết thúc hợp đồng", value: DETAIL_LABELS.empty },
    { label: "Tình trạng", value: DETAIL_LABELS.empty }
  ]);
  tenantInfo.innerHTML = buildTenantFields([
    { label: "Họ và tên", value: DETAIL_LABELS.empty },
    { label: "Loại hợp đồng", value: DETAIL_LABELS.empty },
    { label: "Thời hạn hợp đồng", value: DETAIL_LABELS.empty },
    { label: "Số điện thoại", value: DETAIL_LABELS.empty }
  ]);
  historyBody.innerHTML = `<tr><td class="empty-state" colspan="4">Chưa có lịch sử hợp đồng.</td></tr>`;
  inventoryList.innerHTML = `<div class="empty-state">Chưa có nội thất.</div>`;
  galleryGrid.innerHTML = `<div class="gallery-empty">Chưa có hình ảnh phòng.</div>`;
}

async function renderDetail(metadata) {
  const phong = metadata.phong || {};
  const noiThat = await resolveFurniture(metadata);
  const nguoiThue = metadata.nguoiThue;
  const hopDong = Array.isArray(metadata.hopDong) ? metadata.hopDong : [];
  currentCanHoId = currentCanHoId || String(phong.can_ho_id || "").trim();

  roomTitle.textContent = phong.so_phong ? `Phòng ${phong.so_phong}` : "Chi tiết phòng";

  summaryGrid.innerHTML = buildInfoCards([
    { label: "Giá thuê", value: formatCurrency(phong.gia) },
    { label: "Diện tích", value: formatArea(phong.dien_tich) },
    { label: "Kết thúc hợp đồng", value: getContractEndDate(hopDong) },
    { label: "Tình trạng", value: normalizeStatus(phong.trang_thai).label }
  ]);

  tenantInfo.innerHTML = buildTenantFields([
    { label: "Họ và tên", value: nguoiThue?.ho_ten || DETAIL_LABELS.empty },
    { label: "Loại hợp đồng", value: getContractType(hopDong) },
    { label: "Thời hạn hợp đồng", value: getContractDuration(hopDong) },
    { label: "Số điện thoại", value: nguoiThue?.so_dien_thoai || DETAIL_LABELS.empty }
  ]);

  historyBody.innerHTML = hopDong.length
    ? hopDong
        .map((item) => {
          const contractStatus = mapContractStatus(item.trang_thai);
          return `
            <tr>
              <td>${escapeHtml(item.nguoi_thue?.ho_ten || nguoiThue?.ho_ten || DETAIL_LABELS.empty)}</td>
              <td>${escapeHtml(formatContractRange(item))}</td>
              <td>${escapeHtml(item.loai_hop_dong || DETAIL_LABELS.empty)}</td>
              <td><span class="status-pill ${contractStatus.kind}">${contractStatus.label}</span></td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td class="empty-state" colspan="4">Chưa có lịch sử hợp đồng.</td></tr>`;

  inventoryList.innerHTML = noiThat.length
    ? noiThat
        .map(
          (item) => `
            <div class="inventory-item">
              <div class="inventory-icon ${getInventoryIconClass(item.ten)}"></div>
              <div class="inventory-text">
                <strong>${escapeHtml(item.ten || "Nội thất")}</strong>
                <span>${escapeHtml(buildInventoryDetail(item))}</span>
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">Chưa có nội thất.</div>`;

  renderGallery(phong);
}

function buildInfoCards(items) {
  return items
    .map(
      (item) => `
        <article class="summary-card">
          <div class="title-wrap small-gap">
            <div>
              <p>${escapeHtml(item.label)}</p>
              <strong>${escapeHtml(item.value)}</strong>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function buildTenantFields(items) {
  return items
    .map(
      (item) => `
        <div class="tenant-field">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </div>
      `,
    )
    .join("");
}

function buildListUrl() {
  const listUrl = new URL("./RoomList.html", window.location.href);
  if (currentCanHoId) {
    listUrl.searchParams.set("canHoId", currentCanHoId);
  }
  if (apiBase) {
    listUrl.searchParams.set("apiBase", apiBase);
  }
  return listUrl.toString();
}

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

function resolveNoiThatApiBase() {
  return resolvedApiBase.replace(/\/api\/phongs$/, "/api/noithat");
}

async function resolveFurniture(metadata) {
  if (Array.isArray(metadata.noiThat) && metadata.noiThat.length) {
    return metadata.noiThat;
  }

  const furnitureIds = Array.isArray(metadata.phong?.noi_that_ids)
    ? metadata.phong.noi_that_ids.filter(Boolean)
    : [];

  if (!furnitureIds.length) {
    return [];
  }

  const items = await Promise.all(
    furnitureIds.map(async (id) => {
      try {
        const response = await fetch(`${resolvedNoiThatApiBase}/${encodeURIComponent(id)}`);
        const payload = await parseJsonResponse(response);
        if (!response.ok) {
          return null;
        }
        return payload.metadata || null;
      } catch (error) {
        return null;
      }
    }),
  );

  return items.filter(Boolean);
}

function buildImageUrl(imagePath) {
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const origin = resolvedApiBase.replace(/\/api\/phongs$/, "");
  return `${origin}/${String(imagePath).replace(/^\/+/, "")}`;
}

function renderGallery(phong) {
  if (!phong.anh_phong) {
    galleryGrid.innerHTML = `<div class="gallery-empty">Chưa có hình ảnh phòng.</div>`;
    return;
  }

  galleryGrid.innerHTML = `<img id="roomGalleryImage" src="${escapeAttribute(buildImageUrl(phong.anh_phong))}" alt="Ảnh phòng ${escapeAttribute(phong.so_phong || "")}" />`;
  const image = document.getElementById("roomGalleryImage");
  image.addEventListener("error", () => {
    galleryGrid.innerHTML = `<div class="gallery-empty">Chưa có hình ảnh phòng.</div>`;
  });
}

function getInventoryIconClass(name) {
  const value = String(name || "").toLowerCase();
  if (value.includes("điều hòa") || value.includes("dieu hoa") || value.includes("máy lạnh") || value.includes("may lanh")) {
    return "snow";
  }
  if (value.includes("đèn") || value.includes("den")) {
    return "light";
  }
  if (value.includes("tủ") || value.includes("tu")) {
    return "wardrobe";
  }
  return "kitchen";
}

function buildInventoryDetail(item) {
  const details = [];
  if (item.tinh_trang) details.push(item.tinh_trang);
  if (item.so_luong) details.push(`Số lượng: ${item.so_luong}`);
  return details.join(" - ") || "Chưa có thông tin";
}

function getContractEndDate(contracts) {
  if (!contracts.length) return DETAIL_LABELS.empty;
  return formatDate(contracts[0].ngay_ket_thuc);
}

function getContractType(contracts) {
  if (!contracts.length) return DETAIL_LABELS.empty;
  return contracts[0].loai_hop_dong || DETAIL_LABELS.empty;
}

function getContractDuration(contracts) {
  if (!contracts.length) return DETAIL_LABELS.empty;
  return formatContractRange(contracts[0]);
}

function formatContractRange(contract) {
  const start = formatDate(contract.ngay_bat_dau);
  const end = formatDate(contract.ngay_ket_thuc);
  if (start === DETAIL_LABELS.empty && end === DETAIL_LABELS.empty) return DETAIL_LABELS.empty;
  return `${start} - ${end}`;
}

function mapContractStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("hết") || value.includes("het") || value.includes("expired")) {
    return { kind: "expired", label: DETAIL_LABELS.contractExpired };
  }
  return { kind: "active", label: status || DETAIL_LABELS.contractActive };
}

function formatArea(value) {
  if (value === undefined || value === null || value === "") return DETAIL_LABELS.empty;
  return `${value} m²`;
}

function formatDate(value) {
  if (!value) return DETAIL_LABELS.empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return DETAIL_LABELS.empty;
  return date.toLocaleDateString("vi-VN");
}

function formatCurrency(value) {
  const rawValue =
    typeof value === "object" && value !== null && "$numberDecimal" in value
      ? value.$numberDecimal
      : value;
  const amount = Number(rawValue);
  if (Number.isNaN(amount)) return DETAIL_LABELS.empty;
  return `${amount.toLocaleString("vi-VN")} đ`;
}

function normalizeStatus(rawStatus) {
  const source = String(rawStatus || "").toLowerCase();
  const compact = source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (compact.includes("bao tri") || source.includes("bảo trì") || source.includes("maintenance")) {
    return { key: "maintenance", label: "Đang bảo trì" };
  }
  if (
    compact.includes("co nguoi")
    || compact.includes("nguoi o")
    || source.includes("người ở")
    || source.includes("rented")
  ) {
    return { key: "occupied", label: "Đang có người ở" };
  }
  if (compact.includes("khong su dung") || source.includes("không sử dụng")) {
    return { key: "available", label: "Không sử dụng" };
  }
  return { key: "available", label: "Phòng trống" };
}

function setNotice(message, isError = false) {
  detailNotice.textContent = message;
  detailNotice.classList.toggle("error", isError);
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
