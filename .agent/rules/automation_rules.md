# Quy Tắc Chung cho QA Automation

> Áp dụng cho mọi tác vụ automation testing, bất kể framework (Playwright, Selenium, Appium).

## 1. Kiến Trúc & Framework

- Bắt buộc sử dụng mô hình **Page Object Model (POM)**.
- Phân tách rõ ràng:
  - **Page classes:** Khai báo locators + methods tương tác UI
  - **Test classes:** Chứa logic kiểm thử + assertions
  - **Test data:** Tách riêng khỏi code chức năng (JSON, DataProvider, Utils)
- Assertions chỉ đặt trong Test classes, KHÔNG đặt trong Page classes.

## 2. Sinh Dữ Liệu Test (Test Data)

- Tất cả trường yêu cầu unique (Email, Username, Mã KH...) **phải sinh động**, không hardcode.
- Sử dụng UUID, Timestamp hoặc thư viện Faker.
- Dữ liệu phải **traceable** — nhìn vào DB biết ngay test nào tạo ra:
  ```
  Format: [prefix]_[testName]_[timestamp]_[random]
  Ví dụ:  auto_createCustomer_20260402_A3F2@test.com
  ```
- Hỗ trợ chạy parallel: mỗi test method có data riêng biệt, không conflict.

## 3. Chất Lượng Code

- Không logic trùng lặp — tạo helper methods cho các hành động lặp đi lặp lại.
- Code phải đơn giản, dễ đọc, dễ bảo trì.
- Trước khi deliver code:
  - Xóa toàn bộ `console.log`, `System.out.println`, `print()` sinh ra khi debug
  - Xóa code bị comment (`//`, `/* */`)
  - Xóa locator / biến không sử dụng (unused code)

## 4. Quản Lý File & Thư Mục (Test Organization)

- **Cấu trúc thư mục theo Module (BẮT BUỘC):**
  - Mọi test UI phải được tổ chức trong thư mục con tương ứng với module chức năng: `tests/ui/<module>/<feature>.spec.ts`
  - Ví dụ:
    - `tests/ui/auth/login.spec.ts`, `tests/ui/auth/register.spec.ts`
    - `tests/ui/cart/cart.spec.ts`
    - `tests/ui/course/enroll.spec.ts`, `tests/ui/course/search.spec.ts`
    - `tests/ui/profile/profile-avatar.spec.ts`, `tests/ui/profile/profile-courses.spec.ts`
- **CẤM đặt tên file test theo mã ticket Jira** (ví dụ: TUYỆT ĐỐI KHÔNG tạo `tests/ui/SCRUM-18.spec.ts`):
  - Tên file test phải mang tính bền vững theo nghiệp vụ hệ thống.
  - Khi có ticket Jira mới cùng module (ví dụ ticket mới về Cart), **BẮT BUỘC mở rộng file spec hiện có của module đó** hoặc tạo file feature tương ứng bên trong folder module, KHÔNG tạo file riêng theo mã ticket.
- **Traceability qua Playwright Tags:**
  - Liên kết mã ticket Jira thông qua tag trong `test.describe` hoặc `test`:
    ```typescript
    test.describe('Chức năng Giỏ hàng', { tag: ['@SCRUM-18', '@cart'] }, () => { ... });
    ```
- KHÔNG tự động xóa file source khi chưa xác nhận với user.
- Kiểm tra cấu trúc thư mục hiện có trước khi tạo file mới — tránh duplicate.

## 5. Quy Tắc Đặt Tên

### Java

| Thành phần | Quy tắc | Ví dụ |
|---|---|---|
| Page class | PascalCase + hậu tố `Page` | `LoginPage.java`, `CartPage.java` |
| Test class | PascalCase + hậu tố `Test` | `LoginTest.java`, `CartTest.java` |
| Test method | Bắt đầu bằng `test` + mô tả hành vi | `testLoginWithValidCredentials()` |
| Locator biến | lowerCamelCase + hậu tố mô tả element | `loginButton`, `usernameInput` |
| Utils class | PascalCase + mô tả chức năng | `DataGenerator.java`, `WaitHelper.java` |

### TypeScript / Playwright

| Thành phần | Quy tắc | Ví dụ |
|---|---|---|
| Thư mục test | kebab-case theo module | `tests/ui/auth/`, `tests/ui/cart/` |
| Page class | PascalCase + hậu tố `Page` | `LoginPage.ts`, `CartPage.ts` |
| Test file | kebab-case + `.spec.ts` | `auth/login.spec.ts`, `cart/cart.spec.ts` |
| Jira Tag | `@<JIRA_KEY>` trong options tag | `{ tag: ['@SCRUM-18', '@cart'] }` |
| Test block | `test('mô tả hành vi')` | `test('đăng nhập thành công')` |
| Locator biến | lowerCamelCase hoặc readonly | `readonly loginButton` |
| Utils | PascalCase hoặc kebab-case | `DataGenerator.ts`, `data-generator.ts` |

## 6. Assertions (Kiểm Tra Kết Quả)

- Mỗi test case **BẮT BUỘC** có ít nhất 1 assertion ở cuối.
- Nên có assertion xen kẽ ở các bước quan trọng.
- Assert phải mô tả rõ expected behavior:
  ```java
  // Java/TestNG
  Assert.assertTrue(dashboardPage.isDisplayed(), "Dashboard phải hiển thị sau khi đăng nhập");
  ```
  ```typescript
  // Playwright
  await expect(page.getByText('Đăng nhập thành công')).toBeVisible();
  ```

## 7. Tính Độc Lập Của Test (Test Independence)

- Mỗi test case phải **độc lập** — không phụ thuộc kết quả test khác.
- Setup/teardown rõ ràng (`@BeforeMethod/@AfterMethod` hoặc `beforeEach/afterEach`).
- Không chia sẻ state giữa các test methods.