# V Learning — Playwright + TypeScript Automation Framework

Framework kiểm thử tự động toàn diện (End-to-End Automation Testing) cho hệ thống đào tạo trực tuyến **V Learning** (CyberSoft), hỗ trợ cả **Web UI Testing** và **API Testing** trên nền tảng **Playwright + TypeScript**.

---

## 📌 Bảng thông tin hệ thống

| Thông tin | Giá trị |
|---|---|
| **Web UI Target** | `https://demo2.cybersoft.edu.vn/` |
| **API Base URL** | `https://elearningnew.cybersoft.edu.vn` |
| **Tech Stack** | Playwright, TypeScript, Node.js (>= 18) |
| **Design Pattern** | Page Object Model (POM) + Workflow Orchestration |
| **Test Runner** | Playwright Test Runner (`@playwright/test`) |
| **Reporting** | Playwright HTML Report & Allure Report |
| **CI/CD** | GitHub Actions + GitHub Pages (Auto-deploy Allure Report) |
| **Integrations** | Jira Software, Xray Cloud, Telegram Bot Event-Driven Trigger |

---

## 📂 Cấu trúc thư mục dự án

```text
demo-ai-automation/
├── .agent/               # AI QA Automation Rules, Skills & Workflows
├── .github/
│   └── workflows/
│       └── playwright.yml # CI/CD pipeline GitHub Actions & Allure Pages
├── constant/             # Các hằng số URL, timeouts, configuration
├── core/                 # Core utilities: API client, base fixtures, helper functions
├── data-object/          # TypeScript interfaces/models (UI & API request/response)
├── fixture/              # Playwright test fixtures kết hợp POM, Services & Workflows
├── page-object/          # Page Object classes (chỉ chứa locators & actions, không assert)
│   ├── components/       # Header, Footer, Shared Modals
│   ├── forgot-password-page.ts
│   ├── home-page.ts
│   ├── login-page.ts
│   └── register-page.ts
├── requirements/         # Tài liệu yêu cầu chi tiết đồng bộ từ Jira
├── scratch/              # Tệp runtime phục vụ Telegram Bot trigger (notify.js, trigger.txt)
├── scripts/              # Scripts tiện ích: Telegram Bot daemon, Jira fetcher
│   ├── integrations/jira/jira_fetcher.js
│   └── telegram_bot.js
├── services/             # API Service wrappers (Auth, User, Course)
├── test-cases/           # Tài liệu Test Cases chuẩn RBT (SCRUM-2, SCRUM-6,...)
├── test-data/            # Dữ liệu kiểm thử ngoại vi
├── tests/                # Test specifications
│   ├── api/              # API Test specs (auth.spec.ts, course.spec.ts)
│   └── ui/               # UI Test specs (login.spec.ts, register.spec.ts, forgot-password.spec.ts)
├── workflow/             # Workflow orchestration (kết hợp Page Objects và API services)
│   ├── api/              # API flows (auth-workflow.ts, course-workflow.ts)
│   └── ui/               # UI flows (login-workflow.ts, course-workflow.ts)
├── .env.example          # Mẫu cấu hình biến môi trường
├── package.json          # Dependencies & npm scripts
├── playwright.config.ts  # Cấu hình Playwright (browsers, viewports, reporters)
├── README.md             # Hướng dẫn dự án chi tiết
└── start-bot.bat         # Script khởi động Telegram Bot nhanh trên Windows
```

---

## ⚙️ Cài đặt & Chuẩn bị môi trường

### 1. Cài đặt Dependencies và Trình duyệt Playwright

Yêu cầu máy tính đã cài đặt **Node.js >= 18**:

```bash
# Cài đặt các thư viện phụ thuộc
npm install

# Cài đặt trình duyệt Chromium cho Playwright
npx playwright install chromium
```

### 2. Thiết lập Biến môi trường (`.env`)

Sao chép file mẫu `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Mở tệp `.env` và điền đầy đủ các thông tin:

```ini
# UI Base URL
UI_BASE_URL=https://demo2.cybersoft.edu.vn

# API Base URL
API_BASE_URL=https://elearningnew.cybersoft.edu.vn

# CyberSoft Platform Token (Bắt buộc cho mọi API request)
TOKEN_CYBERSOFT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mã nhóm bài học / quản lý
MA_NHOM=GP01

# Tài khoản test tĩnh (tùy chọn)
TEST_USERNAME=khai123
TEST_PASSWORD=Password@123

# Cấu hình Jira Integration (tùy chọn)
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=SCRUM

# Cấu hình Telegram Bot Trigger (tùy chọn)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

> ⚠️ **Lưu ý bảo mật**: Không bao giờ commit file `.env` chứa token/mật khẩu thật lên Git repository.

---

## 🚀 Hướng dẫn Chạy Test

### 1. Lệnh thực thi cơ bản

```bash
# Chạy tất cả các test (UI và API)
npm test

# Chạy riêng nhóm UI tests
npm run test:ui

# Chạy riêng nhóm API tests
npm run test:api

# Chạy UI test với trình duyệt hiển thị (Headed mode - để quan sát trực quan)
npm run test:headed
```

### 2. Chạy từng file test hoặc test case cụ thể

