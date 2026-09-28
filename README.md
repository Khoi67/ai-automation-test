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
| **Integrations** | Jira Software, Telegram Bot Event-Driven Trigger |

---

## 📂 Cấu trúc thư mục dự án

```text
demo-ai-automation/
├── .agent/               # AI QA Automation Rules, Skills & Workflows
├── .github/
│   └── workflows/
│       └── playwright.yml # CI/CD pipeline GitHub Actions & Allure Pages & Telegram Notify
├── constant/             # Các hằng số URL, timeouts, configuration
├── core/                 # Core utilities: API client, base fixtures, helper functions
├── data-object/          # TypeScript interfaces/models (UI & API request/response)
├── fixture/              # Playwright test fixtures kết hợp POM, Services & Workflows
├── page-object/          # Page Object classes (chỉ chứa locators & actions, không assert)
│   ├── components/       # Header, Footer, Shared Modals
│   ├── forgot-password-page.ts
│   ├── home-page.ts
│   ├── login-page.ts
│   ├── profile-page.ts   # Trang thông tin cá nhân & tải lên ảnh đại diện
│   └── register-page.ts
├── requirements/         # Tài liệu yêu cầu chi tiết đồng bộ từ Jira
├── scratch/              # Tệp runtime phục vụ Telegram Bot trigger (trigger.txt, push_trigger.txt)
├── scripts/              # Scripts tiện ích: Telegram Bot daemon, Jira integration, Utils
│   ├── integrations/
│   │   ├── git_push_delivery.js # Bàn giao Git & kích hoạt quy trình CI/CD
│   │   ├── notify_ci.js         # Gửi thông báo kết quả GitHub Actions CI/CD
│   │   ├── notify_step.js       # Bắn thông báo có dấu chuẩn từng bước về Telegram Bot
│   │   ├── report_local_test.js # Báo cáo kết quả kiểm thử local kèm nút duyệt Push
│   │   ├── trigger_server.js    # Local HTTP server nhận webhook trigger
│   │   └── jira/
│   │       ├── jira_create_bug.js # Tự động tạo Bug trên Jira + gửi Telegram kèm screenshot
│   │       ├── jira_fetcher.js    # Kéo User Stories/Requirements từ Jira Cloud
│   │       ├── jira_sync.js       # Đồng bộ và so khớp thay đổi requirements Jira
│   │       └── jira_transition.js # Tự động chuyển trạng thái Ticket (In Progress, In Review)
│   ├── utils/            # Thư viện tiện ích dùng chung (DRY Architecture)
│   │   ├── index.js             # Barrel export cho toàn bộ utils
│   │   ├── cli.js               # Tiện ích chuẩn hóa phân tích tham số dòng lệnh (parseArgs)
│   │   ├── jira_api.js          # Jira REST API client & helpers (auth headers, extract bugs, JQL)
│   │   ├── telegram_api.js      # Telegram Bot client đa năng (native fetch Node 18+, messages, photos)
│   │   └── telegram_ui.js       # UI Components & chuẩn hoá nút điều hướng Telegram Bot
│   └── telegram_bot.js        # Telegram Assistant Bot (Zero-Config, Long-Polling)
├── services/             # API Service wrappers (Auth, User, Course)
├── test-cases/           # Tài liệu Test Cases chuẩn RBT (SCRUM-2, SCRUM-6, SCRUM-19,...)
├── test-data/            # Dữ liệu kiểm thử ngoại vi & Fixture files (avatar.png, document.pdf,...)
│   └── ui/               # Ảnh và tệp đính kèm kiểm thử UI
├── tests/                # Test specifications
│   ├── api/              # API Test specs (auth.spec.ts, course.spec.ts)
│   └── ui/               # UI Test specs (login, register, forgot-password, search, profile-avatar, enroll)
├── workflow/             # Workflow orchestration (kết hợp Page Objects và API services)
├── .env.example          # Mẫu cấu hình biến môi trường
├── package.json          # Dependencies & npm scripts
├── playwright.config.ts  # Cấu hình Playwright (browsers, viewports, reporters)
├── docker-compose.yml    # Cấu hình khởi chạy Telegram Bot container
└── README.md             # Hướng dẫn dự án chi tiết
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

## 🤖 Quy trình Vận hành AI Automation End-to-End (Telegram Bot + Antigravity IDE)

Hệ thống hỗ trợ quy trình tự động hóa khép kín: **Jira Cloud ➔ Telegram Bot ➔ Antigravity AI Agent ➔ Playwright Test ➔ Tự động Phân loại & Log Bug ➔ Git Push ➔ CI/CD ➔ Báo cáo Telegram**.

```mermaid
sequenceDiagram
    autonumber
    actor User as Tester / PM
    participant TG as Telegram Bot (Docker)
    participant TF as scratch/trigger.txt
    participant IDE as Antigravity AI Agent
    participant Jira as Jira Cloud
    participant PW as Playwright Tests
    participant Git as GitHub Actions

    User->>TG: Bấm "🚀 Chạy Automation SCRUM-X" (hoặc gửi /start)
    TG->>TF: Ghi mã Ticket vào trigger.txt
    TG-->>User: Phản hồi đã chuyển lệnh cho AI Agent
    User->>IDE: Gõ lệnh: /e2e_jira_to_automation trigger.txt
    IDE->>TF: Đọc mã Ticket từ trigger.txt
    IDE->>Jira: Bước 1: Kéo Requirement & Kiểm tra Requirement Gate
    IDE->>IDE: Bước 2: Sinh Manual Test Cases & Kiểm tra Test Case Gate
    IDE->>IDE: Bước 3: Thiết kế Page Object (POM) & Viết Test Spec
    IDE->>PW: Bước 4: Thực thi test & Phân loại lỗi (Failure Classification)
    alt Phát hiện App Bug
        IDE->>Jira: Tự động tạo Bug, link blocks Story & đính kèm screenshot Playwright
        IDE->>TG: Bắn ảnh screenshot kèm thông tin lỗi chi tiết về Bot
    else Test PASS x2
        Note over IDE: Đạt tiêu chuẩn Definition of Done
    end
    IDE->>Git: Bước 5: Git commit & push lên main
    IDE->>Jira: Bước 6: Chuyển trạng thái Ticket sang "In Review"
    IDE->>TG: Gửi báo cáo tổng kết hoàn tất quy trình
