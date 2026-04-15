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
|-------|------|----------|-------------|
| ho_ten | string | Yes | Họ tên người thuê (2-100 ký tự) |
| tuoi | number | No | Tuổi người thuê (1-150) |
| so_dien_thoai | string | Yes | Số điện thoại (10-11 số) |
| cmnd_cccd | string | Yes | Số CMND/CCCD |
| que_quan | string | Yes | Quê quán |
| sdt_lien_he_khan_cap | string | No | SĐT liên hệ khẩn cấp (10-11 số) |
| ghi_chu | string | No | Ghi chú |
| phong_id | string | Yes | ID của phòng (ObjectId trong CanHo.phong) |
| ngay_bat_dau | date | Yes | Ngày bắt đầu thuê |
| ngay_ket_thuc | date | No | Ngày kết thúc thuê dự kiến |
| gia_thue | number | Yes | Giá thuê (>= 0, có thể khác giá gốc phòng) |
| tien_dat_coc | number | No | Tiền đặt cọc (>= 0) |
| anh_dai_dien | file | No | Ảnh đại diện/chân dung (max 1 ảnh, 5MB) |
| anh_hop_dong | file[] | No | Ảnh hợp đồng (tối đa 5 ảnh, mỗi ảnh max 5MB) |

#### Response thành công (201)

```json
{
  "status": "OK",
  "message": "Tenant created successfully",
  "metadata": {
    "nguoi_thue": {
      "_id": "...",
      "ho_ten": "Nguyễn Văn A",
      "tuoi": 30,
      "so_dien_thoai": "0123456789",
      "cmnd_cccd": "123456789",
      "que_quan": "Hà Nội",
      "sdt_lien_he_khan_cap": "0987654321",
      "anh_dai_dien": "/uploads/tenants/123456.jpg",
      "anh_hop_dong": ["/uploads/tenants/789012.jpg"],
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
      "gia_thue": 3000000,
      "tien_dat_coc": 1000000,
      "trang_thai": "active"
    },
    "phong": {
      "id": "...",
      "so_phong": "101",
      "gia_goc": 3500000
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
  -F "tuoi=30" \
  -F "so_dien_thoai=0123456789" \
  -F "cmnd_cccd=123456789" \
  -F "que_quan=Hà Nội" \
  -F "sdt_lien_he_khan_cap=0987654321" \
  -F "phong_id=660abc123def456" \
  -F "ngay_bat_dau=2024-01-01" \
  -F "ngay_ket_thuc=2025-01-01" \
  -F "gia_thue=3000000" \
  -F "tien_dat_coc=1000000" \
  -F "anh_dai_dien=@/path/to/portrait.jpg" \
  -F "anh_hop_dong=@/path/to/contract1.jpg" \
  -F "anh_hop_dong=@/path/to/contract2.jpg"
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
| tuoi | number | No | Tuổi |
| so_dien_thoai | string | No | Số điện thoại |
| cmnd_cccd | string | No | Số CMND/CCCD |
| que_quan | string | No | Quê quán |
| sdt_lien_he_khan_cap | string | No | SĐT liên hệ khẩn cấp |
| ghi_chu | string | No | Ghi chú |
| phong_id | string | No | ID phòng mới (nếu đổi phòng) |
| ngay_ket_thuc | date | No | Ngày kết thúc thuê mới |
| gia_thue | number | No | Giá thuê mới (cho phòng mới hoặc cập nhật) |
| tien_dat_coc | number | No | Tiền đặt cọc mới |
| anh_dai_dien | file | No | Ảnh đại diện mới (thay thế ảnh cũ) |
| anh_hop_dong | file[] | No | Ảnh hợp đồng thêm mới (cộng vào danh sách cũ) |

#### Logic đổi phòng

Khi `phong_id` thay đổi:
1. Phòng cũ chuyển sang `trang_thai: "available"`
2. Hợp đồng cũ chuyển sang `trang_thai: "expired"`
3. Phòng mới chuyển sang `trang_thai: "occupied"`
4. Tạo hợp đồng mới cho phòng mới (lấy `gia_thue` từ input hoặc giá gốc phòng)

#### Response thành công (200)

```json
{
  "status": "OK",
  "message": "Tenant updated successfully",
  "metadata": {
    "_id": "...",
    "ho_ten": "Nguyễn Văn B",
    "tuoi": 31,
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
  -F "tuoi=31" \
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

### 4. Xóa ảnh

**DELETE** `/api/tenants/:id/image`

Xóa một ảnh cụ thể (ảnh đại diện hoặc ảnh hợp đồng).

#### Request

**Content-Type:** `application/json`

```json
{
  "imagePath": "/uploads/tenants/123456.jpg",
  "imageType": "anh_hop_dong"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| imagePath | string | Yes | Đường dẫn ảnh cần xóa |
| imageType | string | No | Loại ảnh: `"anh_dai_dien"` hoặc `"anh_hop_dong"` (default: `"anh_hop_dong"`) |

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
  -d '{"imagePath": "/uploads/tenants/123456.jpg", "imageType": "anh_hop_dong"}'
```

---

## Error Codes

| HTTP Code | Message | Nguyên nhân |
|-----------|---------|-------------|
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
  ho_ten: String,              // Required
  tuoi: Number,
  so_dien_thoai: String,       // Required
  cmnd_cccd: String,           // Required
  que_quan: String,            // Required
  sdt_lien_he_khan_cap: String,
  anh_dai_dien: String,        // File path
  anh_hop_dong: [String],      // Array of file paths
  ghi_chu: String,
  deleted: Boolean,            // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

### HopDong (Contract)

```javascript
{
  nguoi_thue_id: ObjectId,     // Ref: NguoiThue, Required
  phong_id: ObjectId,          // Required
  ngay_bat_dau: Date,          // Required
  ngay_ket_thuc: Date,
  gia_thue: Number,            // Required
  tien_dat_coc: Number,        // Default: 0
  trang_thai: String           // "active" | "expired"
}
```

### Phong (Room) - embedded in CanHo

```javascript
{
  so_phong: String,
  dien_tich: Number,
  gia: Number,
  trang_thai: String,          // "available" | "occupied"
  noi_that: [NoiThat],
  nguoi_thue_id: ObjectId,     // Ref: NguoiThue
  hop_dong_id: ObjectId        // Ref: HopDong
}
```

---

## File Upload

- **Thư mục lưu:** `uploads/tenants/`
- **Định dạng hỗ trợ:** jpeg, png, gif, webp
- **Kích thước tối đa:** 5MB/ảnh
- **Số lượng tối đa:**
  - `anh_dai_dien`: 1 ảnh
  - `anh_hop_dong`: 5 ảnh
- **Đường dẫn ảnh:** `/uploads/tenants/<filename>`
- **Truy cập ảnh:** `GET http://localhost:5000/uploads/tenants/<filename>`

---

## Transaction Flow

### Create Tenant
```
1. Validate input
2. Check room exists and available
3. [Transaction Start]
   a. Create NguoiThue (with anh_dai_dien, anh_hop_dong)
   b. Create HopDong (active, with gia_thue)
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
   b. Handle images (replace anh_dai_dien, append anh_hop_dong)
   c. If phong_id changed:
      - Old room → available, unlink IDs
      - Old contract → expired
      - New room → occupied, link IDs
      - Create new contract (active, with gia_thue)
   d. Else if gia_thue/ngay_ket_thuc/tien_dat_coc changed:
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
