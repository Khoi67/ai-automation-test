---
name: Smart Locator Agent
description: Skill sinh locator ổn định và dễ bảo trì cho UI automation, hỗ trợ Playwright, Selenium và Appium.
---

# Smart Locator Agent

Purpose: Generate stable and maintainable locators for UI automation.

Applicable frameworks:

- Playwright
- Selenium
- Appium

---

## When to Use

Use this skill when:

- Generating locators for new UI elements
- Reviewing existing locators for stability
- Migrating locators between frameworks

---

## Responsibilities

The agent must:

1. Inspect the DOM or mobile UI hierarchy (NEVER guess)
2. Identify stable attributes
3. Generate a reliable locator
4. Validate locator uniqueness
5. Provide fallback locator if primary is fragile

---

## Locator Priority (4-Tier Master Priority Map)

Mọi locator phải tuân theo thứ tự 4 tầng ưu tiên chuẩn:

1. **Tier 1 — User-Facing Semantic & Accessibility (Ưu tiên cao nhất):**
   - Playwright: `getByRole()`, `getByLabel()`, `getByPlaceholder()`, `getByText()`
   - Appium: `AppiumBy.accessibilityId()`
   - Phản ánh trung thực trải nghiệm người dùng, bền vững nhất trước thay đổi DOM.
2. **Tier 2 — Dedicated Test Attributes:**
   - Playwright: `getByTestId()` hoặc `[data-testid]`, `[data-test]`, `[data-qa]`
3. **Tier 3 — Stable DOM Identifiers:**
   - `id`, `name`, `resource-id` (chỉ dùng khi tĩnh, không chứa hash tự sinh)
4. **Tier 4 — Scoped CSS / Relative XPath (Lựa chọn cuối cùng):**
   - CSS có thuộc tính ngữ nghĩa hoặc XPath tương đối ngắn có neo mốc.

> **Note:** For detailed rules, refer to `.agent/rules/locator_strategy.md`.

---

## Playwright Locators & Scoping Techniques

### 1. Preferred Semantic Locator Methods:
1. `getByRole()` — Best for semantic elements (button, link, heading, dialog, checkbox...)
2. `getByLabel()` — Best for form inputs associated with labels
3. `getByPlaceholder()` — Best for inputs with placeholder text
4. `getByText()` — Best for static text elements
5. `getByTestId()` — Best when data-testid is available

### 2. Component Scoping & Filtering (Thay thế XPath phức tạp):
Khi phần tử nằm trong danh sách hoặc bảng động, định vị container rồi dùng `.filter()`:
```typescript
// Tìm dòng chứa tên khóa học rồi bấm nút Xóa bên trong
const targetRow = page.getByRole('row').filter({ hasText: 'Playwright Masterclass' });
await targetRow.getByRole('button', { name: 'Xóa' }).click();

// Scope bên trong Modal Dialog
const confirmModal = page.getByRole('dialog', { name: 'Xác nhận xóa' });
await confirmModal.getByRole('button', { name: 'Đồng ý' }).click();
```

### 3. iFrame & Shadow DOM Handling:
- **iFrame:** Bắt buộc khai báo context frame rõ ràng:
  ```typescript
  const paymentFrame = page.frameLocator('iframe[name="stripe-checkout"]');
  await paymentFrame.getByPlaceholder('Card number').fill('4242...');
  ```
- **Shadow DOM:** Playwright tự động xuyên qua open Shadow DOM đối với cả CSS và Semantic Locators.

> **Note:** For detailed rules, refer to `.agent/rules/playwright_rules.md`.

---

## Selenium Locators

Preferred order:

1. `id`
2. `data-testid`
3. `name`
4. `cssSelector`
5. `xpath`

Example:
```java
driver.findElement(By.id("login-button"));
driver.findElement(By.cssSelector("button[data-testid='submit-btn']"));
```

> **Note:** For detailed rules, refer to `.agent/rules/selenium_rules.md`.

---

## Appium Locators

Preferred order:

1. `accessibility id`
2. `resource-id`
3. `id`
4. `iOS predicate string`
5. `class chain`
6. `xpath`

Example:
```java
driver.findElement(AppiumBy.accessibilityId("login_button"));
driver.findElement(AppiumBy.id("com.app:id/login_button"));
driver.findElement(AppiumBy.iOSNsPredicateString("label == 'Login'"));
```

> **Note:** For detailed rules, refer to `.agent/rules/appium_rules.md`.

---

## Validation Rules

Before using a locator, ensure:

- [ ] It matches exactly one element
- [ ] The element is visible and interactable
- [ ] It is stable across page reloads
- [ ] It survives cosmetic DOM changes (layout, styling)
- [ ] It does NOT use dynamic class names or positional xpath

---

## Output Format

When generating locators, provide:

1. **Primary locator** — The best, most stable option
2. **Fallback locator** — Alternative if primary breaks
3. **Reasoning** — Why this locator was chosen

---

## Rules References

- `.agent/rules/locator_strategy.md` — Master locator priority map
- `.agent/rules/playwright_rules.md` — Playwright-specific locator rules
- `.agent/rules/selenium_rules.md` — Selenium-specific locator rules
- `.agent/rules/appium_rules.md` — Appium-specific locator rules