```

---

### Các bước thực hiện chi tiết:

#### 🔹 Bước 1: Khởi động Telegram Bot Daemon (Docker)
Khởi động container bot chạy ngầm bằng Docker Compose:
* **Khởi chạy container ngầm:**
  ```bash
  docker compose up -d
  # hoặc: npm run docker:up
  ```
* **Xem logs trực tiếp:**
  ```bash
  docker compose logs -f bot
  # hoặc: npm run docker:logs
  ```
* **Dừng bot:**
  ```bash
  docker compose down
  # hoặc: npm run docker:down
  ```
> 💡 *Container được cấu hình `restart: unless-stopped` giúp Bot luôn tự động thức dậy cùng hệ thống mỗi khi máy tính bật lại.*

---

#### 🔹 Bước 2: Kích hoạt Ticket từ Telegram
1. Mở Telegram và nhắn tin với Bot.
2. Gửi lệnh `/start` hoặc bấm nút **"🔄 Quét lại Jira"**:
   * Bot sẽ tự động truy vấn Jira Cloud và chỉ hiển thị danh sách các User Stories đang ở trạng thái **`In Progress`**.
3. Bấm vào nút inline tương ứng: **"🚀 Chạy Automation SCRUM-X"** (hoặc gửi tin nhắn: `bắt đầu SCRUM-X`):
   * Bot sẽ ghi mã ticket vào file `scratch/trigger.txt`.
   * Bot gửi phản hồi thông báo đã tiếp nhận và sẵn sàng chuyển tiếp cho AI Agent.

---

#### 🔹 Bước 3: Kích hoạt AI Agent trong Antigravity IDE
1. Mở cửa sổ chat của **Antigravity IDE**.
2. Nhập lệnh sau vào ô chat và nhấn Enter:
   ```text
   /e2e_jira_to_automation trigger.txt
   ```
   *(Hoặc bạn có thể gọi trực tiếp theo mã ticket: `/e2e_jira_to_automation SCRUM-X`)*

---

#### 🔹 Bước 4: AI Agent tự động thực thi trọn vẹn 6 bước
AI Agent sẽ tự động đọc `scratch/trigger.txt` và lần lượt thực thi:

1. **Bước 1: Kéo Requirements từ Jira (`/fetch_jira_requirements`)**
   * Tải User Story, Acceptance Criteria và lưu tại `requirements/<KEY>_requirements.md`.
   * Kiểm tra **Requirement Gate**: Đảm bảo yêu cầu rõ ràng, khả thi để kiểm thử.
   * Bắn thông báo tiến độ về Telegram Bot.

2. **Bước 2: Phân tích & Sinh Manual Test Cases (`/generate_testcases_from_requirements`)**
   * Áp dụng kỹ thuật phân vùng tương đương (EP), phân tích giá trị biên (BVA).
   * Lưu bộ test cases chuẩn tại `test-cases/<KEY>_testcases.md`.
   * Kiểm tra **Test Case Gate**: Đảm bảo bao phủ Happy Path, Negative Path và Boundary.
   * Bắn thông báo tiến độ về Telegram Bot.

3. **Bước 3: Thiết kế Page Object (POM) & Test Specs**
   * Tạo/cập nhật Page Objects trong `page-object/` (chỉ chứa Locators & Actions, không chứa assertions).
   * Viết test specs tương ứng trong `tests/ui/<feature>.spec.ts`.
   * Bắn thông báo tiến độ về Telegram Bot.

4. **Bước 4: Chạy Kiểm Thử & Phân Loại Lỗi (Failure Classification)**
   * Chạy kiểm thử tự động với Playwright: `npx playwright test`.
   * **Nếu lỗi do automation (locator/timeout):** Tự kích hoạt Self-Healing sửa code cho đến khi PASS ổn định 2 lần liên tiếp.
   * **Nếu lỗi do ứng dụng (Application Bug / Chưa triển khai logic):**
     * Dừng test, đánh dấu FAILED (tuyệt đối không sửa code test để ép PASS).
     * Tự động chụp ảnh màn hình bằng chứng lỗi tại thời điểm fail.
     * Tự động gọi script `scripts/integrations/jira/jira_create_bug.js`:
       * Tự động đồng bộ 100% Precondition, Steps, Expected Result từ Test Case sang Bug trên Jira.
       * Upload ảnh bằng chứng lỗi lên Jira issue.
       * Thiết lập liên kết: Bug ➡️ **blocks** ➡️ User Story.
       * Bắn ảnh chụp bằng chứng lỗi và thông tin chi tiết về Telegram Bot.
     * **Cơ chế CI Safety (`test.fixme`):** Để giữ trọn vẹn test script trên Git nhưng **không làm FAIL pipeline CI/CD trên Cloud**, Agent tự động gắn cờ `test.fixme(...)` cho test case bị dính bug kèm chú thích mã Bug:
       ```typescript
       // Đánh dấu fixme do Bug <BUG_KEY> trên Jira: <LÝ_DO>
       test.fixme('TC_XXX: <Tên test case>', async ({ page }) => { ... });
       ```
   * **Báo cáo kết quả Local & Cổng phê duyệt (Approval Gate):**
     * Agent chạy `report_local_test.js` gửi tóm tắt PASS / FAIL / BUG về Telegram kèm nút bấm `[🚀 Duyệt & Push Git]`. Agent dừng lại và chờ Tester phê duyệt.

5. **Bước 5: Phê Duyệt & Đẩy Mã Nguồn Lên GitHub (Git Delivery)**
   * Khi Tester bấm nút duyệt trên Telegram hoặc xác nhận trên IDE:
   * Script `git_push_delivery.js` tự động stage, commit chuẩn Conventional Commits và push lên nhánh `main`.
   * Chuyển trạng thái Ticket trên Jira sang **`In Review`** qua `jira_transition.js`.
   * Bắn thông báo xác nhận bàn giao về Telegram Bot.

6. **Bước 6: Kích Hoạt CI/CD & Báo Cáo Kết Quả Tự Động**
   * Bắn thông báo tiến độ Bước 6 về Telegram Bot.
   * GitHub Actions tự động kích hoạt workflow kiểm thử trên Cloud (Ubuntu runner, headless mode).
   * Biên dịch Allure Report và tự động xuất bản lên **GitHub Pages**.
   * **Thông báo kết quả CI về Telegram Bot:** Job `notify` trên GitHub Actions tự động gửi tin nhắn báo cáo kết quả (Trạng thái PASS/FAIL, Người commit, Mã commit, Link Allure Report, Link GitHub Actions Run) trực tiếp về Telegram Bot.

---

### 🔄 Quy trình Kiểm Thử Lại Bug Sau Khi Dev Sửa Xong (`/e2e_retest_bug`)

Khi một Bug trên ứng dụng đã được đội ngũ Developer khắc phục xong và cập nhật trạng thái trên Jira:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / Tester
    participant TG as Telegram Bot
    participant TF as scratch/trigger.txt
    participant IDE as Antigravity AI Agent
    participant PW as Playwright (Headed 1920x1080)
    participant Git as GitHub Actions
    participant Jira as Jira Cloud

    Dev->>TG: Bấm "🔄 Test Lại (SCRUM-X)"
    TG->>TF: Ghi mã Ticket vào trigger.txt
    Dev->>IDE: Gõ lệnh: /e2e_retest_bug trigger.txt
    IDE->>IDE: Bước 1: Tìm Spec file & gỡ bỏ cờ test.fixme
    IDE->>PW: Bước 2: Chạy kiểm thử trực tiếp trên UI thật
    alt Retest Vẫn Thất Bại (Chưa Fix Xong)
        IDE->>IDE: Tự động khôi phục cờ test.fixme (Bảo vệ CI)
        IDE->>TG: Bắn cảnh báo LỖI kèm nguyên nhân chi tiết
    else Retest Thành Công (PASS x2)
        IDE->>TG: Báo cáo kết quả kiểm thử đạt chuẩn
        IDE->>Git: Tự động Commit & Push code lên main
        IDE->>Jira: Chuyển trạng thái sang "In Review"
        IDE->>TG: Thông báo hoàn tất quy trình Retest
    end
```

