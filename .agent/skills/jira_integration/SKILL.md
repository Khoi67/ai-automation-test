---
name: jira_integration
description: Skill tích hợp Jira/Xray — lấy requirements từ Jira, xác thực Xray, và đẩy kết quả test lên Xray Cloud/Server.
---

# Jira & Xray Integration Skill

## Mô tả

Skill này cung cấp khả năng tích hợp giữa Antigravity Testing Kit với hệ thống Jira và Xray để:

1. **Lấy Requirements/User Stories** từ Jira → chuyển thành tài liệu yêu cầu chuẩn
2. **Xác thực Xray** (Cloud hoặc Server/Data Center)
3. **Đẩy kết quả test** (Playwright, JUnit, Allure) lên Xray Test Management

---

## Khi nào sử dụng

Agent sử dụng skill này khi user yêu cầu:

- Lấy requirement / user story từ Jira
- Kết nối / test connection đến Jira API
- Đẩy kết quả test lên Xray
- Import test results lên Jira
- Xác thực Xray token
- Tích hợp CI/CD với Jira

Trigger keywords:
- "fetch jira", "lấy requirement từ jira", "get jira ticket"
- "import xray", "đẩy kết quả lên xray", "push test results"
- "test jira connection", "kiểm tra kết nối jira"

---

## Cấu trúc Scripts

```
scripts/integrations/
├── jira/
│   ├── jira_fetcher.js      # Lấy Requirement/User Story từ Jira
│   ├── jira_transition.js   # Cập nhật trạng thái Jira Ticket (In Progress, In Review, Done)
│   ├── jira_create_bug.js    # Tự động tạo ticket Bug liên kết với Story khi test fail
│   ├── xray_auth.js         # Xác thực và lấy Token Xray
│   ├── xray_importer.js     # Import kết quả test lên Xray
│   └── utils.js             # Hàm utility dùng chung
└── package.json             # Dependencies (axios, dotenv)
```

---

## Điều kiện tiên quyết (Prerequisites)

### 1. Cài đặt dependencies

```bash
cd scripts/integrations
npm install
```

### 2. Cấu hình .env

Copy `.env.example` thành `.env` ở thư mục gốc project:

```bash
cp .env.example .env
```

Điền các thông tin bắt buộc:

| Biến | Mô tả | Bắt buộc |
|------|--------|----------|
| `JIRA_BASE_URL` | URL Jira instance (VD: `https://domain.atlassian.net`) | ✅ |
| `JIRA_EMAIL` | Email tài khoản Jira (Cloud) | ✅ (Cloud) |
| `JIRA_API_TOKEN` | API Token (Cloud) | ✅ (Cloud) |
| `JIRA_PAT` | Personal Access Token (Server/DC) | ✅ (Server) |
| `JIRA_PROJECT_KEY` | Project key mặc định | Khuyến nghị |
| `XRAY_PLATFORM` | `cloud` hoặc `server` | Mặc định: cloud |
| `XRAY_CLIENT_ID` | Xray API Client ID | Khi dùng Xray Cloud |
| `XRAY_CLIENT_SECRET` | Xray API Client Secret | Khi dùng Xray Cloud |

### 3. Cách lấy Jira API Token (Cloud)

