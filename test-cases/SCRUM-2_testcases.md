# Test Cases for SCRUM-2: Tính năng Đăng ký tài khoản (User Registration)

## TC_REG_01: Đăng ký thành công với thông tin hợp lệ
**Mục tiêu:** Xác nhận hệ thống cho phép người dùng đăng ký thành công khi cung cấp thông tin hợp lệ.
**Pre-condition:**
- Có URL trang đăng ký.
- Tạo test data động (random) để tránh trùng lặp: `username`, `email` dựa trên timestamp.
**Steps:**
1. Điều hướng tới trang Đăng ký.
2. Nhập `Tài khoản` (Username ngẫu nhiên, vd: `auto_testuser_{timestamp}`).
3. Nhập `Mật khẩu` hợp lệ (vd: `Password@123`).
4. Nhập `Họ tên` hợp lệ (vd: `Nguyen Van A`).
5. Nhập `Email` hợp lệ ngẫu nhiên (vd: `auto_testuser_{timestamp}@email.com`).
6. Nhập `Số điện thoại` hợp lệ (vd: `0901234567`).
7. Bấm nút `Đăng ký`.
**Expected Results:**
- Giao diện hiển thị thông báo popup màu xanh: "Đăng ký tài khoản thành công".
- Hệ thống điều hướng tự động hoặc có thể chuyển sang trang Đăng nhập.
- Tài khoản mới có thể được dùng để gọi API Đăng nhập thành công.

## TC_REG_02: Đăng ký thất bại do Tài khoản đã tồn tại
**Mục tiêu:** Xác nhận hệ thống báo lỗi khi dùng Tài khoản (Username) đã có trong DB.
**Pre-condition:**
- Đã tồn tại sẵn một tài khoản trong hệ thống (vd: lấy từ `TEST_USERNAME` hoặc tài khoản vừa tạo ở TC_REG_01).
**Steps:**
1. Điều hướng tới trang Đăng ký.
2. Nhập `Tài khoản` đã tồn tại (vd: `khai123` hoặc `TEST_USERNAME`).
3. Nhập `Mật khẩu`, `Họ tên`, `Số điện thoại` hợp lệ.
4. Nhập `Email` mới (ngẫu nhiên).
5. Bấm nút `Đăng ký`.
**Expected Results:**
- Hệ thống hiển thị thông báo lỗi màu đỏ: "Tài khoản đã tồn tại".
- Không điều hướng sang trang khác, người dùng vẫn ở lại trang Đăng ký.

## TC_REG_03: Đăng ký thất bại do Email đã tồn tại
**Mục tiêu:** Xác nhận hệ thống báo lỗi khi dùng Email đã có trong DB.
**Pre-condition:**
- Đã tồn tại sẵn một email trong hệ thống (vd email của user vừa tạo ở TC_REG_01).
**Steps:**
1. Điều hướng tới trang Đăng ký.
2. Nhập `Tài khoản` mới (ngẫu nhiên).
3. Nhập `Mật khẩu`, `Họ tên`, `Số điện thoại` hợp lệ.
4. Nhập `Email` đã tồn tại.
5. Bấm nút `Đăng ký`.
**Expected Results:**
- Hệ thống hiển thị thông báo lỗi màu đỏ liên quan đến "Email đã được sử dụng!".
- Không điều hướng sang trang khác, người dùng vẫn ở lại trang Đăng ký.

## TC_REG_04: Cảnh báo lỗi Front-end khi bỏ trống trường bắt buộc
**Mục tiêu:** Kiểm tra client-side validation khi không nhập dữ liệu.
**Steps:**
1. Điều hướng tới trang Đăng ký.
2. Để trống ô `Tài khoản` hoặc `Mật khẩu` (focus rồi blur ra ngoài).
3. Bấm nút `Đăng ký` (nếu có thể bấm).
**Expected Results:**
- Hiển thị dòng chữ cảnh báo lỗi ngay dưới ô nhập liệu tương ứng (vd: "Tài khoản không được để trống", "Mật khẩu không được để trống").
- Không có request API nào được gửi đi (Client side validation).

## TC_REG_05: Cảnh báo lỗi Front-end khi Email sai định dạng
**Mục tiêu:** Kiểm tra client-side validation cho trường Email.
**Steps:**
1. Điều hướng tới trang Đăng ký.
2. Nhập vào ô `Email` chuỗi sai định dạng (vd: `emailkhonghople@`).
3. Click ra ngoài ô nhập liệu.
**Expected Results:**
- Hiển thị dòng chữ cảnh báo lỗi ngay dưới ô Email (vd: "Email không đúng định dạng").
- Không cho phép submit form (hoặc block request API).
