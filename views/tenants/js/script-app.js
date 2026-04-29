// Non-module version of script-api.js
// All functions are in global scope

const API_BASE_URL = "http://localhost:5000/api";

function extractPayloadData(payload) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  // 1. Lấy lõi dữ liệu từ data hoặc metadata
  const source = payload.data || payload.metadata;

  if (!source) return [];

  // 2. Nếu lõi dữ liệu đã là một Mảng (API cũ không có phân trang) -> Trả về luôn
  if (Array.isArray(source)) {
    return source;
  }

  // 3. Nếu lõi dữ liệu là Object phân trang (API mới) -> Tìm mảng bên trong
  // Tương ứng với tên các model: tenants, apartments, rooms, contracts
  const possibleKeys = ["tenants", "apartments", "rooms", "contracts", "items"];

  for (const key of possibleKeys) {
    if (source[key] && Array.isArray(source[key])) {
      return source[key];
    }
  }

  // Nếu là hàm getById (trả về 1 object duy nhất)
  return source;
}

function formatCurrency(value) {
  const amount =
    typeof value === "object" && value !== null && "$numberDecimal" in value
      ? Number(value.$numberDecimal)
      : Number(value);

  if (Number.isNaN(amount)) {
    return "0";
  }

  return amount.toLocaleString("vi-VN");
}

