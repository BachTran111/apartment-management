const API_BASE_URL = "http://localhost:5000/api";

let tenants = [];
let apartments = [];
let filteredTenants = [];
let rooms = [];
let currentPage = 1;
const itemsPerPage = 5;

const tableBody = document.getElementById("tenantTableBody");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const totalTenantsEl = document.getElementById("totalTenantsCount");
const activeTenantsEl = document.getElementById("activeTenantsCount");
const expiringTenantsEl = document.getElementById("expiringTenantsCount");
const modalOverlay = document.getElementById("modalOverlay");
const modalContainer = document.getElementById("modalContainer");
const tenantForm = document.getElementById("tenantForm");
const formError = document.getElementById("formError");
const apartmentSelect = document.getElementById("formApartment");
const roomSelect = document.getElementById("formRoom");

function extractPayloadData(payload) {
  const source = payload?.metadata || payload?.data;
  if (!source) return [];
  if (Array.isArray(source)) return source;

  const possibleKeys = ["tenants", "apartments", "rooms", "contracts", "items"];
  for (const key of possibleKeys) {
    if (Array.isArray(source[key])) {
      return source[key];
    }
  }

  return source;
}

function formatCurrency(value) {
  const amount =
    typeof value === "object" && value !== null && "$numberDecimal" in value
      ? Number(value.$numberDecimal)
      : Number(value);

  if (Number.isNaN(amount)) return "0";
  return amount.toLocaleString("vi-VN");
}

function normalizeTenantStatus(rawStatus) {
  const value = String(rawStatus || "").toLowerCase();
  if (value === "active") return "Active";
  if (value === "expired") return "Expired";
  if (value === "expiring") return "Expiring soon";
  return "Inactive";
}

function getApartmentIdFromRoom(room) {
  return room?.can_ho_id?._id || room?.can_ho_id || "";
}

function mapTenantData(apiTenant) {
  const roomData = apiTenant.phong_id || {};
  return {
    id: apiTenant._id,
    name: apiTenant.ho_ten || "N/A",
    idCard: apiTenant.cmnd_cccd || "N/A",
    building:
      roomData.can_ho_id?.ten ||
      roomData.can_ho_id?.dia_chi ||
      roomData.building ||
      "N/A",
    room: roomData.so_phong || "N/A",
    apartmentId: getApartmentIdFromRoom(roomData),
    roomId: roomData._id || "",
    status: normalizeTenantStatus(apiTenant.trang_thai),
    phone: apiTenant.so_dien_thoai || "N/A",
    hometown: apiTenant.que_quan || "N/A",
    startDate: apiTenant.ngay_bat_dau
      ? new Date(apiTenant.ngay_bat_dau).toLocaleDateString("vi-VN")
      : "N/A",
    endDate: apiTenant.ngay_ket_thuc
      ? new Date(apiTenant.ngay_ket_thuc).toLocaleDateString("vi-VN")
      : "N/A",
    roomPrice: formatCurrency(apiTenant.tien_phong),
    emergencyContact: apiTenant.lien_he_khan_cap || "N/A",
    age: apiTenant.tuoi || "N/A",
  };
}

function convertVNDateToISO(vnDate) {
  if (!vnDate || vnDate === "N/A") return "";
  const parts = vnDate.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message || `HTTP error! status: ${response.status}`,
    );
  }

  return payload;
}

async function loadApartments() {
  try {
    const payload = await fetchJson(`${API_BASE_URL}/apartments`);
    const data = extractPayloadData(payload);
    apartments = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Lỗi load apartments:", error);
    apartments = [];
  }
}

async function loadRoomsByApartment(apartmentId = "") {
  if (!apartmentId) {
    rooms = [];
    renderRoomOptions();
    return [];
  }

  try {
    const payload = await fetchJson(
      `${API_BASE_URL}/rooms/apartment/${apartmentId}`,
    );
    const data = extractPayloadData(payload);
    rooms = Array.isArray(data) ? data : [];
    renderRoomOptions(apartmentId);
    return rooms;
  } catch (error) {
    console.error("Lỗi tải danh sách phòng:", error);
    rooms = [];
    renderRoomOptions();
    return [];
  }
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
    currentPage = 1;
    renderTable();
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }
}

