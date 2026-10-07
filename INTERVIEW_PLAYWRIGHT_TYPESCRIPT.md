# 📘 CẨM NANG PHỎNG VẤN FRESHER AUTOMATION ENGINEER
## Chuyên Sâu Playwright + TypeScript & Ứng Dụng AI Vào Testing

> **Dành riêng cho ứng viên ứng tuyển vị trí Fresher / Junior Automation Test.**  
> Tài liệu này được biên soạn dựa trên chính kiến trúc và bài toán thực tế của dự án **V Learning Automation Framework** (`demo-ai-automation`).

---

## 📑 MỤC LỤC
1. [Phần 1: Giới Thiệu Dự Án Gây Ấn Tượng (2 Phút Mở Đầu)](#phần-1-giới-thiệu-dự-án-gây-ấn-tượng-2-phút-mở-đầu)
2. [Phần 2: TypeScript Nền Tảng Cho Automation Testing](#phần-2-typescript-nền-tảng-cho-automation-testing)
3. [Phần 3: Playwright Core & Kiến Trúc Nâng Cao](#phần-3-playwright-core--kiến-trúc-nâng-cao)
4. [Phần 4: Xử Lý Các Tình Huống UI Phức Tạp (Alert, Frame, Upload, Network)](#phần-4-xử-lý-các-tình-huống-ui-phức-tạp-alert-frame-upload-network)
5. [Phần 5: Page Object Model (POM) & Custom Fixtures](#phần-5-page-object-model-pom--custom-fixtures)
6. [Phần 6: Kỹ Năng Debug & Quản Trị Flaky Test](#phần-6-kỹ-năng-debug--quản-trị-flaky-test)
7. [Phần 7: Ứng Dụng AI Trong Automation (Điểm Cộng Vượt Trội)](#phần-7-ứng-dụng-ai-trong-automation-điểm-cộng-vượt-trội)
8. [Phần 8: Câu Chuyện Tình Huống STAR Thực Tế Đắt Giá](#phần-8-câu-chuyện-tình-huống-star-thực-tế-đắt-giá)

---

## PHẦN 1: GIỚI THIỆU DỰ ÁN GÂY ẤN TƯỢNG (2 PHÚT MỞ ĐẦU)

> **Interviewer:** *"Em hãy giới thiệu ngắn gọn về dự án Automation nổi bật nhất trong CV của mình?"*

**💡 Câu trả lời chuẩn mực:**
> *"Dạ, dự án nổi bật nhất của em là **V Learning Automation Framework** trên nền tảng **Playwright + TypeScript**. Đây là một hệ sinh thái kiểm thử khép kín End-to-End:*
> 1. **Về kiến trúc mã nguồn:** Em áp dụng mô hình **Page Object Model (POM)** kết hợp **Fixture Dependency Injection**, phân chia thư mục theo từng module chức năng (`auth`, `course`, `cart`, `profile`), đảm bảo nguyên tắc DRY và quản lý dữ liệu kiểm thử động (Traceable Test Data).
> 2. **Về hạ tầng tích hợp:** Dự án kết nối trực tiếp với **Jira Cloud REST API**, **Telegram Assistant Bot** (Long-polling điều phối kịch bản) và **GitHub Actions CI/CD** tự động biên dịch Allure Report xuất bản lên GitHub Pages.
> 3. **Về ứng dụng AI:** Em áp dụng mô hình **AI-RBT (Risk-Based Testing)** có kiểm soát chất lượng nghiêm ngặt (Quality Gates): AI hỗ trợ phân tích yêu cầu, sinh test cases và test script; đồng thời thiết lập cơ chế **Failure Classification** (phân biệt lỗi script và bug app thực tế), cơ chế **CI Safety (`test.fixme`)** và **Pre-Push Quality Gate** để bảo vệ pipeline CI luôn xanh 100%."*

---

## PHẦN 2: TYPESCRIPT NỀN TẢNG CHO AUTOMATION TESTING

### Câu 1: Tại sao nên dùng TypeScript thay vì JavaScript thuần cho Automation Testing?
* **Trả lời:**
  * **Static Typing (Kiểm tra kiểu tĩnh tại compile-time):** Giúp phát hiện sai sót về tên hàm, thuộc tính của Page Object ngay khi viết code (tránh trường hợp chạy nửa tiếng trên CI mới phát hiện lỗi `TypeError: Cannot read properties of undefined`).
  * **Auto-completion & IntelliSense mạnh mẽ:** Khi gọi các Page Object methods hay Playwright APIs, IDE gợi ý chính xác tham số và kiểu trả về.
  * **Hỗ trợ Interface & Type Alias:** Định nghĩa rõ ràng cấu trúc dữ liệu cho API Request/Response và Test Data (ví dụ: `ThongTinDangNhap`, `CourseModel`).
  * **Refactoring an toàn:** Khi đổi tên một method trong Page Object, TypeScript sẽ báo đỏ ở tất cả các test spec đang gọi nó, giúp sửa đồng bộ dễ dàng.

---

### Câu 2: Sự khác biệt giữa `interface` và `type` trong TypeScript? Em sử dụng chúng ra sao trong framework?
* **Trả lời:**
  * **Điểm giống:** Cả hai đều dùng để định nghĩa hình dạng (shape) của object.
  * **Điểm khác:**
    * `interface`: Hỗ trợ **kế thừa (extends)** và **gộp khai báo (declaration merging)**. Phù hợp nhất để định nghĩa cấu trúc Page Objects, Fixtures hoặc Data Models.
    * `type`: Linh hoạt hơn khi dùng với **Union types (`type Status = 'PASS' | 'FAIL' | 'SKIP'`)**, Tuple, hoặc kiểu dữ liệu nguyên thủy (Primitive).
  * **Trong dự án của em:**
    * Dùng `interface` cho Model dữ liệu API và Fixtures:
      ```typescript
      export interface ThongTinDangNhap {
        taiKhoan: string;
        matKhau: string;
      }
      ```
    * Dùng `type` cho các hằng số hữu hạn hoặc Union type:
      ```typescript
      export type TestSuiteScope = 'all' | 'ui' | 'api';
      ```

---

### Câu 3: Async/Await và Promise hoạt động thế nào trong Playwright? Điều gì xảy ra nếu quên từ khóa `await`?
* **Trả lời:**
  * Trong Playwright, hầu như 100% các hành động tương tác trình duyệt (`page.goto()`, `locator.click()`, `locator.fill()`) và Web-First Assertions (`expect().toBeVisible()`) đều trả về một **Promise**.
  * `await` dùng để tạm dừng thực thi cho đến khi Promise đó giải quyết xong (resolved) hoặc thất bại (rejected).
  * **Nếu quên từ khóa `await`:**
    * Lệnh đó sẽ chạy ngầm không đồng bộ mà không đợi hoàn thành. Playwright sẽ nhảy ngay sang dòng lệnh tiếp theo.
    * **Hậu quả:** Gây ra lỗi **Race Condition** và test bị flaky (ví dụ: chưa click xong nút Đăng nhập mà đã assert URL tiếp theo $\rightarrow$ Test FAIL ngẫu nhiên).

---

### Câu 4: Path Mapping (`baseUrl` và `paths`) trong `tsconfig.json` có lợi ích gì?
* **Trả lời:**
  * Giúp tránh việc sử dụng đường dẫn tương đối dài dòng và dễ vỡ (`../../../page-object/login-page.js`).
  * Trong dự án, em cấu hình:
    ```json
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["page-object/*"],
      "@fixture/*": ["fixture/*"],
      "@core/*": ["core/*"],
      "@data/*": ["data-object/*"]
    }
    ```
  * Giúp code sạch, dễ đọc và khi di chuyển thư mục file test thì không phải sửa lại toàn bộ chuỗi `../../`.

---

## PHẦN 3: PLAYWRIGHT CORE & KIẾN TRÚC NÂNG CAO

### Câu 5: Kiến trúc của Playwright khác biệt thế nào so với Selenium WebDriver?
* **Trả lời:**
  * **Selenium WebDriver:** Sử dụng giao thức HTTP JSON Wire Protocol (hoặc W3C WebDriver). Mỗi command (click, sendKeys) là một HTTP Request gửi qua Browser Driver riêng biệt $\rightarrow$ Có độ trễ mạng và không biết được khi nào DOM thực sự sẵn sàng.
  * **Playwright:** Sử dụng **một kết nối WebSocket duy nhất** trực tiếp tới Browser Engine (thông qua Chrome DevTools Protocol hoặc giao thức nội bộ tương đương cho Firefox/WebKit). 
  * **Lợi ích của Playwright:**
    * Tốc độ cực nhanh (thao tác trực tiếp với process của trình duyệt).
    * Lắng nghe sự kiện mạng (Network events) và DOM mutations theo thời gian thực.
    * Khả năng can thiệp sâu (Intercept network, mock response, giả lập geolocation, device emulation).

---

### Câu 6: Phân biệt `Browser`, `BrowserContext` và `Page` trong Playwright?
* **Trả lời:**
  * **Browser:** Là một instance của trình duyệt được khởi chạy (Chromium, Firefox, WebKit). Khởi tạo Browser tốn nhiều tài nguyên nhất.
  * **BrowserContext:** Là một phiên làm việc độc lập hoàn toàn (tương tự như một hồ sơ **Incognito/Ẩn danh**).
    * Mỗi context có Cookies, LocalStorage, SessionStorage và Cache hoàn toàn cô lập với context khác.
    * Khởi tạo context cực nhanh (chỉ vài mili-giây), cho phép chạy hàng chục test song song mà không tốn tài nguyên bật tắt Browser process.
  * **Page:** Là một tab hoặc một cửa sổ trình duyệt nằm bên trong một BrowserContext.

---

### Câu 7: Cơ chế Auto-Waiting của Playwright hoạt động ra sao? Nó kiểm tra những Actionability Checks nào?
* **Trả lời:**
  Trước khi thực hiện một hành động (ví dụ: `locator.click()`), Playwright tự động chạy một chuỗi các **Actionability Checks**:
  1. **Attached:** Element đã được gắn vào DOM cây chưa?
  2. **Visible:** Element có hiển thị trên màn hình không (không có `display: none`, `visibility: hidden`, kích thước > 0)?
  3. **Stable:** Element có đang bị chuyển động hoặc chạy hiệu ứng CSS animation không?
  4. **Receives Events:** Element có bị phần tử khác che khuất (che bởi modal, spinner, overlay) không?
  5. **Enabled:** Element có bị disabled (`disabled` attribute) không?
  6. **Editable:** (Đối với `fill()`) Element có bị `readonly` không?
  * Nếu chưa thỏa mãn, Playwright sẽ tự động chờ liên tục cho đến khi timeout (mặc định 30s) mà không cần lập trình viên phải viết `sleep` thủ công.

---

### Câu 8: Web-First Assertions là gì? Vì sao không nên dùng assertions của Jest/Chai (`expect(await locator.isVisible()).toBe(true)`)?
* **Trả lời:**
  * **Sai lầm phổ biến:**
    ```typescript
    // ❌ NON-RETRYING ASSERTION:
    const isVisible = await page.locator('.modal').isVisible();
    expect(isVisible).toBe(true);
    ```
    * `isVisible()` chỉ kiểm tra DOM ngay tại thời điểm gọi hàm (trả về `false` ngay nếu modal đang animate mờ dần mở ra). Assertion sẽ fail ngay lập tức!
  * **Chuẩn mực Web-First Assertions của Playwright:**
    ```typescript
    // ✅ RETRYING ASSERTION:
    await expect(page.locator('.modal')).toBeVisible({ timeout: 5000 });
    ```
    * Playwright sẽ liên tục kiểm tra lại (polling retry) cho đến khi element thực sự hiển thị hoặc hết timeout.

---

### Câu 9: Soft Assertions (`expect.soft`) là gì? Khi nào nên sử dụng?
* **Trả lời:**
  * Mặc định, khi một `expect()` bị fail, test execution sẽ **dừng lại ngay lập tức** tại dòng đó.
  * **`expect.soft()`:** Khi assertion fail, Playwright sẽ **ghi nhận lỗi nhưng KHÔNG dừng test**, tiếp tục chạy các bước tiếp theo. Khi test kết thúc, nếu có bất kỳ soft assertion nào fail thì test vẫn được đánh dấu FAILED.
  * **Khi nào dùng:** Rất hữu ích khi verify nhiều thông tin độc lập trên cùng một trang (ví dụ: Kiểm tra thông tin hồ sơ học viên gồm: Họ tên, Email, SĐT, Khóa học. Nếu SĐT sai, ta vẫn muốn kiểm tra xem Email và Khóa học có đúng hay không để tổng hợp báo cáo 1 lần).

---

## PHẦN 4: XỬ LÝ CÁC TÌNH HUỐNG UI PHỨC TẠP

### Câu 10: Xử lý JavaScript Alert, Confirm, Prompt và SweetAlert2 thế nào?
* **Trả lời:**
  * **Với Browser Native Dialog (`alert`, `confirm`):** Playwright mặc định tự động dismiss dialog để test không bị treo. Muốn chấp nhận hoặc tương tác:
    ```typescript
    page.on('dialog', async dialog => {
      console.log('Dialog text:', dialog.message());
      await dialog.accept(); // hoặc dialog.dismiss()
    });
    ```
  * **Với Custom HTML Dialog (SweetAlert2, Bootstrap Modal):** Đây là các phần tử HTML thông thường nằm trong DOM, không dùng `page.on('dialog')` mà định nghĩa locator:
    ```typescript
    readonly sweetAlertConfirm = page.locator('.swal2-confirm, button:has-text("Đồng ý")');
    await expect(sweetAlertConfirm).toBeVisible();
    await sweetAlertConfirm.click();
    ```

---

### Câu 11: Làm sao để kiểm tra tải file lên (Upload file) và tải file về (Download file)?
* **Trả lời:**
  * **Upload file:** Dùng method `setInputFiles()` (hỗ trợ cả input ẩn):
    ```typescript
    // 1 file
    await page.locator('input[type="file"]').setInputFiles('test-data/ui/avatar.png');
    // Xóa file đã chọn
    await page.locator('input[type="file"]').setInputFiles([]);
    ```
  * **Download file:** Lắng nghe sự kiện `page.waitForEvent('download')`:
    ```typescript
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Xuất Excel' }).click()
    ]);
    const filePath = await download.path();
    await download.saveAs('./downloads/report.xlsx');
    ```

---

### Câu 12: Làm thế nào để tương tác với iFrame và Cửa sổ/Tab mới (Multiple Pages)?
* **Trả lời:**
  * **iFrame:** Dùng `page.frameLocator()`:
    ```typescript
    const iframe = page.frameLocator('#payment-iframe');
    await iframe.getByPlaceholder('Số thẻ').fill('4111222233334444');
    ```
  * **Tab mới (Popup):** Dùng `page.waitForEvent('popup')`:
    ```typescript
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.getByRole('link', { name: 'Chính sách bảo mật' }).click() // Mở tab mới
    ]);
    await newPage.waitForLoadState();
    await expect(newPage).toHaveTitle(/Chính sách/);
    ```

---

### Câu 13: Network Interception & API Mocking trong Playwright hoạt động ra sao?
* **Trả lời:**
  * Playwright cho phép chặn và sửa đổi HTTP Requests qua `page.route()`:
  * **Trường hợp 1: Mocking API trả về dữ liệu giả lập (để test UI khi backend chưa xong hoặc test case lỗi 500):**
    ```typescript
    await page.route('**/api/QuanLyKhoaHoc/LayDanhSachKhoaHoc', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ maKhoaHoc: 'MOCK_01', tenKhoaHoc: 'Khóa học giả lập' }])
      });
    });
    ```
  * **Trường hợp 2: Chặn tải hình ảnh hoặc font để tăng tốc độ chạy test:**
    ```typescript
    await page.route('**/*.{png,jpg,jpeg,svg,woff2}', route => route.abort());
    ```

---

## PHẦN 5: PAGE OBJECT MODEL (POM) & CUSTOM FIXTURES

### Câu 14: Tại sao trong Page Object KHÔNG ĐƯỢC CHỨA assertions (`expect`)?
* **Trả lời:**
  * **Vi phạm nguyên tắc Single Responsibility (Đơn trách nhiệm):**
    * Nhiệm vụ của **Page Object** là biểu diễn cấu trúc trang và hành vi người dùng (Service Layer / Representation).
    * Nhiệm vụ của **Test Script** là kiểm tra nghiệp vụ và thẩm định kết quả (Validation Layer).
  * **Giảm khả năng tái sử dụng:** Nếu viết cứng `expect(page).toHaveURL('/dashboard')` bên trong hàm `login()`, ta sẽ không thể tái sử dụng hàm `login()` đó cho các kịch bản kiểm thử tiêu cực (Negative tests: Đăng nhập sai pass, đăng nhập tài khoản khóa).

---

### Câu 15: Fixture Dependency Injection trong Playwright Test hoạt động thế nào? Dự án của em áp dụng ra sao?
* **Trả lời:**
  * Trong Playwright, Fixture là cơ chế cung cấp môi trường độc lập cho từng bài test.
  * Thay vì khởi tạo thủ công ở từng file test:
    ```typescript
    // ❌ Cách cũ: Lặp code, khó quản lý lifecycle
    const loginPage = new LoginPage(page);
    ```
  * Em tạo một custom fixture kế thừa `test.extend()` tại `fixture/page-fixture.ts`:
    ```typescript
    type MyFixtures = {
      loginPage: LoginPage;
      cartPage: CartPage;
      profilePage: ProfilePage;
    };

    export const test = base.extend<MyFixtures>({
      loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
      },
      cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
      }
    });
    ```
  * **Lợi ích:** Trong file test, chỉ cần truyền thẳng `{ loginPage, cartPage }` vào tham số của `test()`. Playwright tự động quản lý khởi tạo và giải phóng tài nguyên.

---

## PHẦN 6: KỸ NĂNG DEBUG & QUẢN TRỊ FLAKY TEST

### Câu 16: Flaky Test là gì? Nguyên nhân chính và giải pháp khắc phục trong Playwright?
* **Trả lời:**
  * **Flaky Test:** Là test case chạy lúc PASS lúc FAIL mà không có bất kỳ thay đổi nào trong mã nguồn.
  * **3 nguyên nhân phổ biến và giải pháp:**
    1. **Chưa ổn định trạng thái mạng / Animation:**
       * *Khắc phục:* Dùng Web-First Assertions (`await expect(locator).toBeVisible()`), tránh hard sleep. Dùng `waitForLoadState('domcontentloaded')`.
    2. **Xung đột dữ liệu kiểm thử (Shared State / Test Data conflict):**
       * *Khắc phục:* Sinh test data độc lập cho từng test (UUID + timestamp qua `generateUsername()`), không dùng chung tài khoản khi chạy song song.
    3. **Phụ thuộc thứ tự thực thi (Test Interdependence):**
       * *Khắc phục:* Mỗi test phải hoàn toàn độc lập, tự khởi tạo precondition qua API service trước khi thực hiện UI test.

---

### Câu 17: Làm sao em debug khi một test case bị FAIL trên CI mà trên máy local lại PASS?
* **Trả lời:**
  * **Bật Playwright Trace Viewer:** Trong `playwright.config.ts`, cấu hình `trace: 'on-first-retry'` (hoặc `retain-on-failure`). Khi test fail, tải file `trace.zip` từ CI Artifacts về và mở bằng `npx playwright show-trace trace.zip`.
    * Trace Viewer cho phép tua lại từng mili-giây hành động, xem ảnh chụp màn hình DOM trước/sau mỗi click, log mạng, và log console.
  * **Kiểm tra độ phân giải màn hình (Viewport):** Mặc định CI chạy headless với kích thước nhỏ có thể làm ẩn menu hoặc vỡ layout. Trong dự án, em cố định `viewport: { width: 1920, height: 1080 }` trên cả local và CI.
  * **Kiểm tra Biến môi trường (Secrets / Envs):** Xác nhận các secrets trên GitHub Actions (`UI_BASE_URL`, `TOKEN_CYBERSOFT`) đã được cấu hình trùng khớp.

---

## PHẦN 7: ỨNG DỤNG AI TRONG AUTOMATION (ĐIỂM CỘNG VƯỢT TRỘI)

### Câu 18: Sự khác biệt giữa việc "hỏi ChatGPT viết code test" và mô hình "Agentic AI Automation" trong dự án của em là gì?
* **Trả lời:**
  * **Dùng ChatGPT thông thường:** Developer copy HTML/mô tả và paste vào chat, ChatGPT trả về code thường bị hallucination (đoán selector không có thật, sinh ra code không theo chuẩn POM của dự án, phải copy paste thủ công và sửa lại nhiều lần).
  * **Agentic AI Automation trong dự án của em:**
    * Hoạt động theo quy trình **Workflows & Quality Gates** chuẩn hóa.
    * Agent có **Browser Tools (Playwright MCP)** để tự mở trình duyệt thật, tự inspect cấu trúc DOM thực tế của ứng dụng trước khi viết code (Tuyệt đối không đoán selector).
    * Code sinh ra bắt buộc tuân thủ bộ **Rules** của dự án: theo đúng POM, lưu vào đúng folder module, gắn Jira tags, sử dụng helper sinh data có sẵn.

---

### Câu 19: Làm sao hệ thống phân biệt được "Lỗi Script Test" và "Bug Ứng Dụng Thực Tế"?
* **Trả lời:**
  * Em thiết lập cơ chế **Failure Classification**:
    * **Lỗi Script:** Do locator bị lệch, timeout mạng $\rightarrow$ Agent kích hoạt **Self-Healing** (tự inspect lại DOM, cập nhật selector mới bền vững) và chạy lại cho đến khi PASS.
    * **Bug Ứng Dụng (Real Bug):** Code test đúng theo User Story/Acceptance Criteria nhưng hệ thống hoạt động sai (ví dụ: màn hình không có nút đổi avatar, click hủy đăng ký không hiện SweetAlert confirm) $\rightarrow$ **CẤM sửa code test để ép pass**.
    * Khi gặp Real Bug: Agent tự động chụp ảnh màn hình bằng chứng, gọi Jira REST API tạo một issue loại `Bug` (liên kết `blocks` với Story), bắn thông báo Telegram kèm ảnh lỗi, và gắn cờ **`test.fixme()`** cho test case đó.

---

### Câu 20: Cơ chế `test.fixme()` bảo vệ CI/CD Pipeline (CI Safety) như thế nào?
* **Trả lời:**
  * Trong thực tế, khi phát hiện Bug, nếu để test FAIL thì build CI/CD sẽ đỏ, làm nghẽn toàn bộ luồng release của team.
  * Khi gắn `test.fixme()`: Playwright sẽ tự động **Skip** test case này khi chạy CI $\rightarrow$ **GitHub Actions luôn PASS XANH**, đồng thời mã nguồn test vẫn được lưu giữ trên Git mà không bị thất lạc.
  * Khi Dev báo đã sửa xong Bug trên Jira, Tester chỉ cần kích hoạt workflow `/e2e_retest_bug`: Agent tự động gỡ `test.fixme()`, chạy lại trên browser thật, nếu PASS thì tự động đóng Bug trên Jira.

---

## PHẦN 8: CÂU CHUYỆN TÌNH HUỐNG STAR THỰC TẾ ĐẮT GIÁ

> **Interviewer:** *"Em hãy kể về một sự cố kỹ thuật khó khăn nhất trong dự án và cách em giải quyết nó?"*

**💡 Kể chuyện theo mô hình STAR chuẩn mực:**

* **Situation (Bối cảnh):**
  > *"Trong một đợt em refactor lại toàn bộ test suite từ cấu trúc phẳng sang cấu trúc module thư mục (`auth`, `course`, `cart`, `profile`) và dọn dẹp mã nguồn. Trước khi bàn giao, em đã cẩn thận chạy lệnh `tsc --noEmit` (kiểm tra kiểu TypeScript) và `playwright test --list`. Cả 2 lệnh đều trả về mã thành công (Exit Code 0). Tuy nhiên, ngay sau khi mã nguồn được đẩy lên GitHub, pipeline GitHub Actions lại thông báo FAILED đỏ lòm."*

* **Task (Nhiệm vụ):**
  > *"Em cần tìm ra chính xác nguyên nhân gốc rễ (Root Cause) vì sao kiểm tra cú pháp thì pass mà khi chạy CI lại fail, sửa toàn bộ các test bị gãy, và quan trọng nhất là: **thiết kế một giải pháp chặn đứng vĩnh viễn việc code lỗi bị push lên Git**."*

* **Action (Hành động):**
  > *"Em đã truy vết qua Allure Report trên GitHub Pages và phát hiện ra 3 vấn đề:*
  > 1. *Form Đăng ký sử dụng HTML5 Form Validation native popup cho email sai định dạng và class `.errorMessage` của CyberSoft, khác với selector tĩnh ban đầu.*
  > 2. *Tính năng Đổi Avatar (SCRUM-19) thực tế chưa có nút upload trên giao diện CyberSoft nhưng ở commit cũ chưa được gắn cờ `test.fixme()`.*
  > 3. *Và lỗ hổng lớn nhất: Script giao hàng tự động `git_push_delivery.js` lúc đó chỉ thực hiện `git commit` và `git push` dựa trên niềm tin mà không hề có bước chạy kiểm thử thật sự trước khi push.*
  > 
  > *Sau đó, em đã thực hiện:*
  > - *Sửa lại selector `.errorMessage` và kiểm tra `checkValidity()` cho form Đăng ký (5 test cases PASS 100%).*
  > - *Gắn cờ `test.fixme()` chuẩn mực cho tính năng Avatar chưa triển khai.*
  > - *Tích hợp thẳng chốt chặn **Pre-Push Quality Gate** vào script `git_push_delivery.js`: Trước khi commit và push, script bắt buộc chạy `npx playwright test`. Nếu có bất kỳ test nào fail thì lập tức **TỪ CHỐI PUSH CODE**, ném ngoại lệ dừng lại và bắn cảnh báo về Telegram."*

* **Result (Kết quả):**
  > *"Sau khi triển khai Pre-Push Quality Gate, lần chạy kiểm thử tiếp theo đã đạt **19 Passed, 19 Skipped an toàn, 0 Failed**. Lần kích hoạt GitHub Actions tiếp theo (Run #37620114166) đã **PASS XANH 100%**. Quy trình bàn giao mã nguồn của dự án từ đó trở đi được bảo vệ tuyệt đối, không còn khả năng code lỗi bị lọt lên nhánh `main`."*

---

> 🎯 **Lời khuyên trước buổi phỏng vấn:**  
> Hãy mở sẵn đường link GitHub Repository và **Allure Report GitHub Pages** (`https://Khoi67.github.io/ai-automation-test/`) trên trình duyệt máy tính của bạn. Việc trình chiếu báo cáo thực tế kèm sơ đồ luồng sẽ chứng minh 100% năng lực thật của bạn!
