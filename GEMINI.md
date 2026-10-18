# GEMINI AI - GLOBAL AUTOMATION AGENT RULES

> **Scope:** Áp dụng cho mọi tác vụ Test Automation do Gemini (Antigravity) hoạt động trong dự án này.
> **Mục tiêu:** Sinh ra test scripts hiệu quả, ổn định – dễ debug – dễ scale – CI friendly – bảo vệ nhánh chính và kiến trúc 5 tầng DRY.

---

## Git Operations & Delivery Rules (Phân Định 2 Chế Độ Làm Việc)

Nhằm xóa bỏ hoàn toàn xung đột giữa việc bảo toàn trạng thái code local và quy trình tự động hóa bàn giao CI/CD, Agent **BẮT BUỘC** tuân thủ 2 chế độ làm việc với Git:

### 1. Trong Quá Trình Viết Code & Debug (Working Phase)
* **Tuyệt đối KHÔNG tự ý dùng lệnh làm thay đổi trạng thái code:** Nghiêm cấm chạy `git pull`, `git checkout <nhánh-khác>`, `git merge`, `git rebase`, `git reset --hard` để lấy code từ remote hoặc thay đổi nhánh trong khi đang phát triển.
* **Nguyên nhân:** Tránh nguy cơ code trên server chưa cập nhật hoặc việc pull code về sẽ ghi đè, làm mất toàn bộ phần code đang chỉnh sửa ở máy local.
* **Luôn giữ nguyên trạng thái code local hiện tại để làm việc.** Nếu cần file hoặc nội dung mới, hãy yêu cầu người dùng cung cấp thay vì tự ý dùng git.
* **Được phép dùng lệnh read-only:** `git status`, `git diff`, `git log` — để kiểm tra trạng thái và theo dõi thay đổi mà không làm biến động code.

### 2. Trong Quá Trình Bàn Giao & Chạy Pipeline (Delivery & Pipeline Phase)
* Áp dụng khi người dùng kích hoạt các workflow: `/push`, `/e2e_jira_to_automation`, `/e2e_retest_bug` hoặc script `git_push_delivery.js`.
* **CẤM PUSH TRỰC TIẾP LÊN MAIN:** Nhánh `main` là protected branch, tuyệt đối **KHÔNG ĐƯỢC PHÉP** chạy `git push origin main` từ local.
* **Bắt buộc phân nhánh Feature Branch:** Mọi thay đổi code hoặc kịch bản test mới phải được phát triển trên nhánh riêng biệt theo quy ước:
  * `feat/<JIRA_KEY>` (ví dụ: `feat/SCRUM-17`) cho kịch bản kiểm thử mới.
  * `fix/<JIRA_KEY>` cho việc sửa lỗi automation test hoặc heal locator.
  * `fix/retest-<JIRA_KEY>` cho việc kiểm chứng và retest bug đã fix.
* **Quy trình bàn giao 5 bước chuẩn qua Pull Request:**
  1. **Pre-Push Quality Gate:** Bắt buộc `npm run typecheck` và `npx playwright test` đạt 100% PASS (hoặc fixme bảo vệ CI).
  2. **Tạo nhánh:** `git checkout -b feat/<JIRA_KEY>` (hoặc `fix/retest-<JIRA_KEY>`).
  3. **Staging có chọn lọc (Selective Staging):** `git add tests/ page-object/ fixture/ workflow/ core/ constant/ test-data/` (TUYỆT ĐỐI CẤM `git add .` làm dính file rác).
  4. **Commit & Push nhánh:** `git commit -m "feat(automation): add test suite for <JIRA_KEY>"` và `git push -u origin feat/<JIRA_KEY>`.
  5. **Tạo Pull Request:** Tự động sinh link GitHub PR (`compare/main...feat/<JIRA_KEY>?expand=1`) gửi về Telegram để Reviewer duyệt merge vào `main`.
* **Dọn dẹp & Đồng bộ an toàn (Post-Merge Cleanup):** Chỉ sau khi CI/CD trên GitHub Actions đã Auto-Merge thành công vào `main` và xóa nhánh trên remote, Agent mới được phép dọn dẹp local (`git checkout main && git pull origin main && git branch -D feat/<JIRA_KEY>`).

