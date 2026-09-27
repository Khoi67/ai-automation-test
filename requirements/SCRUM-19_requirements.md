# Requirements: SCRUM-19 - [Profile] Đổi ảnh đại diện học viên (Upload Profile Avatar)

## 1. User Story
- **Là một:** Học viên đã đăng nhập vào hệ thống V Learning
- **Tôi muốn:** Truy cập trang Thông tin cá nhân (`/thongtincanhan`), bấm vào avatar để tải lên file ảnh `avatar.png` (< 2MB)
- **Để mà:** Tôi có thể cá nhân hóa tài khoản và thấy ảnh đại diện mới được cập nhật ngay trên Header.

---

## 2. Acceptance Criteria (Tiêu chí chấp nhận)

### AC 1: Tải lên ảnh đại diện hợp lệ thành công
- **Given:** Học viên đã đăng nhập và đang ở trang Thông tin cá nhân (`/thongtincanhan`).
- **When:** Nhấp vào ảnh đại diện/nút đổi avatar, chọn file ảnh hợp lệ (`avatar.png`, kích thước < 2MB) và xác nhận.
- **Then:** Hệ thống hiển thị thông báo tải lên thành công, ảnh đại diện tại trang thông tin cá nhân và trên thanh Header được cập nhật sang ảnh mới.

### AC 2: Chặn tải lên file vượt quá dung lượng cho phép (> 2MB)
- **Given:** Học viên đang ở trang Thông tin cá nhân.
- **When:** Chọn file ảnh có dung lượng lớn hơn 2MB.
- **Then:** Hệ thống hiển thị cảnh báo lỗi: dung lượng ảnh không được vượt quá 2MB và chặn upload.

### AC 3: Chặn tải lên định dạng file không hợp lệ
- **Given:** Học viên đang ở trang Thông tin cá nhân.
- **When:** Cố gắng chọn file không phải định dạng ảnh (ví dụ: `.pdf`, `.docx`, `.exe`).
- **Then:** Hệ thống từ chối file và hiển thị thông báo yêu cầu định dạng ảnh hợp lệ (`.jpg`, `.jpeg`, `.png`).

---

## 3. Requirement Gate Evaluation
- **Trạng thái:** ✅ **PASSED**
- **Đánh giá:** Yêu cầu rõ ràng, có tiêu chí chấp nhận cụ thể, có thể đo lường và kiểm thử được.
