# Requirements: SCRUM-6 - [Auth] Chức năng Quên mật khẩu và Khôi phục quyền truy cập tài khoản

## 1. User Story
- **Là một:** Học viên / Người dùng đã có tài khoản trên hệ thống E-Learning
- **Tôi muốn:** Yêu cầu lấy lại mật khẩu thông qua địa chỉ Email đã đăng ký
- **Để mà:** Tôi có thể khôi phục quyền truy cập vào tài khoản và tiếp tục học tập khi quên mật khẩu cũ.

---

## 2. Acceptance Criteria (Tiêu chí chấp nhận)

### AC 1: Yêu cầu khôi phục thành công với Email hợp lệ
- **Given:** Người dùng đang ở trang Đăng nhập (`/login`).
- **When:** Nhấp vào liên kết "Quên mật khẩu?", nhập địa chỉ Email chính xác đã tồn tại trên hệ thống và bấm "Gửi yêu cầu".
- **Then:** Hệ thống hiển thị thông báo thành công: *"Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn."*

### AC 2: Báo lỗi khi Email không tồn tại trong hệ thống
- **Given:** Người dùng đang ở form Quên mật khẩu.
- **When:** Nhập địa chỉ Email chưa từng được đăng ký tài khoản và bấm "Gửi yêu cầu".
- **Then:** Hệ thống hiển thị thông báo lỗi: *"Email này không tồn tại trong hệ thống. Vui lòng kiểm tra lại."*

### AC 3: Validation trường bắt buộc & định dạng Email
- **Given:** Người dùng đang ở form Quên mật khẩu.
- **When:** Để trống ô Email hoặc nhập sai định dạng (ví dụ: `abc@`, `user@domain`), sau đó bấm "Gửi yêu cầu".
- **Then:** Hệ thống hiển thị cảnh báo lỗi định dạng ngay dưới ô nhập liệu và chặn gửi yêu cầu.

---

## 3. Requirement Gate Evaluation
- **Trạng thái:** ✅ **PASSED**
- **Đánh giá:** Tiêu chí chấp nhận (AC) đã rõ ràng, có đầy đủ Given-When-Then, đủ điều kiện để chuyển sang Bước 2 sinh Test Cases.
