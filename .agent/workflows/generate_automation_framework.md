---
description: Thiết kế, scaffold và mở rộng automation framework Playwright + TypeScript cho Web và API.
skills:
  - framework_architect
---

# Workflow: Thiết Kế Automation Framework

> **BẮT BUỘC:** Nạp và đọc kỹ skill `framework_architect` tại `.agent/skills/framework_architect/SKILL.md` trước khi bắt đầu. Chỉ tham khảo `qa_automation_engineer` nếu skill này tồn tại trong repository.

Workflow này áp dụng cho framework **Playwright + TypeScript**. Workflow không thay thế cấu trúc hiện có của dự án: mọi thay đổi phải tuân thủ structure, quy ước và dependency direction trong `framework_architect`.

## Nguyên tắc thực thi

- Trả lời, tài liệu hướng dẫn và phần giải thích bằng tiếng Việt; tên file, mã nguồn và thuật ngữ kỹ thuật dùng theo convention của dự án.
- Không tự đoán các quyết định ảnh hưởng đáng kể đến scaffold. Với dự án mới, phải lấy xác nhận của user trước khi tạo file. Với dự án có sẵn, phải kiểm tra cấu trúc trước và chỉ hỏi thông tin còn thiếu.
- Chỉ dùng giá trị mặc định khi user cho phép agent tự chọn; phải nêu rõ giá trị đã chọn.
- Giữ cấu trúc root-level hiện có; không tự tạo hoặc migration sang `src/`.
- Mã framework phải typecheck/build được. Các phần phụ thuộc URL, credential, DOM hoặc API contract chưa có phải được khai báo rõ trong `.env.example`, config hoặc README, không giả vờ là test có thể chạy end-to-end.
- Không hardcode secret, token, password hoặc dữ liệu nhạy cảm. Dùng environment variables và CI secrets.
- Không dùng fixed wait; ưu tiên locator auto-wait, `expect()` và wait theo trạng thái.
- Không tạo `task.md` mặc định. Chỉ tạo checklist tiến độ khi user yêu cầu; ưu tiên `.agent/task.md` và ghi rõ có cần commit hay không.

## Stack hỗ trợ

| Platform | Stack | Runner | Báo cáo mặc định |
|---|---|---|---|
| Web / API | Playwright + TypeScript | Playwright Test | HTML Report |

Allure, CI/CD, Docker, parallel execution và các tích hợp bổ sung chỉ được thêm khi user yêu cầu rõ ràng.

## Bước 1: Thu thập yêu cầu

1. Xác định phạm vi: Web, API hoặc Web + API; đây là dự án mới hay dự án hiện có.
2. Thu thập các thông tin cần thiết:

   | Thông tin | Mục đích |
   |---|---|
   | URL/base URL và môi trường chạy | Cấu hình môi trường |
   | Luồng hoặc entity cần tự động hóa | Xác định Page Object, workflow và service |
   | Có API contract/endpoint hay không | Quyết định API layer |
   | Credential và cách cấp quyền | Thiết kế biến môi trường/fixture |
   | Browser, retry, timeout, chạy song song | Cấu hình Playwright |
   | Có cần CI/CD, Allure hoặc Docker không | Chỉ tạo integration khi được yêu cầu |

3. Với dự án mới, tóm tắt lựa chọn và chờ user xác nhận trước khi scaffold. Với dự án hiện có, tóm tắt cấu trúc đã phát hiện và kế hoạch thay đổi trước khi sửa.

## Bước 2: Thiết kế hoặc scaffold cấu trúc

1. Đọc `package.json`, `playwright.config.ts`, cấu trúc thư mục và rules hiện có trước khi thêm file.
2. Dùng template trong `framework_architect` làm định hướng, nhưng chỉ tạo các layer cần thiết:
   - `core/`: API wrapper, browser management, element utilities và base fixture.
   - `page-object/`: Page Object và component dùng chung.
   - `services/`: service API theo domain, ví dụ `wrap-<domain>-services.ts`.
   - `workflow/ui/` và `workflow/api/`: điều phối các hành trình.
   - `data-object/`, `test-data/`, `fixture/`, `tests/ui/`, `tests/api/` khi có nhu cầu.