---

## Browser Rules (MANDATORY)

### 🖥️ Viewport & Mode

* Tất cả **UI debugging** phải chạy với **desktop viewport**: **`1920x1080`**
* Bắt buộc **mở browser thật** khi debug (headed mode)
* **Headless mode** chỉ được sử dụng **sau khi test đã debug PASS trên UI**
* CI/CD pipeline **được phép chạy headless mặc định**

### 🔄 Thứ Tự Debug Bắt Buộc (Playwright MCP)

Khi dùng Playwright MCP để debug UI, **LUÔN** tuân theo thứ tự:

```
navigate → resize(1920×1080) → wait_for(page_load) → snapshot → interact → screenshot(on_fail)
```

* **KHÔNG** gọi `browser_navigate` lại nếu đã đang ở đúng trang — tránh reload ngoài ý muốn
* **LUÔN** gọi `browser_resize(width=1920, height=1080)` ngay sau `browser_navigate`
* **LUÔN** verify page đã load xong trước khi lấy snapshot hoặc tương tác

### 📸 Screenshot & Snapshot

* Dùng **`snapshot`** để phân tích DOM và xác định locator
* Dùng **`screenshot`** để lưu bằng chứng khi test fail hoặc để báo cáo
* Chụp **screenshot ngay khi assertion fail** để hỗ trợ truy vết lỗi
* **KHÔNG** chụp screenshot tràn lan — chỉ khi cần thiết (fail / milestone quan trọng)

---

## Tools

### 🛠️ Ưu Tiên Sử Dụng

* Ưu tiên sử dụng **Playwright MCP** cho tất cả tác vụ debug UI
* Tham chiếu rule chi tiết: [Quy tắc Playwright](.agent/rules/playwright_rules.md)

### 🔍 Inspect & Debug

* Mở browser thật để debug (headed mode)
* Inspect **DOM / HTML thực tế** trên trình duyệt — **KHÔNG đoán locator**
* Execute và debug test trực tiếp trên UI trước khi sinh code
* **KHÔNG** generate code khi chưa inspect DOM

### ⚡ Nguyên Tắc

* Một locator phải được **verify chạy được** trên browser hiện tại trước khi đưa vào code
* Nếu locator lấy từ code cũ → **bắt buộc verify lại** trước khi dùng

---

## Cleanup & Delivery

### ✅ Điều kiện bàn giao (Definition of Done)

Test chỉ được coi là **hoàn thành** khi đáp ứng **toàn bộ** các tiêu chí sau:

#### 🧹 Code Cleanup

- [ ] Xoá toàn bộ `print()`, `console.log()`, debug log tạm thời
- [ ] Xoá locator không còn sử dụng
- [ ] Không để lại commented-out code
- [ ] Không có `waitForTimeout` / `Thread.sleep` hardcoded
- [ ] Không có test data hardcoded (email, username, ID phải random/traceable)

#### 🏗️ Cấu trúc & POM (Kiến Trúc 5 Tầng DRY)

- [ ] Tuân thủ mô hình **Page Object Model nâng cao với 5 tầng DRY** — tách biệt Page class, Shared Components, Fixture Injection, Workflows, và Test Data/Utils
- [ ] Không tạo Page Object trùng lặp chức năng đã có trong `page-object/`
- [ ] Các phần tử dùng chung (Header, Footer, Sidebar, Navigation Bar, Modal, Toast Notification) được tách thành Component class riêng trong `page-object/components/`
- [ ] Bắt buộc sử dụng Fixture Injection từ `fixture/page-fixture.ts` (hoặc `fixture/index.ts`), **CẤM** khởi tạo `new PageObject(page)` thủ công trong từng test spec
- [ ] Đóng gói các chuỗi thao tác nghiệp vụ liên hoàn qua nhiều màn hình vào `workflow/*.ts`
- [ ] Sử dụng các hàm helper sinh dữ liệu ngẫu nhiên từ `core/utils/` và constants từ `constant/`
- [ ] Test UI tổ chức theo module folder: `tests/ui/<module>/<feature>.spec.ts` (**CẤM đặt file theo tên `SCRUM-X.spec.ts`**)
- [ ] Gắn Jira Tag `@<JIRA_KEY>` trong options tag của test để phục vụ truy vết (`{ tag: ['@SCRUM-X', '@module'] }`)
- [ ] Locator được định nghĩa trong Page class, không viết inline trong test
- [ ] Tên file, class, method đặt theo convention rõ ràng và nhất quán (kebab-case cho file, PascalCase cho class)
- [ ] Import không còn thừa (unused imports)

