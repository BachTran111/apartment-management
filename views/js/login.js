/* ============================================
   LOGIN PAGE JAVASCRIPT
   ============================================ */

class LoginManager {
  constructor() {
    this.loginForm = document.getElementById("loginForm");
    this.usernameInput = document.getElementById("username");
    this.passwordInput = document.getElementById("password");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.rememberMeCheckbox = document.getElementById("rememberMe");
    this.alertContainer = document.getElementById("alertContainer");
    this.loadingModal = document.getElementById("loadingModal");
    this.btnRegister = document.getElementById("btnRegister");
    this.btnText = document.getElementById("btnText");
    this.btnIcon = document.getElementById("btnIcon");

    this.API_BASE_URL = "/api/auth";
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadRememberedUsername();
  }

  attachEventListeners() {
    // Form submission
    this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));

    // Show/Hide password
    this.togglePasswordBtn.addEventListener("click", () =>
      this.togglePasswordVisibility(),
    );

    // Clear errors on input
    this.usernameInput.addEventListener("input", () =>
      this.clearError("username"),
    );
    this.passwordInput.addEventListener("input", () =>
      this.clearError("password"),
    );

    // Register button
    this.btnRegister.addEventListener("click", () => this.navigateToRegister());

    // Forgot password link
    const forgotLink = document.querySelector(".forgot-password");
    if (forgotLink) {
      forgotLink.addEventListener("click", (e) => this.handleForgotPassword(e));
    }
  }

  /**
   * Validate form inputs
   */
  validateForm() {
    let isValid = true;

    // Validate username
    const username = this.usernameInput.value.trim();
    if (!username) {
      this.showError("username", "Vui lòng nhập tên đăng nhập");
      isValid = false;
    } else if (username.length < 3) {
      this.showError("username", "Tên đăng nhập phải có ít nhất 3 ký tự");
      isValid = false;
    }

    // Validate password
    const password = this.passwordInput.value;
    if (!password) {
      this.showError("password", "Vui lòng nhập mật khẩu");
      isValid = false;
    } else if (password.length < 6) {
      this.showError("password", "Mật khẩu phải có ít nhất 6 ký tự");
      isValid = false;
    }

    return isValid;
  }

  /**
   * Show error message under input field
   */
  showError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement =
      fieldName === "username" ? this.usernameInput : this.passwordInput;

    if (errorElement) {
      errorElement.textContent = message;
    }

    if (inputElement) {
      inputElement.classList.add("error");
    }
  }

  /**
   * Clear error message for a field
   */
  clearError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement =
      fieldName === "username" ? this.usernameInput : this.passwordInput;

    if (errorElement) {
      errorElement.textContent = "";
    }

    if (inputElement) {
      inputElement.classList.remove("error");
    }
  }

  /**
   * Show alert message
   */
  showAlert(message, type = "success", icon = "fas fa-check-circle") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

    this.alertContainer.innerHTML = "";
    this.alertContainer.appendChild(alertDiv);

    // Auto-dismiss after 5 seconds for success, 8 seconds for others
    const dismissTime = type === "success" ? 5000 : 8000;
    setTimeout(() => {
      if (alertDiv.parentElement) {
        alertDiv.remove();
      }
    }, dismissTime);
  }

  /**
   * Show loading modal
   */
  showLoading() {
    this.loadingModal.classList.add("active");
    this.loginForm.style.pointerEvents = "none";
    this.loginForm.style.opacity = "0.6";
  }

  /**
   * Hide loading modal
   */
  hideLoading() {
    this.loadingModal.classList.remove("active");
    this.loginForm.style.pointerEvents = "auto";
    this.loginForm.style.opacity = "1";
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility() {
    const isPassword = this.passwordInput.type === "password";
    this.passwordInput.type = isPassword ? "text" : "password";

    const icon = this.togglePasswordBtn.querySelector("i");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  }

  /**
   * Save username for "Remember me" feature
   */
  saveRememberedUsername(username) {
    if (this.rememberMeCheckbox.checked) {
      localStorage.setItem("rememberedUsername", username);
    } else {
      localStorage.removeItem("rememberedUsername");
    }
  }

  /**
   * Load remembered username
   */
  loadRememberedUsername() {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      this.usernameInput.value = rememberedUsername;
      this.rememberMeCheckbox.checked = true;
      // Focus on password field
      this.passwordInput.focus();
    }
  }

  /**
   * Handle login
   */
  async handleLogin(e) {
    e.preventDefault();

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    try {
      this.showLoading();

      // API call
      const response = await fetch(`${this.API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Save token
      if (data.metadata && data.metadata.token) {
        localStorage.setItem("authToken", data.metadata.token);
        localStorage.setItem("userRole", data.metadata.role || "user");

        // Save remembered username
        this.saveRememberedUsername(username);

        // Show success message
        this.showAlert(
          "Đăng nhập thành công! Đang chuyển hướng...",
          "success",
          "fas fa-check-circle",
        );

        // Redirect after 1.5 seconds
        setTimeout(() => {
          window.location.href = "/dashboard.html";
        }, 1500);
      }
    } catch (error) {
      this.showAlert(
        error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        "danger",
        "fas fa-exclamation-circle",
      );
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Navigate to register page
   */
  navigateToRegister() {
    // You can implement this based on your needs
    // Option 1: Navigate to register page
    window.location.href = "/register.html";

    // Option 2: Show registration modal (if you have one)
    // this.showRegisterModal();
  }

  /**
   * Handle forgot password
   */
  handleForgotPassword(e) {
    e.preventDefault();
    // Implement forgot password functionality
    // This could open a modal or navigate to forgot-password page
    console.log("Forgot password clicked");
    this.showAlert(
      "Tính năng khôi phục mật khẩu sẽ được cập nhật sớm.",
      "warning",
      "fas fa-info-circle",
    );
  }
}

/**
 * Initialize when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  new LoginManager();

  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Enter key to submit form
    if (e.key === "Enter" && document.activeElement.tagName !== "TEXTAREA") {
      const form = document.getElementById("loginForm");
      const inputs = form.querySelectorAll(
        'input[type="text"], input[type="password"]',
      );
      if (
        Array.from(inputs).some((input) => input === document.activeElement)
      ) {
        form.dispatchEvent(new Event("submit"));
      }
    }
  });
});

/**
 * Utility function to check if user is logged in
 */
function isUserLoggedIn() {
  return !!localStorage.getItem("authToken");
}

/**
 * Utility function to get auth token
 */
function getAuthToken() {
  return localStorage.getItem("authToken");
}

/**
 * Utility function to get user role
 */
function getUserRole() {
  return localStorage.getItem("userRole");
}

/**
 * Utility function to logout
 */
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");
  window.location.href = "/login.html";
}

/**
 * Redirect to login if not authenticated (useful for protected pages)
 */
function requireLogin() {
  if (!isUserLoggedIn()) {
    window.location.href = "/login.html";
  }
}
