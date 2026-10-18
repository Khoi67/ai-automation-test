---
name: Flaky Test Analyzer
description: Skill phân tích và khắc phục các automation test không ổn định (flaky tests), xác định root cause và đề xuất fix.
---

# Flaky Test Analyzer

Purpose: Identify and resolve unstable automation tests.

---

## When to Use

Use this skill when:

- A test passes and fails intermittently
- Test results are inconsistent across runs
- CI/CD pipeline has unreliable test results

---

## Responsibilities

Detect flaky tests caused by:

- Unstable locators (dynamic classes, positional xpath)
- Timing issues (race conditions, slow page loads)
- Incorrect waits (hard sleep instead of smart waits)
- Environment dependency (data not cleaned up, external service down)
- Test data conflicts (shared data between parallel tests)

---

## Analysis Workflow

1. **Detect** — Identify the failing test and reproduce the failure
2. **Inspect** — Read error logs, stack traces, and screenshots
3. **Classify** — Categorize the root cause (locator / timing / data / environment)
4. **Fix** — Apply the appropriate fix strategy
5. **Verify** — Re-run test multiple times to confirm stability

---

## Common Flaky Causes & Fixes

### Unstable Locator

**Problem:**
```
//div[3]/button
.css-1n2xyz-btn
```

**Fix:** Replace with stable locator following **4-Tier Master Priority Map** in `.agent/rules/locator_strategy.md`:
1. **Tier 1 (User-Facing Semantic):** `page.getByRole('button', { name: 'Submit' })`, `page.getByLabel('Email')`
2. **Tier 2 (Dedicated Test Attributes):** `page.getByTestId('submit-btn')`
3. **Tier 3 (Stable Identifiers):** `#submit-button`, `input[name="user_email"]`
4. **Tier 4 (Scoped CSS / Relative XPath):** Container scope với `.filter({ hasText: '...' })`

---

### Timing Issues & Network Race Conditions

**Problem:**
```java
Thread.sleep(3000);       // Hard sleep — BAD
page.waitForTimeout(2000); // Fixed delay — BAD
```

**Fix:** Use smart waits as defined in `.agent/rules/playwright_rules.md` and `.agent/rules/selenium_rules.md`:
```typescript
// Playwright: Web-First Assertions
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

// Playwright: Đồng bộ Network API tránh Race Condition khi click
const [response] = await Promise.all([
  page.waitForResponse(res => res.url().includes('/api/v1/data') && res.status() === 200),
  submitButton.click(),
]);
```

> ⚠️ **Anti-Pattern:** **CẤM DÙNG `click({ force: true })` MÙ QUÁNG** để che giấu lỗi phần tử bị che khuất bởi backdrop hoặc animation chưa xong. Hãy xử lý nguyên nhân gốc (chờ modal đóng hoặc dùng assertion visibility).

---

### SPA Hydration & Detached DOM Elements

**Problem:** Click vào element ngay khi vừa render nhưng React/Vue/Angular chưa gắn event listener xong, hoặc DOM bị re-render khiến element rơi vào trạng thái "Element is detached from DOM".

**Fix:**
- Tái định vị element qua semantic locator (Playwright tự động re-query locator trước mỗi action).
- Chạy kiểm thử kèm `--trace on` (`npx playwright test <file> --trace on`) để inspect chính xác timeline DOM snapshot, network call và console logs.

---

### Test Data Conflicts

**Problem:** Tests share mutable data → parallel runs conflict.

**Fix:** Use unique, traceable random data with timestamp & prefix:
```
<prefix>_<testName>_<timestamp>@test.com
Ví dụ: auto_login_1712049200@test.com
```

---

## Stability Checklist

After fixing a flaky test, verify:

- [ ] Locator matches Tier 1/2 semantic standard and is unique in scope
- [ ] No hard sleep (`waitForTimeout`) or fixed delays
- [ ] No blind `click({ force: true })` used to bypass legitimate visibility issues
- [ ] Network/API calls are properly synchronized with `page.waitForResponse()`
- [ ] Test data is unique and traceable (`<prefix>_<testName>_<timestamp>`)
- [ ] Test is independent (no dependency on prior test execution)
- [ ] **Verification Runs:** Test PASS ổn định ít nhất **3+ lần liên tiếp** trên local (`npx playwright test <file> --retries=0 --repeat-each=3 --trace on`), và chạy 5-10 lần khi điều tra lỗi ngẫu nhiên không rõ quy luật.

---

## Rules References

The agent MUST follow these rules when analyzing flaky tests:

- `.agent/rules/locator_strategy.md` — 4-Tier Locator stability rules & container scoping
- `.agent/rules/automation_rules.md` — General automation best practices (5-tier DRY, False Healing prevention)
- `.agent/rules/playwright_rules.md` — Playwright auto-waiting, Web-First assertions, and network sync
- `.agent/rules/selenium_rules.md` — Selenium wait strategy (WebDriverWait)