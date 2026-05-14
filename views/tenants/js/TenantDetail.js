const API_BASE_URL = "http://localhost:5000/api";

let currentTenantId = null;
let currentTenantData = null;

async function getTenantById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.metadata || data.data || data;
  } catch (error) {
    console.error("Lỗi lấy chi tiết người thuê:", error);
    return null;
  }
}

function formatDate(dateString) {
  if (!dateString) return "---";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "---";
  return date.toLocaleDateString("vi-VN");
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === "") return "---";
  const amount =
    typeof value === "object" && value !== null && "$numberDecimal" in value
      ? Number(value.$numberDecimal)
      : Number(value);
  if (Number.isNaN(amount)) return "---";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

function getStatusPresentation(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "active") {
    return { text: "Hoạt động", className: "status-badge status-active" };
  }
  if (normalized === "expiring") {
    return { text: "Sắp hết hạn", className: "status-badge status-warning" };
  }
  if (normalized === "expired") {
    return { text: "Hết hạn", className: "status-badge status-inactive" };
  }
  return { text: "Không hoạt động", className: "status-badge status-inactive" };
}

async function loadTenantDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  currentTenantId = urlParams.get("id");

  if (!currentTenantId) {
    alert("Không tìm thấy ID người thuê");
    window.location.href = "TenantList.html";
    return;
  }

  try {
    const apiTenant = await getTenantById(currentTenantId);
    if (!apiTenant) throw new Error("Không tìm thấy dữ liệu");

    currentTenantData = apiTenant;
    const roomData = apiTenant.phong_id || {};
    const apartmentData = roomData.can_ho_id || {};

    document.getElementById("tenantName").textContent =
      apiTenant.ho_ten || "Chi tiết người thuê";
    document.getElementById("tenantStatusInfo").textContent =
      `CMND/CCCD: ${apiTenant.cmnd_cccd || "---"} | Phòng: ${roomData.so_phong || "---"}`;

    document.getElementById("detailFullName").textContent =
      apiTenant.ho_ten || "---";
    document.getElementById("detailIdCard").textContent =
      apiTenant.cmnd_cccd || "---";
    document.getElementById("detailAge").textContent = apiTenant.tuoi || "---";
    document.getElementById("detailHometown").textContent =
      apiTenant.que_quan || "---";
    document.getElementById("detailOccupation").textContent =
      apiTenant.nghe_nghiep || "---";
    document.getElementById("detailEmail").textContent = apiTenant.email || "---";
    document.getElementById("detailPhone").textContent =
      apiTenant.so_dien_thoai || "---";

    document.getElementById("detailApartment").textContent =
      apartmentData.ten || apartmentData.dia_chi || "---";
    document.getElementById("detailRoom").textContent = roomData.so_phong || "---";
    document.getElementById("detailRentPrice").textContent = formatCurrency(
      apiTenant.tien_phong,
    );
    document.getElementById("detailStartDate").textContent = formatDate(
      apiTenant.ngay_bat_dau,
    );
    document.getElementById("detailEndDate").textContent = formatDate(
      apiTenant.ngay_ket_thuc,
    );
    document.getElementById("detailEmergencyContact").textContent =
      apiTenant.lien_he_khan_cap || "---";

    const statusEl = document.getElementById("detailStatus");
    const statusPresentation = getStatusPresentation(
      apiTenant.contract_status || apiTenant.trang_thai,
    );
    statusEl.textContent = statusPresentation.text;
    statusEl.className = statusPresentation.className;
  } catch (error) {
    console.error("Lỗi:", error);
    alert(`Lỗi tải dữ liệu chi tiết: ${error.message}`);
  }
}

function editTenant() {
  if (!currentTenantData) return;

  document.getElementById("editName").value = currentTenantData.ho_ten || "";
  document.getElementById("editPhone").value =
    currentTenantData.so_dien_thoai || "";
  document.getElementById("editAge").value = currentTenantData.tuoi || "";
  document.getElementById("editHometown").value =
    currentTenantData.que_quan || "";
  document.getElementById("editEmail").value = currentTenantData.email || "";
  document.getElementById("editOccupation").value =
    currentTenantData.nghe_nghiep || "";
  document.getElementById("editEmergencyContact").value =
    currentTenantData.lien_he_khan_cap || "";

  document.getElementById("editTenantModal").classList.add("active");
}

function closeEditModal() {
  document.getElementById("editTenantModal").classList.remove("active");
}

async function submitEditForm(event) {
  event.preventDefault();

  const updatedData = {
    ho_ten: document.getElementById("editName").value.trim(),
    so_dien_thoai: document.getElementById("editPhone").value.trim(),
    tuoi: Number(document.getElementById("editAge").value) || undefined,
    que_quan: document.getElementById("editHometown").value.trim(),
    email: document.getElementById("editEmail").value.trim() || undefined,
    nghe_nghiep: document.getElementById("editOccupation").value.trim(),
    lien_he_khan_cap:
      document.getElementById("editEmergencyContact").value.trim() || undefined,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${currentTenantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error("Lỗi cập nhật");

    alert("Cập nhật thành công!");
    closeEditModal();
    window.location.reload();
  } catch (error) {
    alert(`Lỗi: ${error.message}`);
  }
}

async function deleteTenant() {
  if (
    !window.confirm(
      "Bạn có chắc chắn muốn xóa người thuê này? Hành động này không thể hoàn tác.",
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${currentTenantId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Lỗi xóa");

    alert("Xóa thành công!");
    window.location.href = "TenantList.html";
  } catch (error) {
    alert(`Lỗi: ${error.message}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadTenantDetails();
  document
    .getElementById("editTenantForm")
    .addEventListener("submit", submitEditForm);
});

window.editTenant = editTenant;
window.closeEditModal = closeEditModal;
window.deleteTenant = deleteTenant;
