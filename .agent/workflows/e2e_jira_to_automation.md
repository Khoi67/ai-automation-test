---
description: Quy trình tự động hóa khép kín End-to-End từ Jira Issue -> Sinh Requirements -> Sinh Test Cases -> Sinh Automation Scripts (POM) -> Chạy test & Tự sửa lỗi (Self-Healing) -> Push Git -> Chạy CI -> Báo cáo Telegram.
skills:
  - jira_integration
  - requirements_analyzer
  - rbt_manual_testing
  - qa_automation_engineer
  - ui_debug_agent
  - smart_locator_agent
  - test_data_generator
---

# Workflow: E2E Jira to Automation Pipeline (Advanced with Quality Gates)

> **Mục tiêu:** Tự động hóa toàn diện quy trình kiểm thử từ lúc có yêu cầu trên Jira cho đến khi code automation được kiểm tra kỹ lưỡng, PASS trên local, được push lên Git, kích hoạt CI và gửi báo cáo về Telegram. Đảm bảo tính chính xác cao nhất thông qua các Quality Gates và cơ chế phân loại lỗi (Failure Classification).

```mermaid
flowchart TD
    A["1. Jira Issue (Key: VL-XXX)"] --> B["2. /fetch_jira_requirements"]
    B --> G1{"Requirement Gate:\nClear & Testable?"}
    G1 -- No --> R1["Reviewer Agent:\nYêu cầu làm rõ"]
    G1 -- Yes --> C["3. /generate_testcases_from_requirements"]
    
    C --> G2{"Test Case Gate:\nĐủ coverage?"}
    G2 -- No --> R2["Reviewer Agent:\nBổ sung TC"]
    G2 -- Yes --> D["4. /generate_automation_from_testcases"]
    
    D --> E["5. Execution & Failure Classification"]
    E --> F_Class{"Phân loại Lỗi"}
    
    F_Class -- "Code/Locator Lỗi" --> AutoFix["Self-Healing\n(Tự sửa code)"]
    AutoFix --> E
    
    F_Class -- "App Bug / Chứa mâu thuẫn" --> Bug["Báo cáo Bug\nKhông cố ép PASS (False Healing)"]
    
    F_Class -- "PASS x2" --> G3{"Quality Gate:\nSạch code, POM chuẩn?"}
    
    G3 -- No --> R3["Code Review Agent:\nRefactor Code"]
    R3 --> D
    
    G3 -- Yes --> F["6. Git Delivery"]
    F --> G["7. GitHub Actions CI & Pages"]
    G --> H["8. Telegram / n8n Notification"]
```

---

## Các Bước Thực Hiện Chi Tiết

### Bước 1: Lấy Requirements từ Jira (`/fetch_jira_requirements`)
0. Gửi thông báo: `node scratch/notify.js "Bắt đầu Bước 1: Kéo Requirement từ Jira cho ticket <JIRA_KEY>"`
1. Nhận `JIRA_KEY` (ví dụ: `VL-101`) từ người dùng hoặc từ Webhook n8n.
2. Thực thi script fetcher để lấy requirement format MD.
3. **Requirement Gate (Validation):**
   - Đánh giá xem Requirement đã đủ rõ ràng để viết test chưa? (Có acceptance criteria, có thiết kế không?)
   - Nếu chưa rõ: Trả kết quả báo "Requirement chưa đủ điều kiện, cần bổ sung".

---

### Bước 2: Sinh Manual Test Cases (`/generate_testcases_from_requirements`)
0. Gửi thông báo: `node scratch/notify.js "Bắt đầu Bước 2: Sinh Manual Test Cases cho ticket <JIRA_KEY>"`
1. Áp dụng kỹ thuật phân tích biên (BVA), phân vùng tương đương (EP), và Field-Level Validation theo skill `rbt_manual_testing`.
2. Tạo file test cases chuẩn tại `test-cases/<JIRA_KEY>_testcases.md`.
3. **Test Case Gate (Validation):**
   - Đã cover đủ happy path, negative path và edge cases chưa?
   - Test data có traceable không?

