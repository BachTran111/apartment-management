/**
 * Authentication Helper
 * Cung cấp các hàm tiện ích để quản lý authentication tokens và user sessions
 */

class AuthHelper {
  static TOKEN_KEY = "authToken";
  static EMAIL_KEY = "userEmail";
  static FULLNAME_KEY = "userFullName";
  static API_BASE_URL = "/api/auth";

  /**
   * Lưu token vào localStorage
   */
  static saveToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Lấy token từ localStorage
   */
  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Xóa token khỏi localStorage
   */
  static removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Lưu email vào localStorage
   */
  static saveEmail(email) {
    localStorage.setItem(this.EMAIL_KEY, email);
  }

  /**
   * Lấy email từ localStorage
   */
  static getEmail() {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  /**
   * Lưu fullName vào localStorage
   */
  static saveFullName(fullName) {
    localStorage.setItem(this.FULLNAME_KEY, fullName);
  }

  /**
   * Lấy fullName từ localStorage
   */
  static getFullName() {
    return localStorage.getItem(this.FULLNAME_KEY);
  }

  /**
   * Kiểm tra xem user có đang authenticated không
   */
  static isAuthenticated() {
    const token = this.getToken();
    return token !== null && token !== "";
  }

  /**
   * Kiểm tra xem token có hợp lệ không
   */
  static async isTokenValid() {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${this.API_BASE_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      return response.ok;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  static async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`${this.API_BASE_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const data = await response.json();
      return data.metadata;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }

  /**
   * Đăng xuất
   */
  static logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.FULLNAME_KEY);
  }

  /**
   * Decode JWT token (client-side, không validate signature)
   * Lưu ý: Chỉ dùng để lấy thông tin, không dùng cho security
   */
  static decodeToken(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  /**
   * Kiểm tra xem token có hết hạn không
   */
  static isTokenExpired(token = null) {
    try {
      const tokenToCheck = token || this.getToken();
      if (!tokenToCheck) return true;

      const decoded = this.decodeToken(tokenToCheck);
      if (!decoded || !decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  }

  /**
   * Lấy thời gian còn lại của token (tính bằng giây)
   */
  static getTokenExpirationTime(token = null) {
    try {
      const tokenToCheck = token || this.getToken();
      if (!tokenToCheck) return null;

      const decoded = this.decodeToken(tokenToCheck);
      if (!decoded || !decoded.exp) return null;

      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = decoded.exp - currentTime;

      return remainingTime > 0 ? remainingTime : 0;
    } catch (error) {
      console.error("Error getting token expiration time:", error);
      return null;
    }
  }

  /**
   * Format token expiration time thành readable format
   */
  static formatTokenExpirationTime(token = null) {
    const seconds = this.getTokenExpirationTime(token);
    if (seconds === null || seconds === 0) return "Token has expired";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  }

  /**
   * Gửi request với Authorization header
   */
  static async fetchWithAuth(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Kiểm tra xem user có role nhất định không
   */
  static hasRole(requiredRole) {
    const userRole = this.getRole();
    return userRole === requiredRole || userRole === "ADMIN";
  }

  /**
   * Kiểm tra xem user có một trong những role được liệt kê không
   */
  static hasAnyRole(roles) {
    const userRole = this.getRole();
    return roles.includes(userRole) || userRole === "ADMIN";
  }

  /**
   * Thực hiện tự động logout nếu token hết hạn
   */
  static setupAutoLogout(checkIntervalMs = 60000) {
    setInterval(() => {
      if (this.isTokenExpired()) {
        console.warn("Token has expired. Logging out...");
        this.logout();
        // Có thể redirect tới login page
        // window.location.href = "/login.html";
      }
    }, checkIntervalMs);
  }
}

// Export cho browser global scope
window.AuthHelper = AuthHelper;

// Hoặc export như module
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthHelper;
}
