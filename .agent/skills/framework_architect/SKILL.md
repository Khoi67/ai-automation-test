---
name: Framework Architect
description: Skill thiết kế, chuẩn hóa và mở rộng framework Playwright TypeScript theo cấu trúc Page Object, Workflow và Service của dự án hiện tại.
---

# Framework Architect

## Description

Skill chuyên biệt giúp agent thiết kế, chuẩn hóa và mở rộng framework automation **Playwright + TypeScript** hiện có. Skill này áp dụng cấu trúc sẵn có của dự án thay vì thay thế bằng một template `src/` tổng quát.

Agent có thể:

- Phân tích và duy trì cấu trúc `core`, `page-object`, `workflow`, `services`, `fixture`, `data-object`, `tests` và `test-data`
- Tạo Page Object, component dùng chung, workflow UI/API và service API đúng tầng
- Bổ sung fixture, test data, model TypeScript và test case UI/API
- Chuẩn hóa cấu hình, quản lý biến môi trường, reporting và script chạy Playwright
- Review kiến trúc, locator, test isolation và khả năng bảo trì của framework

---

## When to Use

Sử dụng skill này khi:

- User yêu cầu tạo hoặc mở rộng test case Playwright TypeScript trong dự án này
- User cần thêm Page Object, component, workflow, service API hoặc fixture
- User muốn chuẩn hóa framework hiện tại theo POM và layered architecture
- User cần bổ sung test UI, test API, CSV test data hoặc TypeScript data object
- User hỏi về best practices cho Playwright TypeScript trong cấu trúc dự án hiện tại

Trigger keywords: "Playwright", "POM", "page object", "workflow", "API test", "fixture", "test automation", "chuẩn hóa framework"

---

## Supported Stack

| Stack | Ngôn ngữ | Runner | Report | Build Tool |
|---|---|---|---|---|
| **Playwright + TypeScript** | TypeScript | Playwright Test | HTML Report | npm |

Phạm vi gồm UI automation và API automation với Playwright.

---

## Framework Components

### 1. Project Structure (Mandatory)

- Giữ cấu trúc thư mục root-level hiện có; không tự ý chuyển sang `src/` hoặc đổi tên thư mục.
- Tách rõ test, page, workflow, service, core utility, model và test data.
- Duy trì `playwright.config.ts`, `package.json`, `.gitignore`; bổ sung `README.md` hoặc `.env.example` khi user yêu cầu.

### 2. Configuration Management (Mandatory)

- `constant/config-constant.ts` chỉ chứa cấu hình không nhạy cảm: URL mặc định, collection ID, expected count.
- URL, timeout và environment cần tập trung tại config, không hardcode trong test.
- Token, password và credential phải đọc từ environment variables; không commit vào TypeScript hoặc CSV.
- CI có thể override cấu hình bằng biến môi trường.

### 3. Browser / Request Management (Mandatory)

- `core/browser/browser-management.ts` quản lý `Browser`, `BrowserContext`, `Page` và `APIRequestContext` theo vòng đời test.
- `core/browser/browser-utils.ts` chỉ chứa thao tác browser/page có thể tái sử dụng.
- `playwright.config.ts` là nơi cấu hình project, timeout, retry, browser và reporter.
- Không dùng fixed wait; ưu tiên locator auto-wait và assertion của Playwright.

### 4. Core Layer (Mandatory)

- `core/element/element.ts`: wrapper chung cho locator, action và assertion.
- `core/api/api.ts`: wrapper HTTP GET/POST/DELETE dùng `APIRequestContext`.
- `core/utils/`: helper thuần như CSV, string và data generation.
- `core/fixture/base-fixture.ts`: khởi tạo các dependency Playwright nền.
- `core/` không được chứa selector, URL hay logic nghiệp vụ đặc thù của domain.

### 5. Page Object Model (Mandatory)

- Mỗi page tương ứng một class trong `page-object/`.
- Component dùng ở nhiều page nằm trong `page-object/components/`.
- Locator được khai báo trong Page/Component, không inline trong test hoặc workflow.
- Method diễn tả hành vi người dùng: `login`, `goToProfilePage`, `verify...`; không phơi bày thao tác DOM không cần thiết.
- Ưu tiên locator `data-testid`, `role`, label hoặc semantic locator; XPath chỉ dùng khi không có lựa chọn ổn định hơn.

### 6. Workflow and Service Layer (Mandatory)

- `workflow/ui/` điều phối nhiều Page Object thành một hành trình UI hoàn chỉnh.
- `workflow/api/` điều phối nghiệp vụ API hoặc luồng kết hợp API + UI.
- `services/` bao bọc endpoint theo từng domain nghiệp vụ của dự án.
- Test không gọi raw HTTP API trực tiếp; tái sử dụng `services/` và `core/api/APIUtils`.
- Page Object không gọi service API và service không thao tác UI.

### 7. Test Data Management (Mandatory)

- Interface/type cho dữ liệu UI nằm trong `data-object/ui/`; dữ liệu API nằm trong `data-object/api/`.
- Dữ liệu ngoài nằm tại `test-data/ui/` hoặc `test-data/api/`.
- Dữ liệu CSV được đọc qua `core/utils/csv.ts`.
- Dữ liệu thay đổi server state cần unique và traceable; dọn dẹp state trong `finally` hoặc fixture teardown.