#### Các điểm cốt lõi của Retest Workflow:
1. **Nhận diện thông minh**: Telegram Bot tự động quét liên kết `issuelinks` trên Jira. Nếu Story đang gắn Bug, nút bấm tự chuyển thành **`[🔄 Test Lại (SCRUM-X)]`** thay vì sinh lại code từ đầu.
2. **Bảo toàn CI Safety**: Test case được tạm mở (`test(...)` thay vì `test.fixme(...)`). Nếu test vẫn **FAIL** trên UI thật, Agent **tự động hoàn tác lại cờ `test.fixme`** để tránh làm vỡ pipeline CI/CD khi đồng nghiệp push code.
3. **Báo cáo chuẩn hoá & Nhất quán**: Thông báo lỗi hoặc thành công được tích hợp các nút điều hướng chuẩn (`Quét User Story Mới`, `Danh sách Story`, `Xem Bugs`, `Trạng thái`).

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Dự án đã được cấu hình CI/CD hoàn chỉnh trong `.github/workflows/playwright.yml`:

- **Kích hoạt tự động**: Khi có `push` hoặc `pull_request` vào nhánh `main` / `master`.
- **Hỗ trợ chạy thủ công (`workflow_dispatch`)**: Cho phép chọn chạy toàn bộ (`all`), chỉ UI (`ui`), hoặc chỉ API (`api`).
- **Tự động xuất bản Báo cáo**: Sau khi test xong, GitHub Actions sẽ tự động biên dịch Allure Report và deploy lên **GitHub Pages**.
- **Tự động thông báo về Telegram Bot**: Gửi ngay kết quả kiểm thử trên Cloud và đường dẫn Allure Report về nhóm chat/kênh Telegram của bạn.
- **Cấu hình GitHub Secrets cần thiết trong Repository Settings (Settings ➔ Secrets and variables ➔ Actions)**:
  - `UI_BASE_URL`: URL trang web kiểm thử (`https://demo2.cybersoft.edu.vn`)
  - `API_BASE_URL`: URL hệ thống API (`https://elearningnew.cybersoft.edu.vn`)
  - `TOKEN_CYBERSOFT`: Token xác thực CyberSoft
  - `TEST_USERNAME`: Tài khoản test đăng nhập
  - `TEST_PASSWORD`: Mật khẩu tài khoản test
  - `TELEGRAM_BOT_TOKEN`: Token của Telegram Bot
  - `TELEGRAM_CHAT_ID`: ID chat cá nhân hoặc nhóm nhận thông báo

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

