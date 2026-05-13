const body = document.body;
const params = new URLSearchParams(window.location.search);

const contractTitle = document.getElementById("contractTitle");
const contractNote = document.getElementById("contractNote");
const contractStatus = document.getElementById("contractStatus");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const daysRemaining = document.getElementById("daysRemaining");
const summaryGrid = document.getElementById("summaryGrid");
const contractInfo = document.getElementById("contractInfo");
const tenantInfo = document.getElementById("tenantInfo");
const roomInfo = document.getElementById("roomInfo");
const extraInfo = document.getElementById("extraInfo");
const editContractLink = document.getElementById("editContractLink");
const terminateContractLink = document.getElementById("terminateContractLink");
const editCard = document.getElementById("editCard");
const editBadge = document.getElementById("editBadge");
const editForm = document.getElementById("editForm");
const editTenantSelect = document.getElementById("edit_tenant_id");
const editApartmentSelect = document.getElementById("edit_apartment_id");
const editRoomSelect = document.getElementById("edit_room_id");
const editStartDateInput = document.getElementById("edit_start_date");
const editEndDateInput = document.getElementById("edit_end_date");
const editDepositInput = document.getElementById("edit_deposit");
const editStatusSelect = document.getElementById("edit_status");
const editNoteInput = document.getElementById("edit_note");
const editNote = document.getElementById("editNote");
const editFormMessage = document.getElementById("editFormMessage");
const reloadEditButton = document.getElementById("reloadEditButton");
const saveButton = document.getElementById("saveButton");
const terminationCard = document.getElementById("terminationCard");
const terminationBadge = document.getElementById("terminationBadge");
const terminationSummary = document.getElementById("terminationSummary");
const terminationForm = document.getElementById("terminationForm");
const ngayThanhLyInput = document.getElementById("ngay_thanh_ly");
const chiPhiInput = document.getElementById("chi_phi_phat_sinh");
const ghiChuInput = document.getElementById("ghi_chu_thanh_ly");
const terminateButton = document.getElementById("terminateButton");
const fillTodayButton = document.getElementById("fillTodayButton");
const terminationNote = document.getElementById("terminationNote");
const errorPanel = document.getElementById("errorPanel");
const errorMessage = document.getElementById("errorMessage");
const refreshButton = document.getElementById("refreshButton");

const contractId = (params.get("id") || body.dataset.contractId || "").trim();
const apiBase = resolveApiBase();
let currentContract = null;
let tenantsLoaded = false;
let apartmentsLoaded = false;

if (refreshButton) {
  refreshButton.addEventListener("click", () => loadContract());
}
if (reloadEditButton) {
  reloadEditButton.addEventListener("click", () => syncEditFormFromContract());
}
if (editApartmentSelect) {
  editApartmentSelect.addEventListener("change", handleApartmentChange);
}
if (editForm) {
  editForm.addEventListener("submit", handleEditSubmit);
}
if (fillTodayButton) {
  fillTodayButton.addEventListener("click", fillTodayDate);
}
if (terminationForm) {
  terminationForm.addEventListener("submit", handleTerminateSubmit);
}
loadEditOptions();
loadContract();

async function loadContract() {
  if (!contractId) {
    renderError("Thiếu id hợp đồng trên URL.");
    return;
  }

  setLoadingState(true);
  hideError();

  try {
    const response = await fetch(
      `${apiBase}/contracts/${encodeURIComponent(contractId)}`,
      {
        headers: { Accept: "application/json" },
      },
    );
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload?.message || "Không thể tải chi tiết hợp đồng");
    }

    currentContract = payload?.metadata || payload?.data || payload || {};
    updateActionLinks(currentContract._id);
    renderContract(currentContract);
  } catch (error) {
    renderError(error.message || "Không thể tải chi tiết hợp đồng.");
  } finally {
    setLoadingState(false);
  }
}