#### ✔️ Chất lượng Test

- [ ] Test **PASS ổn định** ít nhất **2 lần liên tiếp** trên UI (headed mode)
- [ ] Assertion có message rõ ràng, dễ debug khi fail
- [ ] Mỗi test case độc lập — không phụ thuộc thứ tự chạy
- [ ] Test data được sinh động (timestamp/random) và traceable

#### 📁 File Output

- [ ] Source code được lưu đúng vị trí trong project structure
- [ ] Không có file tạm, file test thừa trong thư mục source
- [ ] File cấu hình (config, .env) không chứa credentials thật

#### 📋 Báo Cáo Kết Quả

- [ ] Tóm tắt kết quả: số test PASS / FAIL / SKIP
- [ ] Nêu rõ các TC đã implement và TC nào bị skip (kèm lý do)
- [ ] Ghi chú các known issues hoặc limitation nếu có

---

## 1. Ngôn Ngữ & Giao Tiếp

- Luôn giao tiếp, giải thích ý tưởng và báo cáo bằng **Tiếng Việt**.
- Diễn giải **ngắn gọn, rõ ràng, dễ hiểu**.
- Tránh suy đoán lập trình hoặc giải thích mơ hồ về lỗi mà cần có căn cứ trực tiếp.

## 2. Quy Trình Làm Việc (Workflow)

- **Recon (Điều tra):** Luôn inspect giao diện thực tế hoặc DOM/HTML/XML trước khi viết automation. Tuyệt đối KHÔNG ĐOÁN locator.
- **Implementation:** Giữ vững mô hình **Page Object Model (POM) 5 tầng DRY**. Phân tách rõ Page objects, Components, Test execution, Fixtures và Utils/Test data.
- **Execution & Self-fix (Chống False Healing):** 
  - Chạy test ngay sau khi code xong. Khi một test FAIL, bắt buộc phân loại chính xác nguyên nhân:
    1. **Lỗi Code Automation (Test Bug):** Do thay đổi DOM, selector hỏng, thiếu wait hoặc expected text lệch so với spec ban đầu -> Tự động đọc log -> phân tích root cause -> sửa code (Self-Healing) -> chạy lại đến khi PASS ổn định (tối đa 5 vòng).
    2. **Lỗi Ứng Dụng (Application Bug):** Ứng dụng hoạt động sai so với Requirement / Business Logic quy định.
       - **NGHIÊM CẤM FALSE HEALING:** Tuyệt đối không được sửa `expect()` theo kết quả sai của ứng dụng để ép test PASS trên CI.
       - **Bảo vệ CI:** Giữ nguyên assertion đúng theo requirement, tự động log Bug lên Jira (nếu trong luồng E2E), và chuyển test case thành `test.fixme(...)` kèm chú thích mã Jira Bug (`[BUG-SCRUM-XX]`) để bảo vệ pipeline CI xanh 100% trong khi chờ Dev khắc phục.
  - Chỉ hỏi User khi gặp business rule mâu thuẫn hoặc sau khi đã thử tự sửa hết số vòng quy định.
- **Cleanup:** Gỡ bỏ debug logs, code thừa, locator không dùng trước khi deliver.

## 3. Tech Stack Hỗ Trợ

