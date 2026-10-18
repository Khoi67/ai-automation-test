# Quy Tắc Dành Riêng Cho Playwright

> Áp dụng khi thiết lập và chạy automation với Playwright (TypeScript hoặc Java).

## 1. Thiết Lập Browser (BẮT BUỘC)

- **Viewport debug:** Mọi quá trình debug UI bắt buộc chạy với viewport desktop: **`1920x1080`**.
- **Playwright MCP — Resize bắt buộc:** Khi sử dụng Playwright MCP để debug UI, **LUÔN LUÔN** gọi `browser_resize(width=1920, height=1080)` **ngay sau khi mở browser** (sau lệnh `browser_navigate` đầu tiên). Đây là bước bắt buộc, không được bỏ qua.
  ```
  Thứ tự bắt buộc:
  1. browser_navigate(url) → mở trang
  2. browser_resize(width=1920, height=1080) → set viewport
  3. browser_snapshot() hoặc browser_take_screenshot() → bắt đầu inspect
  ```
- **Headed mode:** Bắt buộc mở browser có hiển thị (headed) trong quá trình thiết lập và debug test.
- **Headless mode:** Chỉ được phép sử dụng khi:
  - Test đã debug PASS 100% trên headed mode
  - Hoặc trong CI/CD pipeline mặc định

## 2. Workflow Phát Triển & Tìm Element

- Ưu tiên sử dụng **Playwright MCP** để mở browser và tương tác với trang đích.
- **Inspect DOM thực tế:** Verify và capture selector trực tiếp từ browser DOM.
- **TUYỆT ĐỐI KHÔNG:**
  - Suy đoán locator
  - Copy locator mù quáng từ code cũ mà không verify
  - Dựa trên URL / tài liệu mà không xác nhận sự tồn tại trên UI thật

## 3. Thứ Tự Ưu Tiên Locator Playwright & Kỹ Thuật Chaining/Filtering

Playwright cung cấp bộ locator semantic hướng người dùng. Ưu tiên sử dụng thay vì CSS/XPath:

1. `getByRole()` — Tốt nhất cho semantic elements (button, link, heading, dialog...)
2. `getByLabel()` — Tốt nhất cho form fields có label liên kết
3. `getByPlaceholder()` — Tốt nhất cho input fields có placeholder text
4. `getByText()` — Tốt nhất cho text content tĩnh
5. `getByTestId()` — Tốt nhất khi element có thuộc tính `data-testid`
6. `locator("css")` — Fallback khi không có lựa chọn semantic tốt hơn

### Kỹ thuật Locator Chaining & Filtering (Thay thế XPath phức tạp)

Khi phần tử nằm trong danh sách, bảng hoặc modal, sử dụng cơ chế Chaining và `.filter()` thay vì viết XPath dài:

```typescript
// 1. Chaining & Text Filtering cho Card hoặc Table Row
const productCard = page.locator('.course-card').filter({ hasText: 'Playwright Masterclass' });
await productCard.getByRole('button', { name: 'Thêm vào giỏ' }).click();

// 2. Chaining cho Modal / Dialog (Scope an toàn tránh click nhầm element bị che khuất)
const confirmModal = page.getByRole('dialog', { name: 'Xác nhận xóa' });
await confirmModal.getByRole('button', { name: 'Đồng ý' }).click();

// 3. Chaining trong Navigation Menu
const navHeader = page.getByRole('navigation');
await navHeader.getByRole('link', { name: 'Khóa học của tôi' }).click();
```

## 4. Chiến Lược Chờ Đợi (Wait Strategy & Network Sync)

**NGHIÊM CẤM:**
- `page.waitForTimeout()` — hard sleep gây lãng phí thời gian và làm chậm CI
- `await new Promise(r => setTimeout(r, N))` — tự tạo delay
- Bất kỳ cách nào cố định thời gian chờ

**SỬ DỤNG:**
- Tận dụng auto-waiting mặc định của Playwright (tự động chờ element visible, enabled, stable trước khi click/fill).
- **Web-First Assertions:**
  ```typescript
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
  await expect(locator).toHaveText('Thành công');
  await expect(page).toHaveURL(/dashboard/);
  ```
- **Đồng bộ Network/API (Network Synchronization):**
  Khi thao tác UI kích hoạt một API call bất đồng bộ (ví dụ: submit form, áp mã giảm giá, checkout), sử dụng `page.waitForResponse()` kết hợp Web-First Assertions thay vì tăng timeout mù quáng:
  ```typescript
  // Đợi API phản hồi 200 đồng thời với thao tác bấm nút
  const [response] = await Promise.all([
    page.waitForResponse(res => res.url().includes('/api/v1/cart/add') && res.status() === 200),
    coursePage.addCourseToCart(),
  ]);
  await expect(cartPage.cartBadgeCount).toHaveText('1');
  ```

## 5. Cấu Trúc Test Chuẩn Dự Án (Fixture Injection & Tagging)

Bắt buộc tuân thủ cấu trúc kiểm thử chuẩn Enterprise của dự án:
- Sử dụng Custom Fixture (`fixture/page-fixture.ts`) để inject trực tiếp các Page Objects, Services và Workflows.
- **Tuân thủ chuẩn NodeNext ESM:** Dự án cấu hình TypeScript `"moduleResolution": "NodeNext"`, do đó mọi import relative file cục bộ bắt buộc phải có phần mở rộng `.js` (ví dụ: `../../../fixture/page-fixture.js`).
- **CẤM** khởi tạo thủ công `new PageObject(page)` trong test spec.
- Gắn Jira Tag `@<JIRA_KEY>` và module tag vào options của `test.describe`:

```typescript
import { test, expect } from '../../../fixture/page-fixture.js';

test.describe('SCRUM-18: Chức năng Giỏ hàng', { tag: ['@SCRUM-18', '@cart'] }, () => {
  test('TC_01: Thêm khóa học vào giỏ hàng thành công', async ({ coursePage, cartPage }) => {
    // Arrange & Act: Gọi hàm hành vi từ Page Object đã được inject qua fixture
    await coursePage.navigateToCourseDetail('Playwright Masterclass');
    await coursePage.addCourseToCart();

    // Assert: Web-First Assertions đặt tại Test Spec
    await expect(cartPage.cartBadgeCount).toHaveText('1');
    await expect(cartPage.getCourseItemInCart('Playwright Masterclass')).toBeVisible();
  });
});
```

## 6. Quản Lý Phiên Đăng Nhập & Test Isolation (Session Caching)

- **Tái sử dụng `storageState`:** Đối với các test case không kiểm thử trực tiếp màn hình Đăng nhập (như Cart, Profile, Course Enroll, Checkout), ưu tiên sử dụng session đã lưu trong `storageState` (được cấu hình qua setup project `tests/setup/auth.setup.ts`) hoặc API login inject token vào context.
- **Tránh lặp thao tác UI Login:** Tuyệt đối tránh việc lặp lại các bước điền form đăng nhập qua UI ở `beforeEach` của từng test case, giúp giảm 70% thời gian thực thi test suite và triệt tiêu nguy cơ flaky do network.
- **Tính độc lập (Test Isolation):** Mỗi test case phải thao tác trên dữ liệu riêng biệt (traceable test data) hoặc tự dọn dẹp state sau khi hoàn tất, đảm bảo không ảnh hưởng đến các test case chạy song song (Parallel Workers).
