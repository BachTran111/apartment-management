/**
 * Apartment Contract Management System
 * Main JavaScript File
 */

class ContractManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.contracts = [];
    this.filteredContracts = [];
    this.searchTerm = ""; // Store search term
    this.statusFilter = "all"; // Store active status filter (single value)
    this.timeFilter = "all"; // Store active time filter
    this.init();
  }

  init() {
    this.loadContracts();
    this.setupEventListeners();
  }

  async loadContracts() {
    try {
      const response = await fetch("http://localhost:5000/api/contracts");
      if (!response.ok) {
        throw new Error("Failed to fetch contracts");
      }
      const result = await response.json();

      // Transform API data to UI format
      // API returns { status, message, metadata: { contracts, pagination } }
      const contracts = result.metadata?.contracts || [];
      this.contracts = contracts.map((contract) =>
        this.transformContractData(contract),
      );
      this.filteredContracts = [...this.contracts];
      this.updateStats();
      this.renderTable();
    } catch (error) {
      console.error("Error loading contracts:", error);
      this.showNotification("Lỗi tải dữ liệu hợp đồng", "danger");
      // Show empty state
      this.contracts = [];
      this.filteredContracts = [];
      this.renderTable();
    }
  }

  transformContractData(apiContract) {
    const startDate = new Date(apiContract.ngay_bat_dau);
    const endDate = new Date(apiContract.ngay_ket_thuc);
    const today = new Date();

    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    // Keep only the three real enum values from the API.
    // "Sắp hết hạn" is shown as a separate time-based filter/state, not a stored status.
    let status = apiContract.trang_thai || "active";

    if (daysRemaining < 0 && status !== "terminated") {
      status = "expired";
    }

    return {
      id: apiContract._id,
      tenant: apiContract.nguoi_thue_id?.ho_ten || "N/A",
      apartment: apiContract.phong_id?.so_phong || "N/A",
      apartmentDesc: apiContract.phong_id?.so_phong || "N/A",
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
      daysRemaining: Math.max(0, daysRemaining),
      price: this.formatPrice(apiContract.tien_dat_coc || 0),
      roomPrice: this.formatPrice(apiContract.phong_id?.gia || 0),
      status: status,
    };
  }

  formatDate(date) {
    if (!date || isNaN(date)) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price);
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.handleSearch(e));
    }

    // Filter buttons NEW
    const filterStatusBtn = document.getElementById("filterStatusBtn");
    const filterTimeBtn = document.getElementById("filterTimeBtn");
    if (filterStatusBtn) {
      filterStatusBtn.addEventListener("click", () =>
        this.showStatusFilterModal(),
      );
    }
    if (filterTimeBtn) {
      filterTimeBtn.addEventListener("click", () => this.showTimeFilterModal());
    }

    // Download button
    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => this.handleDownload());
    }

    // Modal close buttons
    document.querySelectorAll(".close-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".filter-modal").classList.remove("active");
      });
    });

    // Modal cancel buttons
    document.querySelectorAll(".btn-cancel").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".filter-modal").classList.remove("active");
      });
    });

    // Modal apply buttons
    document.querySelectorAll(".btn-apply").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".filter-modal");
        if (modal.id === "statusFilterModal") {
          this.applyStatusFilter();
        } else if (modal.id === "timeFilterModal") {
          this.applyTimeFilter();
        }
      });
    });

    // Close modal when clicking outside
    document.querySelectorAll(".filter-modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    });

    // Action buttons
    document.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("edit-btn") ||
        e.target.closest(".edit-btn")
      ) {
        this.handleEdit(e.target.closest(".edit-btn"));
      }
      if (
        e.target.classList.contains("terminate-btn") ||
        e.target.closest(".terminate-btn")
      ) {
        this.handleTerminate(e.target.closest(".terminate-btn"));
      }
      if (
        e.target.classList.contains("view-btn") ||
        e.target.closest(".view-btn")
      ) {
        this.handleView(e.target.closest(".view-btn"));
      }
    });

    // Pagination
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("page-btn")) {
        this.goToPage(parseInt(e.target.dataset.page));
      }
      if (e.target.id === "prevBtn") {
        this.previousPage();
      }
      if (e.target.id === "nextBtn") {
        this.nextPage();
      }
    });
  }

  showStatusFilterModal() {
    const modal = document.getElementById("statusFilterModal");
    // Set radio buttons based on current status filter
    document.querySelectorAll(".status-filter").forEach((radio) => {
      radio.checked = radio.value === this.statusFilter;
    });
    modal.classList.add("active");
  }

  showTimeFilterModal() {
    const modal = document.getElementById("timeFilterModal");
    // Reset radio buttons
    document.querySelectorAll(".time-filter").forEach((radio) => {
      radio.checked = radio.value === this.timeFilter;
    });
    modal.classList.add("active");
  }

  applyStatusFilter() {
    const checkedRadio = document.querySelector(".status-filter:checked");
    if (checkedRadio) {
      this.statusFilter = checkedRadio.value;
    }
    document.getElementById("statusFilterModal").classList.remove("active");
    this.currentPage = 1;
    this.applyAllFilters();
  }

  applyTimeFilter() {
    const checkedRadio = document.querySelector(".time-filter:checked");
    if (checkedRadio) {
      this.timeFilter = checkedRadio.value;
    }
    document.getElementById("timeFilterModal").classList.remove("active");
    this.currentPage = 1;
    this.applyAllFilters();
  }

  applyAllFilters() {
    // Start with all contracts
    let result = [...this.contracts];

    // Apply search filter
    if (this.searchTerm && this.searchTerm !== "") {
      result = result.filter((contract) => {
        return (
          contract.tenant.toLowerCase().includes(this.searchTerm) ||
          contract.apartment.toLowerCase().includes(this.searchTerm) ||
          contract.apartmentDesc.toLowerCase().includes(this.searchTerm)
        );
      });
    }

    // Apply status filter
    if (this.statusFilter !== "all") {
      result = result.filter(
        (contract) => contract.status === this.statusFilter,
      );
    }

    // Apply time filter
    switch (this.timeFilter) {
      case "active-only":
        result = result.filter((c) => c.status === "active");
        break;
      case "expiring-soon":
        result = result.filter((c) => {
          const remaining = Number(c.daysRemaining);
          return c.status === "active" && remaining > 0 && remaining <= 30;
        });
        break;
      case "expired":
        result = result.filter((c) => c.status === "expired");
        break;
      default:
        // all - no filtering
        break;
    }

    this.filteredContracts = result;
    this.renderTable();
    this.updateStats();
  }

  handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    // Store search term for combining with filters
    this.searchTerm = searchTerm;

    this.currentPage = 1;
    this.applyAllFilters();
  }

  handleFilter(e) {
    const filterType = e.currentTarget.textContent.trim();
    this.showNotification(`Lọc theo: ${filterType}`, "info");
  }

  handleDownload() {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "danh_sach_hop_dong.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showNotification("Xuất danh sách thành công!", "success");
  }

  generateCSV() {
    const headers = [
      "Người thuê",
      "Căn hộ",
      "Địa chỉ",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Giá thuê",
      "Trạng thái",
    ];
    const rows = this.filteredContracts.map((contract) => [
      contract.tenant,
      contract.apartment,
      contract.apartmentDesc,
      contract.startDate,
      contract.endDate,
      contract.price,
      this.getStatusLabel(contract.status),
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    return csv;
  }

  handleEdit(btn) {
    const contractId = btn?.dataset?.contractId;

    if (!contractId) {
      this.showNotification(
        "Không xác định được hợp đồng cần chỉnh sửa",
        "danger",
      );
      return;
    }

    const editUrl = new URL("./ContractEdit.html", window.location.href);
    editUrl.searchParams.set("id", contractId);
    window.location.href = editUrl.toString();
  }

  handleView(btn) {
    const contractId = btn?.dataset?.contractId;

    if (!contractId) {
      this.showNotification("Không xác định được hợp đồng cần xem", "danger");
      return;
    }

    const detailUrl = new URL("./ContractDetail.html", window.location.href);
    detailUrl.searchParams.set("id", contractId);
    window.location.href = detailUrl.toString();
  }

  handleTerminate(btn) {
    const contractId = btn?.dataset?.contractId;

    if (!contractId) {
      this.showNotification(
        "Không xác định được hợp đồng cần thanh lý",
        "danger",
      );
      return;
    }

    const terminateUrl = new URL(
      "./ContractTerminate.html",
      window.location.href,
    );
    terminateUrl.searchParams.set("id", contractId);
    window.location.href = terminateUrl.toString();
  }

  renderTable() {
    const tableBody = document.getElementById("contractTableBody");
    if (!tableBody) return;

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageData = this.filteredContracts.slice(start, end);

    if (pageData.length === 0) {
      tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 60px 20px;">
                        <div class="empty-state">
                            <div class="empty-state-icon">📋</div>
                            <h3>Không tìm thấy hợp đồng</h3>
                            <p>Thử thay đổi điều kiện tìm kiếm của bạn</p>
                        </div>
                    </td>
                </tr>
            `;
      return;
    }

    tableBody.innerHTML = pageData
      .map(
        (contract) => `
            <tr>
                <td>
                    <span class="tenant-name">${contract.tenant}</span>
                </td>
                <td>
                    <div class="apartment-info">
                        <span class="apartment-code">Căn hộ ${contract.apartment}</span>
                        <span class="apartment-desc">Giá phòng: ${contract.roomPrice}đ/tháng</span>
                    </div>
                </td>
                <td>
                    <div class="date-range">${contract.startDate} - ${contract.endDate}</div>
                    <div class="time-remaining">Còn ${contract.daysRemaining} ngày</div>
                </td>
                <td>
                    <div class="price">${contract.price}đ</div>
                </td>
                <td>
                    <span class="badge badge-${contract.status}">
                        ${this.getStatusLabel(contract.status)}
                    </span>
                </td>
                <td>
                  <div class="actions">
                    <button class="action-btn edit-btn" title="Chỉnh sửa" data-contract-id="${contract.id}"><i class="fas fa-pen"></i></button>
                    <button class="action-btn view-btn" title="Xem chi tiết" data-contract-id="${contract.id}"><i class="fas fa-eye"></i></button>
                      <button class="action-btn terminate-btn" title="Thanh lý" data-contract-id="${contract.id}"><i class="fas fa-balance-scale-right"></i></button>
                  </div>
                </td>
            </tr>
        `,
      )
      .join("");

    this.updatePagination();
  }

  getStatusLabel(status) {
    const labels = {
      active: "Đang hoạt động",
      expired: "Hết hạn",
      terminated: "Đã thanh lý",
    };
    return labels[status] || "Không xác định";
  }

  updatePagination() {
    const totalPages = Math.ceil(
      this.filteredContracts.length / this.itemsPerPage,
    );
    const paginationContainer = document.getElementById("paginationContainer");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const paginationInfo = document.getElementById("paginationInfo");

    if (!paginationContainer) return;

    // Update info
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredContracts.length,
    );
    if (paginationInfo) {
      paginationInfo.textContent = `Hiển thị ${start} đến ${end} trong số ${this.filteredContracts.length} hợp đồng`;
    }

    // Update buttons state
    if (prevBtn) prevBtn.disabled = this.currentPage === 1;
    if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;

    // Update page numbers
    let paginationHTML = `<button class="pagination-btn" id="prevBtn"><i class="fas fa-chevron-left"></i></button>`;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
                    <button class="pagination-number page-btn ${i === this.currentPage ? "active" : ""}" 
                            data-page="${i}">${i}</button>
                `;
      }
    } else {
      for (let i = 1; i <= 3; i++) {
        paginationHTML += `
                    <button class="pagination-number page-btn ${i === this.currentPage ? "active" : ""}" 
                            data-page="${i}">${i}</button>
                `;
      }
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      for (let i = totalPages - 2; i <= totalPages; i++) {
        paginationHTML += `
                    <button class="pagination-number page-btn ${i === this.currentPage ? "active" : ""}" 
                            data-page="${i}">${i}</button>
                `;
      }
    }

    paginationHTML += `<button class="pagination-btn" id="nextBtn"><i class="fas fa-chevron-right"></i></button>`;
    paginationContainer.innerHTML = paginationHTML;

    // Re-attach event listeners
    this.setupEventListeners();
  }

  goToPage(page) {
    const totalPages = Math.ceil(
      this.filteredContracts.length / this.itemsPerPage,
    );
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.renderTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  nextPage() {
    const totalPages = Math.ceil(
      this.filteredContracts.length / this.itemsPerPage,
    );
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.renderTable();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  updateStats() {
    const activeCount = this.filteredContracts.filter(
      (c) => c.status === "active",
    ).length;
    const expiringCount = this.filteredContracts.filter((c) => {
      const remainingDays = Number(c.daysRemaining);
      return c.status === "active" && remainingDays > 0 && remainingDays <= 30;
    }).length;
    const expiredCount = this.filteredContracts.filter(
      (c) => c.status === "expired",
    ).length;

    const activeEl = document.getElementById("statActive");
    const expiringEl = document.getElementById("statExpiring");
    const expiredEl = document.getElementById("statPending"); // Use statPending element for expired count

    if (activeEl) activeEl.textContent = activeCount;
    if (expiringEl) expiringEl.textContent = expiringCount;
    if (expiredEl) expiredEl.textContent = expiredCount;
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            background: ${type === "success" ? "#51cf66" : type === "danger" ? "#ff3b30" : "#339af0"};
            color: white;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize on DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  new ContractManager();
});

// Add slide animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