async function getTenants(filter = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filter.status) queryParams.append("trang_thai", filter.status);

    const response = await fetch(`${API_BASE_URL}/tenants?${queryParams}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const payload = await response.json();
    const tenantsData = extractPayloadData(payload);
    return Array.isArray(tenantsData)
      ? tenantsData
      : tenantsData
        ? [tenantsData]
        : [];
  } catch (error) {
    console.error("Lỗi lấy danh sách người thuê:", error);
    return [];
  }
}

async function getTenantById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const payload = await response.json();
    return extractPayloadData(payload) || null;
  } catch (error) {
    console.error("Lỗi lấy chi tiết người thuê:", error);
    return null;
  }
}

function mapTenantData(apiTenant) {
  const roomData = apiTenant.phong_id || {};

  // SỬA LỖI: Đồng bộ logic trạng thái giữa các DB và UI
  let mappedStatus = "Inactive";
  if (
    apiTenant.trang_thai === "active" ||
    apiTenant.trang_thai === "KHẢ DỤNG"
  ) {
    mappedStatus = "Active";
  } else if (
    apiTenant.trang_thai === "expired" ||
    apiTenant.trang_thai === "HẾT HẠN"
  ) {
    mappedStatus = "Expired";
  } else if (apiTenant.trang_thai === "expiring") {
    mappedStatus = "Expiring soon";
  }

  return {
    id: apiTenant._id,
    name: apiTenant.ho_ten || "N/A",
    idCard: apiTenant.cmnd_cccd || "N/A",
    building:
      roomData.building ||
      roomData.can_ho_id?.ten ||
      roomData.can_ho_id?.dia_chi ||
      "N/A",
    room: roomData.so_phong || "N/A",
    status: mappedStatus,
    gender: "N/A",
    phone: apiTenant.so_dien_thoai || "N/A",
    birthDate: apiTenant.tuoi ? `${apiTenant.tuoi} tuổi` : "N/A",
    hometown: apiTenant.que_quan || "N/A",
    startDate: apiTenant.ngay_bat_dau
      ? new Date(apiTenant.ngay_bat_dau).toLocaleDateString("vi-VN")
      : "N/A",
    endDate: apiTenant.ngay_ket_thuc
      ? new Date(apiTenant.ngay_ket_thuc).toLocaleDateString("vi-VN")
      : "N/A",
    roomPrice: formatCurrency(apiTenant.tien_phong),
    deposit: formatCurrency(apiTenant.tien_dat_coc ?? apiTenant.tien_phong),
    note: apiTenant.ghi_chu || "N/A",
    residentId: apiTenant._id,
    daysRented: calculateDaysRented(
      apiTenant.ngay_bat_dau,
      apiTenant.ngay_ket_thuc,
    ),
    emergencyContact: apiTenant.lien_he_khan_cap || "N/A",
    age: apiTenant.tuoi || "N/A",
  };
}

function calculateDaysRented(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

function convertVNDateToISO(vnDate) {
  if (!vnDate || vnDate === "N/A") return "";
  const parts = vnDate.split("/");
  if (parts.length !== 3) return "";
  const day = parts[0].padStart(2, "0");
  const month = parts[1].padStart(2, "0");
  const year = parts[2];
  return `${year}-${month}-${day}`;
}

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

async function loadApartments() {
  try {
    const res = await fetch(`${API_BASE_URL}/apartments`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const payload = await res.json();
    const apartmentData = extractPayloadData(payload);
    apartments = Array.isArray(apartmentData) ? apartmentData : [];
  } catch (err) {
    console.error("Lỗi load apartments:", err);
    apartments = [];
  }
}

async function loadTenants() {
  try {
    const apiTenants = await getTenants();
    tenants = apiTenants.map(mapTenantData);
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

  if (paginatedItems.length === 0) {
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
      (t) => t.status === "Active",
    ).length;
  }
  if (expiringTenantsEl) {
    expiringTenantsEl.innerText = filteredTenants.filter(
      (t) => t.status === "Expiring soon",
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

function changePage(p) {
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
  if (p < 1 || p > totalPages) return;
  currentPage = p;
  renderTable();
}

function applyFilters() {
  const query = searchInput?.value.toLowerCase() || "";
  const category = categoryFilter?.value || "all";
  const status = statusFilter?.value || "all";

  filteredTenants = tenants.filter((t) => {
    const matchesStatus = status === "all" || t.status === status;
    let matchesQuery = true;

    if (query) {
      if (category === "all") {
        matchesQuery = Object.values(t).some((val) =>
          String(val).toLowerCase().includes(query),
        );
      } else {
        const key = category === "id" ? "idCard" : category;
        matchesQuery = String(t[key] ?? "")
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
  window.location.href = `chitietnguoithue.html?id=${id}`;
}

function showError(message) {
  if (!formError) return;
  formError.innerText = message;
  formError.classList.remove("hidden");
  setTimeout(() => {
    formError.classList.add("hidden");
  }, 3000);
}

async function loadRooms() {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    if (!response.ok) throw new Error("Failed to fetch rooms");
    const payload = await response.json();
    const roomData = extractPayloadData(payload);
    rooms = Array.isArray(roomData) ? roomData : [];
  } catch (error) {
    console.error("Lỗi tải danh sách phòng:", error);
    rooms = [];
  }
}

function renderApartmentOptions() {
  if (!apartmentSelect) return;

  apartmentSelect.innerHTML = '<option value="">-- Chọn căn hộ --</option>';
  apartments.forEach((apt) => {
    const option = document.createElement("option");
    option.value = apt._id;
    option.textContent = apt.ten || apt.dia_chi || "Căn hộ";
    apartmentSelect.appendChild(option);
  });
}

function renderRoomOptions(apartmentId = "") {
  if (!roomSelect) return;

  const filteredRooms = apartmentId
    ? rooms.filter((room) => {
        const roomApartmentId =
          room.apartment_id || room.can_ho_id?._id || room.can_ho_id;
        return String(roomApartmentId || "") === String(apartmentId);
      })
    : rooms;

  roomSelect.innerHTML = filteredRooms.length
    ? '<option value="">-- Chọn phòng --</option>'
    : '<option value="">Chưa có phòng</option>';

  filteredRooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room._id;
    option.textContent = `Phòng ${room.so_phong || "N/A"}`;
    roomSelect.appendChild(option);
  });
}

function openModal(editId = null) {
  if (!tenantForm) return;

  tenantForm.reset();
  document.getElementById("editId").value = "";
  document.getElementById("modalTitle").innerText = "Thêm Người Thuê Mới";
  if (formError) formError.classList.add("hidden");

  renderApartmentOptions();
  renderRoomOptions();

  if (editId) {
    const tenant = tenants.find((t) => t.id === editId);
    if (tenant) {
      const setFieldValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
          el.value = value;
        }
      };

      document.getElementById("editId").value = tenant.id;
      setFieldValue("formName", tenant.name);
      setFieldValue("formPhone", tenant.phone || "");
      setFieldValue("formIdCard", tenant.idCard);
      setFieldValue("formAge", tenant.age === "N/A" ? "" : tenant.age);
      setFieldValue("formHometown", tenant.hometown);
      setFieldValue("formStartDate", convertVNDateToISO(tenant.startDate));
      setFieldValue("formEndDate", convertVNDateToISO(tenant.endDate));
      setFieldValue("formRentPrice", tenant.roomPrice.replace(/\./g, ""));
      setFieldValue("formEmergency", tenant.emergencyContact || "");
      setFieldValue(
        "formStatus",
        tenant.status === "Active" ? "active" : "inactive",
      );

      const selectedRoom = rooms.find((room) => room.so_phong === tenant.room);
      if (selectedRoom) {
        const apartmentId =
          selectedRoom.apartment_id ||
          selectedRoom.can_ho_id?._id ||
          selectedRoom.can_ho_id ||
          "";

        if (apartmentId && apartmentSelect) {
          apartmentSelect.value = apartmentId;
          renderRoomOptions(apartmentId);
        }

        setFieldValue("formRoom", selectedRoom._id);
      }

      document.getElementById("modalTitle").innerText = "Chỉnh Sửa Thông Tin";
    }
  }

  if (modalOverlay) modalOverlay.classList.remove("hidden");
  if (modalContainer) modalContainer.classList.remove("hidden");

  setTimeout(() => {
    if (modalOverlay) modalOverlay.classList.remove("opacity-0");
    if (modalContainer) {
      modalContainer.classList.remove("opacity-0", "scale-95");
      modalContainer.classList.add("scale-100");
    }
  }, 10);
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.add("opacity-0");
  if (modalContainer) {
    modalContainer.classList.add("opacity-0", "scale-95");
    modalContainer.classList.remove("scale-100");
  }

  setTimeout(() => {
    if (modalOverlay) modalOverlay.classList.add("hidden");
    if (modalContainer) modalContainer.classList.add("hidden");
    if (tenantForm) tenantForm.reset();
  }, 300);
}

// SỬA LỖI: Gắn logic gọi API thực tế vào sự kiện submit của Form thay vì block lại
if (tenantForm) {
  tenantForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const editId = document.getElementById("editId").value;

    // Thu thập dữ liệu
    const payload = {
      ho_ten: document.getElementById("formName").value,
      so_dien_thoai: document.getElementById("formPhone").value,
      cmnd_cccd: document.getElementById("formIdCard").value,
      tuoi: Number(document.getElementById("formAge").value) || null,
      que_quan: document.getElementById("formHometown").value,
      ngay_bat_dau: document.getElementById("formStartDate").value || null,
      ngay_ket_thuc: document.getElementById("formEndDate").value || null,
      tien_phong: Number(document.getElementById("formRentPrice").value) || 0,
      lien_he_khan_cap: document.getElementById("formEmergency").value,
      trang_thai: document.getElementById("formStatus").value,
      phong_id: document.getElementById("formRoom").value || null,
    };

    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `${API_BASE_URL}/tenants/${editId}`
        : `${API_BASE_URL}/tenants`;

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Có lỗi xảy ra khi lưu dữ liệu");
      }

      closeModal();
      await loadTenants(); // Tải lại danh sách sau khi thêm/sửa thành công
    } catch (error) {
      showError(error.message);
    }
  });
}

// SỬA LỖI: Bổ sung tham số id và logic gọi API DELETE
async function deleteTenantHandler(id) {
  if (!id) return;
  if (
    !confirm(
      "Bạn có chắc chắn muốn xóa người thuê này? Hành động này không thể hoàn tác.",
    )
  )
    return;

  try {
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Lỗi khi xóa người thuê");
    }

    await loadTenants(); // Reload lại bảng sau khi xóa
  } catch (error) {
    alert(error.message);
  }
}

function editTenant(id) {
  openModal(id);
}

if (searchInput) searchInput.addEventListener("input", applyFilters);
if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
if (statusFilter) statusFilter.addEventListener("change", applyFilters);
if (apartmentSelect) {
  apartmentSelect.addEventListener("change", (event) => {
    renderRoomOptions(event.target.value);
  });
}

window.openModal = openModal;
window.closeModal = closeModal;
window.viewTenantDetails = viewTenantDetails;
window.editTenant = editTenant;
window.deleteTenantHandler = deleteTenantHandler;
window.changePage = changePage;
window.resetFilters = resetFilters;

Promise.all([loadApartments(), loadRooms()]).finally(loadTenants);
