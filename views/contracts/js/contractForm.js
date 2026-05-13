document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contractForm");
  const tenantSelect = document.getElementById("nguoi_thue_id");
  const apartmentSelect = document.getElementById("can_ho_id");
  const roomSelect = document.getElementById("phong_id");
  const messageEl = document.getElementById("formMessage");
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form || !tenantSelect || !apartmentSelect || !roomSelect) {
    return;
  }

  const apiBase = resolveApiBase();
  const state = {
    loadingRooms: false,
    tenants: [],
    apartments: [],
  };

  boot();

  async function boot() {
    setMessage("Đang tải dữ liệu form...", "info");

    form.addEventListener("submit", handleSubmit);
    apartmentSelect.addEventListener("change", handleApartmentChange);

    try {
      await Promise.all([loadTenants(), loadApartments()]);
      setMessage("Sẵn sàng tạo hợp đồng.", "success");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Không thể tải dữ liệu form.", "error");
    }
  }

  function resolveApiBase() {
    if (window.location.origin && window.location.origin !== "null") {
      return `${window.location.origin}/api`;
    }

    return "http://localhost:5000/api";
  }

  async function loadTenants() {
    const payload = await fetchJson(`${apiBase}/tenants?skip=0&limit=200`);
    const tenants = extractList(payload, ["tenants"]);

    state.tenants = tenants;
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

    state.apartments = apartments;
    renderSelect(
      apartmentSelect,
      apartments,
      (apartment) => ({
        value: apartment._id,
        label: `${apartment.ten || "Căn hộ"}${apartment.dia_chi ? ` - ${apartment.dia_chi}` : ""}`,
      }),
      "Chọn căn hộ",
    );

    apartmentSelect.value = "";
    resetRoomSelect("Chọn căn hộ trước");
  }

  async function handleApartmentChange() {
    const apartmentId = apartmentSelect.value;
    await loadRooms(apartmentId);
  }

  async function loadRooms(apartmentId) {
    if (!apartmentId) {
      resetRoomSelect("Chọn căn hộ trước");
      return;
    }

    state.loadingRooms = true;
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
      roomSelect.value = "";
    } catch (error) {
      console.error(error);
      resetRoomSelect("Không tải được phòng");
      setMessage(error.message || "Không thể tải danh sách phòng.", "error");
    } finally {
      state.loadingRooms = false;
    }
  }

  function resetRoomSelect(placeholder) {
    roomSelect.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
    roomSelect.disabled = true;
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

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      nguoi_thue_id: tenantSelect.value.trim(),
      phong_id: roomSelect.value.trim(),
      ngay_bat_dau: document.getElementById("ngay_bat_dau").value,
      ngay_ket_thuc: document.getElementById("ngay_ket_thuc").value,
      tien_dat_coc: Number(document.getElementById("tien_dat_coc").value),
      trang_thai: document.getElementById("trang_thai").value || "active",
      ghi_chu: document.getElementById("ghi_chu").value.trim(),
    };

    if (!payload.nguoi_thue_id || !payload.phong_id) {
      setMessage("Vui lòng chọn người thuê, căn hộ và phòng.", "error");
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

    if (!payload.ghi_chu) {
      delete payload.ghi_chu;
    }

    try {
      setBusy(true);
      setMessage("Đang lưu hợp đồng...", "info");

      const response = await fetch(`${apiBase}/contracts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(result?.message || "Không thể tạo hợp đồng.");
      }

      form.reset();
      roomSelect.innerHTML = '<option value="">Chọn căn hộ trước</option>';
      roomSelect.disabled = true;
      setMessage(result?.message || "Tạo hợp đồng thành công.", "success");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Có lỗi xảy ra khi lưu hợp đồng.", "error");
    } finally {
      setBusy(false);
      await Promise.all([loadTenants(), loadApartments()]);
    }
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    return parseJsonResponse(response);
  }

  async function parseJsonResponse(response) {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  function setBusy(isBusy) {
    if (submitButton) {
      submitButton.disabled = isBusy;
      submitButton.textContent = isBusy ? "Đang lưu..." : "Lưu hợp đồng";
    }

    tenantSelect.disabled = isBusy;
    apartmentSelect.disabled = isBusy;
    roomSelect.disabled = isBusy || roomSelect.disabled;
  }

  function setMessage(message, type = "info") {
    if (!messageEl) return;

    const colors = {
      success: "#0f766e",
      error: "#b42318",
      info: "#475467",
    };

    messageEl.textContent = message;
    messageEl.style.marginTop = "8px";
    messageEl.style.color = colors[type] || colors.info;
    messageEl.style.fontWeight = "600";
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
