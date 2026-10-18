# Prompt Templates

Các prompt templates tái sử dụng cho các tác vụ QA automation phổ biến. Agent có thể tham khảo khi cần format output hoặc khi user cung cấp yêu cầu chưa rõ ràng.

---

## 1. Test Case Generation

```
Phân tích requirement sau và sinh test cases chất lượng cao:

**Requirement:** [Mô tả requirement / User Story / Jira Ticket]

**Output format (Bảng chuẩn 11-12 cột Automation Metadata):**
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |

**Yêu cầu:**
- Bao phủ: Positive (Happy path), Negative (Validation lỗi), Boundary (Biên), Edge Cases (Bảo mật/Race condition)
- Risk Level: Critical / High / Medium / Low
- Priority: P0 (Blocker) / P1 (Critical) / P2 (Major) / P3 (Minor)
- Automatable: Yes / No
- Auto Type: UI / API / E2E
- Tags: @smoke, @regression, @<JIRA_KEY>, @security
- Ngôn ngữ: Tiếng Việt rõ ràng, từng bước hành động cụ thể
```

---

## 2. Automation Script Generation

```
Chuyển đổi test case sau thành Playwright TypeScript Automation Script:

**Test Case:** [TC ID + Tiêu đề + Các bước + Expected Result]
**Framework:** Playwright Test (TypeScript)
**Kiến trúc:** 5-Tier DRY Architecture (POM + Custom Fixtures)

**Output:**
1. Page Object class(es) trong `page-object/<name>-page.ts` (kế thừa UIElement, chỉ chứa Scoped Locators và User Actions)
2. Shared Component class(es) nếu có phần tử dùng chung trong `page-object/components/`
3. Fixture Injection đăng ký tại `fixture/index.ts` (không khởi tạo `new PageObject(page)` trong test spec)
4. Test Spec tại `tests/ui/<module>/<feature>.spec.ts`

**Quy tắc:**
- Tái sử dụng Page Objects và Fixture đã có, không tạo trùng lặp
- Gắn Jira Tag `@<JIRA_KEY>` và module tag vào `test.describe('...', { tag: ['@<JIRA_KEY>', '@module'] })`
- Web-First Assertions đặt tại Test Spec (`expect(locator).toBeVisible()`)
- Sử dụng hàm sinh random data traceable từ `core/utils/`
- Tuyệt đối không dùng hard sleep (`waitForTimeout`)
```

---

## 3. API Test Generation

```
Sinh API tests từ Swagger specification:

**Swagger URL:** [URL]
**Endpoint(s):** [Endpoint cần test]
**Framework:** REST Assured + TestNG

**Bao gồm:**
- Happy path (200 OK)
- Validation errors (400)
- Authentication (401/403)
- Not found (404)
- Boundary values
- Schema validation
```

---

## 4. Locator Generation

```
Inspect element và sinh locator ổn định:

**Element:** [Mô tả element cần tìm]
**Page URL:** [URL]
**Tool:** [Selenium / Playwright]

**Output:**
- Locator chính (primary)
- Locator dự phòng (fallback)
- Giải thích lý do chọn locator
```

---

## 5. Flaky Test Analysis

```
Phân tích test flaky và đề xuất fix:

**Test file:** [Path to test]
**Triệu chứng:** [Mô tả hành vi flaky]

**Phân tích:**
1. Root cause
2. Pattern phát hiện (timing, data, environment, selector)
3. Đề xuất fix cụ thể
4. Code fix
```

---

## 6. Test Data Generation

```
Sinh test data cho module:

**Module:** [Tên module]
**Fields:** [Danh sách fields cần data]

**Bao gồm:**
- Valid data (happy path)
- Invalid data (negative)
- Boundary values (min, max, empty, null)
- Special characters
- Format: JSON / CSV / Excel
```