function renderTable() {
  if (!tableBody) return;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredTenants.slice(startIndex, endIndex);

  tableBody.innerHTML = "";

  if (!paginatedItems.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-on-surface-variant">
          <p class="text-sm">Không có dữ liệu</p>
        </td>
      </tr>
    `;
    updatePagination();
    updateStats();
    return;
  }

  paginatedItems.forEach((tenant, index) => {
    const row = document.createElement("tr");
    row.className = `hover:bg-primary-fixed/40 tonal-transition rounded-xl ${
      index % 2 === 0
        ? "bg-surface-container-lowest"
        : "bg-surface-container-low"
    }`;

    let statusClass = "bg-tertiary-fixed text-on-tertiary-fixed";
    if (tenant.status === "Active") {
      statusClass = "bg-secondary-container text-on-secondary-container";
    } else if (tenant.status === "Expired") {
      statusClass = "bg-error-container text-on-error-container";
    }

    row.innerHTML = `
      <td class="px-6 py-4 first:rounded-l-xl last:rounded-r-xl cursor-pointer" onclick="viewTenantDetails('${tenant.id}')">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
            ${tenant.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <span class="text-sm font-semibold text-on-surface">${tenant.name}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-sm font-medium text-on-surface-variant font-mono cursor-pointer" onclick="viewTenantDetails('${tenant.id}')">${tenant.idCard}</td>
      <td class="px-6 py-4 text-sm font-bold text-primary cursor-pointer" onclick="viewTenantDetails('${tenant.id}')">${tenant.building}</td>
      <td class="px-6 py-4 text-sm font-medium text-on-surface-variant cursor-pointer" onclick="viewTenantDetails('${tenant.id}')">${tenant.room}</td>
      <td class="px-6 py-4 cursor-pointer" onclick="viewTenantDetails('${tenant.id}')">
        <span class="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${statusClass}">${tenant.status}</span>
      </td>
      <td class="px-6 py-4 text-right first:rounded-l-xl last:rounded-r-xl">
        <div class="flex justify-end gap-2">
          <button onclick="editTenant('${tenant.id}')" class="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-primary">
            <span class="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
          </button>
          <button onclick="deleteTenantHandler('${tenant.id}')" class="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-error">
            <span class="material-symbols-outlined text-[18px]" data-icon="delete">delete</span>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });

  updatePagination();
  updateStats();
}

function updateStats() {
  if (totalTenantsEl) totalTenantsEl.innerText = filteredTenants.length;
  if (activeTenantsEl) {
    activeTenantsEl.innerText = filteredTenants.filter(
      (tenant) => tenant.status === "Active",
    ).length;
  }
  if (expiringTenantsEl) {
    expiringTenantsEl.innerText = filteredTenants.filter(
      (tenant) => tenant.status === "Expiring soon",
    ).length;
  }
}