function renderContract(contract) {
  const start = formatDate(contract.ngay_bat_dau);
  const end = formatDate(contract.ngay_ket_thuc);
  const status = normalizeStatus(contract.trang_thai, contract.ngay_ket_thuc);
  const remainingDays = calculateRemainingDays(contract.ngay_ket_thuc);
  const tenant = contract.nguoi_thue_id || {};
  const room = contract.phong_id || {};

  document.title =
    `Chi tiết hợp đồng ${room.so_phong ? `- Phòng ${room.so_phong}` : ""}`.trim();
  contractTitle.textContent = room.so_phong
    ? `Hợp đồng phòng ${room.so_phong}`
    : "Chi tiết hợp đồng";
  contractNote.textContent = tenant.ho_ten
    ? `Khách thuê: ${tenant.ho_ten}`
    : "Dữ liệu hợp đồng đã được tải từ API.";

  contractStatus.textContent = status.label;
  contractStatus.className = `status-value ${status.kind}`;
  startDate.textContent = start;
  endDate.textContent = end;
  daysRemaining.textContent = remainingDays;

  summaryGrid.innerHTML = [
    buildSummaryCard("Người thuê", tenant.ho_ten || "Chưa có"),
    buildSummaryCard("Số phòng", room.so_phong || "Chưa có"),
    buildSummaryCard("Tiền đặt cọc", formatCurrency(contract.tien_dat_coc)),
    buildSummaryCard(
      "Phí phát sinh",
      formatCurrency(contract.chi_phi_phat_sinh || 0),
    ),
  ].join("");

  contractInfo.innerHTML = buildFields([
    { label: "Mã hợp đồng", value: contract._id || "Chưa có" },
    { label: "Ngày bắt đầu", value: start },
    { label: "Ngày kết thúc", value: end },
    { label: "Trạng thái", value: status.label },
    { label: "Tiền đặt cọc", value: formatCurrency(contract.tien_dat_coc) },
    { label: "Ngày thanh lý", value: formatDate(contract.ngay_thanh_ly) },
  ]);

  tenantInfo.innerHTML = buildFields([
    { label: "Họ và tên", value: tenant.ho_ten || "Chưa có" },
    { label: "Số điện thoại", value: tenant.so_dien_thoai || "Chưa có" },
    { label: "Email", value: tenant.email || "Chưa có" },
    { label: "CMND/CCCD", value: tenant.cccd || tenant.cmnd || "Chưa có" },
  ]);

  roomInfo.innerHTML = buildFields([
    { label: "Số phòng", value: room.so_phong || "Chưa có" },
    { label: "Giá phòng", value: formatCurrency(room.gia) },
    {
      label: "Diện tích",
      value: room.dien_tich ? `${room.dien_tich} m²` : "Chưa có",
    },
    { label: "Tình trạng", value: room.trang_thai || "Chưa có" },
  ]);

  extraInfo.innerHTML = [
    buildExtraRow(
      "Chi phí phát sinh",
      formatCurrency(contract.chi_phi_phat_sinh || 0),
    ),
    buildExtraRow("Ghi chú", contract.ghi_chu || "Không có ghi chú"),
    buildExtraRow("Còn lại", remainingDays),
  ].join("");

  renderEditState(contract, status);
  renderTerminationState(contract, status, start, end);
}

async function loadEditOptions() {
  if (!editForm || !editCard) {
    return;
  }

  try {
    await Promise.all([loadTenants(), loadApartments()]);
  } catch (error) {
    renderEditMessage(
      error.message || "Không thể tải dữ liệu chỉnh sửa.",
      "error",
    );
  }
}

function buildSummaryCard(label, value) {
  return `
    <article class="summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `;
}

function buildFields(items) {
  return items
    .map(
      (item) => `
        <div class="field-row">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </div>
      `,
    )
    .join("");
}

