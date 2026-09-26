# Test Cases for SCRUM-14: [Enroll] Đăng ký ghi danh tham gia khóa học dành cho học viên

## TC_ENROLL_01: Chuyển hướng đến trang Đăng nhập khi khách vãng lai (Guest) nhấn Đăng ký (Redirection)
**Mục tiêu:** Xác nhận hệ thống yêu cầu đăng nhập đối với người dùng chưa xác thực khi cố gắng ghi danh khóa học.
**Pre-condition:**
- Người dùng chưa đăng nhập vào hệ thống (Guest).
**Steps:**
1. Điều hướng tới trang Chi tiết khóa học (`/chitiet/000123456`).
2. Nhấn nút "Đăng ký".
**Expected Results:**
- Hệ thống tự động chuyển hướng người dùng tới trang Đăng nhập (`/login`).
- Trang Đăng nhập hiển thị đầy đủ form đăng nhập.

---

## TC_ENROLL_02: Cảnh báo chặn ghi danh trùng lặp khi đã đăng ký khóa học (Duplicate Enroll Prevention)
**Mục tiêu:** Xác nhận hệ thống ngăn chặn học viên ghi danh lại khóa học mà họ đã tham gia từ trước.
**Pre-condition:**
- Học viên đã đăng nhập tài khoản thành công.
- Học viên đã từng ghi danh khóa học `000123456`.
**Steps:**
1. Đăng nhập với tài khoản học viên hợp lệ.
2. Điều hướng tới trang Chi tiết khóa học (`/chitiet/000123456`).
3. Nhấn nút "Đăng ký".
**Expected Results:**
- Hệ thống hiển thị thông báo SweetAlert dạng cảnh báo (warning).
- Tiêu đề thông báo hiển thị: "Đã đăng ký khóa học này rồi!".
- Khóa học không bị tạo thêm bản ghi ghi danh trùng lặp.

---

## TC_ENROLL_03: Ghi danh thành công khóa học mới khi đã đăng nhập (Happy Path)
**Mục tiêu:** Xác nhận học viên đăng nhập có thể ghi danh thành công một khóa học hợp lệ.
**Pre-condition:**
- Học viên đã đăng nhập vào hệ thống.
- Học viên chưa từng ghi danh khóa học mục tiêu.
**Steps:**
1. Đăng nhập với tài khoản học viên hợp lệ.
2. Điều hướng tới trang Chi tiết khóa học.
3. Nhấn nút "Đăng ký".
**Expected Results:**
- Hệ thống hiển thị thông báo popup SweetAlert thành công (success).
- Tiêu đề thông báo hiển thị: "Đăng kí thành công" (hoặc "Đăng ký thành công").
- Trạng thái ghi danh của học viên được cập nhật.
