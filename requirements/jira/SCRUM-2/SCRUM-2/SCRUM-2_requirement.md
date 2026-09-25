# SCRUM-2: [UI/API] Tính năng Đăng ký tài khoản

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | SCRUM-2 |
| **Loại** | Story |
| **Trạng thái** | In Progress |
| **Độ ưu tiên** |  |
| **Người giao** | Unassigned |
| **Người báo** | Nguyên Khôi |
| **Labels** | N/A |
| **Components** | N/A |
| **Attachments** | N/A |
| **Ngày tạo** | 2026-09-23T21:22:53.070+0700 |
| **Cập nhật** | 2026-09-23T22:30:35.226+0700 |

## Mô tả (Description)

### 📝 Mô tả (Description):

**User Story:** Là một khách truy cập chưa có tài khoản, tôi muốn có thể đăng ký tài khoản mới trên hệ thống, để tôi có thể tham gia các khóa học và lưu trữ tiến trình học tập của mình.

**Business Rules (Quy tắc nghiệp vụ):**

1. **Tài khoản (Tài khoản/Username):** Bắt buộc, không được chứa khoảng trắng hoặc ký tự đặc biệt, không được trùng với tài khoản đã tồn tại.

2. **Mật khẩu (Password):** Bắt buộc, tối thiểu 6 ký tự.

3. **Họ tên:** Bắt buộc, chỉ chứa chữ cái.

4. **Email:** Bắt buộc, phải đúng định dạng email chuẩn (`@...`) và chưa từng được đăng ký trong hệ thống.

5. **Số điện thoại:** Bắt buộc, chỉ chứa số.

6. **Mã nhóm (Group Code):** Mặc định gửi ngầm hoặc cho phép chọn (VD: `GP01`).

---

### ✅ Tiêu chí chấp nhận (Acceptance Criteria):

**Scenario 1: Đăng ký thành công với thông tin hợp lệ**

- **Given** người dùng đang ở trang Đăng ký (`/register` hoặc `/dang-ky`)

- **When** người dùng điền đầy đủ và đúng định dạng các trường: Tài khoản, Mật khẩu, Họ tên, Email, Số điện thoại

- **And** bấm nút "Đăng ký"

- **Then** hệ thống gọi API tạo tài khoản thành công

- **And** hiển thị thông báo popup màu xanh: "Đăng ký tài khoản thành công"

- **And** tự động chuyển hướng người dùng về trang Đăng nhập

**Scenario 2: Đăng ký thất bại do Tài khoản hoặc Email đã tồn tại**

- **Given** người dùng đang ở trang Đăng ký

- **When** người dùng nhập Tài khoản (Username) hoặc Email đã tồn tại trên hệ thống

- **And** bấm nút "Đăng ký"

- **Then** hệ thống chặn submit và hiển thị thông báo lỗi màu đỏ: "Tài khoản đã tồn tại" hoặc "Email đã được sử dụng!"

- **And** người dùng vẫn ở lại trang Đăng ký để nhập lại dữ liệu

**Scenario 3: Validation lỗi định dạng ngay tại Front-end**

- **Given** người dùng đang ở trang Đăng ký

- **When** người dùng nhập Email sai định dạng (VD: `abc@`) HOẶC để trống một trường bắt buộc

- **And** bấm hoặc click ra ngoài ô input (blur)

- **Then** hệ thống lập tức hiển thị text cảnh báo màu đỏ bên dưới ô input (VD: "Email không đúng định dạng", "Vui lòng nhập họ tên")

- **And** nút "Đăng ký" có thể bị vô hiệu hóa (disabled) cho đến khi điền đúng.

---

### 💾 Test Data & Notes:

- **API Endpoint liên quan:** `POST /api/QuanLyNguoiDung/DangKy`

- **Mã nhóm test:** `GP01` (Lấy từ biến môi trường).

- *Lưu ý Automation Test:* Phải generate Email và Tài khoản tự động (Kèm timestamp) để đảm bảo test chạy đi chạy lại không bị lỗi trùng data.

## Tiêu chí chấp nhận (Acceptance Criteria)

_Không có_