function buildExtraRow(label, value) {
  return `
    <div class="extra-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function normalizeStatus(status, endDateValue) {
  const now = new Date();
  const endDate = new Date(endDateValue);

  if (status === "terminated") {
    return { label: "Đã thanh lý", kind: "terminated" };
  }

  if (!isNaN(endDate) && endDate < now) {
    return { label: "Đã hết hạn", kind: "expired" };
  }

  if (!isNaN(endDate)) {
    const remaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    if (remaining <= 30) {
      return { label: "Sắp hết hạn", kind: "expiring" };
    }
  }

  return { label: "Đang hoạt động", kind: "active" };
}

function calculateRemainingDays(endDateValue) {
  const endDate = new Date(endDateValue);
  if (isNaN(endDate)) {
    return "Chưa xác định";
  }

  const diff = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) {
    return "Đã hết hạn";
  }

  return `${diff} ngày`;
}

function formatDate(value) {
  if (!value) return "Chưa có";

  const date = new Date(value);
  if (isNaN(date)) return "Chưa có";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "Chưa có";
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return "Chưa có";
  }

  return `${new Intl.NumberFormat("vi-VN").format(numberValue)} đ`;
}

async function loadTenants() {
  if (!editTenantSelect) {
    return;
  }

  const payload = await fetchJson(`${apiBase}/tenants?skip=0&limit=200`);
  const tenants = extractList(payload, ["tenants"]);

  tenantsLoaded = true;
  renderSelect(
    editTenantSelect,
    tenants,
    (tenant) => ({
      value: tenant._id,
      label: `${tenant.ho_ten || "Chưa có tên"}${tenant.so_dien_thoai ? ` - ${tenant.so_dien_thoai}` : ""}`,
    }),
    "Chọn người thuê",
  );
  syncEditFormFromContract();
}

async function loadApartments() {
  if (!editApartmentSelect) {
    return;
  }

  const payload = await fetchJson(`${apiBase}/apartments?skip=0&limit=200`);
  const apartments = extractList(payload);

  apartmentsLoaded = true;
  renderSelect(
    editApartmentSelect,
    apartments,
    (apartment) => ({
      value: apartment._id,
      label: `${apartment.ten || "Căn hộ"}${apartment.dia_chi ? ` - ${apartment.dia_chi}` : ""}`,
    }),
    "Chọn căn hộ",
  );
  syncEditFormFromContract();
}

async function handleApartmentChange() {
  if (!editApartmentSelect) {
    return;
  }

  const apartmentId = editApartmentSelect.value;
  await loadRooms(apartmentId);
}

async function loadRooms(apartmentId) {
  if (!editRoomSelect) {
    return;
  }

  if (!apartmentId) {
    resetRoomSelect("Chọn căn hộ trước");
    return;
  }

  editRoomSelect.disabled = true;
  editRoomSelect.innerHTML = '<option value="">Đang tải phòng...</option>';

  try {
    const payload = await fetchJson(
      `${apiBase}/rooms/apartment/${encodeURIComponent(apartmentId)}?skip=0&limit=200`,
    );
    const rooms = extractList(payload);

    renderSelect(
      editRoomSelect,
      rooms,
      (room) => ({
        value: room._id,
        label: `${room.so_phong || "Phòng"}${room.trang_thai ? ` - ${room.trang_thai}` : ""}`,
      }),
      rooms.length ? "Chọn phòng" : "Không có phòng nào",
    );

    editRoomSelect.disabled = rooms.length === 0;
    if (currentContract) {
      const currentRoomId = getObjectId(currentContract.phong_id);
      editRoomSelect.value = currentRoomId || "";
    }
  } catch (error) {
    resetRoomSelect("Không tải được phòng");
    renderEditMessage(
      error.message || "Không thể tải danh sách phòng.",
      "error",
    );
  }
}

function resetRoomSelect(placeholder) {
  if (!editRoomSelect) {
    return;
  }

  editRoomSelect.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
  editRoomSelect.disabled = true;
}

function renderSelect(selectEl, items, mapItem, placeholder) {
  if (!selectEl) {
    return;
  }

  const options = [`<option value="">${escapeHtml(placeholder)}</option>`];

  for (const item of items || []) {
    const mapped = mapItem(item);
    if (!mapped?.value) continue;
    options.push(
      `<option value="${escapeHtml(mapped.value)}">${escapeHtml(mapped.label || mapped.value)}</option>`,
    );
  }

  selectEl.innerHTML = options.join("");
}

function extractList(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  const metadata = payload?.metadata;
  if (Array.isArray(metadata)) return metadata;

  if (metadata && typeof metadata === "object") {
    for (const key of keys) {
      if (Array.isArray(metadata[key])) return metadata[key];
    }

    for (const value of Object.values(metadata)) {
      if (Array.isArray(value)) return value;
    }
  }

  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}

function resolveApiBase() {
  if (body.dataset.apiBase) {
    return body.dataset.apiBase.replace(/\/$/, "");
  }

  if (window.location.origin && window.location.origin !== "null") {
    return `${window.location.origin}/api`;
  }

  return "http://localhost:5000/api";
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  return parseJsonResponse(response);
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };

    function renderEditState(contract, status) {
      if (
        !editCard ||
        !editBadge ||
        !editNote ||
        !editTenantSelect ||
        !editApartmentSelect ||
        !editRoomSelect ||
        !editStartDateInput ||
        !editEndDateInput ||
        !editDepositInput ||
        !editStatusSelect ||
        !editNoteInput ||
        !saveButton ||
        !reloadEditButton
      ) {
        return;
      }

      const isTerminated = status.kind === "terminated";
      const apartmentId = getObjectId(contract.phong_id?.can_ho_id);
      const roomId = getObjectId(contract.phong_id);
      const tenantId = getObjectId(contract.nguoi_thue_id);

      editBadge.textContent = isTerminated ? "Đã thanh lý" : "Có thể chỉnh sửa";
      editBadge.className = `edit-badge ${status.kind}`;
      editNote.textContent = isTerminated
        ? "Hợp đồng đã thanh lý nên chỉ có thể xem, không thể sửa thêm."
        : "Thay đổi sẽ được gửi qua PUT /api/contracts/:id.";

      editStartDateInput.value = toDateInputValue(contract.ngay_bat_dau);
      editEndDateInput.value = toDateInputValue(contract.ngay_ket_thuc);
      editDepositInput.value = contract.tien_dat_coc ?? 0;
      editStatusSelect.value = contract.trang_thai || "active";
      editNoteInput.value = contract.ghi_chu || "";

      if (tenantsLoaded) {
        editTenantSelect.value = tenantId || "";
      }

      if (apartmentsLoaded) {
        editApartmentSelect.value = apartmentId || "";
        if (apartmentId) {
          loadRooms(apartmentId).catch(() => {});
        } else {
          resetRoomSelect("Chọn căn hộ trước");
        }
      }

      editTenantSelect.disabled = isTerminated;
      editApartmentSelect.disabled = isTerminated;
      editRoomSelect.disabled = isTerminated || editRoomSelect.disabled;
      editStartDateInput.disabled = isTerminated;
      editEndDateInput.disabled = isTerminated;
      editDepositInput.disabled = isTerminated;
      editStatusSelect.disabled = isTerminated;
      editNoteInput.disabled = isTerminated;
      saveButton.disabled = isTerminated;
      reloadEditButton.disabled = isTerminated;
    }

    function syncEditFormFromContract() {
      if (!currentContract || !editCard) {
        return;
      }

      renderEditState(
        currentContract,
        normalizeStatus(
          currentContract.trang_thai,
          currentContract.ngay_ket_thuc,
        ),
      );
    }

    async function handleEditSubmit(event) {
      event.preventDefault();

      if (!currentContract?._id || !editForm) {
        renderEditMessage("Thiếu thông tin hợp đồng để cập nhật.", "error");
        return;
      }

      const payload = {
        nguoi_thue_id: editTenantSelect.value.trim(),
        phong_id: editRoomSelect.value.trim(),
        ngay_bat_dau: editStartDateInput.value,
        ngay_ket_thuc: editEndDateInput.value,
        tien_dat_coc: Number(editDepositInput.value),
        trang_thai: editStatusSelect.value || "active",
        ghi_chu: editNoteInput.value.trim(),
      };

      if (!payload.nguoi_thue_id || !payload.phong_id) {
        renderEditMessage(
          "Vui lòng chọn người thuê, căn hộ và phòng.",
          "error",
        );
        return;
      }

      if (!payload.ngay_bat_dau || !payload.ngay_ket_thuc) {
        renderEditMessage(
          "Vui lòng nhập ngày bắt đầu và ngày kết thúc.",
          "error",
        );
        return;
      }

      if (Number.isNaN(payload.tien_dat_coc) || payload.tien_dat_coc < 0) {
        renderEditMessage(
          "Tiền đặt cọc phải là số lớn hơn hoặc bằng 0.",
          "error",
        );
        return;
      }

      if (payload.ngay_bat_dau >= payload.ngay_ket_thuc) {
        renderEditMessage("Ngày bắt đầu phải nhỏ hơn ngày kết thúc.", "error");
        return;
      }

      try {
        setEditBusy(true);
        renderEditMessage("Đang lưu thay đổi...", "info");

        const response = await fetch(
          `${apiBase}/contracts/${encodeURIComponent(currentContract._id)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              ...payload,
              ghi_chu: payload.ghi_chu || undefined,
            }),
          },
        );

        const result = await parseJsonResponse(response);

        if (!response.ok) {
          throw new Error(result?.message || "Không thể cập nhật hợp đồng");
        }

        currentContract = result?.metadata || currentContract;
        renderContract(currentContract);
        renderEditMessage(
          result?.message || "Cập nhật hợp đồng thành công.",
          "success",
        );
        hideError();
      } catch (error) {
        renderEditMessage(
          error.message || "Không thể cập nhật hợp đồng.",
          "error",
        );
      } finally {
        setEditBusy(false);
      }
    }

    function setEditBusy(isBusy) {
      if (
        !saveButton ||
        !reloadEditButton ||
        !editTenantSelect ||
        !editApartmentSelect ||
        !editRoomSelect ||
        !editStartDateInput ||
        !editEndDateInput ||
        !editDepositInput ||
        !editStatusSelect ||
        !editNoteInput
      ) {
        return;
      }

      saveButton.textContent = isBusy ? "Đang lưu..." : "Lưu thay đổi";

      if (isBusy) {
        saveButton.disabled = true;
        reloadEditButton.disabled = true;
        editTenantSelect.disabled = true;
        editApartmentSelect.disabled = true;
        editRoomSelect.disabled = true;
        editStartDateInput.disabled = true;
        editEndDateInput.disabled = true;
        editDepositInput.disabled = true;
        editStatusSelect.disabled = true;
        editNoteInput.disabled = true;
        return;
      }

      const isTerminated =
        normalizeStatus(
          currentContract?.trang_thai,
          currentContract?.ngay_ket_thuc,
        ).kind === "terminated";

      saveButton.disabled = isTerminated;
      reloadEditButton.disabled = isTerminated;
      editTenantSelect.disabled = isTerminated;
      editApartmentSelect.disabled = isTerminated;
      editRoomSelect.disabled =
        isTerminated || editRoomSelect.options.length <= 1;
      editStartDateInput.disabled = isTerminated;
      editEndDateInput.disabled = isTerminated;
      editDepositInput.disabled = isTerminated;
      editStatusSelect.disabled = isTerminated;
      editNoteInput.disabled = isTerminated;
    }

    function renderEditMessage(message, type = "info") {
      if (!editFormMessage) return;

      const colors = {
        success: "#176b45",
        error: "#9b1c31",
        info: "#475467",
      };

      editFormMessage.textContent = message;
      editFormMessage.style.color = colors[type] || colors.info;
      editFormMessage.style.fontWeight = "600";
      editFormMessage.style.marginTop = "6px";
    }

    function getObjectId(value) {
      if (!value) return "";
      if (typeof value === "string") return value;
      if (typeof value === "object" && value._id) return value._id;
      return String(value);
    }
  }
}

