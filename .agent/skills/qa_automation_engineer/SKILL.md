---
name: QA Automation Engineer
description: Skill hỗ trợ agent thực hiện các tác vụ QA automation testing bao gồm generate test cases, automation scripts, API tests, locators, phân tích flaky tests, và tạo test data.
---

# QA Automation Engineer

## Description

This skill enables the agent to assist with software testing and automation tasks.

The agent can:

- Generate manual test cases from requirements
- Generate test automation scripts from test cases or UI flows
- Generate API tests from Swagger/OpenAPI specifications
- Explore applications and discover test scenarios
- Generate automation frameworks
- Generate test data
- Analyze flaky tests
- Generate stable locators
- Generate requirements from website analysis

This skill is designed for modern QA workflows and automation development.

---

# When to Use

Use this skill when the user asks about:

- Test automation
- Manual testing
- Automation frameworks
- API testing
- UI testing
- Test data generation
- Flaky test debugging
- Locator generation
- Requirements analysis from website
- Jira integration (fetch requirements, push test results)
- Xray test management

Typical prompts include:

- Generate test cases from requirement
- Generate Selenium automation from test case
- Generate automation from UI steps
- Generate API tests from Swagger
- Generate regression suite → _(redirect sang `generate_application_test_plan` hoặc `generate_manual_testcases_rbt`)_
- Generate test data
- Analyze flaky test
- Generate locator for element
- Generate requirements from website

---

# Workflow Routing

When the user request matches a specific task, select the appropriate workflow file from `.agent/workflows/`.

### Generate test cases from requirements

> **Delegate:** Tác vụ này thuộc skill **`rbt_manual_testing`** — không phải `qa_automation_engineer`.

Use workflow: `generate_testcases_from_requirements` (QUICK mode) hoặc `generate_manual_testcases_rbt` (FULL RBT mode).

Triggers when user asks:

- generate test cases → **delegate to `rbt_manual_testing` (QUICK mode)**
- write manual test cases → **delegate to `rbt_manual_testing` (QUICK mode)**
- test scenarios from requirement → **delegate to `rbt_manual_testing` (QUICK mode)**
- sinh test cases đầy đủ / quy trình 6 bước → **delegate to `rbt_manual_testing` (FULL RBT mode)**

---

### Generate automation from manual test case

Use workflow: `generate_automation_from_testcases`

Triggers when user asks:

- convert test case to automation
- generate Selenium automation
- generate Playwright automation from test case

---

### Generate automation from UI steps

Use workflow: `generate_automation_from_ui_flow`

Triggers when user asks:

- automate this UI flow
- generate automation from steps
- run UI steps and generate Selenium script

---

### Generate API tests

Use workflow: `generate_api_tests_from_swagger`

Triggers when user provides:

- Swagger URL / OpenAPI specification
- Postman Collection (JSON) / cURL command
- Requirement / API documentation text
- Asks for API test cases / API automation (REST Assured, Playwright API, Pytest Requests, Supertest)

---

### Generate test data

Use workflow: `generate_test_data`

Triggers when user asks:

- generate test data
- generate boundary test data

---

### Analyze cross-module feature & generate combinatorial matrix

Use workflow: `generate_cross_module_test_plan`

> Workflow dành cho **tính năng phức tạp đi qua nhiều modules nối tiếp**. Sinh Data Flow Map + Ma trận kết hợp đa chiều (Pairwise / Business-critical / Full Cartesian).

Triggers when user asks:

- phân tích tính năng cross-module
- test nhiều module liên kết
- sinh ma trận kết hợp / combinatorial matrix
- test tính năng có nhiều điều kiện kết hợp
- analyze multi-module feature
- pairwise testing
- decision table đa chiều / nhiều chiều

---

### Generate combinatorial test data (multi-module pipeline)

Use workflow: `generate_combinatorial_test_data`

> Sinh test data cho ma trận kết hợp. Hỗ trợ 2 modes: **GENERATE** (sinh offline) và **PIPELINE** (chạy thật trên browser qua N modules).

Triggers when user asks:

- sinh data cho ma trận kết hợp
- tạo test data cho combinatorial matrix
- chạy pipeline tạo data qua nhiều module
- generate combinatorial test data
- setup data cho cross-module test

---

### Generate regression suite

> **Không có workflow riêng.** Dùng `generate_application_test_plan` (Mode PLAN) hoặc `generate_manual_testcases_rbt` (FULL RBT) tùy theo input.

Triggers when user asks:

- create regression test suite
- generate regression scenarios

---

### Generate automation framework

