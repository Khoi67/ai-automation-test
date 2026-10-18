---
name: Locator Healer Agent
description: Skill tự động phát hiện và sửa chữa locators bị hỏng khi automation tests fail do thay đổi DOM.
---

# Locator Healer Agent

Purpose: Automatically repair broken locators when automation tests fail.

---

## When to Use

Use this skill when:

- A test fails with "element not found" or "element detached" errors
- UI has changed and existing locators no longer work
- After a frontend deployment that modifies DOM structure

---

## Responsibilities

When a locator fails:

1. Inspect current DOM or UI hierarchy
2. Compare old locator with current page structure
3. Identify updated attributes
4. Generate a replacement locator
5. Re-run test to verify the fix

---

## Detection Strategy

Locator is considered broken when:

- Element not found (NoSuchElementException / TimeoutError)
- Element detached from DOM
- Selector matches zero elements
- Selector matches wrong element (different text/position)

---

## Healing Workflow

### Step 1: Analyze the Error
- Read error log to identify which locator failed
- Identify the Page Object file and line number

### Step 2: Inspect Current DOM (Chống Blind Healing)
- Mở trang bằng Playwright MCP theo đúng thứ tự bắt buộc:
  1. `browser_navigate(url)`
  2. `browser_resize(width=1920, height=1080)` (bắt buộc set desktop viewport chuẩn)
  3. `browser_snapshot()` hoặc `browser_take_screenshot()`
- **Chốt chặn chống Blind Healing (CRITICAL GUARDRAIL):**
  - Trước khi cố tìm locator thay thế, kiểm tra xem UI có đang bị lỗi ứng dụng (HTTP 500/502, crash trắng trang, spinner loading vô tận, hoặc modal không mở do bug logic).
  - **NẾU LÀ APP BUG:** **DỪNG HEALING NGAY LẬP TỨC!** Không được tự ý nhặt một element ngẫu nhiên khác trên trang để thay thế nhằm ép test pass (Blind / False Healing). Đánh dấu `test.fixme()` kèm Jira Bug ticket.
  - **NẾU DO DOM THAY ĐỔI:** Tiếp tục sang Step 3 để tìm locator mới.

### Step 3: Find Alternative Locator (4-Tier Master Priority Map)
Tìm kiếm locator thay thế theo đúng 4 tầng ưu tiên chuẩn:

1. **Tier 1 — User-Facing Semantic & Accessibility (Ưu tiên cao nhất):**
   - Playwright: `getByRole()`, `getByLabel()`, `getByPlaceholder()`, `getByText()`
   - Appium: `AppiumBy.accessibilityId()`
2. **Tier 2 — Dedicated Test Attributes:**
   - `getByTestId()` hoặc `[data-testid]`, `[data-test]`, `[data-qa]`
3. **Tier 3 — Stable DOM Identifiers:**
   - `id`, `name`, `resource-id` (chỉ dùng khi cố định, cấm auto-generated hashes)
4. **Tier 4 — Scoped CSS / Relative XPath (Lựa chọn cuối cùng):**
   - Áp dụng Scoping: `parentContainer.filter({ hasText: ... }).locator(...)`
   - Với iFrame: dùng `page.frameLocator(...)`

### Step 4: Validate & Replace
- Verify the new locator matches exactly one element (Strict Uniqueness: `await expect(locator).toHaveCount(1)`)
- Verify the element is the correct one (text, position, behavior)
- Replace the broken locator in the Page Object class (không viết inline trong test spec)
- Re-run the test to verify stability

---

## Difference from Smart Locator Agent

| Aspect | Locator Healer | Smart Locator |
|--------|---------------|---------------|
| **Trigger** | Test failure (reactive) | New element (proactive) |
| **Input** | Broken locator + error log | HTML/DOM element |
| **Goal** | Fix existing locator | Generate new locator |
| **Workflow** | Error → Inspect → Replace → Verify | Inspect → Generate → Validate |

---

## Verification

After healing:

- [ ] Locator must match exactly one element
- [ ] Element is the correct target (verify text/attributes)
- [ ] Test must pass successfully
- [ ] Locator is stable across page reloads

---

## Rules References

- `.agent/rules/locator_strategy.md` — Master locator priority map
- `.agent/rules/automation_rules.md` — General automation best practices