```bash
# Chạy duy nhất file kiểm thử Đăng ký
npx playwright test tests/ui/register.spec.ts

# Chạy file Quên mật khẩu
npx playwright test tests/ui/forgot-password.spec.ts

# Chạy file Đăng nhập
npx playwright test tests/ui/login.spec.ts

# Chạy test theo tên/mã Test Case cụ thể (sử dụng cờ -g)
npx playwright test -g "TC_REG_01"

# Chạy chế độ UI tương tác của Playwright (Playwright Test UI Mode)
npx playwright test --ui

# Chạy chế độ Debug từng bước (Playwright Inspector)
npx playwright test --debug
```

### 3. Kiểm tra kiểu dữ liệu TypeScript

```bash
npm run typecheck
```

---

## 📊 Xem Báo cáo Kiểm thử (Reporting)

### 1. Báo cáo HTML mặc định của Playwright

Sau khi chạy xong test, xem báo cáo trực quan với biểu đồ, hình chụp và video lỗi:

```bash
npm run report
```

### 2. Báo cáo chuyên nghiệp với Allure Report

```bash
# 1. Chạy toàn bộ test và xuất dữ liệu Allure
npm run test:allure

# 2. Sinh báo cáo Allure HTML tĩnh từ thư mục allure-results
npm run generate:allure

# 3. Khởi chạy máy chủ cục bộ để xem Allure Report trên trình duyệt
npm run report:allure

# 4. Dọn dẹp các thư mục báo cáo và artifacts tạm thời
npm run clean
```

---

## 🤖 Điều khiển Tự động hóa qua Telegram Bot

Dự án tích hợp cơ chế Event-Driven giúp kích hoạt luồng Automation trực tiếp từ Telegram:

1. Khởi động Bot:
   ```bash
   npm run bot
   # Hoặc nhấp đúp vào file start-bot.bat trên Windows
   ```
2. Mở Telegram và gửi lệnh cho bot:
   - `/start` hoặc `/help`: Xem hướng dẫn sử dụng.
   - `Bắt đầu SCRUM-6` (hoặc bất kỳ ticket nào): Bot sẽ tự động kéo requirements từ Jira, tạo test case, sinh mã nguồn POM, thực thi kiểm thử và gửi kết quả kèm commit ID trực tiếp về Telegram.

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Dự án đã được cấu hình CI/CD hoàn chỉnh trong `.github/workflows/playwright.yml`:

- **Kích hoạt tự động**: Khi có `push` hoặc `pull_request` vào nhánh `main` / `master`.
- **Hỗ trợ chạy thủ công (`workflow_dispatch`)**: Cho phép chọn chạy toàn bộ (`all`), chỉ UI (`ui`), hoặc chỉ API (`api`).
- **Tự động xuất bản Báo cáo**: Sau khi test xong, GitHub Actions sẽ tự động biên dịch Allure Report và deploy lên **GitHub Pages**.
- **Cấu hình GitHub Secrets cần thiết trong Repository Settings**:
  - `UI_BASE_URL`
  - `API_BASE_URL`
  - `TOKEN_CYBERSOFT`
  - `TEST_USERNAME`
  - `TEST_PASSWORD`

---

## 📐 Kiến trúc & Nguyên tắc Thiết kế (Design Principles)

1. **Page Object Model (POM)**:
   - Tất cả các Locators và Hành vi người dùng (User Actions) nằm trong thư mục `page-object/`.
   - **Không viết `expect()` hay assertions trong Page class**. Tất cả assertion phải nằm trong file `tests/`.
2. **Quy tắc Test Data**:
   - Dữ liệu độc lập và traceable: Tài khoản và email sinh tự động phải unique.
   - Giới hạn độ dài: Hệ thống backend quy định độ dài tài khoản (`taiKhoan`) tối đa là **16 ký tự**. Hàm `generateUsername()` trong `core/utils/string.ts` đã được thiết kế đảm bảo quy chuẩn này.
3. **Smart Waits**:
   - Không sử dụng `Thread.sleep` hay hardcoded `waitForTimeout()`.
   - Sử dụng cơ chế auto-waiting của Playwright và `expect(locator).toBeVisible()`.

---

## 🤖 AI Automation Agent (`.agent/`)

Hệ thống cấu hình và chuẩn hoá cho AI Automation Agent (Rules, Skills và Workflows) trong thư mục `.agent/` được xây dựng, tham khảo và kế thừa từ cộng đồng **[Anh Tester](https://anhtester.com)**:

- **`.agent/rules/`**: Bộ quy tắc chuẩn cho Automation Testing (Quy ước đặt tên POM, chiến lược chọn locator bền vững, quy chuẩn Playwright, Selenium, Appium, API Testing).
- **`.agent/skills/`**: Các bộ kỹ năng chuyên sâu cho AI Agent (QA Automation Engineer, UI Debug, Smart Locator, Locator Healer, Flaky Test Analyzer, Test Data Generator).
- **`.agent/workflows/`**: Quy trình chuẩn hóa thực thi tự động (Phân tích Requirement từ Jira/Website, AI-RBT Manual Testing 6 bước, sinh Test Cases, chuyển đổi sang Automation Script E2E).

> 🌟 **Nguồn tham khảo / Credits:**  
> Toàn bộ tài nguyên, quy chuẩn và kiến trúc `.agent` được tham khảo và phát triển dựa trên chia sẻ từ **[Anh Tester](https://anhtester.com)** — Nền tảng & cộng đồng đào tạo kiểm thử phần mềm tự động (Software Testing & Automation) hàng đầu tại Việt Nam.

