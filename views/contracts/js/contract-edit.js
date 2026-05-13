document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const contractId = (params.get("id") || "").trim();

  const form = document.getElementById("editForm");
  const messageEl = document.getElementById("editFormMessage");
  const pageTitle = document.getElementById("pageTitle");
  const pageNote = document.getElementById("pageNote");
  const backLink = document.getElementById("backLink");
  const cancelLink = document.getElementById("cancelLink");
  const saveButton = document.getElementById("saveButton");
  const tenantSelect = document.getElementById("edit_tenant_id");
  const apartmentSelect = document.getElementById("edit_apartment_id");
  const roomSelect = document.getElementById("edit_room_id");
  const startDateInput = document.getElementById("edit_start_date");
  const endDateInput = document.getElementById("edit_end_date");
  const depositInput = document.getElementById("edit_deposit");
  const statusSelect = document.getElementById("edit_status");
  const noteInput = document.getElementById("edit_note");

  if (
    !form ||
    !messageEl ||
    !tenantSelect ||
    !apartmentSelect ||
    !roomSelect ||
    !startDateInput ||
    !endDateInput ||
    !depositInput ||
    !statusSelect ||
    !noteInput
  ) {
    return;
  }

  const apiBase = resolveApiBase();
  let currentContract = null;

  form.addEventListener("submit", handleSubmit);
  apartmentSelect.addEventListener("change", handleApartmentChange);

  if (!contractId) {
    setMessage("Thiếu id hợp đồng trên URL.", "error");
    setBusy(true);
    return;
  }

  updateNavigationLinks(contractId);
  loadFormData();

  function resolveApiBase() {
    if (window.location.origin && window.location.origin !== "null") {
      return `${window.location.origin}/api`;
    }

    return "http://localhost:5000/api";
  }

  async function loadFormData() {
    try {
      setMessage("Đang tải dữ liệu hợp đồng...", "info");
      const [contract] = await Promise.all([
        fetchContract(),
        loadTenants(),
        loadApartments(),
      ]);

      currentContract = contract;
      renderContract(contract);
      setMessage("Sẵn sàng chỉnh sửa hợp đồng.", "success");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Không thể tải dữ liệu hợp đồng.", "error");
      setBusy(true);
    }
  }

  async function fetchContract() {
    const response = await fetch(
      `${apiBase}/contracts/${encodeURIComponent(contractId)}`,
      { headers: { Accept: "application/json" } },
    );
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(payload?.message || "Không thể tải chi tiết hợp đồng");
    }

    return payload?.metadata || payload?.data || payload || {};
  }

  async function loadTenants() {
    const payload = await fetchJson(`${apiBase}/tenants?skip=0&limit=200`);
    const tenants = extractList(payload, ["tenants"]);

    renderSelect(
      tenantSelect,
      tenants,
      (tenant) => ({
        value: tenant._id,
        label: `${tenant.ho_ten || "Chưa có tên"}${tenant.so_dien_thoai ? ` - ${tenant.so_dien_thoai}` : ""}`,
      }),
      "Chọn người thuê",
    );
  }

  async function loadApartments() {
    const payload = await fetchJson(`${apiBase}/apartments?skip=0&limit=200`);
    const apartments = extractList(payload);

    renderSelect(
      apartmentSelect,
      apartments,
      (apartment) => ({
        value: apartment._id,
        label: `${apartment.ten || "Căn hộ"}${apartment.dia_chi ? ` - ${apartment.dia_chi}` : ""}`,
      }),
      "Chọn căn hộ",
    );
  }

  async function handleApartmentChange() {
    await loadRooms(apartmentSelect.value.trim());
  }

  async function loadRooms(apartmentId) {
    if (!apartmentId) {
      resetRoomSelect("Chọn căn hộ trước");
      return;
    }

    roomSelect.disabled = true;
    roomSelect.innerHTML = '<option value="">Đang tải phòng...</option>';

    try {
      const payload = await fetchJson(
        `${apiBase}/rooms/apartment/${encodeURIComponent(apartmentId)}?skip=0&limit=200`,
      );
      const rooms = extractList(payload);

      renderSelect(
        roomSelect,
        rooms,
        (room) => ({
          value: room._id,
          label: `${room.so_phong || "Phòng"}${room.trang_thai ? ` - ${room.trang_thai}` : ""}`,
        }),
        rooms.length ? "Chọn phòng" : "Không có phòng nào",
      );

      roomSelect.disabled = rooms.length === 0;
      if (currentContract) {
        roomSelect.value = getObjectId(currentContract.phong_id) || "";
      }
    } catch (error) {
      resetRoomSelect("Không tải được phòng");
      setMessage(error.message || "Không thể tải danh sách phòng.", "error");
    }
  }

  function renderContract(contract) {
    const tenantId = getObjectId(contract.nguoi_thue_id);
    const apartmentId = getObjectId(contract.phong_id?.can_ho_id);
    const roomId = getObjectId(contract.phong_id);
    const roomName =
      contract.phong_id?.so_phong || contract.phong_id?.ten_phong || "";
    const tenantName = contract.nguoi_thue_id?.ho_ten || "";

    pageTitle.textContent = `Chỉnh sửa hợp đồng${roomName ? ` - Phòng ${roomName}` : ""}`;
    pageNote.textContent = tenantName
      ? `Chỉnh sửa hợp đồng của ${tenantName}.`
      : "Cập nhật thông tin hợp đồng và lưu thay đổi qua API.";

    tenantSelect.value = tenantId || "";
    apartmentSelect.value = apartmentId || "";
    startDateInput.value = toDateInputValue(contract.ngay_bat_dau);
    endDateInput.value = toDateInputValue(contract.ngay_ket_thuc);
    depositInput.value = contract.tien_dat_coc ?? 0;
    statusSelect.value = contract.trang_thai || "active";
    noteInput.value = contract.ghi_chu || "";

    if (apartmentId) {
      loadRooms(apartmentId).catch(() => {});
    } else {
      resetRoomSelect("Chọn căn hộ trước");
    }

    const roomSelectValue = roomId || getObjectId(contract.phong_id);
    if (roomSelectValue) {
      roomSelect.value = roomSelectValue;
    }

    setBusy(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!currentContract?._id) {
      setMessage("Thiếu thông tin hợp đồng để cập nhật.", "error");
      return;
    }

    const payload = {
      nguoi_thue_id: tenantSelect.value.trim(),
      phong_id: roomSelect.value.trim(),
      ngay_bat_dau: startDateInput.value,
      ngay_ket_thuc: endDateInput.value,
      tien_dat_coc: Number(depositInput.value),
      trang_thai: statusSelect.value || "active",
      ghi_chu: noteInput.value.trim(),
    };

    if (!payload.nguoi_thue_id || !payload.phong_id) {
      setMessage("Vui lòng chọn người thuê và phòng.", "error");
      return;
    }

    if (!payload.ngay_bat_dau || !payload.ngay_ket_thuc) {
      setMessage("Vui lòng nhập ngày bắt đầu và ngày kết thúc.", "error");
      return;
    }

    if (Number.isNaN(payload.tien_dat_coc) || payload.tien_dat_coc < 0) {
      setMessage("Tiền đặt cọc phải là số lớn hơn hoặc bằng 0.", "error");
      return;
    }

    if (payload.ngay_bat_dau >= payload.ngay_ket_thuc) {
      setMessage("Ngày bắt đầu phải nhỏ hơn ngày kết thúc.", "error");
      return;
    }

    try {
      setBusy(true);
      setMessage("Đang lưu thay đổi...", "info");

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
      setMessage(result?.message || "Cập nhật hợp đồng thành công.", "success");
      if (currentContract?._id) {
        updateNavigationLinks(currentContract._id);
      }
    } catch (error) {
      setMessage(error.message || "Không thể cập nhật hợp đồng.", "error");
    } finally {
      setBusy(false);
    }
  }

  function updateNavigationLinks(id) {
    if (backLink) {
      const detailUrl = new URL("./ContractDetail.html", window.location.href);
      detailUrl.searchParams.set("id", id);
      backLink.href = detailUrl.toString();
    }

    if (cancelLink) {
      const detailUrl = new URL("./ContractDetail.html", window.location.href);
      detailUrl.searchParams.set("id", id);
      cancelLink.href = detailUrl.toString();
    }
  }

  function renderSelect(selectEl, items, mapItem, placeholder) {
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
    }
  }

  function setBusy(isBusy) {
    saveButton.disabled = isBusy;
    tenantSelect.disabled = isBusy;
    apartmentSelect.disabled = isBusy;
    roomSelect.disabled = isBusy || roomSelect.options.length <= 1;
    startDateInput.disabled = isBusy;
    endDateInput.disabled = isBusy;
    depositInput.disabled = isBusy;
    statusSelect.disabled = isBusy;
    noteInput.disabled = isBusy;
    saveButton.textContent = isBusy ? "Đang lưu..." : "Lưu thay đổi";
  }

  function setMessage(message, type = "info") {
    const colors = {
      success: "#176b45",
      error: "#9b1c31",
      info: "#475467",
    };

    messageEl.textContent = message;
    messageEl.style.color = colors[type] || colors.info;
  }

  function resetRoomSelect(placeholder) {
    roomSelect.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
    roomSelect.disabled = true;
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

  function getObjectId(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value._id) return value._id;
    return String(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
});
