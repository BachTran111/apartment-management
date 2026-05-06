const API_BASE_URL = "http://localhost:5000/api";
const INTERIOR_API_URL = `${API_BASE_URL}/interiors`;
const detailGrid = document.getElementById("detailGrid");
const editButton = document.getElementById("editButton");
const featureId = new URLSearchParams(window.location.search).get("id");

async function fetchJson(url) {
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `HTTP error! status: ${response.status}`);
  return payload;
}
function getMetadata(payload) { return payload?.metadata || payload?.data || {}; }
function renderDetail(item) {
  const room = item.phong_id || {};
  const apartmentName = room.can_ho_id?.ten || room.can_ho_id?.dia_chi || "Chưa rõ căn hộ";
  const fields = [
    ["Tên nội thất", item.ten_noi_that || "N/A"],
    ["Tình trạng", item.tinh_trang || "N/A"],
    ["Phòng", room.so_phong || "N/A"],
    ["Căn hộ", apartmentName],
  ];
  detailGrid.innerHTML = fields.map(([label, value]) => `
    <article class="detail-item">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>`).join("");
}
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const payload = await fetchJson(`${INTERIOR_API_URL}/${featureId}`);
    const item = getMetadata(payload);
    renderDetail(item);
    editButton.onclick = () => { window.location.href = `FeatureForm.html?id=${featureId}`; };
  } catch (error) {
    detailGrid.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
});
