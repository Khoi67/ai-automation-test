# Chiến Lược Chọn Locator (Áp Dụng Mọi Framework)

> Độ ổn định và khả năng đọc hiểu của locator quyết định sức khỏe của một automation framework.
> Nguyên tắc cốt lõi: KHÔNG BAO GIỜ chọn element dựa trên cấu trúc DOM gắn với styling. Hãy xây dựng locator dựa trên thuộc tính có ngữ nghĩa và hướng người dùng.

## 1. Bản Đồ Ưu Tiên 4 Tầng (4-Tier Master Priority Map)

Mọi locator phải tuân theo thứ tự ưu tiên 4 tầng nghiêm ngặt từ cao xuống thấp:

| Tầng | Nhóm Locator | Thuộc Tính / Phương Thức | Ví Dụ | Mục Đích & Ưu Điểm |
|---|---|---|---|---|
| **Tier 1 (Cao nhất)** | User-Facing Semantic & Accessibility | Role, Label, Placeholder, Text hiển thị (`getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, hoặc `AccessibilityId` trên Appium) | `page.getByRole('button', { name: 'Đăng nhập' })`<br>`page.getByLabel('Email')` | Mô phỏng chính xác cách người dùng tương tác, bền vững nhất trước thay đổi cấu trúc DOM/CSS. |
| **Tier 2** | Dedicated Test Attributes | Thuộc tính chuyên dụng kiểm thử (`data-testid`, `data-test`, `data-qa`, `test-id`) | `page.getByTestId('submit-btn')`<br>`[data-testid="cart-badge"]` | Ổn định cao, được bảo vệ khỏi thay đổi design/CSS và đa ngôn ngữ. |
| **Tier 3** | Stable DOM Identifiers | Thuộc tính định danh cố định, có ngữ nghĩa (`id`, `name`, `resource-id` không auto-generated) | `#username`<br>`input[name="password"]` | Dành cho các form chuẩn HTML không có Aria role rõ ràng. |
| **Tier 4 (Cuối cùng)** | Scoped CSS / Relative XPath | CSS kết hợp ngữ nghĩa hoặc XPath tương đối ngắn có neo mốc (anchor) | `.product-card >> button.buy`<br>`//div[@class='card'][.//h3[text()='Pro']]//button` | Chỉ sử dụng khi không có lựa chọn ở Tier 1-3. Bắt buộc scope chặt chẽ. |

## 2. Quy Tắc Ổn Định (Stability Rules)

Mọi locator phải đảm bảo:
- Chỉ match **đúng 1 element** duy nhất trên trang hoặc trong scope xác định (Strict Uniqueness).
- Sống sót qua thay đổi giao diện — không bị ảnh hưởng khi DOM thay đổi layout (thêm/bớt div wrapper, đổi từ float sang flexbox/grid).

**NGHIÊM CẤM sử dụng (Anti-Patterns):**
- CSS class name động / hash tạm thời sinh bởi build tool (ví dụ: `css-1n2xyz-btn`, `sc-bdVaJa`, `style_btn__3k4A`)
- Chuỗi `nth-child`, `nth-of-type` sâu khi có giải pháp semantic hoặc text filtering tốt hơn
- ID tự sinh bởi frontend framework (ví dụ: `id=":r1:"`, `id="ember1234"`, `id="mat-input-0"`)
- XPath tuyệt đối dựa trên vị trí cây DOM (ví dụ: `/html/body/div[1]/div[3]/div[2]/form/div/button`)

### 2.1. Quy Tắc Scoping cho Danh Sách Động, Bảng và Modal

Khi làm việc với các thành phần giao diện phức tạp, **KHÔNG BAO GIỜ** viết một locator dài ngoằng để cố chọc vào phần tử con. Áp dụng kỹ thuật phân tầng Container Scope:

1. **Bảng và Danh sách (Table / Grid / List):**
   - Định vị hàng (Row) hoặc thẻ (Card) chứa dữ liệu định danh trước, sau đó tìm nút thao tác con bên trong:
     ```typescript
     // Định vị dòng khóa học cụ thể rồi bấm nút Xóa
     const courseRow = page.getByRole('row').filter({ hasText: 'Playwright Masterclass' });
     await courseRow.getByRole('button', { name: 'Xóa' }).click();
     ```
2. **Hộp thoại / Popups / Dialogs:**
   - Luôn giới hạn phạm vi tìm kiếm bên trong Modal/Dialog để tránh match nhầm element bị che ở background:
     ```typescript
     const confirmModal = page.getByRole('dialog', { name: 'Xác nhận xóa' });
     await confirmModal.getByRole('button', { name: 'Đồng ý' }).click();
     ```
3. **iFrame và Shadow DOM:**
   - Với element nằm bên trong `iframe`, bắt buộc khai báo context frame rõ ràng:
     ```typescript
     // Playwright iFrame scoping
     const stripeFrame = page.frameLocator('iframe[name="stripe-checkout"]');
     await stripeFrame.getByPlaceholder('Card number').fill('4242...');
     ```
   - Với Shadow DOM: Playwright mặc định xuyên qua open Shadow DOM với CSS và Semantic Locators. Nếu là Selenium/Appium, bắt buộc dùng `getShadowRoot()` hoặc API tương ứng.

## 3. Quy Trình Xác Minh Locator (Strict Uniqueness Verification)

Trước khi đưa locator vào Page Object hoặc test code, bắt buộc kiểm tra các tiêu chí:

1. **Kiểm tra tính duy nhất (Strict Uniqueness - Match đúng 1 element):**
   - **Với Playwright Semantic Locators (`getByRole`, `getByLabel`, `getByText`):**
     - Kiểm tra trên Accessibility Snapshot (`browser_snapshot`): đảm bảo tổ hợp `role` + `name` là duy nhất trong ngữ cảnh trang hoặc container.
     - Kiểm tra trong runtime: `await expect(locator).toHaveCount(1)` hoặc kiểm tra `await locator.count() === 1`.
   - **Với CSS Selector / XPath:**
     - Có thể kiểm tra nhanh trong browser console: `document.querySelectorAll('<selector>').length === 1` hoặc `document.evaluate(...)`.
2. **Khả năng tương tác (Actionability):**
   - Element match phải là thành phần hiển thị và người dùng tương tác được (visible, enabled, stable), không bị che phủ bởi loading backdrop hay fixed header.
3. **Tính bền vững qua điều hướng:**
   - Thử reload / navigate lại trang hoặc đổi ngữ cảnh (loading state, empty data, filled data) để đảm bảo locator không bị biến mất hoặc đổi định danh.

## 4. Locator Theo Framework

Chi tiết quy tắc và mẫu code chuẩn cho từng framework:
- **Playwright (TypeScript):** Xem chi tiết tại [Quy Tắc Playwright](.agent/rules/playwright_rules.md) (Mục 3 & 4)
- **Selenium / Appium:** Áp dụng Master Priority Map, ưu tiên `By.id`, `By.name`, `By.cssSelector` có thuộc tính `data-*` hoặc `AppiumBy.accessibilityId`.
