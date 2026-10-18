# Quy Tắc Chung cho QA Automation

> Áp dụng cho mọi tác vụ automation testing, bất kể framework (Playwright, Selenium, Appium).
> Mục tiêu: Xây dựng hệ thống kiểm thử tự động đạt chuẩn Enterprise — kiến trúc 5 tầng DRY, ổn định, chống false healing, CI-friendly và bảo vệ nhánh chính.

## 1. Kiến Trúc & Framework (Kiến Trúc 5 Tầng DRY)

Bắt buộc tuân thủ mô hình **Page Object Model (POM) nâng cao với 5 tầng DRY**, phân tách triệt để trách nhiệm để chống lặp code và dễ dàng bảo trì:

1. **Page Objects (`page-object/*.ts`):**
   - Chỉ chứa **Scoped Locators** và các **User Actions** (hành động của người dùng trên trang).
   - **TUYỆT ĐỐI CẤM** đặt `expect()` assertion trong Page class (trừ các hàm helper kiểm tra state trả về `Promise<boolean>` hoặc chờ điều kiện chuyển trang).
2. **Shared Components (`page-object/components/*.ts`):**
   - Các phần tử giao diện dùng chung trên nhiều trang (Header, Footer, Sidebar, Navigation Bar, Modal/Dialog, Toast Notification) bắt buộc phải tách thành Component class riêng.
   - Nhúng Component vào Page Object qua quan hệ Composition:
     ```typescript
     export class HomePage {
       readonly header: HeaderComponent;
       readonly footer: FooterComponent;

       constructor(page: Page) {
         this.header = new HeaderComponent(page);
         this.footer = new FooterComponent(page);
       }
     }
     ```
3. **Fixtures Injection (`fixture/page-fixture.ts`):**
   - **BẮT BUỘC** khởi tạo và inject tất cả Page Objects, Services và Workflows qua Playwright Custom Test Fixture (`test.extend<{ loginPage: LoginPage, cartPage: CartPage, ... }>`).
   - Mọi file test spec import test/expect trực tiếp từ fixture theo chuẩn NodeNext ESM:
     ```typescript
     import { test, expect } from '../../../fixture/page-fixture.js';
     ```
   - **NGHIÊM CẤM** khởi tạo thủ công `new LoginPage(page)` lặp đi lặp lại trong từng test block hoặc `beforeEach`.
4. **Business Workflows (`workflow/*.ts`):**
   - Đóng gói các chuỗi thao tác nghiệp vụ liên hoàn qua nhiều trang (ví dụ: `checkoutWorkflow.completeOrder(...)`, `onboardingWorkflow.registerAndVerify(...)`) được tái sử dụng ở nhiều test specs.
5. **Test Data & Constants (`test-data/`, `constant/`, `core/utils/`):**
   - Tách biệt hoàn toàn dữ liệu kiểm thử (JSON/factories), hằng số URL, Timeout, Error Messages và Utilities dùng chung khỏi logic kịch bản kiểm thử.

## 2. Sinh Dữ Liệu Test (Test Data)

- Tất cả trường yêu cầu unique (Email, Username, Mã KH, Mã đơn hàng...) **phải sinh động**, không hardcode.
- Sử dụng UUID, Timestamp hoặc thư viện Faker/DataGenerator để đảm bảo tính duy nhất.
- Dữ liệu phải **traceable** — nhìn vào cơ sở dữ liệu hoặc log biết ngay test case nào tạo ra:
  ```
  Format: [prefix]_[testName]_[timestamp]_[random]
  Ví dụ:  auto_createCustomer_20260402_A3F2@test.com
  ```
- **Quy tắc bảo mật & Quyền riêng tư (Security & Privacy):**
  - **CẤM** sử dụng thông tin định danh cá nhân thật (PII - Personally Identifiable Information) của khách hàng/nhân sự thật trong test data.
  - **CẤM** nạp hoặc đọc trực tiếp file `.env` bằng LLM context trong quá trình tương tác. Mọi thông tin nhạy cảm (secrets, API keys, credentials) chỉ được truy xuất gián tiếp qua `process.env.<VAR>` trong mã nguồn hoặc qua test fixture.
- Hỗ trợ chạy song song (Parallel Execution): Mỗi test method/worker phải có data hoàn toàn độc lập, không conflict dữ liệu.

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

## 5. Quy Tắc Đặt Tên (Case-Sensitivity Safe)

### Java

| Thành phần | Quy tắc | Ví dụ |
|---|---|---|
| Page class | PascalCase + hậu tố `Page` | `LoginPage.java`, `CartPage.java` |
| Component class | PascalCase + hậu tố `Component` | `HeaderComponent.java` |
| Test class | PascalCase + hậu tố `Test` | `LoginTest.java`, `CartTest.java` |
| Test method | Bắt đầu bằng `test` + mô tả hành vi | `testLoginWithValidCredentials()` |
| Locator biến | lowerCamelCase + hậu tố mô tả element | `loginButton`, `usernameInput` |
| Utils class | PascalCase + mô tả chức năng | `DataGenerator.java`, `WaitHelper.java` |

### TypeScript / Playwright (Bắt buộc chuẩn Case-Sensitivity trên Linux CI)

