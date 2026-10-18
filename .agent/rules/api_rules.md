# Quy Tắc Dành Riêng Cho API Testing

> Áp dụng cho mọi tác vụ kiểm thử API (Playwright API Request, REST Assured, Axios).
> Mục tiêu: Xây dựng hệ thống kiểm thử API đạt chuẩn Enterprise — kiến trúc 5 tầng DRY, bảo mật token, xác thực schema chặt chẽ, tối ưu tốc độ và hỗ trợ Hybrid Testing cho UI.

---

## 1. Kiến Trúc Phân Tầng API (5-Tier DRY API Architecture)

Hệ thống kiểm thử API bắt buộc tuân thủ mô hình 5 tầng phân tách triệt để trách nhiệm:

1. **Services Layer (`services/*.ts`):**
   - Đóng gói các hàm gọi HTTP request thuần túy (`request.get()`, `request.post()`, `request.put()`, `request.delete()`).
   - Quản lý endpoints, query parameters, request body và custom headers.
   - **TUYỆT ĐỐI CẤM** đặt `expect()` assertion trong Service class. Service class chỉ thực hiện request và trả về `Promise<APIResponse>` hoặc parsed data.
   ```typescript
   export class WrapAuthServices {
     constructor(private request: APIRequestContext) {}

     async login(payload: ThongTinDangNhap): Promise<APIResponse> {
       return this.request.post('/api/QuanLyNguoiDung/DangNhap', {
         data: payload,
         headers: { 'Content-Type': 'application/json' },
       });
     }
   }
   ```

2. **API Workflows (`workflow/api/*.ts`):**
   - Đóng gói các chuỗi nghiệp vụ API liên hoàn qua nhiều endpoint (ví dụ: tạo tài khoản mới -> kích hoạt -> đăng nhập lấy token -> cấp quyền).
   - Tái sử dụng để chuẩn bị dữ liệu (Data Seeding) cho các tầng kiểm thử khác.

3. **Data Models / DTOs (`data-object/api/*.ts`):**
   - Khai báo kiểu dữ liệu TypeScript (Interfaces / Types) cho Request Payloads và Response Payloads.
   - Bảo đảm tính Type-Safety khi gửi và nhận dữ liệu.

4. **Fixtures Injection (`fixture/page-fixture.ts`):**
   - Inject tập trung các API Services và API Workflows qua Playwright Custom Test Fixture (`test.extend<{ authService: WrapAuthServices, ... }>`).
   - Cung cấp sẵn authenticated `request` context hoặc `IsolatedUserSession`.

5. **Test Specs (`tests/api/**/*.spec.ts`):**
   - Nơi duy nhất chứa các câu lệnh kiểm tra kết quả (`expect()`).
   - Tổ chức theo module tương ứng: `tests/api/auth/`, `tests/api/course/`, `tests/api/user/`.

---

## 2. Quản Lý Xác Thực & Vòng Đời Token (Auth & Token Lifecycle)

- **CẤM Hardcode Credentials / Tokens:** Tuyệt đối không lưu token hoặc password trực tiếp trong code test. Token phải được sinh động thông qua API đăng nhập hoặc trích xuất từ biến môi trường.
- **Bearer Token Injection:** Khi gọi các endpoint yêu cầu xác thực, inject Bearer token qua Headers:
  ```typescript
  const response = await request.get('/api/QuanLyNguoiDung/ThongTinTaiKhoan', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  ```
- **Cô Lập Phiên Kiểm Thử (Session Isolation):** Mỗi worker hoặc test suite chạy song song phải sở hữu tài khoản và token riêng biệt để tránh tình trạng race condition làm thay đổi state của nhau.

---

## 3. Quy Chuẩn Assertions Cho API (Assertions Standard)

Mỗi kịch bản kiểm thử API bắt buộc phải có đầy đủ 3 cấp độ assertion:

### 3.1. HTTP Status Code Assertion (Bắt buộc)
- Kiểm tra mã phản hồi HTTP chính xác theo tiêu chuẩn RESTful:
  - **200 OK / 201 Created:** Khi thao tác thành công.
  - **400 Bad Request:** Khi payload sai định dạng hoặc thiếu trường bắt buộc.
  - **401 Unauthorized:** Khi thiếu token hoặc token hết hạn.
  - **403 Forbidden:** Khi token hợp lệ nhưng tài khoản không đủ quyền hạn.
  - **404 Not Found:** Khi tài nguyên truy vấn không tồn tại.
  - **409 Conflict / 422 Unprocessable Entity:** Khi dữ liệu bị trùng lặp hoặc vi phạm ràng buộc nghiệp vụ.
