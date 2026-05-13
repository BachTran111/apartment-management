# 🔗 API Integration Guide - Login System

## 📋 Tổng Quan

Backend và Frontend đã được kết nối hoàn toàn. Hệ thống authentication sử dụng JWT token.

---

## 🚀 Bắt Đầu

### 1. Khởi động Server

```bash
npm install
npm start
```

Server sẽ chạy trên `http://localhost:5000`

---

## 📡 API Endpoints

### 1️⃣ Đăng Ký (Register)

**Endpoint:** `POST /api/auth/register`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "username": "user123",
  "password": "password123",
  "role": "USER"
}
```

**Response (201 - Success):**

```json
{
  "status": "OK",
  "message": "User registered successfully",
  "metadata": {
    "id": "507f1f77bcf86cd799439011",
    "username": "user123",
    "role": "USER"
  }
}
```

**Response (400 - Error):**

```json
{
  "status": "ERROR",
  "message": "Username already exists"
}
```

---

### 2️⃣ Đăng Nhập (Login)

**Endpoint:** `POST /api/auth/login`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "username": "user123",
  "password": "password123"
}
```

**Response (200 - Success):**

```json
{
  "status": "OK",
  "message": "Login successful",
  "metadata": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "USER",
    "username": "user123"
  }
}
```

**Response (401 - Error):**

```json
{
  "status": "ERROR",
  "message": "Invalid username or password"
}
```

---

### 3️⃣ Lấy Thông Tin Người Dùng (Get Current User)

**Endpoint:** `GET /api/auth/me`

**Headers:**

```json
{
  "Authorization": "Bearer {token}"
}
```

**Response (200 - Success):**

```json
{
  "status": "OK",
  "message": "User information retrieved",
  "metadata": {
    "id": "507f1f77bcf86cd799439011",
    "username": "user123",
    "role": "USER"
  }
}
```

**Response (401 - Unauthorized):**

```json
{
  "status": "ERROR",
  "message": "Authentication required"
}
```

---

### 4️⃣ Xác Minh Token (Verify Token)

**Endpoint:** `POST /api/auth/verify`

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 - Valid):**

```json
{
  "status": "OK",
  "message": "Token is valid",
  "metadata": {
    "id": "507f1f77bcf86cd799439011",
    "username": "user123",
    "role": "USER"
  }
}
```

---

## 🧪 Test với cURL

### Register Example

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test@123",
    "role": "USER"
  }'
```

### Login Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test@123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Frontend Integration (login.html)

### 1. Quy Trình Đăng Nhập

**File:** `views/js/login.js` - Lớp `LoginManager`

```javascript
// Quy trình:
1. User nhập username và password
2. LoginManager validate input
3. Gửi POST request tới /api/auth/login
4. Server trả về token
5. Lưu token vào localStorage
6. Redirect sang /dashboard.html
```

### 2. Lưu Trữ Token

```javascript
// Token được lưu tại:
localStorage.setItem("authToken", token);
localStorage.setItem("userRole", role);

// Retrieve token:
const token = localStorage.getItem("authToken");
```

### 3. Sử Dụng Token trong Requests

```javascript
// Để gọi các API protected:
const token = localStorage.getItem("authToken");

fetch("/api/protected-route", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 🔐 Security Features

✅ **Password Hashing** - Sử dụng bcryptjs  
✅ **JWT Token** - Token expire sau 24 giờ  
✅ **Input Validation** - Kiểm tra username và password  
✅ **Error Handling** - Không leak thông tin nhạy cảm  
✅ **CORS** - Configured for local development

---

## ⚙️ Validation Rules

### Username

- Tối thiểu 3 ký tự
- Tối đa 30 ký tự
- Chỉ chứa: chữ cái, số, dấu chấm, dấu gạch ngang, dấu gạch dưới
- Ví dụ: `user_123`, `admin.root`, `test-user`

### Password

- Tối thiểu 6 ký tự
- Tối đa 100 ký tự
- Không giới hạn ký tự đặc biệt

---

## 🐛 Xử Lý Lỗi Phổ Biến

| Lỗi                                      | Nguyên Nhân                     | Giải Pháp                         |
| ---------------------------------------- | ------------------------------- | --------------------------------- |
| `Username already exists`                | Username đã được đăng ký        | Chọn username khác                |
| `Invalid username or password`           | Username/password sai           | Kiểm tra lại thông tin            |
| `Username must be at least 3 characters` | Username quá ngắn               | Nhập username dài ít nhất 3 ký tự |
| `Password must be at least 6 characters` | Password quá ngắn               | Nhập password dài ít nhất 6 ký tự |
| `Access token required`                  | Không có token trong request    | Thêm `Authorization` header       |
| `Invalid or expired token`               | Token không hợp lệ hoặc hết hạn | Đăng nhập lại                     |

---

## 📊 Token Structure (JWT)

```javascript
// Payload của token:
{
  "id": "507f1f77bcf86cd799439011",
  "username": "user123",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234654290
}

// iat (issued at) - Thời gian tạo
// exp (expiration) - Thời gian hết hạn (24 giờ)
```

---

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (login.html)                   │
│  - Input username & password                            │
│  - Validate form                                        │
│  - Send POST /api/auth/login                            │
│  - Receive token & role                                 │
│  - Save to localStorage                                 │
│  - Redirect to dashboard                                │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP POST
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Backend (Node.js/Express)                  │
│  - Receive request at POST /api/auth/login              │
│  - Find user in MongoDB                                 │
│  - Verify password with bcrypt                          │
│  - Generate JWT token (24h expiry)                      │
│  - Return token & role to client                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Environment Variables

Tạo file `.env` nếu cần custom:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/apartment-management
JWT_SECRET=your-super-secret-key-here
NODE_ENV=development
```

---

## ✨ Next Steps

1. ✅ Test login endpoint với cURL
2. ✅ Test frontend login page
3. ✅ Tạo dashboard page
4. ✅ Implement Protected Routes (sử dụng middleware)
5. ✅ Thêm Logout functionality
6. ✅ Thêm Forgot Password feature

---

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra console logs trên browser (F12)
2. Kiểm tra terminal logs của server
3. Xác nhận MongoDB đang chạy
4. Xác nhận port 5000 không bị chiếm dụng
