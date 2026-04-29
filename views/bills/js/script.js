const form = document.getElementById("create-invoice-form");
const invoiceNameInput = document.getElementById("invoice-name");
const invoiceTypeInput = document.getElementById("invoice-type");
const createdDateInput = document.getElementById("created-date");
const backButton = document.getElementById("back-button");
const statusMessage = document.getElementById("form-status");

const errorElements = {
  invoiceName: document.getElementById("invoice-name-error"),
  invoiceType: document.getElementById("invoice-type-error"),
  createdDate: document.getElementById("created-date-error"),
};

function setTodayAsDefault() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const date = `${today.getDate()}`.padStart(2, "0");

  createdDateInput.value = `${year}-${month}-${date}`;
}

function setFieldError(input, key, message) {
  input.classList.toggle("is-invalid", Boolean(message));
  errorElements[key].textContent = message;
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.classList.remove("is-success");
}

function validateForm() {
  let isValid = true;
  const nameValue = invoiceNameInput.value.trim();
  const typeValue = invoiceTypeInput.value;
  const dateValue = createdDateInput.value;

  if (!nameValue) {
    setFieldError(
      invoiceNameInput,
      "invoiceName",
      "Vui lòng nhập tên hóa đơn.",
    );
    isValid = false;
  } else {
    setFieldError(invoiceNameInput, "invoiceName", "");
  }

  if (!typeValue) {
    setFieldError(
      invoiceTypeInput,
      "invoiceType",
      "Vui lòng chọn loại hóa đơn.",
    );
    isValid = false;
  } else {
    setFieldError(invoiceTypeInput, "invoiceType", "");
  }

  if (!dateValue) {
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

function handleSubmit(event) {
  event.preventDefault();
  clearStatus();

  if (!validateForm()) {
    return;
  }

  const invoiceName = invoiceNameInput.value.trim();
  const invoiceTypeLabel =
    invoiceTypeInput.options[invoiceTypeInput.selectedIndex].textContent;

  statusMessage.textContent = `Đã tạo hóa đơn "${invoiceName}" thuộc loại "${invoiceTypeLabel}".`;
  statusMessage.classList.add("is-success");
  form.reset();
  setTodayAsDefault();
}

function handleBack() {
  clearStatus();

  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = "/";
}

setTodayAsDefault();

form.addEventListener("submit", handleSubmit);
form.addEventListener("input", handleFieldCleanup);
form.addEventListener("change", handleFieldCleanup);
backButton.addEventListener("click", handleBack);
