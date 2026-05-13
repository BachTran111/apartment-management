const API_BASE_URL = "http://localhost:5000/api";
const INTERIOR_API_URL = `${API_BASE_URL}/interiors`;
const form = document.getElementById("featureForm");
const formTitle = document.getElementById("formTitle");
const apartmentSelect = document.getElementById("apartmentSelect");
const roomSelect = document.getElementById("roomSelect");
const featureName = document.getElementById("featureName");
const featureStatus = document.getElementById("featureStatus");
const formMessage = document.getElementById("formMessage");
const featureId = new URLSearchParams(window.location.search).get("id");

function getMetadata(payload) { return payload?.metadata || payload?.data || []; }
async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `HTTP error! status: ${response.status}`);
  return payload;
}
function setError(id, message) { document.getElementById(id).textContent = message; }
function clearErrors() { ["apartmentError", "roomError", "nameError", "statusError"].forEach((id) => setError(id, "")); }
async function loadApartments() {
  const payload = await fetchJson(`${API_BASE_URL}/apartments`);
  const data = getMetadata(payload);
  const apartments = Array.isArray(data) ? data : [];
  apartmentSelect.innerHTML = '<option value="">Chọn căn hộ</option>';
  apartments.forEach((apartment) => {
    const option = document.createElement("option");
    option.value = apartment._id;
    option.textContent = apartment.ten || apartment.dia_chi || "Căn hộ";
    apartmentSelect.appendChild(option);
  });
}
async function loadRooms(apartmentId, selectedRoomId = "") {
  if (!apartmentId) {
    roomSelect.innerHTML = '<option value="">Chọn phòng</option>';
    return;
  }
  const payload = await fetchJson(`${API_BASE_URL}/rooms/apartment/${apartmentId}`);
  const data = getMetadata(payload);
  const rooms = Array.isArray(data) ? data : [];
  roomSelect.innerHTML = '<option value="">Chọn phòng</option>';
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room._id;
    option.textContent = `Phòng ${room.so_phong}`;
    roomSelect.appendChild(option);
  });
  if (selectedRoomId) roomSelect.value = selectedRoomId;
}
async function loadFeatureForEdit() {
  if (!featureId) return;
  formTitle.textContent = "Cập nhật nội thất";
  const payload = await fetchJson(`${INTERIOR_API_URL}/${featureId}`);
  const item = getMetadata(payload);
  const apartmentId = item.phong_id?.can_ho_id?._id || item.phong_id?.can_ho_id || "";
  apartmentSelect.value = apartmentId;
  await loadRooms(apartmentId, item.phong_id?._id || "");
  featureName.value = item.ten_noi_that || "";
  featureStatus.value = item.tinh_trang || "Mới";
}
function validateForm() {
  clearErrors();
  let isValid = true;
  if (!apartmentSelect.value) { setError("apartmentError", "Vui lòng chọn căn hộ."); isValid = false; }
  if (!roomSelect.value) { setError("roomError", "Vui lòng chọn phòng."); isValid = false; }
  if (!featureName.value.trim()) { setError("nameError", "Vui lòng nhập tên nội thất."); isValid = false; }
  if (!featureStatus.value) { setError("statusError", "Vui lòng chọn tình trạng."); isValid = false; }
  return isValid;
}
async function handleSubmit(event) {
  event.preventDefault();
  formMessage.textContent = "";
  if (!validateForm()) return;
  const payload = {
    phong_id: roomSelect.value,
    ten_noi_that: featureName.value.trim(),
    tinh_trang: featureStatus.value,
  };
  try {
    await fetchJson(featureId ? `${INTERIOR_API_URL}/${featureId}` : INTERIOR_API_URL, {
      method: featureId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    window.location.href = "FeatureList.html";
  } catch (error) {
    formMessage.textContent = error.message;
  }
}
apartmentSelect.addEventListener("change", async () => { await loadRooms(apartmentSelect.value); });
form.addEventListener("submit", handleSubmit);
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadApartments();
    await loadFeatureForEdit();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});
