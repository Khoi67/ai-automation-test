# Test Cases for SCRUM-18: [Cart] Thêm khóa học vào Giỏ hàng & Áp dụng mã giảm giá

## Yêu cầu
Là học viên, tôi muốn có nút "Thêm vào giỏ hàng" tại mỗi khóa học, xem trang Giỏ hàng (/giohang) và nhập mã giảm giá CYBER2026 để được giảm 20% học phí.

## Test Cases

### TC_CART_01: Thêm khóa học vào giỏ hàng thành công
- **Precondition:** Đang ở trang danh sách khóa học hoặc chi tiết khóa học.
- **Steps:**
  1. Click vào nút "Thêm vào giỏ hàng" của một khóa học.
- **Expected Result:**
  - Hiển thị thông báo thêm thành công.
  - Số lượng item trên biểu tượng giỏ hàng tăng lên.

### TC_CART_02: Xem trang Giỏ hàng
- **Precondition:** Giỏ hàng đang có ít nhất 1 khóa học.
- **Steps:**
  1. Điều hướng đến trang `/giohang`.
- **Expected Result:**
  - Hiển thị danh sách khóa học đã thêm.
  - Hiển thị tổng tiền chính xác.

### TC_CART_03: Áp dụng mã giảm giá hợp lệ
- **Precondition:** Đang ở trang Giỏ hàng và có khóa học trong giỏ.
- **Steps:**
  1. Nhập mã `CYBER2026` vào ô mã giảm giá.
  2. Click "Áp dụng".
- **Expected Result:**
  - Hiển thị thông báo áp dụng mã thành công.
  - Tổng tiền được giảm đúng 20%.

### TC_CART_04: Áp dụng mã giảm giá không hợp lệ
- **Precondition:** Đang ở trang Giỏ hàng.
- **Steps:**
  1. Nhập mã `INVALID_CODE` vào ô mã giảm giá.
  2. Click "Áp dụng".
- **Expected Result:**
  - Hiển thị thông báo lỗi "Mã giảm giá không hợp lệ".
  - Tổng tiền giữ nguyên.
