# Requirements: SCRUM-24 - [API-Course] API Đăng ký và Hủy ghi danh khóa học dành cho học viên (Enrollment & Unenrollment API)

## 1. User Story
- **Là một:** Học viên đã đăng ký tài khoản trên V Learning
- **Tôi muốn:** Gửi yêu cầu API để Đăng ký tham gia khóa học và Hủy ghi danh khóa học bằng AccessToken
- **Để mà:** Hệ thống ghi nhận việc tham gia học tập của tôi và cập nhật danh sách khóa học cá nhân ngay lập tức.

---

## 2. API Contract Specification

### 📌 Endpoint 1: Đăng ký khóa học
- **Method:** `POST`
- **URL:** `/api/QuanLyKhoaHoc/DangKyKhoaHoc`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <accessToken>` (Bắt buộc)
- **Request Body:**
```json
{
  "maKhoaHoc": "string",
  "taiKhoan": "string"
}
```

### 📌 Endpoint 2: Hủy ghi danh khóa học
- **Method:** `POST`
- **URL:** `/api/QuanLyKhoaHoc/HuyGhiDanh`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <accessToken>` (Bắt buộc)
- **Request Body:**
```json
{
  "maKhoaHoc": "string",
  "taiKhoan": "string"
}
```

---

## 3. Acceptance Criteria (Tiêu chí chấp nhận)

### 🟢 AC 1: Đăng ký khóa học thành công với Token hợp lệ (Happy Path)
- **Given:** Học viên đã xác thực hợp lệ (có Bearer Token) và một mã khóa học hợp lệ chưa từng ghi danh.
- **When:** Gửi request `POST /api/QuanLyKhoaHoc/DangKyKhoaHoc` kèm body `maKhoaHoc` và `taiKhoan`.
- **Then:**
  - HTTP Status Code trả về phải là `200 OK`.
  - Response body chứa thông báo đăng ký thành công (hoặc status 200).
  - Response time phải dưới `2000ms`.

### 🔴 AC 2: Chặn đăng ký khi thiếu hoặc sai AccessToken (Unauthorized)
- **Given:** Không truyền Header `Authorization` hoặc truyền token hết hạn / sai định dạng.
- **When:** Gửi request `POST /api/QuanLyKhoaHoc/DangKyKhoaHoc`.
- **Then:**
  - HTTP Status Code trả về phải là `401 Unauthorized` (hoặc từ chối không trả về 200).

### 🔴 AC 3: Chặn đăng ký trùng lặp khóa học đã ghi danh (Conflict / Business Validation)
- **Given:** Khóa học này học viên *đã đăng ký thành công* trước đó.
- **When:** Gửi lại request `POST /api/QuanLyKhoaHoc/DangKyKhoaHoc` với cùng `maKhoaHoc` và `taiKhoan`.
- **Then:**
  - Hệ thống từ chối và cảnh báo học viên đã đăng ký khóa học này rồi (HTTP Status `400 Bad Request` hoặc `500` kèm message cảnh báo).
  - *Chống False Healing:* Tuyệt đối không chấp nhận ghi danh 2 lần thành công.

### 🟢 AC 4: Hủy ghi danh khóa học thành công (Happy Path)
- **Given:** Học viên đang theo học một khóa học (đã ghi danh ở AC 1).
- **When:** Gửi request `POST /api/QuanLyKhoaHoc/HuyGhiDanh` kèm Bearer Token của học viên.
- **Then:**
  - HTTP Status Code trả về phải là `200 OK`.
  - Khóa học được gỡ khỏi danh sách đã xét duyệt của học viên.

---

## 4. Ma Trận Dữ Liệu Kiểm Thử (Test Data Strategy)
- **Tài khoản test:** Sinh động qua API (`auto_api_user_<timestamp>`) để đảm bảo tính độc lập và sạch sẽ.
- **Mã khóa học:** Lấy tự động qua API `GET /api/QuanLyKhoaHoc/LayDanhSachKhoaHoc` (tránh hardcode mã khóa học có thể bị xóa).

---

## 5. Requirement Gate Evaluation
- **Trạng thái:** ✅ **PASSED**
- **Đánh giá:** Requirement API cực kỳ rõ ràng, có đầy đủ endpoint, payload, headers, status codes và acceptance criteria.
