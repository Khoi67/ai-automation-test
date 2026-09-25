# SCRUM-7: [Course] Tìm kiếm khóa học theo từ khóa trên Trang chủ

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | SCRUM-7 |
| **Loại** | Story |
| **Trạng thái** | In Progress |
| **Độ ưu tiên** | Medium |
| **Người giao** | Unassigned |
| **Người báo** | Nguyên Khôi |
| **Labels** | N/A |
| **Components** | N/A |
| **Attachments** | N/A |
| **Ngày tạo** | 2026-09-25T19:37:25.800+0700 |
| **Cập nhật** | 2026-09-25T19:38:03.047+0700 |

## Mô tả (Description)

#### Descriptions:

```markdown
### 1. User Story
**As a** người dùng truy cập trang V Learning,  
**I want to** nhập từ khóa vào ô tìm kiếm trên trang chủ,  
**So that** tôi có thể nhanh chóng tìm thấy các khóa học phù hợp với nhu cầu.

---

### 2. Phạm vi & Môi trường (Scope & Environment)
- **Web UI Target:** `https://demo2.cybersoft.edu.vn/`
- **Component:** Thanh tìm kiếm khóa học trên Header / Hero section (`input[placeholder*="tìm"]`).
- **API Endpoint:** `GET https://elearningnew.cybersoft.edu.vn/api/QuanLyKhoaHoc/LayDanhSachKhoaHoc?tenKhoaHoc={keyword}&MaNhom=GP01`

---

### 3. Acceptance Criteria (Tiêu chí chấp nhận)

#### AC1: Tìm kiếm có kết quả phù hợp
- **Given:** Người dùng ở trang chủ `https://demo2.cybersoft.edu.vn/`.
- **When:** Nhập từ khóa hợp lệ có trong danh sách khóa học (ví dụ: `"React"`, `"Java"`, `"Lập trình"`) và nhấn Enter hoặc icon Search.
- **Then:**
  - Hệ thống lọc và hiển thị danh sách các thẻ khóa học (course cards).
  - Tên các khóa học hiển thị phải chứa từ khóa tìm kiếm (không phân biệt hoa thường).

#### AC2: Tìm kiếm không có kết quả
- **Given:** Người dùng ở trang chủ.
- **When:** Nhập từ khóa không tồn tại trong hệ thống (ví dụ: `"xyz123randomnotfound"`) và nhấn Enter.
- **Then:**
  - Hệ thống hiển thị thông báo "Không tìm thấy khóa học phù hợp" hoặc danh sách trống (0 kết quả).
  - Giao diện không bị crash hay vỡ layout.

#### AC3: Tìm kiếm với chuỗi rỗng
- **Given:** Người dùng ở trang chủ.
- **When:** Ô tìm kiếm để trống và người dùng nhấn Enter.
- **Then:**
  - Hệ thống hiển thị toàn bộ danh sách khóa học mặc định.
```

## Tiêu chí chấp nhận (Acceptance Criteria)

_Không có_