| Thành phần | Quy tắc | Ví dụ |
|---|---|---|
| Page Object File | `kebab-case` + `.ts` (không tạo trùng chức năng) | `page-object/login-page.ts`, `page-object/cart-page.ts` |
| Page Object Class | `PascalCase` + hậu tố `Page` | `export class LoginPage`, `export class CartPage` |
| Component File | `kebab-case` + `.component.ts` | `page-object/components/header.component.ts` |
| Component Class | `PascalCase` + hậu tố `Component` | `export class HeaderComponent` |
| Thư mục test | `kebab-case` theo module | `tests/ui/auth/`, `tests/ui/cart/` |
| Test File | `kebab-case` + `.spec.ts` | `tests/ui/auth/login.spec.ts`, `tests/ui/cart/cart.spec.ts` |
| Jira Tag | `@<JIRA_KEY>` trong options tag | `{ tag: ['@SCRUM-18', '@cart'] }` |
| Test block | `test('mô tả hành vi')` | `test('TC_01: Đăng nhập với tài khoản hợp lệ')` |
| Locator biến | `lowerCamelCase` hoặc `readonly` | `readonly loginButton`, `readonly emailInput` |
| Utils / Helpers | `kebab-case` + `.ts` | `core/utils/data-generator.ts`, `core/network/network-helper.ts` |

## 6. Assertions & Phân Loại Lỗi (Chống False Healing)

- Mỗi test case **BẮT BUỘC** có ít nhất 1 assertion ở cuối.
- Nên có assertion xen kẽ ở các bước quan trọng để fail fast khi gặp lỗi luồng.
- Assert phải mô tả rõ expected behavior:
  ```java
  // Java/TestNG
  Assert.assertTrue(dashboardPage.isDisplayed(), "Dashboard phải hiển thị sau khi đăng nhập");
  ```
  ```typescript
  // Playwright
  await expect(page.getByText('Đăng nhập thành công')).toBeVisible();
  ```
- **Phân loại lỗi khi Assertion FAIL (BẮT BUỘC):**
  Khi một assertion thất bại trong quá trình chạy test hoặc auto-heal, bắt buộc phân loại chính xác:
  1. **Lỗi Code Test (Test Automation Bug):** Do thay đổi DOM, selector hỏng hoặc expected text trong code bị lệch so với Test Case spec.
     - *Xử lý:* Cập nhật locator, chỉnh sửa lại assertion cho khớp với Requirement/TC ban đầu.
  2. **Lỗi Ứng Dụng (Application Bug):** Ứng dụng hoạt động sai so với Requirement / Business Logic quy định.
     - *Xử lý:* **NGHIÊM CẤM FALSE HEALING** — Tuyệt đối không được sửa expected value theo kết quả sai của ứng dụng để ép test PASS trên CI.
     - *Bảo vệ CI:* Giữ nguyên assertion đúng theo requirement, chuyển test thành `test.fixme(...)` kèm chú thích mã Jira Bug để báo hiệu cho team Dev:
       ```typescript
       test.fixme('TC_02: [BUG-SCRUM-45] Đơn hàng hiển thị đúng thuế VAT', async ({ checkoutPage }) => {
         // Assertion giữ nguyên để verify khi bug được fix
       });
       ```

## 7. Tính Độc Lập Của Test (Test Independence)

- Mỗi test case phải **độc lập** — không phụ thuộc vào kết quả hoặc thứ tự chạy của test khác.
- Setup/teardown rõ ràng (`@BeforeMethod/@AfterMethod` hoặc `beforeEach/afterEach`).
- Không chia sẻ in-memory state giữa các test methods.
- Dọn dẹp tài nguyên hoặc sử dụng dữ liệu cô lập cho từng test run.

## 8. Quy Tắc Bàn Giao Mã Nguồn & Phân Nhánh (Git Branching & Delivery)

- **CẤM PUSH TRỰC TIẾP LÊN MAIN:** Nhánh `main` là protected branch, tuyệt đối không push trực tiếp từ local. Mọi thay đổi phải đi qua Pull Request.
- **Quy tắc phân nhánh (Feature Branching):**
  - Kịch bản kiểm thử mới: `feat/<JIRA_KEY>` (ví dụ: `feat/SCRUM-17`).
  - Sửa lỗi test / heal locator: `fix/<JIRA_KEY>`.
  - Kiểm thử lại bug đã fix: `fix/retest-<JIRA_KEY>`.
- **Đồng bộ nhánh trước khi thao tác (Chống Merge Conflict):**
  - Trước khi tạo nhánh mới hoặc trước khi push, luôn chạy:
    ```bash
    git fetch origin main && git rebase origin/main
    ```
- **Pre-Push Quality Gate:**
  - Bắt buộc kiểm tra TypeScript: `npm run typecheck`
  - Bắt buộc chạy kiểm thử local targeted: `npx playwright test tests/ui/<module>/` đạt 100% PASS (hoặc fixme bảo vệ CI).
- **An toàn Git Working Tree (Selective Staging):**
  - **CẤM DÙNG `git add .`:** Tránh commit nhầm các file artifacts/scratch (`task.md`, `flaky_analysis.md`, thư mục `scratch/`, logs tạm).
  - Chỉ stage có chọn lọc các thư mục mã nguồn:
    ```bash
    git add tests/ page-object/ fixture/ workflow/ core/ constant/ test-data/
    ```
- **Quy trình bàn giao hoàn chỉnh:**
  1. `git checkout -b feat/<JIRA_KEY>`
  2. `git add tests/ page-object/ fixture/ workflow/ core/ constant/ test-data/`
  3. `git commit -m "feat(automation): add test suite and POM for <JIRA_KEY>"`
  4. `git push -u origin feat/<JIRA_KEY>`
  5. Tạo link Pull Request: `https://github.com/<GITHUB_OWNER>/<GITHUB_REPO>/compare/main...feat/<JIRA_KEY>?expand=1` để reviewer phê duyệt và merge vào `main`.