function setLoadingState(isLoading) {
  if (!refreshButton) return;

  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading ? "Đang tải..." : "Làm mới";
}

function updateActionLinks(contractId) {
  if (!contractId) return;

  if (editContractLink) {
    const editUrl = new URL("./ContractEdit.html", window.location.href);
    editUrl.searchParams.set("id", contractId);
    editContractLink.href = editUrl.toString();
  }

  if (terminateContractLink) {
    const terminateUrl = new URL(
      "./ContractTerminate.html",
      window.location.href,
    );
    terminateUrl.searchParams.set("id", contractId);
    terminateContractLink.href = terminateUrl.toString();
  }
}

function renderTerminationState(contract, status, start, end) {
  if (
    !terminationCard ||
    !terminationBadge ||
    !terminationSummary ||
    !terminationForm ||
    !ngayThanhLyInput ||
    !chiPhiInput ||
    !ghiChuInput ||
    !terminateButton ||
    !fillTodayButton ||
    !terminationNote
  ) {
    return;
  }

  const isTerminated = status.kind === "terminated";
  const startDateValue = toDateInputValue(contract.ngay_bat_dau);
  const endDateValue = toDateInputValue(contract.ngay_ket_thuc);
  const defaultTerminationDate = toDateInputValue(new Date());

  terminationBadge.textContent = isTerminated
    ? "Đã thanh lý"
    : "Sẵn sàng xử lý";
  terminationBadge.className = `termination-badge ${status.kind}`;
  terminationSummary.innerHTML = [
    buildSummaryLine("Trạng thái hiện tại", status.label),
    buildSummaryLine("Bắt đầu", start),
    buildSummaryLine("Kết thúc", end),
    buildSummaryLine(
      "Khuyến nghị",
      isTerminated ? "Không thể thanh lý lại" : "Kiểm tra trước khi gửi",
    ),
  ].join("");

  ngayThanhLyInput.min = startDateValue;
  ngayThanhLyInput.max = endDateValue;
  if (!ngayThanhLyInput.value) {
    ngayThanhLyInput.value = defaultTerminationDate;
  }

  chiPhiInput.value = contract.chi_phi_phat_sinh ?? 0;
  ghiChuInput.value = contract.ghi_chu || "";

  terminationForm
    .querySelectorAll("input, textarea, button")
    .forEach((element) => {
      if (element === fillTodayButton) return;
      element.disabled = isTerminated;
    });

  fillTodayButton.disabled = isTerminated;
  terminateButton.textContent = isTerminated
    ? "Đã thanh lý"
    : "Thanh lý hợp đồng";
  terminationNote.textContent = isTerminated
    ? "Hợp đồng này đã được thanh lý, bạn chỉ có thể xem thông tin lịch sử."
    : "Hành động này sẽ gửi yêu cầu cập nhật trạng thái hợp đồng lên API.";
}

