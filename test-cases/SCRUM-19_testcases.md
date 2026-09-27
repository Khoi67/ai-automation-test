# Test Cases for SCRUM-19: [Profile] Đổi ảnh đại diện học viên (Upload Profile Avatar)

## TC_AVATAR_01: Tải lên ảnh đại diện hợp lệ thành công (Happy Path)
**Mục tiêu:** Xác nhận học viên có thể tải lên ảnh đại diện định dạng `.png` hợp lệ với dung lượng < 2MB và ảnh được cập nhật hiển thị.
**Pre-condition:**
- Học viên đã đăng nhập tài khoản vào hệ thống.
- Học viên đang ở trang Thông tin cá nhân (`/thongtincanhan`).
**Steps:**
1. Điều hướng tới trang Thông tin cá nhân (`/thongtincanhan`).
2. Định vị khu vực ảnh đại diện (Avatar).
3. Nhấp vào nút/biểu tượng tải ảnh đại diện và chọn file `avatar.png` (dung lượng < 2MB).
4. Nhấn nút "Lưu thay đổi" / "Cập nhật" (nếu có).
**Expected Results:**
- Hệ thống hiển thị thông báo thành công (SweetAlert/Toast: "Cập nhật ảnh đại diện thành công").
- Ảnh đại diện tại trang cá nhân được hiển thị bằng ảnh mới tải lên.

---

## TC_AVATAR_02: Chặn tải lên file ảnh vượt quá dung lượng cho phép (> 2MB)
**Mục tiêu:** Xác nhận hệ thống ngăn chặn người dùng tải lên ảnh có dung lượng vượt quá giới hạn 2MB.
**Pre-condition:**
- Học viên đã đăng nhập và đang ở trang Thông tin cá nhân.
- Chuẩn bị sẵn file ảnh `large_avatar.png` có dung lượng > 2MB (ví dụ: 3MB).
**Steps:**
1. Tại khu vực Avatar, chọn tải lên file `large_avatar.png` (> 2MB).
**Expected Results:**
- Hệ thống chặn tải lên.
- Hiển thị thông báo lỗi cảnh báo: "Dung lượng ảnh không được vượt quá 2MB".
- Ảnh đại diện cũ không bị thay đổi.

---

## TC_AVATAR_03: Chặn tải lên định dạng file không hợp lệ
**Mục tiêu:** Xác nhận hệ thống chỉ chấp nhận định dạng ảnh và từ chối các định dạng file tài liệu, thực thi.
**Pre-condition:**
- Học viên đã đăng nhập và đang ở trang Thông tin cá nhân.
- Chuẩn bị file tài liệu không hợp lệ `document.pdf`.
**Steps:**
1. Tại khu vực Avatar, chọn tải lên file `document.pdf`.
**Expected Results:**
- Input file từ chối hoặc hệ thống hiển thị cảnh báo định dạng không hỗ trợ.
- Không có hành động upload nào được thực hiện.

---

## TC_AVATAR_04: Kiểm tra đồng bộ ảnh đại diện trên thanh Header
**Mục tiêu:** Xác nhận ảnh đại diện mới được đồng bộ tức thì trên thanh Header sau khi tải lên thành công.
**Pre-condition:**
- Học viên vừa cập nhật ảnh đại diện mới thành công tại trang Thông tin cá nhân.
**Steps:**
1. Quan sát ảnh avatar người dùng trên thanh Header góc trên bên phải.
**Expected Results:**
- Ảnh avatar trên thanh Header hiển thị đúng ảnh đại diện mới cập nhật.