```typescript
expect(response.status(), 'Mã phản hồi HTTP phải là 200 OK').toBe(200);
// Hoặc sử dụng Playwright built-in matcher:
expect(response.ok(), 'Request phải thành công (dải 200-299)').toBeTruthy();
```

### 3.2. Response Body & Data Integrity Assertion
- Kiểm tra nội dung JSON trả về:
  - Xác nhận sự tồn tại của các trường quan trọng (`id`, `accessToken`, `email`...).
  - Kiểm tra giá trị trả về khớp với dữ liệu gửi lên.
```typescript
const body = await response.json();
expect(body).toHaveProperty('accessToken');
expect(body.email).toBe(expectedEmail);
```

### 3.3. Performance & Header Assertion
- Khuyến nghị kiểm tra `Content-Type` header:
  ```typescript
  expect(response.headers()['content-type']).toContain('application/json');
  ```
- Kiểm tra thời gian phản hồi (Response Time): Đối với các API cốt lõi, thời gian phản hồi không nên vượt quá ngưỡng SLA quy định (ví dụ < 2000ms):
  ```typescript
  const startTime = Date.now();
  const response = await authService.login(credentials);
  const duration = Date.now() - startTime;
  expect(duration, 'Thời gian phản hồi API phải dưới 2000ms').toBeLessThan(2000);
  ```

---

## 4. Mô Hình Kiểm Thử Kết Hợp (Hybrid Testing: API Pre-Seeding cho UI)

Nhằm tối ưu hóa tốc độ kiểm thử UI và triệt tiêu tính flaky do form đăng ký/đăng nhập:

- **Sử Dụng API Để Setup Pre-conditions:** Trước khi chạy một kịch bản UI (ví dụ: Giỏ hàng, Đổi mật khẩu, Vào học), sử dụng API Workflow trong `test.beforeEach` để tạo sẵn dữ liệu và tài khoản:
  ```typescript
  test.beforeEach(async ({ authApiWorkflow, loginPage }) => {
    // 1. Tạo tài khoản hợp lệ siêu tốc qua API (< 100ms)
    validUser = await authApiWorkflow.ensureTestAccount();
    // 2. Đi thẳng tới trang cần test trên UI
    await loginPage.goToLoginPage();
  });
  ```
- **Bypass UI Login:** Kết hợp inject session token trực tiếp vào Browser Context (`storageState` hoặc `localStorage`) thay vì phải thực hiện điền form đăng nhập qua UI ở mỗi test case.

---

## 5. Phân Loại Lỗi Khi API Fail (Chống False Healing)

Khi một assertion của API test thất bại, Agent bắt buộc phân loại rõ ràng:

1. **Lỗi Code Test (Test Bug):**
   - Do sai URL endpoint, sai payload structure, hoặc thiếu header -> Tự động sửa code test.
2. **Lỗi Server / Ứng Dụng (Application / Backend Bug):**
   - API trả về `500 Internal Server Error`, `502 Bad Gateway`.
   - API trả về sai mã lỗi nghiệp vụ (ví dụ: gửi dữ liệu rỗng nhưng trả về 200 OK thay vì 400 Bad Request).
   - **NGHIÊM CẤM FALSE HEALING:** Tuyệt đối không đổi `expect(status).toBe(400)` thành `expect(status).toBe(200)` để ép test pass.
   - **Bảo vệ CI:** Giữ nguyên assertion chuẩn theo tài liệu Swagger/API spec, tự động log Bug và gắn cờ `test.fixme()` kèm mã ticket Bug (`[BUG-API-XXX]`).

---

## 6. Bảo Mật & An Toàn Dữ Liệu API (Security Guardrails)

- **CẤM In Token Ra Console/Logs:** Không dùng `console.log(token)` hoặc in authorization header trong test run hoặc báo cáo CI.
- **Traceable Test Data:** Mọi dữ liệu tạo mới qua API (tài khoản, khóa học, đơn hàng) phải có tiền tố `auto_api_<module>_<timestamp>` để dễ dàng dọn dẹp và truy vết.
- **Cleanup Sau Khi Test:** Tận dụng `test.afterEach` hoặc script cleanup định kỳ (`scripts/utils/cleanup_stale_test_data.js`) để xóa dữ liệu rác đã sinh ra qua API, giữ database luôn sạch sẽ.
