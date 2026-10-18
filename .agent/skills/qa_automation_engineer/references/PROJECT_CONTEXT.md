# Project Context

## Hướng Dẫn Sử Dụng

File này chứa thông tin ngữ cảnh của dự án đang test. **Agent cần đọc file này trước khi bắt đầu bất kỳ tác vụ automation nào** để hiểu đúng domain và tech stack.

> ⚠️ **Bạn cần cập nhật file này** cho mỗi dự án cụ thể. Dưới đây là template.

---

## Application Overview

- **Tên ứng dụng:** [Tên app]
- **Mô tả:** [Mô tả ngắn về ứng dụng]
- **Loại:** [Web App / Mobile App / API]
- **URL môi trường test:** [URL staging/test]

## Tech Stack

- **Frontend:** [React / Angular / Vue / ...]
- **Backend:** [Java Spring / Node.js / .NET / ...]
- **Database:** [MySQL / PostgreSQL / MongoDB / ...]
- **Authentication:** [JWT / OAuth2 / Session-based / ...]

## Key Features & Modules

| Module | Mô tả | Priority |
|--------|--------|----------|
| Login | Đăng nhập, quên mật khẩu, 2FA | High |
| Dashboard | Trang tổng quan | Medium |
| User Management | CRUD users, phân quyền | High |
| ... | ... | ... |

## Environment Details

> ⚠️ **CẢNH BÁO BẢO MẬT (SECURITY GUARDRAIL):** KHÔNG điền mật khẩu thật dạng plain-text vào file này; chỉ ghi tên biến môi trường trong `.env` (VD: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`) hoặc tên role trong fixture (`adminUser`, `standardUser`).

| Môi trường | URL | Credentials (Biến Môi Trường / Fixture Role) |
|------------|-----|----------------------------------------------|
| Dev | ... | `process.env.DEV_USER_EMAIL` / `adminUser` |
| Staging | ... | `process.env.STAGING_USER_EMAIL` / `standardUser` |
| Production | ... | N/A (Tuyệt đối không chạy automation test trên prod) |

## Notes

- Thêm các lưu ý đặc biệt về business rules, edge cases, hoặc known issues ở đây.
- Quản lý secrets an toàn qua `.env` (không commit `.env` lên Git).