function buildSummaryLine(label, value) {
  return `
    <div class="termination-line">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function toDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date)) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fillTodayDate() {
  if (!ngayThanhLyInput) {
    return;
  }

  ngayThanhLyInput.value = toDateInputValue(new Date());
}

async function handleTerminateSubmit(event) {
  event.preventDefault();

  if (!currentContract?._id || !terminationForm) {
    renderError("Thiếu thông tin hợp đồng để thanh lý.");
    return;
  }

  const ngayThanhLy = ngayThanhLyInput.value;
  const chiPhiPhatSinh = Number(chiPhiInput.value);
  const ghiChu = ghiChuInput.value.trim();

  if (!ngayThanhLy) {
    renderError("Vui lòng chọn ngày thanh lý.");
    return;
  }

  if (Number.isNaN(chiPhiPhatSinh) || chiPhiPhatSinh < 0) {
    renderError("Chi phí phát sinh phải là số lớn hơn hoặc bằng 0.");
    return;
  }

  const startDateValue = new Date(currentContract.ngay_bat_dau);
  const endDateValue = new Date(currentContract.ngay_ket_thuc);
  const terminationDateValue = new Date(ngayThanhLy);

  if (
    isNaN(startDateValue) ||
    isNaN(endDateValue) ||
    isNaN(terminationDateValue) ||
    terminationDateValue < startDateValue ||
    terminationDateValue > endDateValue
  ) {
    renderError(
      "Ngày thanh lý phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc.",
    );
    return;
  }

  setTerminationBusy(true);

  try {
    const response = await fetch(
      `${apiBase}/contracts/${encodeURIComponent(currentContract._id)}/terminate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ngay_thanh_ly: ngayThanhLy,
          chi_phi_phat_sinh: chiPhiPhatSinh,
          ghi_chu: ghiChu || undefined,
        }),
      },
    );

    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload?.message || "Không thể thanh lý hợp đồng");
    }

    currentContract = payload?.metadata || currentContract;
    renderContract(currentContract);
    terminationNote.textContent =
      payload?.message || "Thanh lý hợp đồng thành công.";
    contractNote.textContent =
      payload?.message || "Thanh lý hợp đồng thành công.";
    hideError();
  } catch (error) {
    renderError(error.message || "Không thể thanh lý hợp đồng.");
  } finally {
    setTerminationBusy(false);
  }
}

function setTerminationBusy(isBusy) {
  if (
    !terminateButton ||
    !fillTodayButton ||
    !ngayThanhLyInput ||
    !chiPhiInput ||
    !ghiChuInput
  ) {
    return;
  }

  terminateButton.disabled = isBusy;
  fillTodayButton.disabled = isBusy || terminateButton.disabled;
  ngayThanhLyInput.disabled = isBusy || terminateButton.disabled;
  chiPhiInput.disabled = isBusy || terminateButton.disabled;
  ghiChuInput.disabled = isBusy || terminateButton.disabled;
  terminateButton.textContent = isBusy
    ? "Đang thanh lý..."
    : "Thanh lý hợp đồng";
}

function renderError(message) {
  if (errorMessage && errorPanel) {
    errorMessage.textContent = message;
    errorPanel.hidden = false;
  }

  if (contractNote) {
    contractNote.textContent = message;
  }
}

function hideError() {
  if (errorPanel) {
    errorPanel.hidden = true;
  }

  if (errorMessage) {
    errorMessage.textContent = "";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
