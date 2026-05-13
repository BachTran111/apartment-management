// ========== UI Elements ==========
const registerForm = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const fullNameInput = document.getElementById("fullName");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePasswordBtn = document.getElementById("togglePassword");
const toggleConfirmPasswordBtn = document.getElementById(
  "toggleConfirmPassword",
);
const agreeTermsCheckbox = document.getElementById("agreeTerms");
const alertContainer = document.getElementById("alertContainer");
const btnSubmit = document.querySelector(".btn-submit");
const btnLogin = document.getElementById("btnLogin");
const loadingModal = document.getElementById("loadingModal");

// ========== Event Listeners ==========
registerForm?.addEventListener("submit", handleRegister);
togglePasswordBtn?.addEventListener("click", () =>
  togglePasswordVisibility(passwordInput, togglePasswordBtn),
);
toggleConfirmPasswordBtn?.addEventListener("click", () =>
  togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordBtn),
);
btnLogin?.addEventListener(
  "click",
  () => (window.location.href = "login.html"),
);
passwordInput?.addEventListener("input", checkPasswordStrength);

// ========== Utility Functions ==========

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(input, button) {
  if (input.type === "password") {
    input.type = "text";
    button.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    input.type = "password";
    button.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

/**
 * Check password strength
 */
function checkPasswordStrength() {
  const password = passwordInput.value;
  const strengthElement = document.getElementById("passwordStrength");

  if (!strengthElement) return;

  let strength = 0;
  let strengthText = "";
  let strengthColor = "";

  if (password.length >= 6) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength < 2) {
    strengthText = "Yếu";
    strengthColor = "#dc3545";
  } else if (strength < 4) {
    strengthText = "Trung bình";
    strengthColor = "#ffc107";
  } else {
    strengthText = "Mạnh";
    strengthColor = "#28a745";
  }

  strengthElement.textContent = `Mức độ: ${strengthText}`;
  strengthElement.style.color = strengthColor;
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate full name
 */
function validateFullName(fullName) {
  return (
    fullName && fullName.trim().length >= 2 && fullName.trim().length <= 100
  );
}

/**
 * Validate password
 */
function validatePassword(password) {
  return password && password.length >= 6 && password.length <= 100;
}

/**
 * Validate all fields
 */
function validateForm() {
  const email = emailInput.value.trim();
  const fullName = fullNameInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const agreeTerms = agreeTermsCheckbox.checked;

  // Clear previous errors
  document.getElementById("emailError").textContent = "";
  document.getElementById("fullNameError").textContent = "";
  document.getElementById("passwordError").textContent = "";
  document.getElementById("confirmPasswordError").textContent = "";
  document.getElementById("termsError").textContent = "";

  let isValid = true;

  // Validate email
  if (!email) {
    document.getElementById("emailError").textContent = "Email là bắt buộc";
    isValid = false;
  } else if (!validateEmail(email)) {
    document.getElementById("emailError").textContent = "Email không hợp lệ";
    isValid = false;
  }

  // Validate full name
  if (!fullName) {
    document.getElementById("fullNameError").textContent =
      "Họ và tên là bắt buộc";
    isValid = false;
  } else if (!validateFullName(fullName)) {
    document.getElementById("fullNameError").textContent =
      "Họ và tên phải từ 2-100 ký tự";
    isValid = false;
  }

  // Validate password
  if (!password) {
    document.getElementById("passwordError").textContent =
      "Mật khẩu là bắt buộc";
    isValid = false;
  } else if (!validatePassword(password)) {
    document.getElementById("passwordError").textContent =
      "Mật khẩu phải từ 6-100 ký tự";
    isValid = false;
  }

  // Validate confirm password
  if (password !== confirmPassword) {
    document.getElementById("confirmPasswordError").textContent =
      "Mật khẩu xác nhận không khớp";
    isValid = false;
  }

  // Validate terms
  if (!agreeTerms) {
    document.getElementById("termsError").textContent =
      "Bạn phải đồng ý với điều khoản dịch vụ";
    isValid = false;
  }

  return isValid;
}

/**
 * Show alert message
 */
function showAlert(type, message) {
  alertContainer.innerHTML = `
    <div class="alert alert-${type === "error" ? "danger" : type} alert-dismissible fade show" role="alert">
      <i class="fas fa-${type === "error" ? "exclamation-circle" : type === "warning" ? "exclamation-triangle" : "check-circle"}"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

/**
 * Show loading spinner
 */
function showLoading() {
  loadingModal.style.display = "flex";
}

/**
 * Hide loading spinner
 */
function hideLoading() {
  loadingModal.style.display = "none";
}

/**
 * Handle registration
 */
async function handleRegister(e) {
  e.preventDefault();

  // Validate form
  if (!validateForm()) {
    return;
  }

  try {
    showLoading();

    const email = emailInput.value.trim();
    const fullName = fullNameInput.value.trim();
    const password = passwordInput.value;

    // Make API call
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        fullName,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === "OK") {
      showAlert(
        "success",
        "Đăng ký thành công! Chuyển hướng đến trang đăng nhập...",
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      showAlert("error", data.message || "Đăng ký thất bại");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showAlert("error", "Có lỗi xảy ra. Vui lòng thử lại.");
  } finally {
    hideLoading();
  }
}

// ========== Initialize ==========
console.log("Register form loaded");
