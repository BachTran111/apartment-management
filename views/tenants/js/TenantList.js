const API_BASE_URL = "http://localhost:5000/api";

let tenants = [];
let apartments = [];
let rooms = [];
let filteredTenants = [];
let isEditMode = false;
let editingId = null;

function extractPayloadData(payload) {
    const source = payload?.metadata || payload?.data;
    if (!source) return [];
    if (Array.isArray(source)) return source;
    const possibleKeys = ["tenants", "apartments", "rooms", "contracts", "items"];
    for (const key of possibleKeys) {
        if (Array.isArray(source[key])) return source[key];
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
        roomId: apiTenant.phong_id?._id || "",
        apartmentId: roomData.can_ho_id?._id || "",
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

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.message || `HTTP error! status: ${response.status}`);
    }
    return payload;
}

async function loadApartments() {
    try {
        const payload = await fetchJson(`${API_BASE_URL}/apartments`);
        const data = extractPayloadData(payload);
        apartments = Array.isArray(data) ? data : [];
        renderApartmentOptions();
    } catch (error) {
        console.error("Lỗi tải căn hộ:", error);
        apartments = [];
    }
}

function renderApartmentOptions() {
    const select = document.getElementById("formApartment");
    if (!select) return;
    select.innerHTML = '<option value="">-- Chọn căn hộ --</option>';
    apartments.forEach((apt) => {
        const option = document.createElement("option");
        option.value = apt._id;
        option.textContent = apt.ten || apt.dia_chi || "Không xác định";
        select.appendChild(option);
    });
}

async function loadRoomsByApartment(apartmentId) {
    if (!apartmentId) {
        rooms = [];
        renderRoomOptions();
        return;
    }
    try {
        const payload = await fetchJson(
            `${API_BASE_URL}/rooms/apartment/${apartmentId}`
        );
        const data = extractPayloadData(payload);
        rooms = Array.isArray(data) ? data : [];
        renderRoomOptions();
    } catch (error) {
        console.error("Lỗi tải phòng:", error);
        rooms = [];
        renderRoomOptions();
    }
}

function renderRoomOptions() {
    const select = document.getElementById("formRoom");
    if (!select) return;
    select.innerHTML = '<option value="">-- Chọn phòng --</option>';
    rooms.forEach((room) => {
        const option = document.createElement("option");
        option.value = room._id;
        option.textContent = `Phòng ${room.so_phong}`;
        select.appendChild(option);
    });
}

async function loadTenants() {
    try {
        const payload = await fetchJson(`${API_BASE_URL}/tenants`);
        const data = extractPayloadData(payload);
        const tenantList = Array.isArray(data) ? data : Array.isArray(data.tenants) ? data.tenants : [];
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

    if (filteredTenants.length === 0) {
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
        const row = document.createElement("tr");
        row.className = "border-b hover:bg-gray-50";

        let statusColor = "badge-success";
        let statusText = "Hoạt động";
        if (tenant.status === "Expired") {
            statusColor = "badge-danger";
            statusText = "Hết hạn";
        } else if (tenant.status === "Expiring soon") {
            statusColor = "badge-warning";
            statusText = "Sắp hết hạn";
        }

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
    const totalEl = document.getElementById("totalCount");
    const activeEl = document.getElementById("activeCount");
    const warningEl = document.getElementById("warningCount");

    if (totalEl) totalEl.textContent = filteredTenants.length;
    if (activeEl) {
        activeEl.textContent = filteredTenants.filter(
            (t) => t.status === "Active"
        ).length;
    }
    if (warningEl) {
        warningEl.textContent = filteredTenants.filter(
            (t) => t.status === "Expiring soon" || t.status === "Expired"
        ).length;
    }
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
    const tenant = tenants.find((t) => t.id === id);
    if (!tenant) return;

    isEditMode = true;
    editingId = id;
    document.getElementById("modalTitle").textContent = "Chỉnh sửa thông tin người thuê";
    document.getElementById("editId").value = id;
    document.getElementById("formName").value = tenant.name;
    document.getElementById("formPhone").value = tenant.phone;
    document.getElementById("formIdCard").value = tenant.idCard;
    document.getElementById("formAge").value = tenant.age;
    document.getElementById("formHometown").value = tenant.hometown;

    // Format dates from vi-VN to ISO
    const startDateParts = tenant.startDate.split("/");
    if (startDateParts.length === 3) {
        document.getElementById("formStartDate").value = `${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`;
    }

    const endDateParts = tenant.endDate.split("/");
    if (endDateParts.length === 3) {
        document.getElementById("formEndDate").value = `${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`;
    }

    document.getElementById("formRentPrice").value = tenant.roomPrice.replace(/\D/g, "");

    // Set room (this might need apartment/room loading based on tenant data)
    // For now, just leave it blank or set to the room if it's available
    if (tenant.room && tenant.room !== "N/A") {
        // You may need to populate apartment and room dropdowns here
        document.getElementById("formRoom").value = tenant.roomId || "";
    }

    document.getElementById("tenantModal").classList.add("active");
}

async function submitTenantForm(e) {
    e.preventDefault();

    const formData = {
        ho_ten: document.getElementById("formName").value,
        so_dien_thoai: document.getElementById("formPhone").value,
        cmnd_cccd: document.getElementById("formIdCard").value,
        tuoi: parseInt(document.getElementById("formAge").value) || null,
        que_quan: document.getElementById("formHometown").value,
        ngay_bat_dau: document.getElementById("formStartDate").value,
        ngay_ket_thuc: document.getElementById("formEndDate").value,
        tien_phong: parseInt(document.getElementById("formRentPrice").value) || 0,
        phong_id: document.getElementById("formRoom").value,
    };

    try {
        let url = `${API_BASE_URL}/tenants`;
        let method = "POST";

        if (isEditMode && editingId) {
            url += `/${editingId}`;
            method = "PUT";
        }

        const response = await fetchJson(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        alert(isEditMode ? "Cập nhật thành công!" : "Thêm mới thành công!");
        closeModal();
        await loadTenants();
    } catch (error) {
        alert("Lỗi: " + error.message);
    }
}

function viewDetails(id) {
    window.location.href = `TenantDetail.html?id=${id}`;
}

async function deleteTenant(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa?")) return;

    try {
        await fetchJson(`${API_BASE_URL}/tenants/${id}`, { method: "DELETE" });
        alert("Xóa thành công!");
        await loadTenants();
    } catch (error) {
        alert("Lỗi: " + error.message);
    }
}

function handleSearch() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    filteredTenants = tenants.filter(
        (tenant) =>
            tenant.name.toLowerCase().includes(searchValue) ||
            tenant.idCard.toLowerCase().includes(searchValue) ||
            tenant.room.toLowerCase().includes(searchValue)
    );
    renderTable();
    updateStats();
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
    await loadApartments();
    await loadTenants();

    document.getElementById("formApartment").addEventListener("change", (e) => {
        loadRoomsByApartment(e.target.value);
    });

    document.getElementById("searchInput").addEventListener("input", handleSearch);
    document.getElementById("tenantForm").addEventListener("submit", submitTenantForm);
});
