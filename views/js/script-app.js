// Non-module version of script-api.js
// All functions are in global scope

// Inline API client
const API_BASE_URL = 'http://localhost:5000/api';

async function getTenants(filter = {}) {
    try {
        const queryParams = new URLSearchParams();
        if (filter.status) queryParams.append('trang_thai', filter.status);

        const response = await fetch(`${API_BASE_URL}/tenants?${queryParams}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Lỗi lấy danh sách người thuê:', error);
        return [];
    }
}

async function getTenantById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Lỗi lấy chi tiết người thuê:', error);
        return null;
    }
}

function mapTenantData(apiTenant) {
    return {
        id: apiTenant._id,
        name: apiTenant.ho_ten || 'N/A',
        idCard: apiTenant.cmnd_cccd || 'N/A',
        building: apiTenant.phong_id?.building || 'N/A',
        room: apiTenant.phong_id?.so_phong || 'N/A',
        status: apiTenant.trang_thai === 'active' ? 'Active' : 'Inactive',
        gender: 'N/A',
        phone: apiTenant.so_dien_thoai || 'N/A',
        birthDate: apiTenant.tuoi ? `${apiTenant.tuoi} tuổi` : 'N/A',
        hometown: apiTenant.que_quan || 'N/A',
        startDate: apiTenant.ngay_bat_dau ? new Date(apiTenant.ngay_bat_dau).toLocaleDateString('vi-VN') : 'N/A',
        endDate: apiTenant.ngay_ket_thuc ? new Date(apiTenant.ngay_ket_thuc).toLocaleDateString('vi-VN') : 'N/A',
        roomPrice: apiTenant.tien_phong?.toLocaleString('vi-VN') || '0',
        deposit: apiTenant.tien_phong?.toLocaleString('vi-VN') || '0',
        note: 'N/A',
        residentId: apiTenant._id,
        daysRented: calculateDaysRented(apiTenant.ngay_bat_dau, apiTenant.ngay_ket_thuc),
        emergencyContact: apiTenant.lien_he_khan_cap || 'N/A',
        age: apiTenant.tuoi || 'N/A',
    };
}

function calculateDaysRented(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
}

// Convert VN date format "15/04/2026" or "15/4/2026" to ISO format "2026-04-15" for input date field
function convertVNDateToISO(vnDate) {
    if (!vnDate || vnDate === 'N/A') return '';
    const parts = vnDate.split('/');
    const day = parts[0].padStart(2, '0');      // "15" → "15"
    const month = parts[1].padStart(2, '0');    // "4" → "04"
    const year = parts[2];                       // "2026" → "2026"
    return `${year}-${month}-${day}`;            // "2026-04-15"
}

// State
let tenants = [];
let filteredTenants = [];
let rooms = [];
let currentPage = 1;
const itemsPerPage = 5;

// DOM
const tableBody = document.getElementById('tenantTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');
const totalTenantsEl = document.getElementById('totalTenantsCount');
const activeTenantsEl = document.getElementById('activeTenantsCount');
const expiringTenantsEl = document.getElementById('expiringTenantsCount');
const modalOverlay = document.getElementById('modalOverlay');
const modalContainer = document.getElementById('modalContainer');
const tenantForm = document.getElementById('tenantForm');
const formError = document.getElementById('formError');

// Load data
async function loadTenants() {
    try {
        console.log('Starting to load tenants from:', API_BASE_URL);
        const apiTenants = await getTenants();
        console.log('Received tenants:', apiTenants);

        if (!apiTenants || apiTenants.length === 0) {
            console.warn('No tenants received from API');
        }

        tenants = apiTenants.map(mapTenantData);
        filteredTenants = [...tenants];
        currentPage = 1;
        console.log('Mapped tenants:', tenants);
        renderTable();
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
    }
}

function renderTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredTenants.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

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
        const row = document.createElement('tr');
        row.className = `hover:bg-primary-fixed/40 tonal-transition rounded-xl ${index % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'
            }`;

        let statusClass = '';
        if (tenant.status === 'Active')
            statusClass = 'bg-secondary-container text-on-secondary-container';
        else if (tenant.status === 'Expired')
            statusClass = 'bg-error-container text-on-error-container';
        else statusClass = 'bg-tertiary-fixed text-on-tertiary-fixed';

        row.innerHTML = `
      <td class="px-6 py-4 first:rounded-l-xl last:rounded-r-xl cursor-pointer" onclick="viewTenantDetails('${tenant.id}')">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
            ${tenant.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <span class="text-sm font-semibold text-on-surface">${tenant.name}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-sm font-medium text-on-surface-variant font-mono cursor-pointer" onclick="viewTenantDetails('${tenant.id}')">${tenant.idCard}</td>
      <td class="px-6 py-4 text-sm font-bold text-primary cursor-pointer" onclick="viewTenantDetails('${tenant.id}')">Bldg ${tenant.building}</td>
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
    totalTenantsEl.innerText = filteredTenants.length;
    activeTenantsEl.innerText = filteredTenants.filter((t) => t.status === 'Active').length;
    expiringTenantsEl.innerText = filteredTenants.filter((t) => t.status === 'Expiring soon').length;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
    const paginationEl = document.getElementById('paginationControls');
    document.getElementById('totalResults').innerText = filteredTenants.length;
    document.getElementById('showingStart').innerText =
        filteredTenants.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    document.getElementById('showingEnd').innerText = Math.min(
        currentPage * itemsPerPage,
        filteredTenants.length
    );

    paginationEl.innerHTML = `
    <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30">
      <span class="material-symbols-outlined text-[18px]">chevron_left</span>
    </button>
  `;

    for (let i = 1; i <= totalPages; i++) {
        paginationEl.innerHTML += `
      <button onclick="changePage(${i})" class="w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i
                ? 'bg-primary text-on-primary shadow-md'
                : 'text-slate-500 hover:bg-slate-100'
            }">${i}</button>
    `;
    }

    paginationEl.innerHTML += `
    <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30">
      <span class="material-symbols-outlined text-[18px]">chevron_right</span>
    </button>
  `;
}

function changePage(p) {
    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    renderTable();
}

function applyFilters() {
    const query = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const status = statusFilter.value;

    filteredTenants = tenants.filter((t) => {
        const matchesStatus = status === 'all' || t.status === status;
        let matchesQuery = true;
        if (query) {
            if (category === 'all') {
                matchesQuery = Object.values(t).some((val) =>
                    String(val).toLowerCase().includes(query)
                );
            } else {
                const key = category === 'id' ? 'idCard' : category;
                matchesQuery = String(t[key]).toLowerCase().includes(query);
            }
        }
        return matchesStatus && matchesQuery;
    });

    currentPage = 1;
    renderTable();
}

function resetFilters() {
    searchInput.value = '';
    categoryFilter.value = 'all';
    statusFilter.value = 'all';
    applyFilters();
}

function viewTenantDetails(id) {
    window.location.href = `chitietnguoithue.html?id=${id}`;
}

function showError(message) {
    formError.innerText = message;
    formError.classList.remove('hidden');
    setTimeout(() => {
        formError.classList.add('hidden');
    }, 3000);
}

async function loadRooms() {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);
        if (!response.ok) throw new Error('Failed to fetch rooms');
        const data = await response.json();
        rooms = data.data || [];
        console.log('Rooms loaded:', rooms.length);
    } catch (error) {
        console.error('Lỗi tải danh sách phòng:', error);
        rooms = [];
    }
}

function openModal(editId = null) {
    tenantForm.reset();
    document.getElementById('editId').value = '';
    document.getElementById('modalTitle').innerText = 'Thêm Người Thuê Mới';
    formError.classList.add('hidden');

    // Load rooms vào dropdown
    const roomSelect = document.getElementById('formRoom');
    if (rooms.length === 0) {
        roomSelect.innerHTML = '<option value="">Chưa có phòng</option>';
    } else {
        roomSelect.innerHTML = '<option value="">-- Chọn phòng --</option>';
        rooms.forEach((room) => {
            const option = document.createElement('option');
            option.value = room._id;
            option.textContent = `Phòng ${room.so_phong} (${room.dien_tich}m² - ${room.gia.toLocaleString('vi-VN')} VNĐ)`;
            roomSelect.appendChild(option);
        });
    }

    if (editId) {
        const tenant = tenants.find((t) => t.id === editId);
        if (tenant) {
            const setFieldValue = (id, value) => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = value;
                }
            };

            document.getElementById('editId').value = tenant.id;
            setFieldValue('formName', tenant.name);
            setFieldValue('formPhone', tenant.phone || '');
            setFieldValue('formIdCard', tenant.idCard);
            setFieldValue('formAge', tenant.age === 'N/A' ? '' : tenant.age);
            setFieldValue('formHometown', tenant.hometown);

            const isoStartDate = convertVNDateToISO(tenant.startDate);
            const isoEndDate = convertVNDateToISO(tenant.endDate);

            setFieldValue('formStartDate', isoStartDate);
            setFieldValue('formEndDate', isoEndDate);

            // Select room từ room number
            if (tenant.room && tenant.room !== 'N/A' && rooms.length > 0) {
                const selectedRoom = rooms.find(r => r.so_phong === tenant.room);
                if (selectedRoom) {
                    setFieldValue('formRoom', selectedRoom._id);
                }
            }

            // Clean roomPrice (remove dots from localeString format)
            const cleanRoomPrice = tenant.roomPrice ? tenant.roomPrice.replace(/\./g, '').replace(/VNĐ$/g, '').trim() : '0';
            setFieldValue('formRentPrice', cleanRoomPrice);

            setFieldValue('formEmergency', tenant.emergencyContact || '');
            setFieldValue('formStatus', tenant.status === 'Active' ? 'active' : 'inactive');

            document.getElementById('modalTitle').innerText = 'Chỉnh Sửa Thông Tin';
        }
    }

    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalContainer').classList.remove('hidden');

    // Trigger transition
    setTimeout(() => {
        document.getElementById('modalOverlay').classList.remove('opacity-0');
        document.getElementById('modalContainer').classList.remove('opacity-0', 'scale-95');
        document.getElementById('modalContainer').classList.add('scale-100');
    }, 10);
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('opacity-0');
    document.getElementById('modalContainer').classList.add('opacity-0', 'scale-95');
    document.getElementById('modalContainer').classList.remove('scale-100');

    setTimeout(() => {
        document.getElementById('modalOverlay').classList.add('hidden');
        document.getElementById('modalContainer').classList.add('hidden');
        tenantForm.reset();
    }, 300);
}

// ===== FORM SUBMIT HANDLER - Disabled API calls =====
tenantForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('Chức năng thêm/chỉnh sửa người thuê hiện không khả dụng');
});

function deleteTenantHandler(id) {
    showError('Chức năng xóa người thuê hiện không khả dụng');
}

function editTenant(id) {
    openModal(id);
}

// Events
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
statusFilter.addEventListener('change', applyFilters);

// Export to global scope for onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.viewTenantDetails = viewTenantDetails;
window.editTenant = editTenant;
window.deleteTenantHandler = deleteTenantHandler;
window.changePage = changePage;
window.resetFilters = resetFilters;

// Init
loadRooms();
loadTenants();