function updatePagination() {
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
  const paginationEl = document.getElementById("paginationControls");
  const totalResultsEl = document.getElementById("totalResults");
  const showingStartEl = document.getElementById("showingStart");
  const showingEndEl = document.getElementById("showingEnd");

  if (!paginationEl || !totalResultsEl || !showingStartEl || !showingEndEl) {
    return;
  }

  totalResultsEl.innerText = filteredTenants.length;
  showingStartEl.innerText =
    filteredTenants.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  showingEndEl.innerText = Math.min(
    currentPage * itemsPerPage,
    filteredTenants.length,
  );

  paginationEl.innerHTML = `
    <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""} class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30">
      <span class="material-symbols-outlined text-[18px]">chevron_left</span>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    paginationEl.innerHTML += `
      <button onclick="changePage(${i})" class="w-8 h-8 rounded-lg text-xs font-bold transition-all ${
        currentPage === i
          ? "bg-primary text-on-primary shadow-md"
          : "text-slate-500 hover:bg-slate-100"
      }">${i}</button>
    `;
  }

  paginationEl.innerHTML += `
    <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""} class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30">
      <span class="material-symbols-outlined text-[18px]">chevron_right</span>
    </button>
  `;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
}

function applyFilters() {
  const query = searchInput?.value.toLowerCase() || "";
  const category = categoryFilter?.value || "all";
  const status = statusFilter?.value || "all";

  filteredTenants = tenants.filter((tenant) => {
    const matchesStatus = status === "all" || tenant.status === status;
    let matchesQuery = true;

    if (query) {
      if (category === "all") {
        matchesQuery = Object.values(tenant).some((value) =>
          String(value).toLowerCase().includes(query),
        );
      } else {
        const key = category === "id" ? "idCard" : category;
        matchesQuery = String(tenant[key] ?? "")
          .toLowerCase()
          .includes(query);
      }
    }

    return matchesStatus && matchesQuery;
  });

  currentPage = 1;
  renderTable();
}

function resetFilters() {
  if (searchInput) searchInput.value = "";
  if (categoryFilter) categoryFilter.value = "all";
  if (statusFilter) statusFilter.value = "all";
  applyFilters();
}

function viewTenantDetails(id) {
  window.location.href = `TenantDetail.html?id=${id}`;
}

function showError(message) {
  if (!formError) return;
  formError.innerText = message;
  formError.classList.remove("hidden");
  setTimeout(() => formError.classList.add("hidden"), 3000);
}

function renderApartmentOptions() {
  if (!apartmentSelect) return;

  apartmentSelect.innerHTML = '<option value="">-- Chọn căn hộ --</option>';
  apartments.forEach((apartment) => {
    const option = document.createElement("option");
    option.value = apartment._id;
    option.textContent = apartment.ten || apartment.dia_chi || "Căn hộ";
    apartmentSelect.appendChild(option);
  });
}

function renderRoomOptions() {
  if (!roomSelect) return;

  if (!rooms.length) {
    roomSelect.innerHTML = '<option value="">Chưa có phòng</option>';
    return;
  }

  roomSelect.innerHTML = '<option value="">-- Chọn phòng --</option>';
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room._id;
    option.textContent = `Phòng ${room.so_phong || "N/A"}`;
    roomSelect.appendChild(option);
  });
}

async function openModal(editId = null) {
  if (!tenantForm) return;

  tenantForm.reset();
  document.getElementById("editId").value = "";
  document.getElementById("modalTitle").innerText = "Thêm Người Thuê Mới";
  formError?.classList.add("hidden");

  renderApartmentOptions();
  rooms = [];
  renderRoomOptions();

  if (editId) {
    const tenant = tenants.find((item) => item.id === editId);
    if (tenant) {
      const setFieldValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
      };

      document.getElementById("editId").value = tenant.id;
      setFieldValue("formName", tenant.name);
      setFieldValue("formPhone", tenant.phone === "N/A" ? "" : tenant.phone);
      setFieldValue("formIdCard", tenant.idCard === "N/A" ? "" : tenant.idCard);
      setFieldValue("formAge", tenant.age === "N/A" ? "" : tenant.age);
      setFieldValue(
        "formHometown",
        tenant.hometown === "N/A" ? "" : tenant.hometown,
      );
      setFieldValue("formStartDate", convertVNDateToISO(tenant.startDate));
      setFieldValue("formEndDate", convertVNDateToISO(tenant.endDate));
      setFieldValue(
        "formRentPrice",
        tenant.roomPrice ? tenant.roomPrice.replace(/\./g, "") : "",
      );
      setFieldValue(
        "formEmergency",
        tenant.emergencyContact === "N/A" ? "" : tenant.emergencyContact,
      );
      setFieldValue(
        "formStatus",
        tenant.status === "Active" ? "active" : "inactive",
      );

      if (tenant.apartmentId && apartmentSelect) {
        apartmentSelect.value = tenant.apartmentId;
        await loadRoomsByApartment(tenant.apartmentId);
        setFieldValue("formRoom", tenant.roomId);
      }

      document.getElementById("modalTitle").innerText = "Chỉnh Sửa Thông Tin";
    }
  }

  modalOverlay?.classList.remove("hidden");
  modalContainer?.classList.remove("hidden");

  setTimeout(() => {
    modalOverlay?.classList.remove("opacity-0");
    modalContainer?.classList.remove("opacity-0", "scale-95");
    modalContainer?.classList.add("scale-100");
  }, 10);
}

function closeModal() {
  modalOverlay?.classList.add("opacity-0");
  modalContainer?.classList.add("opacity-0", "scale-95");
  modalContainer?.classList.remove("scale-100");

  setTimeout(() => {
    modalOverlay?.classList.add("hidden");
    modalContainer?.classList.add("hidden");
    tenantForm?.reset();
  }, 300);
}

async function handleTenantSubmit(event) {
  event.preventDefault();

  const editId = document.getElementById("editId").value;
  const payload = {
    ho_ten: document.getElementById("formName").value.trim(),
    so_dien_thoai: document.getElementById("formPhone").value.trim(),
    cmnd_cccd: document.getElementById("formIdCard").value.trim(),
    tuoi: Number(document.getElementById("formAge").value) || undefined,
    que_quan: document.getElementById("formHometown").value.trim(),
    ngay_bat_dau: document.getElementById("formStartDate").value || undefined,
    ngay_ket_thuc: document.getElementById("formEndDate").value || undefined,
    tien_phong: Number(document.getElementById("formRentPrice").value) || 0,
    lien_he_khan_cap: document.getElementById("formEmergency").value.trim(),
    trang_thai: document.getElementById("formStatus").value,
    phong_id: document.getElementById("formRoom").value || undefined,
  };

  try {
    await fetchJson(
      editId ? `${API_BASE_URL}/tenants/${editId}` : `${API_BASE_URL}/tenants`,
      {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    closeModal();
    await loadTenants();
  } catch (error) {
    showError(error.message);
  }
}

async function deleteTenantHandler(id) {
  if (!id) return;
  const confirmed = window.confirm(
    "Bạn có chắc chắn muốn xóa người thuê này không?",
  );
  if (!confirmed) return;

  try {
    await fetchJson(`${API_BASE_URL}/tenants/${id}`, {
      method: "DELETE",
    });
    await loadTenants();
  } catch (error) {
    showError(error.message);
  }
}

function editTenant(id) {
  openModal(id);
}

if (tenantForm) tenantForm.addEventListener("submit", handleTenantSubmit);
if (searchInput) searchInput.addEventListener("input", applyFilters);
if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
if (statusFilter) statusFilter.addEventListener("change", applyFilters);
if (apartmentSelect) {
  apartmentSelect.addEventListener("change", async (event) => {
    await loadRoomsByApartment(event.target.value);
  });
}

window.openModal = openModal;
window.closeModal = closeModal;
window.viewTenantDetails = viewTenantDetails;
window.editTenant = editTenant;
window.deleteTenantHandler = deleteTenantHandler;
window.changePage = changePage;
window.resetFilters = resetFilters;

Promise.all([loadApartments()]).finally(loadTenants);