> **Delegate:** Tác vụ này sử dụng skill **`framework_architect`** để thiết kế framework.

Use workflow: `generate_automation_framework`

Triggers when user asks:

- create automation framework
- design Selenium framework
- design Playwright framework
- design Appium framework
- scaffold automation project
- thiết kế framework mới

---

### Explore application and generate test plan

Use workflow: `generate_application_test_plan`

> Workflow này có **2 modes**: PLAN (mặc định — chỉ test plan) và FULL (test plan + automation skeleton).
> Khi user yêu cầu "full automation suite" hoặc "bootstrap automation" → tự động chọn Mode FULL.

Triggers when user asks:

- explore application
- discover test scenarios
- generate test plan
- generate full automation suite
- bootstrap automation for project

---

### Analyze flaky tests

Use workflow: `analyze_flaky_tests`

Triggers when user asks:

- why is this test flaky
- analyze unstable automation

---

### Generate stable locators

Use workflow: `generate_locator`

Triggers when user asks:

- generate locator for this element
- find stable selector
- create automation locator

---

### Generate requirements from website

Use workflow: `generate_requirements_from_website`

Triggers when user asks:

- generate requirements from website
- analyze website module and create requirements
- extract user stories from web page

---

### Analyze requirement document

> **Delegate:** Tác vụ này sử dụng skill **`requirements_analyzer`** để phân tích requirement documents.

Use workflow: `analyze_requirement_document`

> Workflow chỉ **phân tích** requirement — KHÔNG sinh test cases. Output là tài liệu phân tích chi tiết gồm: AC breakdown, dependencies, ambiguities, risks.

Triggers when user asks:

- phân tích requirement document
- review yêu cầu / analyze this ticket
- phân tích Jira ticket / requirement
- tìm điểm mơ hồ trong requirement
- analyze requirement / review requirement document

---

### Fetch requirements from Jira

Use workflow: `fetch_jira_requirements`

Triggers when user asks:

- fetch jira requirements
- lấy requirement từ jira
- get jira ticket
- import user stories from jira

---

### Import test results to Xray

Use workflow: `import_test_results_xray`

Triggers when user asks:

- push test results to xray
- đẩy kết quả test lên xray
- import test execution to jira
- upload playwright results to xray

---

### E2E Jira to Automation Pipeline

Use workflow: `e2e_jira_to_automation`

> Quy trình tự động hóa khép kín End-to-End từ Jira Ticket: Kéo requirement → Sinh Test Cases → Sinh mã nguồn Automation (POM 5 tầng) → Thực thi test & Self-Healing → Phân nhánh Git & Push → Kiểm tra CI → Gửi báo cáo Telegram.

Triggers when user asks:

- e2e jira to automation
- chạy trọn gói ticket jira / automate jira ticket end-to-end
- tự động hóa từ jira story / triển khai test từ jira

---

### E2E Retest Bug

Use workflow: `e2e_retest_bug`

> Quy trình tự động thực hiện Retest lại các Bug đã được Dev báo cáo Fix xong: Bỏ đánh dấu `test.fixme()`, chạy targeted test & regression cục bộ, đẩy code qua nhánh `fix/retest-<JIRA_KEY>` và tự động đóng Jira ticket khi CI pass.

Triggers when user asks:

- retest bug / retest ticket
- dev đã fix bug / dev reported bug fixed
- kiểm tra lại bug jira / gỡ fixme chạy lại test bug

---

### Deliver automation code via Git Branch

> **Delegate:** Tác vụ này sử dụng skill **`git_branch_delivery`** để quản lý phân nhánh và ngăn chặn push trực tiếp vào main.

Use workflow: `push`

Triggers when user asks:

- push git / bàn giao code
- push code lên nhánh / tạo pull request
- deliver automation code
- git branch delivery

---

# Automation Framework

### Default / Primary Stack (Dự án chính)

- **Language:** TypeScript (Node.js / npm)
- **UI & API Automation:** Playwright Test (`tests/ui/`, `tests/api/`)
- **Design Pattern:** 5-Tier DRY Architecture
  1. `page-object/`: Page classes chứa Scoped Locators và User Actions
  2. `page-object/components/`: Reusable components (Header, Footer, Dialog...)
  3. `fixture/`: Custom Fixtures injection (`fixture/index.ts`)
  4. `workflow/`: Business workflows liên hoàn nhiều trang
  5. `test-data/`, `constant/`, `core/utils/`: Dữ liệu và utilities dùng chung
- **Assertions:** Web-First Assertions (`expect(locator).toBeVisible()`, `expect(locator).toHaveText()`)
- **Execution:** Headed mode khi debug local (1920x1080), Headless mode trên CI

