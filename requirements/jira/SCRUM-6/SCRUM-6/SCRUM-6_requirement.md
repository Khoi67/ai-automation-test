# SCRUM-6: [Auth] Chức năng Quên mật khẩu và Khôi phục quyền truy cập tài khoản

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | SCRUM-6 |
| **Loại** | Story |
| **Trạng thái** | In Progress |
| **Độ ưu tiên** | Medium |
| **Người giao** | Unassigned |
| **Người báo** | Nguyên Khôi |
| **Labels** | N/A |
| **Components** | N/A |
| **Attachments** | N/A |
| **Ngày tạo** | 2026-09-23T23:12:44.387+0700 |
| **Cập nhật** | 2026-09-23T23:13:12.544+0700 |

## Mô tả (Description)

#### **1. User Story**

- **Là một:** Học viên / Người dùng đã có tài khoản trên hệ thống E-Learning

- **Tôi muốn:** Yêu cầu lấy lại mật khẩu thông qua địa chỉ Email đã đăng ký

- **Để mà:** Tôi có thể khôi phục quyền truy cập vào tài khoản và tiếp tục học tập khi quên mật khẩu cũ.

---

#### **2. Acceptance Criteria (Tiêu chí chấp nhận)**

- **AC 1: Yêu cầu khôi phục thành công với Email hợp lệ** **Given:** Người dùng đang ở trang Quên mật khẩu (`/forgot-password` hoặc pop-up Quên mật khẩu).**When:** Nhập địa chỉ Email chính xác đã tồn tại trên hệ thống và bấm **"Gửi yêu cầu"**.**Then:** Hệ thống gửi email chứa liên kết/mã OTP đặt lại mật khẩu và hiển thị thông báo thành công: *"Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn."*

- **AC 2: Xử lý khi Email không tồn tại trên hệ thống** **Given:** Người dùng đang ở màn hình Quên mật khẩu.**When:** Nhập Email có định dạng hợp lệ nhưng **chưa từng được đăng ký** trên hệ thống và bấm **"Gửi yêu cầu"**.**Then:** Hệ thống hiển thị cảnh báo: *"Email này chưa được đăng ký trong hệ thống!"*.

- **AC 3: Kiểm tra định dạng Email không hợp lệ (Front-end Validation)** **Given:** Người dùng đang ở màn hình Quên mật khẩu.**When:** Nhập Email sai định dạng (ví dụ: `nguyenvana`, `user@.com`, `user@gmail`) và rời khỏi ô nhập hoặc bấm **"Gửi yêu cầu"**.**Then:** Nút submit bị vô hiệu hóa hoặc xuất hiện dòng cảnh báo đỏ ngay dưới ô nhập: *"Email không đúng định dạng!"*.

- **AC 4: Kiểm tra trường bắt buộc (Empty Validation)** **Given:** Người dùng đang ở màn hình Quên mật khẩu.**When:** Để trống trường Email và bấm **"Gửi yêu cầu"**.**Then:** Hệ thống cảnh báo: *"Vui lòng nhập địa chỉ email của bạn!"*.

- **AC 5: Đặt lại mật khẩu mới (Reset Password)** **Given:** Người dùng mở liên kết đặt lại mật khẩu từ email (hoặc nhập đúng mã OTP).**When:** Nhập mật khẩu mới thỏa mãn độ dài (ít nhất 6 ký tự) và xác nhận mật khẩu khớp nhau $\rightarrow$ bấm **"Xác nhận"**.**Then:** Hệ thống cập nhật mật khẩu mới, thông báo thành công và tự động chuyển hướng về trang Đăng nhập (`/login`).

---

#### **3. Test Data tham khảo**

- **Valid Email:** `testuser_valid@example.com`

- **Non-existent Email:** `notfound_user_99999@example.com`

- **Invalid Formats:** `invalid-email`, `abc@`, `@domain.com`

## Tiêu chí chấp nhận (Acceptance Criteria)

_Không có_
