# Test Cases for SCRUM-6: [Auth] Chức năng Quên mật khẩu và Khôi phục quyền truy cập tài khoản

> **URL Target:** https://demo2.cybersoft.edu.vn/login
> **Jira:** SCRUM-6 | Priority: Medium | Status: In Progress
> **Lưu ý:** Trang Quên mật khẩu trên demo2.cybersoft.edu.vn hiện tại chưa implement đầy đủ (link href="#", không có trang /forgot-password riêng, không có API endpoint). Test cases được thiết kế dựa trên hiện trạng thực tế của hệ thống.

---

## TC_FORGOT_01: Xác nhận link "Quên mật khẩu?" hiển thị trên trang Đăng nhập
**Mục tiêu:** Xác nhận giao diện trang Đăng nhập có hiển thị link "Quên mật khẩu?" cho người dùng.
**Pre-condition:**
- Truy cập được URL `https://demo2.cybersoft.edu.vn/login`.
**Steps:**
1. Điều hướng tới trang Đăng nhập (`/login`).
2. Quan sát form đăng nhập (phần bên trái hoặc trung tâm).
3. Kiểm tra sự tồn tại của link "Quên mật khẩu?" bên dưới ô Mật khẩu.
**Expected Results:**
- Link "Quên mật khẩu?" hiển thị rõ ràng trên trang Đăng nhập.
- Link có thể click được (role=link).
- Link nằm trong khu vực form đăng nhập, dưới ô "Mật khẩu" và trên nút "Đăng nhập".
**Priority:** High | **Automatable:** Yes | **Auto Type:** UI

---

## TC_FORGOT_02: Kiểm tra hành vi khi click link "Quên mật khẩu?"
**Mục tiêu:** Xác nhận hành vi thực tế khi người dùng click vào link "Quên mật khẩu?".
**Pre-condition:**
- Đang ở trang Đăng nhập (`/login`).
**Steps:**
1. Điều hướng tới trang Đăng nhập.
2. Click vào link "Quên mật khẩu?".
3. Quan sát hành vi: URL có thay đổi không? Có modal/popup hiện lên không? Có chuyển trang không?
**Expected Results:**
- URL thay đổi thành `/login#` (anchor link).
- Trang KHÔNG chuyển đến trang mới (vẫn ở trang login).
- Hiện tại chức năng chưa được implement → không có form nhập email hay popup nào xuất hiện.
**Test Data:** N/A
**Priority:** High | **Automatable:** Yes | **Auto Type:** UI

---

## TC_FORGOT_03: Kiểm tra trang /forgot-password trả về 404
**Mục tiêu:** Xác nhận truy cập trực tiếp URL `/forgot-password` trả về trang lỗi 404.
**Pre-condition:**
- Truy cập được domain `https://demo2.cybersoft.edu.vn`.
**Steps:**
1. Điều hướng trực tiếp đến URL `https://demo2.cybersoft.edu.vn/forgot-password`.
2. Quan sát nội dung trang hiển thị.
**Expected Results:**
- Trang hiển thị tiêu đề "404".
- Hiển thị thông báo "Có gì đó sai ở đây".
- Có nút/link "Quay về trang chủ" cho phép người dùng quay lại.
**Priority:** Medium | **Automatable:** Yes | **Auto Type:** UI

---

## TC_FORGOT_04: Xác nhận link "Quên mật khẩu?" không ảnh hưởng đến form Đăng nhập
**Mục tiêu:** Kiểm tra rằng sau khi click "Quên mật khẩu?", form đăng nhập vẫn hoạt động bình thường.
**Pre-condition:**
- Đang ở trang Đăng nhập.
**Steps:**
1. Điều hướng tới trang Đăng nhập.
2. Nhập Tài khoản: `admin` vào ô Tài khoản.
3. Nhập Mật khẩu: `admin123` vào ô Mật khẩu.
4. Click vào link "Quên mật khẩu?".
5. Kiểm tra dữ liệu trong các ô nhập liệu có bị mất không.
6. Click nút "Đăng nhập".
**Expected Results:**
- Dữ liệu đã nhập trong ô Tài khoản và Mật khẩu vẫn giữ nguyên sau khi click link.
- Form đăng nhập vẫn submit được bình thường.
- Đăng nhập thành công (nếu tài khoản hợp lệ).
**Test Data:**
- Tài khoản: `admin`
- Mật khẩu: `admin123`
**Priority:** Medium | **Automatable:** Yes | **Auto Type:** UI