### Secondary / Supported Multi-Stack (Khi có yêu cầu cụ thể)

- **Java Stack:** Java 11/17+ with Selenium WebDriver 4, TestNG, REST Assured, Appium (`AppiumBy`), Maven
- **Python Stack:** Python 3.10+ with Playwright / Selenium, Pytest, Requests

---

# Locator Strategy

Mọi tác vụ định vị phần tử phải tuân thủ nghiêm ngặt **Bản Đồ Ưu Tiên 4 Tầng (4-Tier Master Priority Map)**:

1. **Tier 1 — User-Facing Semantic & Accessibility (Ưu tiên cao nhất):**
   - Playwright: `getByRole()`, `getByLabel()`, `getByPlaceholder()`, `getByText()`
   - Appium: `AppiumBy.accessibilityId()`
   - Mô phỏng chính xác hành vi người dùng, bền bỉ nhất trước thay đổi DOM/CSS.
2. **Tier 2 — Dedicated Test Attributes:**
   - Playwright: `getByTestId()` hoặc `[data-testid]`, `[data-test]`, `[data-qa]`
   - Thuộc tính chuyên dụng dành cho automation test, ổn định cao.
3. **Tier 3 — Stable DOM Identifiers:**
   - Thuộc tính cố định có ngữ nghĩa: `id`, `name`, `resource-id` (cấm chuỗi hash/auto-generated ngẫu nhiên).
4. **Tier 4 — Scoped CSS / Relative XPath (Lựa chọn cuối cùng):**
   - Scoped CSS Selector hoặc XPath tương đối ngắn có neo ngữ nghĩa.
   - Luôn sử dụng kỹ thuật Container Scoping (`locator.filter({ hasText: ... })`, `page.frameLocator(...)` cho iFrame) thay vì viết XPath tuyệt đối dài.

> **Note:** Chi tiết quy tắc xem tại `.agent/rules/locator_strategy.md` và `.agent/rules/playwright_rules.md`.

---

# Rules References

The agent MUST also follow the detailed rules defined in `.agent/rules/`:

- [automation_rules.md](.agent/rules/automation_rules.md) — General automation best practices (5-tier DRY, False Healing prevention, Git Flow)
- [locator_strategy.md](.agent/rules/locator_strategy.md) — 4-Tier Master Locator Priority & Scoping
- [playwright_rules.md](.agent/rules/playwright_rules.md) — Playwright standards, wait strategy, fixture injection
- [selenium_rules.md](.agent/rules/selenium_rules.md) — Selenium-specific rules
- [appium_rules.md](.agent/rules/appium_rules.md) — Appium mobile automation rules (`AppiumBy`)
- [api_rules.md](.agent/rules/api_rules.md) — API automation standards, assertions, auth management

---

# References

The agent may consult additional documentation in the `references/` folder:

- `PROJECT_CONTEXT.md` — Project domain, tech stack, key modules, secure credentials
- `TEST_STRATEGY.md` — Testing objectives, scope, targeted local & CI execution plan
- `PROMPT_TEMPLATES.md` — Reusable prompt templates (11-12 columns TC metadata, 5-tier DRY POM)

External references:

- `plans/automation/project_architecture/README.md` — Repository structure & project architecture
- `GEMINI.md` > "Cleanup & Delivery" — Quality checklist / Definition of Done

---

# Output

Depending on the request, the agent may return:

- Manual test cases (chuẩn 11-12 cột đầy đủ metadata)
- Automation scripts (Playwright TypeScript chuẩn 5 tầng DRY hoặc Java/Selenium khi yêu cầu)
- API tests (Playwright API / REST Assured)
- Locator recommendations (4-tier semantic locators)
- Test data (structured, randomized, traceable qua UUID/timestamp)
- Requirements documents & analysis

Automation outputs **BẮT BUỘC** đáp ứng:

- **Tuân thủ 5 tầng DRY Reusability:** Không tạo Page Object trùng lặp, bắt buộc inject qua `fixture/index.ts`, dùng hàm sinh data từ `core/utils/`.
- **Nguyên tắc Chống False Healing:** Tuyệt đối không sửa assertion theo lỗi sai của ứng dụng để ép test PASS. Nếu gặp App Bug, giữ nguyên assertion đúng và đánh dấu `test.fixme(...)` kèm mã Jira Bug.
- **Traceability qua Jira Tag:** Đánh tag `@<JIRA_KEY>` và module tag vào `test.describe` options.
- **Clean Code:** Không debug log (`console.log`), không commented code, không hardcoded sleeps.