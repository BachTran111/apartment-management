# API Tenant Documentation

## Base URL
```
http://localhost:5000/api/tenants
```

## Authentication
Tất cả endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Tạo người thuê mới

**POST** `/api/tenants`

Tạo người thuê, hợp đồng và cập nhật trạng thái phòng trong một transaction.

#### Request

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|-------------|
| ho_ten | string | Yes | Họ tên người thuê (2-100 ký tự) |
| so_dien_thoai | string | Yes | Số điện thoại (10-11 số) |
| email | string | No | Email (định dạng email hợp lệ) |
| cmnd_cccd | string | No | Số CMND/CCCD |
| ngay_sinh | date | No | Ngày sinh (ISO 8601) |
| que_quan | string | No | Quê quán |
| ghi_chu | string | No | Ghi chú |
| phong_id | string | Yes | ID của phòng (ObjectId trong CanHo.phongs) |
| ngay_bat_dau | date | Yes | Ngày bắt đầu thuê |
| ngay_ket_thuc | date | No | Ngày kết thúc thuê |
| tien_dat_coc | number | No | Tiền đặt cọc (>= 0) |
| anh_tai_lieu | file[] | No | Ảnh tài liệu (tối đa 5 ảnh, mỗi ảnh max 5MB) |

#### Response thành công (201)

```json
{
  "status": "OK",
  "message": "Tenant created successfully",
  "metadata": {
    "nguoi_thue": {
      "_id": "...",
      "ho_ten": "Nguyễn Văn A",
      "so_dien_thoai": "0123456789",
      "email": "email@example.com",
      "cmnd_cccd": "123456789",
      "ngay_sinh": "1990-01-01T00:00:00.000Z",
      "que_quan": "Hà Nội",
      "anh_tai_lieu": ["/uploads/tenants/123456.jpg"],
      "ghi_chu": "Ghi chú",
      "deleted": false,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "hop_dong": {
      "_id": "...",
      "nguoi_thue_id": "...",
      "phong_id": "...",
      "ngay_bat_dau": "...",
      "ngay_ket_thuc": null,
      "tien_dat_coc": 1000000,
      "trang_thai": "active"
    },
    "phong": {
      "id": "...",
      "so_phong": "101"
    }
  }
}
```

#### Response lỗi (400)

```json
{
  "status": "ERROR",
  "message": "Room is already occupied"
}
```

#### Ví dụ cURL

```bash
curl -X POST http://localhost:5000/api/tenants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "ho_ten=Nguyễn Văn A" \
  -F "so_dien_thoai=0123456789" \
  -F "email=email@example.com" \
  -F "phong_id=660abc123def456" \
  -F "ngay_bat_dau=2024-01-01" \
  -F "tien_dat_coc=1000000" \
  -F "anh_tai_lieu=@/path/to/image.jpg"
```

---

### 2. Cập nhật người thuê

**PUT** `/api/tenants/:id`

Cập nhật thông tin người thuê. Hỗ trợ đổi phòng (tự động xử lý chuyển phòng).

#### Request

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ho_ten | string | No | Họ tên người thuê |
| so_dien_thoai | string | No | Số điện thoại |
| email | string | No | Email |
| cmnd_cccd | string | No | Số CMND/CCCD |
| ngay_sinh | date | No | Ngày sinh |
| que_quan | string | No | Quê quán |
| ghi_chu | string | No | Ghi chú |
| phong_id | string | No | ID phòng mới (nếu đổi phòng) |
| tien_dat_coc | number | No | Tiền đặt cọc mới |
| ngay_ket_thuc | date | No | Ngày kết thúc thuê mới |
| anh_tai_lieu | file[] | No | Ảnh tài liệu thêm mới |

#### Logic đổi phòng

Khi `phong_id` thay đổi:
1. Phòng cũ chuyển sang `trang_thai: "available"`
2. Hợp đồng cũ chuyển sang `trang_thai: "expired"`
3. Phòng mới chuyển sang `trang_thai: "occupied"`
4. Tạo hợp đồng mới cho phòng mới

#### Response thành công (200)

```json
{
  "status": "OK",
  "message": "Tenant updated successfully",
  "metadata": {
    "_id": "...",
    "ho_ten": "Nguyễn Văn B",
    "so_dien_thoai": "0987654321",
    ...
  }
}
```

#### Response lỗi (400)

```json
{
  "status": "ERROR",
  "message": "Tenant not found"
}
```

#### Ví dụ cURL

```bash
curl -X PUT http://localhost:5000/api/tenants/660abc123def456 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "ho_ten=Nguyễn Văn B" \
  -F "so_dien_thoai=0987654321"
```