1. Đăng nhập vào [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Nhấn **Create API token**
3. Đặt label (VD: "Antigravity Automation")
4. Copy token → dán vào `JIRA_API_TOKEN` trong file `.env`

### 4. Cách lấy Xray Cloud API Key

1. Truy cập [https://app.getxray.app](https://app.getxray.app) → Settings → API Keys
2. Hoặc trong Jira: Apps → Xray → Settings → API Keys
3. Tạo API Key mới → Copy **Client ID** và **Client Secret**

---

## Hướng dẫn sử dụng

### Lấy 1 issue cụ thể

```bash
node scripts/integrations/jira/jira_fetcher.js --issue PROJ-123
```

### Lấy issues theo project

```bash
node scripts/integrations/jira/jira_fetcher.js --project PROJ --type Story --max 20
```

### Tìm theo JQL

```bash
node scripts/integrations/jira/jira_fetcher.js --jql "project = PROJ AND status = 'To Do'"
```

### Xuất thành Markdown requirement

```bash
node scripts/integrations/jira/jira_fetcher.js --issue PROJ-123 --format md
```

### Lấy children của Epic

```bash
node scripts/integrations/jira/jira_fetcher.js --epic PROJ-10 --format md
```

### Chuyển trạng thái Jira Issue (Transition Workflow)

```bash
# Đổi trạng thái sang In Progress, In Review, hoặc Done
node scripts/integrations/jira/jira_transition.js --issue PROJ-123 --status "In Progress"
node scripts/integrations/jira/jira_transition.js --issue PROJ-123 --status "In Review"
node scripts/integrations/jira/jira_transition.js --issue PROJ-123 --status "Done"
```

### Tự động tạo Bug liên kết khi phát hiện App Bug

```bash
node scripts/integrations/jira/jira_create_bug.js --parent PROJ-123 --tc TC_02 --summary "[Cart] Khóa học hiển thị sai thuế VAT" --actual "Thuế tính 15% thay vì 10%" --attachment "auto"
```

### Test Xray authentication

```bash
node scripts/integrations/jira/xray_auth.js
node scripts/integrations/jira/xray_auth.js --verify
```

### Import kết quả Playwright lên Xray

```bash
node scripts/integrations/jira/xray_importer.js --format playwright --file ./test-results.json --project PROJ
```

### Import JUnit XML lên Xray

```bash
node scripts/integrations/jira/xray_importer.js --format junit --file ./junit-results.xml --project PROJ
```

---

## Workflow liên quan

| Workflow | Mô tả |
|----------|--------|
| `/fetch_jira_requirements` | Lấy requirements từ Jira ticket và lưu thành file |
| `/e2e_jira_to_automation` | Tự động hóa trọn gói từ Jira issue đến push Git và chuyển trạng thái ticket |
| `/e2e_retest_bug` | Retest bug, bỏ fixme, push Git và đóng bug ticket trên Jira |
| `/import_test_results_xray` | Đẩy kết quả test lên Xray |

---

## Lưu ý quan trọng

- **Bảo mật AI Agent (Security Guardrail):**
  - **CẤM TUYỆT ĐỐI** AI Agent dùng công cụ đọc file (`view_file`, `run_command` dạng `cat .env`) để mở và in toàn bộ nội dung file `.env` lên context hội thoại.
  - Agent chỉ được phép kiểm tra sự tồn tại của file (`git status`, kiểm tra file exist). Các scripts Node.js đã tự động nạp biến qua thư viện `dotenv`.
  - KHÔNG bao giờ commit file `.env` lên Git (`.gitignore` đã cấu hình bỏ qua `.env`).
- **Rate Limiting**: Jira Cloud có giới hạn API calls. Script đã hỗ trợ phân trang (pagination) để tránh vượt limit.
- **Atlassian Document Format (ADF)**: Jira Cloud sử dụng ADF cho description. Script tự động chuyển đổi ADF → plain text.
- **Test Key Convention**: Đồng bộ mã Jira thông qua Playwright Tag trong `test.describe`:
  ```typescript
  test.describe('Chức năng Giỏ hàng', { tag: ['@SCRUM-18', '@cart'] }, () => { ... });
  ```
  Khi import Xray, hệ thống sẽ map tag `@<JIRA_KEY>` trực tiếp với issue hoặc test case trên Jira/Xray.

---

## Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| HTTP 401 | Token/password sai | Kiểm tra JIRA_API_TOKEN hoặc JIRA_PAT |
| HTTP 403 | Không có quyền | Kiểm tra permission trên Jira project |
| HTTP 404 | URL sai hoặc issue không tồn tại | Kiểm tra JIRA_BASE_URL và issue key |
| `ENOTFOUND` | DNS không resolve | Kiểm tra JIRA_BASE_URL có đúng domain không |
| `ECONNREFUSED` | Server không chạy | Kiểm tra Jira Server có online không |
| File .env not found | Chưa tạo .env | Copy `.env.example` → `.env` |
