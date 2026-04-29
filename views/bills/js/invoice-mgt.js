// Mock data array
const mockInvoices = [
  {
    id: 1,
    name: "Hóa đơn điện tháng 03/2026",
    type: "Điện",
    amount: 1560000,
    date: "2026-03-22",
    status: "Đã thanh toán",
  },
  {
    id: 2,
    name: "Hóa đơn nước tháng 03/2026",
    type: "Nước",
    amount: 245000,
    date: "2026-03-22",
    status: "Đã thanh toán",
  },
  {
    id: 3,
    name: "Internet VNPT Gói Home",
    type: "Internet",
    amount: 350000,
    date: "2026-04-01",
    status: "Chưa thanh toán",
  },
  {
    id: 4,
    name: "Hóa đơn điện tháng 04/2026",
    type: "Điện",
    amount: 1845000,
    date: "2026-04-20",
    status: "Chưa thanh toán",
  },
  {
    id: 5,
    name: "Phí dịch vụ chung cư 2026",
    type: "Dịch vụ",
    amount: 2000000,
    date: "2026-04-15",
    status: "Chưa thanh toán",
  },
  {
    id: 6,
    name: "Tiền WiFi 6 tháng đầu năm",
    type: "Internet",
    amount: 2100000,
    date: "2026-01-10",
    status: "Đã thanh toán",
  },
  {
    id: 7,
    name: "Phiếu thu nước sinh hoạt",
    type: "Nước",
    amount: 115000,
    date: "2026-04-18",
    status: "Chưa thanh toán",
  },
  {
    id: 8,
    name: "Phí quản lý tòa nhà",
    type: "Dịch vụ",
    amount: 800000,
    date: "2026-02-15",
    status: "Đã thanh toán",
  },
  {
    id: 9,
    name: "Internet FPT - Tầng 5",
    type: "Internet",
    amount: 450000,
    date: "2026-03-10",
    status: "Đã thanh toán",
  },
  {
    id: 10,
    name: "Định kỳ tiền điện - P.502",
    type: "Điện",
    amount: 1240000,
    date: "2026-04-12",
    status: "Chưa thanh toán",
  },
];

let itemsPerPage = 5;
let currentPage = 1;
let filteredInvoices = [...mockInvoices];

// DOM Elements
const invoiceBody = document.getElementById("invoiceBody");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const statusFilter = document.getElementById("statusFilter");
const paginationInfo = document.getElementById("paginationInfo");
const paginationButtons = document.getElementById("paginationButtons");

// Formatter for currency
const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

// Main function to display invoices
function displayInvoices() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  invoiceBody.innerHTML = "";

  if (paginatedInvoices.length === 0) {
    invoiceBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;">Không có dữ liệu phù hợp</td></tr>';
    updatePagination();
    return;
  }

  paginatedInvoices.forEach((inv) => {
    const row = `
            <tr>
                <td style="font-weight: 600;">${inv.name}</td>
                <td>${inv.type}</td>
                <td>${formatter.format(inv.amount)}</td>
                <td>${inv.date}</td>
                <td>
                    <span class="badge ${inv.status === "Đã thanh toán" ? "badge-success" : "badge-danger"}">
                        ${inv.status}
                    </span>
                </td>
                <td class="actions">
                    <button class="action-btn" title="Xem" onclick="viewDetail(${inv.id})">👁️</button>
                    <button class="action-btn" title="Sửa" onclick="console.log('Sửa invoice ${inv.id}')">✏️</button>
                    <button class="action-btn" title="Xóa" onclick="console.log('Xóa invoice ${inv.id}')">🗑️</button>
                </td>
            </tr>
        `;
    invoiceBody.insertAdjacentHTML("beforeend", row);
  });

  updatePagination();
}

// Navigation function
function viewDetail(id) {
  window.location.href = `invoice-detail.html?id=${id}`;
}

// Update pagination UI
function updatePagination() {
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startNum = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endNum = Math.min(currentPage * itemsPerPage, totalItems);

  paginationInfo.textContent = `Showing ${startNum} to ${endNum} of ${totalItems}`;

  paginationButtons.innerHTML = "";

  // Page digits
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("a");
    btn.href = "#";
    btn.className = `page-link ${currentPage === i ? "active" : ""}`;
    btn.textContent = i;
    btn.onclick = (e) => {
      e.preventDefault();
      currentPage = i;
      displayInvoices();
    };
    paginationButtons.appendChild(btn);
  }

  // Next button
  if (totalPages > 1 && currentPage < totalPages) {
    const nextBtn = document.createElement("a");
    nextBtn.href = "#";
    nextBtn.className = "page-link";
    nextBtn.textContent = "Next";
    nextBtn.onclick = (e) => {
      e.preventDefault();
      currentPage++;
      displayInvoices();
    };
    paginationButtons.appendChild(nextBtn);
  }
}

// Filter Logic
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const typeValue = typeFilter.value;
  const statusValue = statusFilter.value;

  filteredInvoices = mockInvoices.filter((inv) => {
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm);
    const matchesType = typeValue === "" || inv.type === typeValue;
    const matchesStatus = statusValue === "" || inv.status === statusValue;
    return matchesSearch && matchesType && matchesStatus;
  });

  currentPage = 1;
  displayInvoices();
}

function clearFilters() {
  searchInput.value = "";
  typeFilter.value = "";
  statusFilter.value = "";
  applyFilters();
}

// Event Listeners
searchInput.addEventListener("input", applyFilters);
typeFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  displayInvoices();
});
