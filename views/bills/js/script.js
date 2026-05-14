const API_BASE_URL = "http://localhost:5000/api";

const form = document.getElementById("create-invoice-form");
const contractInput = document.getElementById("contract-id");
const amountInput = document.getElementById("invoice-amount");
const statusInput = document.getElementById("invoice-status");
const createdDateInput = document.getElementById("created-date");
const noteInput = document.getElementById("invoice-note");
const backButton = document.getElementById("back-button");
const statusMessage = document.getElementById("form-status");
const invoiceId = new URLSearchParams(window.location.search).get("id");

const errorElements = {
  contractId: document.getElementById("contract-id-error"),
  invoiceAmount: document.getElementById("invoice-amount-error"),
  invoiceStatus: document.getElementById("invoice-status-error"),
  createdDate: document.getElementById("created-date-error"),
};

function getMetadata(payload) {
  return payload?.metadata || payload?.data || {};
}

function setFieldError(input, key, message) {
  input.classList.toggle("is-invalid", Boolean(message));
  errorElements[key].textContent = message;
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.classList.remove("is-success");
}

function setTodayAsDefault() {
  if (invoiceId) return;
  createdDateInput.value = new Date().toISOString().slice(0, 10);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `HTTP error! status: ${response.status}`);
  }
  return payload;
}

async function loadContracts() {
  const payload = await fetchJson(`${API_BASE_URL}/contracts?page=1&limit=100`);
  const result = getMetadata(payload);
  const contracts = Array.isArray(result.contracts) ? result.contracts : [];

  contractInput.innerHTML = '<option value="">Chọn hợp đồng</option>';
  contracts.forEach((contract) => {
    const tenantName = contract.nguoi_thue_id?.ho_ten || "Chưa rõ người thuê";
    const roomNumber = contract.phong_id?.so_phong || "N/A";
    const option = document.createElement("option");
    option.value = contract._id;
    option.textContent = `${tenantName} - Phòng ${roomNumber}`;
    contractInput.appendChild(option);
  });
}

async function loadBillForEdit() {
  if (!invoiceId) return;

  const payload = await fetchJson(`${API_BASE_URL}/bills/${invoiceId}`);
  const bill = getMetadata(payload);

  contractInput.value = bill.hop_dong_id?._id || bill.hop_dong_id || "";
  amountInput.value = bill.so_tien || "";
  statusInput.value = bill.trang_thai || "CHƯA THANH TOÁN";
  createdDateInput.value = bill.ngay_lap
    ? new Date(bill.ngay_lap).toISOString().slice(0, 10)
    : "";
  noteInput.value = bill.ghi_chu || "";
  document.getElementById("page-title").textContent = "Cập nhật hóa đơn";
}

function validateForm() {
  let isValid = true;

  if (!contractInput.value) {
    setFieldError(contractInput, "contractId", "Vui lòng chọn hợp đồng.");
    isValid = false;
  } else {
    setFieldError(contractInput, "contractId", "");
  }

  if (!amountInput.value || Number(amountInput.value) < 0) {
    setFieldError(
      amountInput,
      "invoiceAmount",
      "Vui lòng nhập số tiền hợp lệ.",
    );
    isValid = false;
  } else {
    setFieldError(amountInput, "invoiceAmount", "");
  }

  if (!statusInput.value) {
    setFieldError(statusInput, "invoiceStatus", "Vui lòng chọn trạng thái.");
    isValid = false;
  } else {
    setFieldError(statusInput, "invoiceStatus", "");
  }

  if (!createdDateInput.value) {
    setFieldError(
      createdDateInput,
      "createdDate",
      "Vui lòng chọn ngày tạo hóa đơn.",
    );
    isValid = false;
  } else {
    setFieldError(createdDateInput, "createdDate", "");
  }

  return isValid;
}

function handleFieldCleanup(event) {
  if (event.target.classList.contains("is-invalid")) {
    validateForm();
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  clearStatus();

  if (!validateForm()) return;

  const payload = {
    hop_dong_id: contractInput.value,
    so_tien: Number(amountInput.value),
    trang_thai: statusInput.value,
    ngay_lap: createdDateInput.value,
    ghi_chu: noteInput.value.trim(),
  };

  try {
    await fetchJson(
      invoiceId ? `${API_BASE_URL}/bills/${invoiceId}` : `${API_BASE_URL}/bills`,
      {
        method: invoiceId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    statusMessage.textContent = invoiceId
      ? "Cập nhật hóa đơn thành công."
      : "Tạo hóa đơn thành công.";
    statusMessage.classList.add("is-success");

    setTimeout(() => {
      window.location.href = "BillList.html";
    }, 700);
  } catch (error) {
    console.error("Lỗi lưu hóa đơn:", error);
    statusMessage.textContent = error.message;
  }
}

function handleBack() {
  window.location.href = "BillList.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    setTodayAsDefault();
    await loadContracts();
    await loadBillForEdit();
  } catch (error) {
    console.error(error);
    statusMessage.textContent = error.message;
  }
});

form.addEventListener("submit", handleSubmit);
form.addEventListener("input", handleFieldCleanup);
form.addEventListener("change", handleFieldCleanup);
backButton.addEventListener("click", handleBack);
