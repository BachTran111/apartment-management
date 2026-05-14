document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const contractId = (params.get("id") || "").trim();

  const form = document.getElementById("terminateForm");
  const messageEl = document.getElementById("terminationFormMessage");
  const pageTitle = document.getElementById("pageTitle");
  const pageNote = document.getElementById("pageNote");
  const backLink = document.getElementById("backLink");
  const cancelLink = document.getElementById("cancelLink");
  const ngayThanhLyInput = document.getElementById("ngay_thanh_ly");
  const chiPhiInput = document.getElementById("chi_phi_phat_sinh");
  const ghiChuInput = document.getElementById("ghi_chu_thanh_ly");
  const fillTodayButton = document.getElementById("fillTodayButton");
  const terminateButton = document.getElementById("terminateButton");
  const terminationNote = document.getElementById("terminationNote");

  if (
    !form ||
    !messageEl ||
    !ngayThanhLyInput ||
    !chiPhiInput ||
    !ghiChuInput ||
    !fillTodayButton ||
    !terminateButton
  ) {
    return;
  }

  const apiBase = resolveApiBase();
  let currentContract = null;

  form.addEventListener("submit", handleSubmit);
  fillTodayButton.addEventListener("click", fillTodayDate);

  if (!contractId) {
    setMessage("Thiếu id hợp đồng trên URL.", "error");
    setBusy(true);
    return;
  }

  updateNavigationLinks(contractId);
  loadContract();

  function resolveApiBase() {
    if (window.location.origin && window.location.origin !== "null") {
      return `${window.location.origin}/api`;
    }

    return "http://localhost:5000/api";
  }

  async function loadContract() {
    try {
      setMessage("Đang tải dữ liệu hợp đồng...", "info");

      const response = await fetch(
        `${apiBase}/contracts/${encodeURIComponent(contractId)}`,
        { headers: { Accept: "application/json" } },
      );
      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Không thể tải chi tiết hợp đồng");
      }

      currentContract = payload?.metadata || payload?.data || payload || {};
      renderContract(currentContract);
      setMessage("Sẵn sàng thanh lý hợp đồng.", "success");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Không thể tải dữ liệu hợp đồng.", "error");
      setBusy(true);
    }
  }

  function renderContract(contract) {
    const roomName =
      contract.phong_id?.so_phong || contract.phong_id?.ten_phong || "";
    const tenantName = contract.nguoi_thue_id?.ho_ten || "";

    pageTitle.textContent = roomName
      ? `Thanh lý hợp đồng${roomName ? ` - Phòng ${roomName}` : ""}`
      : "Thanh lý hợp đồng";
    pageNote.textContent = tenantName
      ? `Thực hiện thanh lý cho hợp đồng của ${tenantName}.`
      : "Nhập ngày thanh lý và chi phí phát sinh rồi gửi yêu cầu qua API.";

    ngayThanhLyInput.min = toDateInputValue(contract.ngay_bat_dau);
    ngayThanhLyInput.max = toDateInputValue(contract.ngay_ket_thuc);
    ngayThanhLyInput.value = toDateInputValue(new Date());
    chiPhiInput.value = contract.chi_phi_phat_sinh ?? 0;
    ghiChuInput.value = contract.ghi_chu || "";

    if (terminationNote) {
      terminationNote.textContent = `Khoảng hợp lệ: ${formatDate(contract.ngay_bat_dau)} → ${formatDate(contract.ngay_ket_thuc)}.`;
    }

    setBusy(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!currentContract?._id) {
      setMessage("Thiếu thông tin hợp đồng để thanh lý.", "error");
      return;
    }

    const ngayThanhLy = ngayThanhLyInput.value;
    const chiPhiPhatSinh = Number(chiPhiInput.value);
    const ghiChu = ghiChuInput.value.trim();

    if (!ngayThanhLy) {
      setMessage("Vui lòng chọn ngày thanh lý.", "error");
      return;
    }

    if (Number.isNaN(chiPhiPhatSinh) || chiPhiPhatSinh < 0) {
      setMessage("Chi phí phát sinh phải là số lớn hơn hoặc bằng 0.", "error");
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
      setMessage(
        "Ngày thanh lý phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc.",
        "error",
      );
      return;
    }

    try {
      setBusy(true);
      setMessage("Đang thanh lý hợp đồng...", "info");

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
      setMessage(
        payload?.message || "Thanh lý hợp đồng thành công.",
        "success",
      );

      if (terminationNote) {
        terminationNote.textContent = "Hợp đồng đã được thanh lý thành công.";
      }

      if (currentContract?._id) {
        updateNavigationLinks(currentContract._id);
      }
    } catch (error) {
      setMessage(error.message || "Không thể thanh lý hợp đồng.", "error");
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

  function fillTodayDate() {
    ngayThanhLyInput.value = toDateInputValue(new Date());
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
    fillTodayButton.disabled = isBusy;
    terminateButton.disabled = isBusy;
    ngayThanhLyInput.disabled = isBusy;
    chiPhiInput.disabled = isBusy;
    ghiChuInput.disabled = isBusy;
    terminateButton.textContent = isBusy
      ? "Đang xử lý..."
      : "Thanh lý hợp đồng";
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

  function toDateInputValue(value) {
    if (!value) return "";

    const date = new Date(value);
    if (isNaN(date)) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
});