| Loại             | Công nghệ                                     |
| ----------------- | ----------------------------------------------- |
| Ngôn ngữ        | TypeScript                                      |
| Web Automation    | Playwright (TypeScript)                         |
| API Automation    | Playwright API Request                          |
| Test Framework    | Playwright Test                                 |
| Build Tool        | npm                                             |

## 4. Tham Chiếu Rules Chi Tiết

Agent phải tham chiếu quy tắc chi tiết trong `.agent/rules/`:

- [Quy tắc chung Automation](.agent/rules/automation_rules.md) — POM 5 tầng DRY, Test Data, Naming, Chống False Healing
- [Chiến lược chọn Locator](.agent/rules/locator_strategy.md) — Thứ tự ưu tiên locator 4 tầng, Container Scoping
- [Quy tắc Playwright](.agent/rules/playwright_rules.md) — Browser setup, semantic locator, smart waits, network sync
- [Quy tắc API Testing](.agent/rules/api_rules.md) — Quy chuẩn API Testing, Status assertions, Auth lifecycle

## 5. Tham Chiếu Skills

Agent sử dụng skills trong `.agent/skills/` tùy theo nhiệm vụ:

| Skill                      | Vai trò                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `qa_automation_engineer` | Master skill cho automation — điều phối toàn bộ quy trình                          |
| `rbt_manual_testing`     | Master skill cho manual testing — 2 modes: QUICK (sinh TC nhanh) và FULL RBT (6 bước) |
| `requirements_analyzer`  | Phân tích requirements từ website/tài liệu                                           |
| `ui_debug_agent`         | Inspect UI/DOM, thu thập locators                                                        |
| `smart_locator_agent`    | Sinh locator mới ổn định                                                              |
| `locator_healer_agent`   | Sửa locator hỏng, chống blind healing                                                  |
| `test_data_generator`    | Sinh test data unique, traceable — hỗ trợ multi-step pipeline & combinatorial data       |
| `flaky_test_analyzer`    | Phân tích và khắc phục flaky tests                                                   |
| `jira_integration`       | Tích hợp Jira/Xray — lấy requirements, đẩy test results, transition trạng thái       |
| `git_branch_delivery`    | Quản lý phân nhánh (Feature Branching), cấm push vào main, tạo PR tự động           |

## 6. Kế Hoạch Kiểm Thử (Plan Templates)

Các bộ prompt template sẵn dùng trong `plans/`:

- **`plans/manual/`** — Quy trình sinh Manual Test Cases (2 modes: QUICK + FULL RBT)
  - Xem `plans/manual/QUICK_START.md` để bắt đầu nhanh
  - Workflow QUICK: `/generate_testcases_from_requirements`
  - Workflow FULL RBT: `/generate_manual_testcases_rbt`
- **`plans/automation/`** — Quy trình 6 bước sinh Automation Scripts
  - Xem `plans/automation/QUICK_START.md` để bắt đầu nhanh
  - One-click: Copy `plans/automation/prompt_automation.txt`
  - Workflow: `/generate_automation_from_testcases`
- **`plans/cross-module/`** — Quy trình phân tích Cross-Module & Ma trận kết hợp
  - Xem `plans/cross-module/QUICK_START.md` để bắt đầu nhanh
  - Workflow phân tích: `/generate_cross_module_test_plan`
  - Workflow sinh data: `/generate_combinatorial_test_data`

## 7. Test Data

- Tất cả field yêu cầu **unique** (Email, Username, Code/ID): **BẮT BUỘC** dùng dữ liệu random.
- Dữ liệu random phải **traceable / deterministic** — có thể truy ngược test gây lỗi.
- Format chuẩn hóa: `<prefix>_<testName>_<timestamp>` (hoặc `<prefix>_<testName>_<timestamp>_<random>`).

Ví dụ:

```
email:    auto_login_1712049200@test.com
username: auto_user_1712049200
code:     TC_LOGIN_1712049200
```

## 8. Code Quality (Smart Waits)

- **KHÔNG** dùng hard sleep (`waitForTimeout`, `Thread.sleep`, fixed delay).
- Chỉ sử dụng **smart waits** / auto-waiting:

