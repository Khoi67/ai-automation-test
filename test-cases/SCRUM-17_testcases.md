# Test Cases for SCRUM-17: [Profile] Xem danh sách khóa học đã ghi danh và Hủy ghi danh

## Mục tiêu kiểm thử
Xác minh chức năng xem danh sách khóa học đã ghi danh và hủy ghi danh của học viên trên trang thông tin cá nhân. Đảm bảo bảo mật truy cập.

## Test Cases

### TC01: Hiển thị danh sách khóa học đã ghi danh (Happy Path)
- **Mô tả:** Kiểm tra hiển thị danh sách khóa học khi học viên truy cập trang `/thongtincanhan`.
- **Pre-condition:** Học viên đã đăng nhập và đã ghi danh ít nhất 1 khóa học.
- **Steps:**
  1. Truy cập đường dẫn `/thongtincanhan`.
- **Expected Result:**
  - Hệ thống hiển thị danh sách các khóa học đã ghi danh.
  - Mỗi khóa học có đầy đủ thông tin: tên khóa học, hình ảnh, ngày đăng ký, và nút "Hủy ghi danh".

### TC02: Hủy ghi danh khóa học thành công (Happy Path)
- **Mô tả:** Kiểm tra chức năng hủy ghi danh khóa học của học viên.
- **Pre-condition:** Học viên đã đăng nhập, ở trang `/thongtincanhan` và có ít nhất 1 khóa học trong danh sách.
- **Steps:**
  1. Nhấn nút "Hủy ghi danh" tại một khóa học bất kỳ.
  2. Xác nhận hủy trên hộp thoại SweetAlert.
- **Expected Result:**
  - Hộp thoại xác nhận hiển thị chính xác.
  - Khóa học bị xóa khỏi danh sách.
  - Hiển thị thông báo "Hủy ghi danh thành công!".

### TC03: Hủy thao tác "Hủy ghi danh"
- **Mô tả:** Kiểm tra khi học viên nhấn Hủy trên hộp thoại xác nhận.
- **Pre-condition:** Học viên đã đăng nhập, ở trang `/thongtincanhan` và có ít nhất 1 khóa học trong danh sách.
- **Steps:**
  1. Nhấn nút "Hủy ghi danh" tại một khóa học.
  2. Nhấn nút "Hủy" hoặc đóng hộp thoại xác nhận.
- **Expected Result:**
  - Khóa học không bị xóa khỏi danh sách.
  - Không có thông báo hủy thành công.

### TC04: Chặn truy cập khi chưa đăng nhập (Negative Path)
- **Mô tả:** Kiểm tra bảo mật truy cập trang `/thongtincanhan`.
- **Pre-condition:** Người dùng chưa đăng nhập.
- **Steps:**
  1. Truy cập trực tiếp đường dẫn `/thongtincanhan`.
- **Expected Result:**
  - Hệ thống tự động chuyển hướng người dùng về trang `/login`.

### TC05: Hiển thị khi chưa ghi danh khóa học nào (Edge Case)
- **Mô tả:** Kiểm tra giao diện khi học viên chưa ghi danh khóa học nào.
- **Pre-condition:** Học viên đã đăng nhập nhưng chưa ghi danh khóa học nào.
- **Steps:**
  1. Truy cập đường dẫn `/thongtincanhan`.
- **Expected Result:**
  - Không có lỗi xảy ra.
  - Hiển thị thông báo phù hợp (vd: "Bạn chưa ghi danh khóa học nào").
