const API_BASE_URL = "http://localhost:5000/api";

let tenants = [];
let filteredTenants = [];
let isEditMode = false;
let editingId = null;

function extractPayloadData(payload) {
  const source = payload?.metadata || payload?.data;
  if (!source) return [];
  if (Array.isArray(source)) return source;

  for (const key of ["tenants", "apartments", "rooms", "contracts", "items"]) {
    if (Array.isArray(source[key])) return source[key];
  }

  return source;
}

function normalizeTenantStatus(rawStatus) {
  const value = String(rawStatus || "").toLowerCase();
  if (value === "active") return "Active";
  if (value === "expired") return "Expired";
  if (value === "expiring") return "Expiring soon";
  return "Inactive";
}

function formatCurrency(value) {
  const amount =
    typeof value === "object" && value !== null && "$numberDecimal" in value
      ? Number(value.$numberDecimal)
      : Number(value);
  if (Number.isNaN(amount)) return "0";
  return amount.toLocaleString("vi-VN");
}

function mapTenantData(apiTenant) {
  const roomData = apiTenant.phong_id || {};
  const apartmentData = roomData.can_ho_id || {};

  return {
    id: apiTenant._id,
    name: apiTenant.ho_ten || "N/A",
    idCard: apiTenant.cmnd_cccd || "N/A",
    room: roomData.so_phong || "N/A",
    building: apartmentData.ten || apartmentData.dia_chi || "N/A",
    status: normalizeTenantStatus(apiTenant.contract_status || apiTenant.trang_thai),
    phone: apiTenant.so_dien_thoai || "N/A",
    hometown: apiTenant.que_quan || "N/A",
    email: apiTenant.email || "",
    startDate: apiTenant.ngay_bat_dau
      ? new Date(apiTenant.ngay_bat_dau).toLocaleDateString("vi-VN")
      : "N/A",
    endDate: apiTenant.ngay_ket_thuc
      ? new Date(apiTenant.ngay_ket_thuc).toLocaleDateString("vi-VN")
      : "N/A",
    roomPrice: formatCurrency(apiTenant.tien_phong),
    emergencyContact: apiTenant.lien_he_khan_cap || "N/A",
    age: apiTenant.tuoi || "",
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `HTTP error! status: ${response.status}`);
  }
  return payload;
}

async function loadTenants() {
  try {
    const payload = await fetchJson(`${API_BASE_URL}/tenants`);
    const data = extractPayloadData(payload);
    const tenantList = Array.isArray(data)
      ? data
      : Array.isArray(data.tenants)
        ? data.tenants
        : [];

    tenants = tenantList.map(mapTenantData);
    filteredTenants = [...tenants];
    renderTable();
    updateStats();
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }
}

