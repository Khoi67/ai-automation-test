# Test Cases for SCRUM-24: [API-Course] API Đăng ký và Hủy ghi danh khóa học dành cho học viên

## 1. Mục Tiêu & Phạm Vi Kiểm Thử
Kiểm thử chức năng API Đăng ký khóa học (`/api/QuanLyKhoaHoc/DangKyKhoaHoc`) và Hủy ghi danh khóa học (`/api/QuanLyKhoaHoc/HuyGhiDanh`) với các ràng buộc về xác thực token, tính hợp lệ của mã khóa học, tính toàn vẹn dữ liệu và chống False Healing.

---

## 2. Danh Sách Test Cases Chi Tiết

| TC ID | Tiêu đề Test Case | Phân loại | Pre-condition | Các bước thực hiện (Steps) | Dữ liệu kiểm thử (Test Data) | Kết quả kỳ vọng (Expected Result) | Độ ưu tiên |
|---|---|---|---|---|---|---|---|
| `TC_API_ENROLL_01` | Đăng ký khóa học thành công với Token hợp lệ | Happy Path | Có tài khoản test mới và mã khóa học hợp lệ | 1. Đăng nhập lấy `accessToken`<br>2. Gửi request `POST /api/QuanLyKhoaHoc/DangKyKhoaHoc` kèm header `Authorization: Bearer <accessToken>` | Header: `Bearer <token>`<br>Body: `{ "maKhoaHoc": "<VALID_ID>", "taiKhoan": "<USER>" }` | - HTTP Status: `200 OK`<br>- Response time < 2000ms<br>- Response chứa thông báo thành công | `Critical` |
| `TC_API_ENROLL_02` | Chặn đăng ký khi không truyền Bearer Token | Negative (Auth) | Có tài khoản và mã khóa học | 1. Gửi request `POST /api/QuanLyKhoaHoc/DangKyKhoaHoc` không có header `Authorization` | Header: Không có Authorization<br>Body: `{ "maKhoaHoc": "<VALID_ID>", "taiKhoan": "<USER>" }` | - HTTP Status: `401 Unauthorized` hoặc khác `200`<br>- Hệ thống từ chối ghi danh | `High` |
| `TC_API_ENROLL_03` | Chặn đăng ký khi truyền Token không hợp lệ | Negative (Auth) | Có mã khóa học | 1. Gửi request `POST /api/QuanLyKhoaHoc/DangKyKhoaHoc` với Bearer Token giả | Header: `Bearer invalid_token_xyz_123`<br>Body: `{ "maKhoaHoc": "<VALID_ID>", "taiKhoan": "<USER>" }` | - HTTP Status: `401 Unauthorized` hoặc `403 Forbidden` | `Medium` |
| `TC_API_ENROLL_04` | Chặn đăng ký trùng lặp khóa học đã ghi danh | Negative (Business) | Học viên đã đăng ký khóa học này ở TC_01 | 1. Gửi lại request `POST /api/QuanLyKhoaHoc/DangKyKhoaHoc` với cùng khóa học và tài khoản | Header: `Bearer <token>`<br>Body: `{ "maKhoaHoc": "<VALID_ID>", "taiKhoan": "<USER>" }` | - HTTP Status: `400 Bad Request` hoặc `500` (cảnh báo đã đăng ký)<br>- **Cấm False Healing:** Không được trả về 200 ghi danh mới | `High` |
| `TC_API_ENROLL_05` | Hủy ghi danh khóa học thành công | Happy Path | Học viên đang ghi danh khóa học | 1. Gửi request `POST /api/QuanLyKhoaHoc/HuyGhiDanh` kèm Bearer Token | Header: `Bearer <token>`<br>Body: `{ "maKhoaHoc": "<VALID_ID>", "taiKhoan": "<USER>" }` | - HTTP Status: `200 OK`<br>- Khóa học được gỡ khỏi danh sách đã đăng ký của học viên | `Critical` |
| `TC_API_ENROLL_06` | Chặn hủy ghi danh khi không có AccessToken | Negative (Auth) | Có mã khóa học | 1. Gửi request `POST /api/QuanLyKhoaHoc/HuyGhiDanh` không gửi token | Header: Không có Authorization<br>Body: `{ "maKhoaHoc": "<VALID_ID>", "taiKhoan": "<USER>" }` | - HTTP Status: `401 Unauthorized` hoặc khác `200` | `Medium` |

---

## 3. Test Case Gate Evaluation
- **Độ bao phủ (Coverage):** 100% các Acceptance Criteria của `SCRUM-24`.
- **Trạng thái:** ✅ **PASSED** — Đầy đủ Happy Path, Negative Path (Auth & Business Logic).
