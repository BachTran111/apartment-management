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

function calculateTimeRemaining(endDate) {
    if (!endDate) return "---";
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Hết hạn";
    if (diffDays === 0) return "Hôm nay hết hạn";
    if (diffDays === 1) return "Còn 1 ngày";
    if (diffDays <= 30) return `Còn ${diffDays} ngày`;
    const months = Math.floor(diffDays / 30);
    return `Còn ${months} tháng`;
}

function formatDate(dateString) {
    if (!dateString) return "---";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    } catch {
        return dateString;
    }
}

function formatCurrency(value) {
    if (!value || value === "N/A") return "---";
    const amount = typeof value === "string" ? parseInt(value.replace(/\D/g, "")) : value;
    if (isNaN(amount)) return "---";
    return amount.toLocaleString("vi-VN") + "đ";
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

        // Populate basic info
        const name = apiTenant.ho_ten || "---";
        const idCard = apiTenant.cmnd_cccd || "---";
        const phone = apiTenant.so_dien_thoai || "---";
        const room = roomData.so_phong || "---";
        const address = apartmentData.dia_chi || "---";

        document.getElementById("tenantName").textContent = name;
        document.getElementById("tenantStatusInfo").textContent = `CMND/CCCD: ${idCard} | Phòng: ${room}`;

        // Populate detail fields
        document.getElementById("detailFullName").textContent = name;
        document.getElementById("detailIdCard").textContent = idCard;
        document.getElementById("detailAge").textContent = apiTenant.tuoi || "---";
        document.getElementById("detailHometown").textContent = apiTenant.que_quan || "---";
        document.getElementById("detailOccupation").textContent = apiTenant.nghe_nghiep || "---";
        document.getElementById("detailPhone").textContent = phone;

        // Housing info
        document.getElementById("detailApartment").textContent = roomData.can_ho_id?.ten || "Phòng " + room || "---";
        document.getElementById("detailRoom").textContent = room;
        document.getElementById("detailRentPrice").textContent = formatCurrency(apiTenant.tien_phong);
        document.getElementById("detailStartDate").textContent = formatDate(apiTenant.ngay_bat_dau);
        document.getElementById("detailEndDate").textContent = formatDate(apiTenant.ngay_ket_thuc);

        // Emergency contact - Handle various API response structures
        const emergencyName = apiTenant.lien_he_khan_cap || apiTenant.ho_than || "---";
        const emergencyPhone = apiTenant.dien_thoai_khan_cap || apiTenant.lien_he_khan_cap || "---";
        const emergencyRelation = apiTenant.quan_he || apiTenant.moi_quan_he || "---";

        document.getElementById("detailEmergencyContact").textContent = emergencyName;
        document.getElementById("detailEmergencyRelation").textContent = emergencyRelation;
        document.getElementById("detailEmergencyPhone").textContent = emergencyPhone;

        // Status badge
        const statusEl = document.getElementById("detailStatus");
        const status = apiTenant.trang_thai || "active";
        if (status === "active" || status === "Active") {
            statusEl.textContent = "Hoạt động";
            statusEl.className = "status-badge status-active";
        } else {
            statusEl.textContent = "Hết hạn";
            statusEl.className = "status-badge status-inactive";
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi tải dữ liệu chi tiết: " + error.message);
    }
}

function editTenant() {
    if (!currentTenantData) return;
    document.getElementById("editName").value = currentTenantData.ho_ten || "";
    document.getElementById("editPhone").value = currentTenantData.so_dien_thoai || "";
    document.getElementById("editAge").value = currentTenantData.tuoi || "";
    document.getElementById("editHometown").value = currentTenantData.que_quan || "";
    document.getElementById("editOccupation").value = currentTenantData.nghe_nghiep || "";

    // Format dates for input
    const endDate = currentTenantData.ngay_ket_thuc
        ? new Date(currentTenantData.ngay_ket_thuc).toISOString().split("T")[0]
        : "";
    document.getElementById("editEndDate").value = endDate;

    const rentPrice = currentTenantData.tien_phong;
    document.getElementById("editRentPrice").value = typeof rentPrice === "string"
        ? rentPrice.replace(/\D/g, "")
        : rentPrice;

    document.getElementById("editTenantModal").classList.add("active");
}

function closeEditModal() {
    document.getElementById("editTenantModal").classList.remove("active");
}

async function submitEditForm(e) {
    e.preventDefault();

    const updatedData = {
        ho_ten: document.getElementById("editName").value,
        so_dien_thoai: document.getElementById("editPhone").value,
        tuoi: parseInt(document.getElementById("editAge").value) || null,
        que_quan: document.getElementById("editHometown").value,
        nghe_nghiep: document.getElementById("editOccupation").value,
        ngay_ket_thuc: document.getElementById("editEndDate").value,
        tien_phong: parseInt(document.getElementById("editRentPrice").value) || 0,
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
        alert("Lỗi: " + error.message);
    }
}

async function deleteTenant() {
    if (!confirm("Bạn có chắc chắn muốn xóa người thuê này? Hành động này không thể được hoàn tác.")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/tenants/${currentTenantId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Lỗi xóa");

        alert("Xóa thành công!");
        window.location.href = "TenantList.html";
    } catch (error) {
        alert("Lỗi: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTenantDetails();
    document.getElementById("editTenantForm").addEventListener("submit", submitEditForm);
});