### 8. Fixture and Test Layer (Mandatory)

- `fixture/page-fixture.ts` compose Page Object và Workflow, sau đó expose chúng cho test.
- Test UI nằm ở `tests/ui/`; test API nằm ở `tests/api/`.
- Test chỉ thể hiện scenario, chọn test data và assertion business-level.
- Mỗi test phải độc lập, không phụ thuộc thứ tự chạy hoặc state còn lại từ test trước.

### 9. Reporting and CI/CD (Recommended)

- Duy trì HTML report, screenshot/video khi failure và trace khi retry trong `playwright.config.ts`.
- Không commit `playwright-report/`, `test-results/`, `blob-report/` hoặc browser cache.
- Khi được yêu cầu, bổ sung npm scripts cho `test`, `test:ui`, `test:api`, `test:headed`, `report` và `typecheck`.
- Chỉ thêm CI/CD, Allure hoặc logger khi user yêu cầu rõ ràng.

---

## Project Structure Template

### Playwright + TypeScript (Current Project)

```text
project-root/
├── playwright.config.ts                 # Playwright projects, browser, timeout, reporter
├── package.json                          # Dependencies and npm scripts
├── .gitignore                            # Ignore reports, results, cache and local secrets
├── constant/
│   └── config-constant.ts                # Non-sensitive constants and configuration
├── core/
│   ├── api/
│   │   └── api.ts                        # Generic API request wrapper
│   ├── browser/
│   │   ├── browser-management.ts         # Browser, context, page and request lifecycle
│   │   └── browser-utils.ts              # Reusable browser/page utilities
│   ├── element/
│   │   └── element.ts                    # Common locator actions and assertions
│   ├── fixture/
│   │   └── base-fixture.ts               # Base Playwright fixture
│   └── utils/
│       ├── csv.ts                        # External CSV reader
│       └── string.ts                     # String/data helpers
├── data-object/
│   ├── api/                              # API request/response models and JSON schemas
│   └── ui/                               # UI test-data models
├── fixture/
│   └── page-fixture.ts                   # Pages and workflows injected into tests
├── page-object/                              # Đặt tên page/component theo domain thực tế của dự án
│   ├── components/                       # Các component dùng chung
│   ├── base-page.ts                      # Hành vi dùng chung của page
│   └── <entity>-page.ts                  # Page Object cho mỗi thực thể/màn hình
├── services/                                 # Đặt tên service theo domain thực tế của dự án
│   └── wrap-<domain>-services.ts          # API operations theo domain
├── workflow/
│   ├── ui/                               # UI journeys theo domain dự án
│   └── api/                              # API setup, cleanup và journeys theo domain
├── test-data/
│   ├── ui/                               # Dữ liệu UI theo domain dự án
│   └── api/                              # Dữ liệu API theo domain dự án
├── tests/
│   ├── ui/                               # UI specifications
│   └── api/                              # API specifications
├── playwright-report/                    # Generated; ignored by Git
└── test-results/                         # Generated; ignored by Git
```

### Dependency Direction

```text
tests -> fixture -> workflow -> page-object / services -> core
                           -> data-object
```

`page-object` và `services` không được import từ `tests` hoặc `workflow`.

---

## Design Principles

1. **DRY (Don't Repeat Yourself)** — Logic dùng chung nằm tại `core`, component hoặc service phù hợp.
2. **Single Responsibility** — Test mô tả scenario; Page Object tương tác UI; Workflow điều phối; Service gọi API.
3. **Open/Closed** — Thêm page, workflow hoặc test mới mà không phá vỡ core layer.
4. **Configuration over Code** — URL, timeout và environment quản lý tập trung; credentials qua environment variables.
5. **Fail Fast, Diagnose Richly** — Assertion rõ ràng, screenshot/video/trace khi failure và cleanup state sau test.
6. **Test Isolation** — Không dùng global mutable test data hoặc phụ thuộc thứ tự chạy test.

---

## Anti-Patterns (FORBIDDEN)

| ❌ Anti-Pattern | ✅ Đúng cách |
|---|---|
| Hardcode token/password trong code hoặc CSV | Đọc từ `.env` local hoặc CI environment variables |
| Locator inline trong test/workflow | Khai báo locator trong Page Object hoặc component |
| Gọi raw API trong test | Dùng `services/` và `core/api/APIUtils` |
| Page Object gọi API hoặc Service thao tác UI | Điều phối ở `workflow/` |
| `waitForTimeout()` cho đồng bộ bình thường | Dùng locator auto-wait, `expect()` hoặc wait theo trạng thái UI |
| Test phụ thuộc dữ liệu/state của test trước | Setup riêng và cleanup bằng `finally`/fixture teardown |
| Đổi sang cấu trúc `src/` chỉ để theo template | Giữ các thư mục hiện có, trừ khi user yêu cầu migration |
| Commit report, test result hoặc `.env` | Giữ trong `.gitignore` |
| Test file lớn chứa nhiều feature không liên quan | Tách spec theo UI/API và feature |

---

## Rules References

Agent PHẢI tuân thủ các rules chi tiết nếu chúng tồn tại trong repository:

- `.agent/rules/automation_rules.md` — General automation best practices
- `.agent/rules/locator_strategy.md` — Locator selection priority
- `.agent/rules/playwright_rules.md` — Playwright-specific rules