function renderTable() {
  const tableBody = document.getElementById("tenantTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (!filteredTenants.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8">
          <p class="text-gray-500">Không có dữ liệu</p>
        </td>
      </tr>
    `;
    return;
  }

  filteredTenants.forEach((tenant) => {
    let statusColor = "badge-success";
    let statusText = "Hoạt động";

    if (tenant.status === "Expired") {
      statusColor = "badge-danger";
      statusText = "Hết hạn";
    } else if (tenant.status === "Expiring soon") {
      statusColor = "badge-warning";
      statusText = "Sắp hết hạn";
    } else if (tenant.status === "Inactive") {
      statusColor = "badge-danger";
      statusText = "Không hoạt động";
    }

    const row = document.createElement("tr");
    row.className = "border-b hover:bg-gray-50";
    row.innerHTML = `
      <td class="px-6 py-4"><strong>${tenant.name}</strong></td>
      <td class="px-6 py-4 font-mono text-sm">${tenant.idCard}</td>
      <td class="px-6 py-4">${tenant.room}</td>
      <td class="px-6 py-4">${tenant.phone}</td>
      <td class="px-6 py-4 text-sm">${tenant.startDate}</td>
      <td class="px-6 py-4 text-sm">${tenant.endDate}</td>
      <td class="px-6 py-4">
        <span class="badge ${statusColor}">${statusText}</span>
      </td>
      <td class="px-6 py-4 text-right">
        <button onclick="viewDetails('${tenant.id}')" class="btn-action" title="Xem chi tiết">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button onclick="editFormTenant('${tenant.id}')" class="btn-action" title="Chỉnh sửa">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button onclick="deleteTenant('${tenant.id}')" class="btn-action btn-danger" title="Xóa">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function updateStats() {
  document.getElementById("totalCount").textContent = filteredTenants.length;
  document.getElementById("activeCount").textContent = filteredTenants.filter(
    (tenant) => tenant.status === "Active",
  ).length;
  document.getElementById("warningCount").textContent = filteredTenants.filter(
    (tenant) => tenant.status === "Expiring soon" || tenant.status === "Expired",
  ).length;
}

function openModal() {
  isEditMode = false;
  editingId = null;
  document.getElementById("modalTitle").textContent = "Thêm người thuê mới";
  document.getElementById("tenantForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("tenantModal").classList.add("active");
}

function closeModal() {
  document.getElementById("tenantModal").classList.remove("active");
  document.getElementById("tenantForm").reset();
}

function editFormTenant(id) {
  const tenant = tenants.find((item) => item.id === id);
  if (!tenant) return;

  isEditMode = true;
  editingId = id;
  document.getElementById("modalTitle").textContent =
    "Chỉnh sửa thông tin người thuê";
  document.getElementById("editId").value = id;
  document.getElementById("formName").value = tenant.name === "N/A" ? "" : tenant.name;
  document.getElementById("formPhone").value =
    tenant.phone === "N/A" ? "" : tenant.phone;
  document.getElementById("formIdCard").value =
    tenant.idCard === "N/A" ? "" : tenant.idCard;
  document.getElementById("formAge").value = tenant.age || "";
  document.getElementById("formHometown").value =
    tenant.hometown === "N/A" ? "" : tenant.hometown;
  document.getElementById("formEmail").value = tenant.email || "";
  document.getElementById("formEmergencyContact").value =
    tenant.emergencyContact === "N/A" ? "" : tenant.emergencyContact;

  document.getElementById("tenantModal").classList.add("active");
}

async function submitTenantForm(event) {
  event.preventDefault();

  const payload = {
    ho_ten: document.getElementById("formName").value.trim(),
    so_dien_thoai: document.getElementById("formPhone").value.trim(),
    cmnd_cccd: document.getElementById("formIdCard").value.trim(),
    tuoi: Number(document.getElementById("formAge").value) || undefined,
    que_quan: document.getElementById("formHometown").value.trim(),
    email: document.getElementById("formEmail").value.trim() || undefined,
    lien_he_khan_cap:
      document.getElementById("formEmergencyContact").value.trim() || undefined,
  };

  try {
    let url = `${API_BASE_URL}/tenants`;
    let method = "POST";

    if (isEditMode && editingId) {
      url += `/${editingId}`;
      method = "PUT";
    }

    await fetchJson(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert(isEditMode ? "Cập nhật thành công!" : "Thêm mới thành công!");
    closeModal();
    await loadTenants();
  } catch (error) {
    alert(`Lỗi: ${error.message}`);
  }
}

function viewDetails(id) {
  window.location.href = `TenantDetail.html?id=${id}`;
}

async function deleteTenant(id) {
  if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;

  try {
    await fetchJson(`${API_BASE_URL}/tenants/${id}`, { method: "DELETE" });
    await loadTenants();
  } catch (error) {
    alert(`Lỗi: ${error.message}`);
  }
}

function handleSearch() {
  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchValue) ||
      tenant.idCard.toLowerCase().includes(searchValue) ||
      tenant.room.toLowerCase().includes(searchValue),
  );
  renderTable();
  updateStats();
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadTenants();
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
  document
    .getElementById("tenantForm")
    .addEventListener("submit", submitTenantForm);
});

window.openModal = openModal;
window.closeModal = closeModal;
window.viewDetails = viewDetails;
window.editFormTenant = editFormTenant;
window.deleteTenant = deleteTenant;