---

### 3. Xóa người thuê (Soft Delete)

**DELETE** `/api/tenants/:id`

Xóa mềm người thuê. Tự động:
- Đánh dấu `deleted: true`
- Hợp đồng đang hoạt động chuyển sang `expired`
- Phòng đang thuê chuyển sang `available`

#### Response thành công (200)

```json
{
  "status": "OK",
  "message": "Tenant deleted successfully"
}
```

#### Response lỗi (400)

```json
{
  "status": "ERROR",
  "message": "Tenant not found"
}
```

#### Ví dụ cURL

```bash
curl -X DELETE http://localhost:5000/api/tenants/660abc123def456 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Xóa ảnh tài liệu

**DELETE** `/api/tenants/:id/image`

Xóa một ảnh cụ thể từ danh sách ảnh tài liệu.

#### Request

**Content-Type:** `application/json`

```json
{
  "imagePath": "/uploads/tenants/123456.jpg"
}
```

#### Response thành công (200)

```json
{
  "status": "OK",
  "message": "Image removed successfully"
}
```

#### Ví dụ cURL

```bash
curl -X DELETE http://localhost:5000/api/tenants/660abc123def456/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imagePath": "/uploads/tenants/123456.jpg"}'
```

---

## Error Codes

| HTTP Code | Message | Nguyên nhân |
|-----------|-------------|
| 400 | Validation error | Dữ liệu không hợp lệ |
| 400 | Room not found | Không tìm thấy phòng |
| 400 | Room is already occupied | Phòng đã có người thuê |
| 400 | Tenant not found | Không tìm thấy người thuê hoặc đã bị xóa |
| 400 | New room not found | Không tìm thấy phòng mới (khi đổi phòng) |
| 400 | New room is already occupied | Phòng mới đã có người thuê |
| 400 | Image not found | Không tìm thấy ảnh trong danh sách |
| 401 | Authorization token required | Thiếu token |
| 401 | Invalid or expired token | Token không hợp lệ hoặc hết hạn |

---

## Database Schema

### NguoiThue (Tenant)

```javascript
{
  ho_ten: String,           // Required
  so_dien_thoai: String,    // Required
  email: String,
  cmnd_cccd: String,
  ngay_sinh: Date,
  que_quan: String,
  anh_tai_lieu: [String],   // Array of file paths
  ghi_chu: String,
  deleted: Boolean,         // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

### HopDong (Contract)

```javascript
{
  nguoi_thue_id: ObjectId,  // Ref: NguoiThue
  phong_id: ObjectId,
  ngay_bat_dau: Date,
  ngay_ket_thuc: Date,
  tien_dat_coc: Number,
  trang_thai: String        // "active" | "expired"
}
```

### Phong (Room) - embedded in CanHo

```javascript
{
  so_phong: String,
  dien_tich: Number,
  gia: Number,
  trang_thai: String,       // "available" | "occupied"
  noi_that: [NoiThat],
  nguoi_thue_id: ObjectId,  // Ref: NguoiThue
  hop_dong_id: ObjectId     // Ref: HopDong
}
```

---

## File Upload

- **Thư mục lưu:** `uploads/tenants/`
- **Định dạng hỗ trợ:** jpeg, png, gif, webp
- **Kích thước tối đa:** 5MB/ảnh
- **Số lượng tối đa:** 5 ảnh/request
- **Đường dẫn ảnh:** `/uploads/tenants/<filename>`
- **Truy cập ảnh:** `GET http://localhost:5000/uploads/tenants/<filename>`

---

## Transaction Flow

### Create Tenant
```
1. Validate input
2. Check room exists and available
3. [Transaction Start]
   a. Create NguoiThue
   b. Create HopDong (active)
   c. Update room status → occupied
   d. Link room → nguoi_thue_id, hop_dong_id
4. [Transaction Commit]
5. Return result
```

### Update Tenant (with room change)
```
1. Validate input
2. [Transaction Start]
   a. Update NguoiThue fields
   b. If phong_id changed:
      - Old room → available, unlink IDs
      - Old contract → expired
      - New room → occupied, link IDs
      - Create new contract (active)
   c. Else if tien_dat_coc/ngay_ket_thuc changed:
      - Update active contract
3. [Transaction Commit]
4. Return result
```

### Delete Tenant
```
1. [Transaction Start]
   a. Set nguoi_thue.deleted = true
   b. Set active contract → expired
   c. Set room → available, unlink IDs
2. [Transaction Commit]
3. Return success
```