3. Đặt tên page/service theo domain thực tế, ví dụ `<entity>-page.ts` và `wrap-<domain>-services.ts`; không dùng tên nghiệp vụ mẫu không liên quan.
4. Với dự án mới, tạo tối thiểu `package.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`, `.env.example` và `README.md`.

## Bước 3: Xây dựng nền tảng

1. Tập trung URL, timeout và cấu hình không nhạy cảm trong config; đọc secret từ environment variables.
2. Quản lý `Browser`, `BrowserContext`, `Page` và `APIRequestContext` qua Playwright config/fixtures và `core/browser/`.
3. Khai báo locator trong Page Object/component. Page Object không gọi API; service không thao tác UI; workflow thực hiện điều phối.
4. Dùng model TypeScript cho dữ liệu UI/API. Dữ liệu tạo server state phải unique, traceable và được cleanup qua `finally` hoặc fixture teardown.
5. Chỉ thêm logger, custom wait helper hoặc wrapper khi Playwright/core hiện có chưa đáp ứng; không trùng lặp khả năng built-in.

## Bước 4: Tạo kiểm thử minh họa

1. Chọn một luồng có thể kiểm chứng từ domain thực tế của dự án. Nếu chưa có URL, DOM hoặc contract, chỉ tạo skeleton typecheck được và ghi điều kiện hoàn thiện trong README.
2. Tạo Page Object `<entity>-page.ts`, workflow cần thiết và test `<entity>.spec.ts`.
3. Test chỉ mô tả scenario, chọn test data và assertion ở mức nghiệp vụ; không inline locator hoặc raw HTTP request.
4. Chỉ thêm data-driven test khi có bộ dữ liệu và scenario phù hợp.

## Bước 5: Reporting và tích hợp tùy chọn

1. Cấu hình HTML Report, screenshot/video khi failure và trace khi retry trong `playwright.config.ts`.
2. Chỉ thêm Allure khi user yêu cầu và xác nhận dependency/scripts cần thiết.
3. Chỉ tạo CI/CD khi user yêu cầu; pipeline phải dùng secrets cho dữ liệu nhạy cảm, chạy headless và upload report artifact.
4. Chỉ thêm Docker khi user yêu cầu hoặc môi trường chạy cần container hóa.

## Bước 6: Verify và bàn giao

1. Chạy các kiểm tra phù hợp:

   ```bash
   npm install
   npx playwright install
   npx playwright test --list
   npm run typecheck
   ```

2. Nếu có môi trường và dữ liệu hợp lệ, chạy test minh họa. Nếu không thể chạy do thiếu hệ thống bên ngoài, nêu rõ điều kiện còn thiếu trong README và báo cáo bàn giao.
3. Sửa mọi lỗi code, import, typecheck hoặc cấu hình do framework gây ra trước khi bàn giao.
4. Kiểm tra:
   - [ ] Cấu trúc tôn trọng project hiện có và `framework_architect`
   - [ ] Không có secret, fixed wait, locator inline hoặc raw API call trong test
   - [ ] Config và test data được quản lý đúng chỗ
   - [ ] Test độc lập, cleanup state nếu làm thay đổi server state
   - [ ] README và `.env.example` nêu rõ cách thiết lập/chạy
   - [ ] Báo cáo và CI/CD chỉ xuất hiện nếu được yêu cầu

## Tình huống đặc biệt

| Tình huống | Cách xử lý |
|---|---|
| Dự án có framework cũ | Kiểm tra code, đề xuất migration plan và chỉ refactor sau khi user chấp thuận. |
| Cần Web + API | Giữ UI/API layer tách biệt; workflow điều phối các luồng kết hợp. |
| Cần multi-browser | Cấu hình Playwright projects theo browser được yêu cầu. |
| User chưa rõ phạm vi | Đề xuất lựa chọn Playwright + TypeScript phù hợp với thông tin đã có và chờ xác nhận. |

## Output

- Các file framework cần thiết, phù hợp với cấu trúc thực tế của dự án
- Config Playwright, environment template và README
- Page Object, service, workflow, fixture và test theo phạm vi đã xác nhận
- HTML report; Allure, CI/CD hoặc Docker chỉ khi được yêu cầu
- Kết quả typecheck/verification và các điều kiện chạy còn thiếu, nếu có
