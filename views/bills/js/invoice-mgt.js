const API_BASE_URL = "http://localhost:5000/api";
const ITEMS_PER_PAGE = 5;

let allBills = [];
let filteredBills = [];
let currentPage = 1;

const invoiceBody = document.getElementById("invoiceBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const paginationInfo = document.getElementById("paginationInfo");
const paginationButtons = document.getElementById("paginationButtons");

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function getMetadata(payload) {
  return payload?.metadata || payload?.data || {};
}

function normalizeStatus(status) {
  const normalized = String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .toUpperCase();

  if (normalized.includes("DA THANH TOAN")) return "ĐÃ THANH TOÁN";
  if (normalized.includes("QUA HAN")) return "QUÁ HẠN";
  return "CHƯA THANH TOÁN";
}

function searchable(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mapBill(bill) {
  return {
    id: bill._id,
    tenantName: bill.hop_dong_id?.nguoi_thue_id?.ho_ten || "Chưa rõ người thuê",
    roomNumber: bill.hop_dong_id?.phong_id?.so_phong || "N/A",
    amount: Number(bill.so_tien || 0),
    createdDate: bill.ngay_lap
      ? new Date(bill.ngay_lap).toLocaleDateString("vi-VN")
      : "N/A",
    status: normalizeStatus(bill.trang_thai),
    note: bill.ghi_chu || "",
  };
}

async function loadBills() {
  try {
    const response = await fetch(`${API_BASE_URL}/bills?limit=100`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const payload = await response.json();
    const result = getMetadata(payload);
    const bills = Array.isArray(result.bills) ? result.bills : [];

    allBills = bills.map(mapBill);
    filteredBills = [...allBills];
    currentPage = 1;
    renderBills();
  } catch (error) {
    console.error("Lỗi tải danh sách hóa đơn:", error);
    invoiceBody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;">Không thể tải dữ liệu hóa đơn</td></tr>';
    paginationInfo.textContent = "Không có dữ liệu";
    paginationButtons.innerHTML = "";
  }
}

function renderBills() {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageItems = filteredBills.slice(startIndex, endIndex);

  invoiceBody.innerHTML = "";

  if (!pageItems.length) {
    invoiceBody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;">Không có dữ liệu phù hợp</td></tr>';
    updatePagination();
    return;
  }

  pageItems.forEach((bill) => {
    const badgeClass =
      bill.status === "ĐÃ THANH TOÁN" ? "badge-success" : "badge-danger";

    invoiceBody.insertAdjacentHTML(
      "beforeend",
      `
        <tr>
          <td>
            <div style="font-weight:600;">${bill.tenantName}</div>
            <div style="font-size:12px;color:#858796;">Phòng ${bill.roomNumber}</div>
          </td>
          <td>${formatter.format(bill.amount)}</td>
          <td>${bill.createdDate}</td>
          <td><span class="badge ${badgeClass}">${bill.status}</span></td>
          <td class="actions">
            <button class="action-btn" title="Xem" onclick="viewDetail('${bill.id}')">👁️</button>
            <button class="action-btn" title="Sửa" onclick="editBill('${bill.id}')">✏️</button>
            <button class="action-btn" title="Xóa" onclick="deleteBill('${bill.id}')">🗑️</button>
          </td>
        </tr>
      `,
    );
  });

  updatePagination();
}

function updatePagination() {
  const totalItems = filteredBills.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startNum =
    totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endNum = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  paginationInfo.textContent = `Hiển thị ${startNum} đến ${endNum} của ${totalItems}`;
  paginationButtons.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("a");
    btn.href = "#";
    btn.className = `page-link ${currentPage === i ? "active" : ""}`;
    btn.textContent = i;
    btn.onclick = (event) => {
      event.preventDefault();
      currentPage = i;
      renderBills();
    };
    paginationButtons.appendChild(btn);
  }
}

function applyFilters() {
  const searchTerm = searchable(searchInput.value);
  const selectedStatus = statusFilter.value;

  filteredBills = allBills.filter((bill) => {
    const matchesSearch =
      !searchTerm ||
      searchable(`${bill.tenantName} ${bill.roomNumber} ${bill.note}`).includes(
        searchTerm,
      );
    const matchesStatus = !selectedStatus || bill.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  currentPage = 1;
  renderBills();
}

function clearFilters() {
  searchInput.value = "";
  statusFilter.value = "";
  applyFilters();
}

function viewDetail(id) {
  window.location.href = `BillDetail.html?id=${id}`;
}

function editBill(id) {
  window.location.href = `BillForm.html?id=${id}`;
}

async function deleteBill(id) {
  if (!window.confirm("Bạn có chắc muốn xóa hóa đơn này?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/bills/${id}`, {
      method: "DELETE",
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || "Không thể xóa hóa đơn");
    }

    await loadBills();
  } catch (error) {
    console.error("Lỗi xóa hóa đơn:", error);
    alert(error.message);
  }
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

window.clearFilters = clearFilters;
window.viewDetail = viewDetail;
window.editBill = editBill;
window.deleteBill = deleteBill;

document.addEventListener("DOMContentLoaded", loadBills);
