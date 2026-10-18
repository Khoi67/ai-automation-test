# Test Strategy

## Hướng Dẫn Sử Dụng

File này định nghĩa chiến lược testing cho dự án. Agent tham khảo file này để hiểu scope, ưu tiên, và approach khi sinh test cases hoặc automation scripts.

> ⚠️ **Bạn cần cập nhật file này** cho mỗi dự án cụ thể. Dưới đây là template.

---

## Testing Objectives

- Đảm bảo chất lượng phần mềm qua các cấp độ test
- Phát hiện lỗi sớm trong development lifecycle
- Duy trì regression suite ổn định cho CI/CD

## Scope of Testing

| Loại Test | Áp dụng | Tool/Framework |
|-----------|---------|----------------|
| UI Functional Testing | ✅ | Selenium / Playwright |
| API Testing | ✅ | REST Assured / Postman |
| Unit Testing | ✅ | JUnit / TestNG |
| Integration Testing | ✅ | TestNG + REST Assured |
| Performance Testing | ⬜ | JMeter / k6 |
| Security Testing | ⬜ | OWASP ZAP |
| Mobile Testing | ⬜ | Appium |

## Test Automation Strategy

### Framework Architecture
- **Primary / Default Stack:**
  - **Language:** TypeScript / Node.js (npm)
  - **Test Runner & Framework:** Playwright Test (`@playwright/test`)
  - **Design Pattern:** 5-Tier DRY Architecture (`page-object/`, `page-object/components/`, `fixture/`, `workflow/`, `core/utils/`)
  - **Reporting:** Playwright HTML Report / GitHub Pages CI Deployment / Telegram Bot Notification
- **Secondary / Supported Stack (mở rộng khi có yêu cầu cụ thể):**
  - Java 11/17+, Selenium WebDriver 4, TestNG, REST Assured, Maven, Allure Report

### Automation Scope
- Smoke tests: Bao phủ happy path của các chức năng chính qua Jira tags
- Targeted Regression (Local Gate): Chỉ chạy tests trong module bị ảnh hưởng (`npx playwright test tests/ui/<module>/`) để phản hồi nhanh
- Full Regression (CI Pipeline): Chạy toàn bộ test suites trên GitHub Actions CI với song song workers
- Data-driven tests: Sử dụng external data / factories (`test-data/`, `core/utils/`)

## Test Data Management

- Sử dụng random data có prefix + timestamp để traceable (`<prefix>_<testName>_<timestamp>`)
- Tách biệt test data khỏi test logic (không hardcode data trong test spec)
- Không hardcode credentials trong code hoặc commit lên Git

## Execution Plan

| Phase | Mô tả & Phạm Vi | Tool / Lệnh Thực Thi | Trigger & Môi Trường |
|---|---|---|---|
| **Local Pre-Push Gate** | Targeted / Module test cho tính năng vừa code | `npx playwright test tests/ui/<module>/` | Local developer trước khi commit / push |
| **Smoke Test** | Happy path chức năng chính | `npx playwright test --grep @smoke` | PR merge hoặc mỗi commit lên branch |
| **Full Regression** | Toàn bộ suite test UI & API | `npx playwright test` | GitHub Actions CI (Ubuntu Runner) |
| **Bug Retest** | Xác minh bug đã fix kèm regression lân cận | `npx playwright test <path/to/spec> --grep @<JIRA_KEY>` | Local + CI pipeline khi Dev bàn giao bug fix |

## Test Environment

- Test chạy trên môi trường Staging / Local
- CI/CD pipeline chạy headless mode
- Local debug chạy headed mode (viewport desktop 1920x1080)