---

### Bước 3: Chuyển Test Cases Thành Automation Script (`/generate_automation_from_testcases`)
0. Gửi thông báo: `node scratch/notify.js "Bắt đầu Bước 3: Sinh Automation Scripts cho ticket <JIRA_KEY>"`
1. Tuân thủ tuyệt đối quy tắc kiến trúc POM của dự án:
   - **Page Objects (`page-object/*.ts`):** Chỉ chứa Scoped Semantic Locators và User Actions. Không chứa `expect()`.
   - **Test Specs (`tests/ui/*.spec.ts`):** Nhận Page Object từ fixture, thực hiện các bước và Web-First Assertions trực tiếp tại tầng Test.
2. Dùng Web-First assertions, không dùng hard-coded sleep.

---

### Bước 4: Thực Thi Kiểm Thử & Phân Loại Lỗi (Failure Classification)
0. Gửi thông báo: `node scratch/notify.js "Bắt đầu Bước 4: Chạy Test & Phân loại lỗi cho ticket <JIRA_KEY>"`
1. Chạy test suite cục bộ: `npm test`
2. **Failure Classification (CRITICAL):**
   - Thay vì mù quáng "thấy FAIL là tự sửa code test cho đến khi PASS" (gây ra False Healing), phải **phân tích root cause**:
     - **Nguyên nhân 1 (Lỗi Automation):** Do locator sai, timeout, logic test sai $\rightarrow$ **Kích hoạt Self-Healing (Tự sửa code automation)**.
     - **Nguyên nhân 2 (Lỗi Ứng dụng / Bug thực sự):** Test logic đúng nhưng app hoạt động sai so với requirement $\rightarrow$ **DỪNG LẠI, đánh dấu FAILED và tự động log BUG lên Jira**.
       - Agent tự gọi script (tự động đồng bộ Precondition, Steps, Expected chuẩn xác 100% từ Test Case): 
         ```bash
         node scripts/integrations/jira/jira_create_bug.js \
           --parent <JIRA_KEY> \
           --tc <TC_ID> \
           --summary "[<Module>] <BUG_TITLE>" \
           --actual "<ACTUAL_RESULT>" \
           --attachment "auto"
         ```
       - Tuyệt đối không sửa code test để "ép" kết quả thành PASS.
3. **Quality Gate:** Code đã clean chưa? Không còn `console.log`, không hard-code credentials, tuân thủ chặt POM.
4. **Tiêu chuẩn Definition of Done:** Test suite phải **PASS ít nhất 2 lần liên tiếp** trên local (hoặc Failed do Bug app hợp lệ).

---

### Bước 5: Đẩy Mã Nguồn Lên GitHub (Git Delivery)
0. Gửi thông báo: `node scratch/notify.js "Bắt đầu Bước 5: Đẩy Code lên Github cho ticket <JIRA_KEY>"`
1. Kiểm tra trạng thái: `git status`.
2. Stage và commit với message chuẩn Conventional Commits.
3. Push lên repository.

---

### Bước 6: Chuyển Trạng Thái Jira, CI & Báo Cáo Telegram
0. Gửi thông báo: `node scratch/notify.js "Bắt đầu Bước 6: Hoàn tất quy trình, báo cáo kết quả cho ticket <JIRA_KEY>"`
1. Chuyển trạng thái Jira sang "In Review":
   - Agent tự chạy: `node scripts/integrations/jira/jira_transition.js --issue <JIRA_KEY> --status "In Review"`
2. GitHub Actions kích hoạt workflow `Playwright Tests` và Generate Allure Report.
3. Gửi thông báo Telegram cuối cùng với kết quả tổng quan (PASS/FAIL/BUG) và link Allure Report.