- **`.agent/rules/`**: Bộ quy tắc chuẩn cho Automation Testing (Quy ước đặt tên POM, chiến lược chọn locator bền vững, quy chuẩn Playwright).
- **`.agent/skills/`**: Các bộ kỹ năng chuyên sâu cho AI Agent (QA Automation Engineer, UI Debug, Smart Locator, Locator Healer, Flaky Test Analyzer, Test Data Generator).
- **`.agent/workflows/`**: Quy trình chuẩn hóa thực thi tự động (Phân tích Requirement từ Jira, AI-RBT Manual Testing 6 bước, sinh Test Cases, chuyển đổi sang Automation Script E2E).

> Toàn bộ tài nguyên, quy chuẩn và kiến trúc `.agent` được tham khảo và phát triển dựa trên chia sẻ từ **[Anh Tester](https://anhtester.com)** — Nền tảng & cộng đồng đào tạo kiểm thử phần mềm tự động (Software Testing & Automation) hàng đầu tại Việt Nam.
> 
> ---
> 
> ## 🗺️ Tiến độ Phát triển (Roadmap)
> 
> **Giai đoạn 1 — Nền tảng ổn định**
> - [x] **1.1. Chuẩn hoá locator**: Ánh xạ DOM thực tế trên các trang (Home, Course List, Course Detail, Profile), cập nhật selector CSS/Text chính xác, bổ sung comment `// TODO: Request dev team to add data-testid` vào những phần tử chưa có thuộc tính ổn định.
> - [x] **1.2. Tách biệt Test Data bằng API**: Thay thế test data ID cứng trong `enroll.spec.ts` bằng hàm fetch khóa học thực tế qua API `getValidCourse()`, đảm bảo test linh hoạt khi không có quyền Admin tạo khóa học mới.
> 
> **Giai đoạn 2 — Tốc độ & Quy trình**
> - [ ] **2.1. Quản lý Session State**: Tái sử dụng phiên đăng nhập (login state) cho toàn bộ UI tests để tiết kiệm thời gian.
> - [ ] **2.2. Nâng cấp Git Delivery**: Chuyển từ push trực tiếp sang tạo Pull Request (PR) qua GitHub CLI.
> 
> **Giai đoạn 3 — Chiều sâu kỹ thuật**
> - [ ] **3.1. API Validation với Zod**: Kiểm tra cấu trúc hợp đồng dữ liệu trả về từ API.
> - [ ] **3.2. Code Cleanup**: Xoá bỏ code thừa, refactor lại kiến trúc cốt lõi nếu cần thiết.