| Framework  | Smart Wait                                                           |
| ---------- | -------------------------------------------------------------------- |
| Playwright | `expect().toBeVisible()`, `expect().toBeEnabled()`, Locator APIs |

- Hạn chế `waitForSelector` nếu `expect()` đáp ứng được.
- Mọi assertion phải có **timeout rõ ràng** hoặc dùng default timeout hợp lý.

## 9. Anti-Patterns (FORBIDDEN)

| ❌ Anti-Pattern                                   | ✅ Thay thế đúng                            |
| ------------------------------------------------- | ---------------------------------------------- |
| Guess selector / đoán locator                   | Inspect DOM thực tế trước khi code         |
| Hard sleep (`waitForTimeout`, `Thread.sleep`) | Smart waits (`expect()`, `WebDriverWait`)  |
| Đặt file test theo mã ticket (`tests/ui/SCRUM-X.spec.ts`) | Phân chia thư mục theo module: `tests/ui/<module>/<feature>.spec.ts` và dùng tag `@SCRUM-X` |
| Sửa `expect()` khi app sai để ép test PASS (False Healing) | Giữ assertion đúng, log Bug Jira và đánh dấu `test.fixme()` bảo vệ CI |
| Khởi tạo `new PageObject(page)` thủ công trong test spec | Inject Page Objects tập trung qua Custom Test Fixture (`fixture/page-fixture.ts`) |
| Copy selector từ code cũ không verify          | Luôn verify selector trên browser hiện tại |
| Viết test không chạy ngay                      | Chạy test ngay sau khi implement              |
| Commit test FAIL                                  | Chỉ commit khi test PASS ổn định (hoặc fixme) |
| Push trực tiếp lên nhánh `main` (`git push origin main`) | Bắt buộc tạo Feature Branch (`feat/<JIRA_KEY>`) và mở Pull Request |
| Để debug log / commented code khi deliver       | Cleanup trước khi deliver                    |
| Dùng test data hardcoded trùng lặp             | Sinh data random + traceable                   |

## 10. Tham Chiếu Workflows

Agent sử dụng workflows trong `.agent/workflows/` qua slash commands:

| Workflow                                  | Mô tả                                                     |
| ----------------------------------------- | ----------------------------------------------------------- |
| `/e2e_jira_to_automation`                 | Quy trình khép kín End-to-End từ Jira Issue -> Requirements -> Manual TCs -> Automation Scripts (POM) -> Phân loại lỗi/Self-Heal/Log Bug -> Push Git -> Chạy CI -> Báo cáo Telegram |
| `/e2e_retest_bug`                         | Quy trình tự động Retest lại các Bug đã được Dev fix xong, gỡ `test.fixme()`, chạy kiểm chứng local (headed `1920x1080`) và đẩy nhánh cập nhật CI |
| `/push`                                   | Bàn giao Git qua Feature Branch, cấm push vào main, tạo PR, đổi trạng thái Jira và chạy CI |
| `/generate_manual_testcases_rbt`        | Sinh manual test cases theo AI-RBT 6 bước (FULL RBT mode) |
| `/generate_testcases_from_requirements` | Sinh test cases nhanh từ requirements (QUICK mode)         |
| `/generate_automation_from_testcases`   | Chuyển manual test cases → automation scripts             |
| `/generate_application_test_plan`       | Khám phá app, sinh test plan (Mode PLAN) hoặc full suite (Mode FULL) |
| `/generate_automation_framework`        | Thiết kế automation framework                             |
| `/generate_locator`                     | Sinh locator ổn định cho UI element                      |
| `/generate_test_data`                   | Sinh test data có cấu trúc                               |
| `/generate_cross_module_test_plan`    | Phân tích cross-module (2 modes: DOCUMENT/BROWSER), sinh ma trận kết hợp bằng script pairwise |
| `/generate_combinatorial_test_data`   | Sinh test data cho ma trận kết hợp — offline hoặc pipeline qua browser          |
| `/analyze_flaky_tests`                  | Phân tích và khắc phục flaky tests                     |
| `/fetch_jira_requirements`              | Lấy requirements/user stories từ Jira                     |
