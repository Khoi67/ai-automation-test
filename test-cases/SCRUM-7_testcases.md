# Test Cases for SCRUM-7: [Course] Tìm kiếm khóa học theo từ khóa trên Trang chủ

## TC_SEARCH_01: Tìm kiếm có kết quả phù hợp (Happy Path)
**Mục tiêu:** Xác nhận hệ thống lọc và hiển thị đúng các khóa học chứa từ khóa tìm kiếm.
**Pre-condition:**
- Truy cập thành công URL `https://demo2.cybersoft.edu.vn/`.
**Steps:**
1. Điều hướng tới trang chủ.
2. Nhập từ khóa hợp lệ vào ô tìm kiếm (vd: `Lập trình` hoặc `React`).
3. Nhấn phím `Enter` hoặc click icon Search.
**Expected Results:**
- Hệ thống hiển thị danh sách các thẻ khóa học.
- Tên các khóa học (course cards) có chứa từ khóa vừa tìm kiếm (không phân biệt hoa/thường).

## TC_SEARCH_02: Tìm kiếm không có kết quả
**Mục tiêu:** Xác nhận hệ thống xử lý đúng khi tìm kiếm từ khóa không tồn tại.
**Pre-condition:**
- Truy cập thành công URL `https://demo2.cybersoft.edu.vn/`.
**Steps:**
1. Điều hướng tới trang chủ.
2. Nhập từ khóa không tồn tại (vd: `xyz123randomnotfound`) vào ô tìm kiếm.
3. Nhấn phím `Enter` hoặc click icon Search.
**Expected Results:**
- Không có thẻ khóa học nào được hiển thị (hoặc có thông báo không tìm thấy).
- Giao diện không bị lỗi hiển thị (crash hay vỡ layout).

## TC_SEARCH_03: Tìm kiếm với chuỗi rỗng
**Mục tiêu:** Xác nhận hệ thống hiển thị toàn bộ khóa học khi ô tìm kiếm rỗng.
**Pre-condition:**
- Truy cập thành công URL `https://demo2.cybersoft.edu.vn/`.
**Steps:**
1. Điều hướng tới trang chủ.
2. Để trống ô tìm kiếm (nếu đang có chữ thì xóa sạch).
3. Nhấn phím `Enter` hoặc click icon Search.
**Expected Results:**
- Hệ thống hiển thị toàn bộ danh sách khóa học mặc định.
- Số lượng khóa học (course cards) lớn hơn 0.
