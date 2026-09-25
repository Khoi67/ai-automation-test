# Test Cases for SCRUM-6: [Auth] Chức năng Quên mật khẩu và Khôi phục quyền truy cập tài khoản

## TC_FORGOT_01: Yêu cầu khôi phục mật khẩu thành công với Email hợp lệ (Happy Path)
**Mục tiêu:** Xác nhận hệ thống gửi email khôi phục mật khẩu thành công khi nhập email đã tồn tại.
**Pre-condition:**
- Người dùng đã truy cập trang Đăng nhập `https://demo2.cybersoft.edu.vn/login`.
- Email `test_valid_user@gmail.com` đã được đăng ký tài khoản trên hệ thống.
**Steps:**
1. Điều hướng tới trang Đăng nhập (`/login`).
2. Nhấp vào liên kết "Quên mật khẩu?".
3. Nhập email hợp lệ: `test_valid_user@gmail.com`.
4. Nhấn nút "Gửi yêu cầu" (hoặc nút Xác nhận).
**Expected Results:**
- Hệ thống hiển thị thông báo thành công: "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn."
- Không có lỗi hệ thống (500) xảy ra.

## TC_FORGOT_02: Yêu cầu khôi phục mật khẩu với Email không tồn tại (Negative Path)
**Mục tiêu:** Xác nhận hệ thống báo lỗi khi nhập email chưa từng đăng ký.
**Pre-condition:**
- Người dùng đã truy cập trang Đăng nhập `https://demo2.cybersoft.edu.vn/login`.
- Email `nonexistent_user_1712049@auto.test` chưa từng tồn tại trên hệ thống.
**Steps:**
1. Điều hướng tới trang Đăng nhập (`/login`).
2. Nhấp vào liên kết "Quên mật khẩu?".
3. Nhập email chưa đăng ký: `nonexistent_user_1712049@auto.test`.
4. Nhấn nút "Gửi yêu cầu".
**Expected Results:**
- Hệ thống hiển thị thông báo lỗi: "Email này không tồn tại trong hệ thống. Vui lòng kiểm tra lại."
- Hệ thống không gửi email và không tạo token reset.

## TC_FORGOT_03: Validation khi để trống trường Email (Empty Field)
**Mục tiêu:** Xác nhận hệ thống chặn gửi yêu cầu khi trường email để trống.
**Pre-condition:**
- Người dùng đang mở form Quên mật khẩu.
**Steps:**
1. Điều hướng tới trang Đăng nhập (`/login`).
2. Nhấp vào liên kết "Quên mật khẩu?".
3. Để trống ô nhập Email.
4. Nhấn nút "Gửi yêu cầu".
**Expected Results:**
- Hệ thống hiển thị thông báo yêu cầu bắt buộc: "Vui lòng nhập email."
- Nút gửi yêu cầu bị chặn, không có request gửi lên server.

## TC_FORGOT_04: Validation khi nhập Email sai định dạng (Invalid Format)
**Mục tiêu:** Xác nhận hệ thống kiểm tra tính hợp lệ của định dạng email.
**Pre-condition:**
- Người dùng đang mở form Quên mật khẩu.
**Steps:**
1. Điều hướng tới trang Đăng nhập (`/login`).
2. Nhấp vào liên kết "Quên mật khẩu?".
3. Nhập email sai định dạng (vd: `invalid_email_format`).
4. Nhấn nút "Gửi yêu cầu".
**Expected Results:**
- Hệ thống hiển thị thông báo lỗi định dạng: "Email không hợp lệ."
- Chặn không cho gửi yêu cầu lên server.
