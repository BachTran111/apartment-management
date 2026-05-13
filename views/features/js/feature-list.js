const API_BASE_URL = "http://localhost:5000/api";
const INTERIOR_API_URL = `${API_BASE_URL}/interiors`;
const PAGE_SIZE = 8;
let apartments = [];
let features = [];
let filteredFeatures = [];
let currentPage = 1;
const searchInput = document.getElementById("searchInput");
const apartmentFilter = document.getElementById("apartmentFilter");
const statusFilter = document.getElementById("statusFilter");
const featureTableBody = document.getElementById("featureTableBody");
const paginationInfo = document.getElementById("paginationInfo");
const paginationButtons = document.getElementById("paginationButtons");
const summaryGrid = document.getElementById("summaryGrid");

function getMetadata(payload) { return payload?.metadata || payload?.data || []; }
async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `HTTP error! status: ${response.status}`);
  return payload;
}
function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function getApartmentName(room) {
  const apartmentId = room?.can_ho_id?._id || room?.can_ho_id || "";
  const apartment = apartments.find((item) => item._id === apartmentId);
  return apartment?.ten || apartment?.dia_chi || "Chưa rõ căn hộ";
}
function getStatusClass(status) {
  if (status === "Mới") return "badge-new";
  if (status === "Đang Sử Dụng") return "badge-using";
  if (status === "Hư Hỏng") return "badge-broken";
  return "badge-replace";
}
function mapFeature(item) {
  return {
    id: item._id,
    name: item.ten_noi_that || "N/A",
    status: item.tinh_trang || "Mới",
    roomNumber: item.phong_id?.so_phong || "N/A",
    apartmentId: item.phong_id?.can_ho_id?._id || item.phong_id?.can_ho_id || "",
    apartmentName: getApartmentName(item.phong_id),
  };
}
async function loadData() {
  try {
    const [apartmentPayload, featurePayload] = await Promise.all([
      fetchJson(`${API_BASE_URL}/apartments`),
      fetchJson(`${INTERIOR_API_URL}?limit=100`),
    ]);
    const apartmentData = getMetadata(apartmentPayload);
    apartments = Array.isArray(apartmentData) ? apartmentData : [];
    const featureData = getMetadata(featurePayload);
    const featureList = Array.isArray(featureData) ? featureData : [];
    features = featureList.map(mapFeature);
    filteredFeatures = [...features];
    currentPage = 1;
    renderApartmentOptions();
    renderSummary();
    renderTable();
  } catch (error) {
    featureTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">Không thể tải dữ liệu nội thất.</td></tr>';
  }
}
function renderApartmentOptions() {
  apartmentFilter.innerHTML = '<option value="">Tất cả căn hộ</option>';
  apartments.forEach((apartment) => {
    const option = document.createElement("option");
    option.value = apartment._id;
    option.textContent = apartment.ten || apartment.dia_chi || "Căn hộ";
    apartmentFilter.appendChild(option);
  });
}
function renderSummary() {
  const cards = [
    { label: "Tổng nội thất", value: features.length },
    { label: "Đang sử dụng", value: features.filter((item) => item.status === "Đang Sử Dụng").length },
    { label: "Hư hỏng", value: features.filter((item) => item.status === "Hư Hỏng").length },
    { label: "Cần thay thế", value: features.filter((item) => item.status === "Cần Thay Thế").length },
  ];
  summaryGrid.innerHTML = cards.map((card) => `<article class="summary-card"><p>${card.label}</p><strong>${card.value}</strong></article>`).join("");
}
function renderTable() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredFeatures.slice(start, start + PAGE_SIZE);
  if (!pageItems.length) {
    featureTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">Không có nội thất phù hợp.</td></tr>';
    renderPagination();
    return;
  }
  featureTableBody.innerHTML = pageItems.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.roomNumber}</td>
      <td>${item.apartmentName}</td>
      <td><span class="badge ${getStatusClass(item.status)}">${item.status}</span></td>
      <td><div class="actions">
        <button class="btn" onclick="viewFeature('${item.id}')">Xem</button>
        <button class="btn" onclick="editFeature('${item.id}')">Sửa</button>
        <button class="btn btn-danger" onclick="deleteFeature('${item.id}')">Xóa</button>
      </div></td>
    </tr>`).join("");
  renderPagination();
}
function renderPagination() {
  const total = filteredFeatures.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const start = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);
  paginationInfo.textContent = `Hiển thị ${start} đến ${end} của ${total}`;
  paginationButtons.innerHTML = "";
  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");
    button.className = `page-btn ${page === currentPage ? "active" : ""}`;
    button.textContent = page;
    button.onclick = () => { currentPage = page; renderTable(); };
    paginationButtons.appendChild(button);
  }
}
function applyFilters() {
  const search = normalizeText(searchInput.value);
  const apartmentId = apartmentFilter.value;
  const status = statusFilter.value;
  filteredFeatures = features.filter((item) => {
    const matchesSearch = !search || normalizeText(`${item.name} ${item.roomNumber} ${item.apartmentName}`).includes(search);
    const matchesApartment = !apartmentId || item.apartmentId === apartmentId;
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesApartment && matchesStatus;
  });
  currentPage = 1;
  renderTable();
}
function resetFilters() {
  searchInput.value = "";
  apartmentFilter.value = "";
  statusFilter.value = "";
  applyFilters();
}
function viewFeature(id) { window.location.href = `FeatureDetail.html?id=${id}`; }
function editFeature(id) { window.location.href = `FeatureForm.html?id=${id}`; }
async function deleteFeature(id) {
  if (!window.confirm("Bạn có chắc muốn xóa nội thất này?")) return;
  try {
    await fetchJson(`${INTERIOR_API_URL}/${id}`, { method: "DELETE" });
    await loadData();
  } catch (error) {
    alert(error.message);
  }
}
searchInput.addEventListener("input", applyFilters);
apartmentFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);
window.resetFilters = resetFilters;
window.viewFeature = viewFeature;
window.editFeature = editFeature;
window.deleteFeature = deleteFeature;
document.addEventListener("DOMContentLoaded", loadData);
