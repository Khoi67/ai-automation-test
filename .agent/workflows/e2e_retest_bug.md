---
description: Quy trình tự động thực hiện Retest lại các Bug đã được Dev báo cáo Fix xong. Bỏ đánh dấu test.fixme, chạy test local, và push Git.
rules:
  - .agent/rules/playwright_rules.md
  - .agent/rules/automation_rules.md
skills:
  - qa_automation_engineer
  - ui_debug_agent
---

# Workflow: E2E Retest Bug (Xác nhận Dev Fix Bug)

> **BẮT BUỘC TUÂN THỦ (MANDATORY RULES):**
> - **`playwright_rules.md`**: Khi Retest local, bắt buộc chạy **headed mode** trên desktop viewport **`1920x1080`** để mắt thấy tai nghe kết quả fix của Dev trên UI thật.
> - **`automation_rules.md`**: Đảm bảo code test sau khi un-skip giữ trọn vẹn POM, smart wait và assertions rõ ràng.
>
> **Mục tiêu:** Tự động hóa quá trình kiểm chứng lại (Retest) các Bug đã được Dev sửa xong. Agent sẽ gỡ cờ bỏ qua (`test.fixme`), chạy thử ở dưới local để xác thực, và nếu PASS, tự động Push code lên Git để kích hoạt luồng CI/CD xác nhận lần cuối.

---

## Các Bước Thực Hiện Chi Tiết

### Bước 1: Đọc mã Ticket từ file trigger
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 1 --title "Khởi động Retest Bug" --detail "Đọc mã ticket từ trigger và định vị file kiểm thử liên quan"
   ```
1. Mở file `scratch/trigger.txt` (nếu người dùng chạy lệnh kèm file này) để lấy mã JIRA_KEY (ví dụ: `SCRUM-19` hoặc `SCRUM-17`).

---

### Bước 2: Loại bỏ cờ SKIP (`test.fixme`)
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 2 --title "Gỡ bỏ cờ test.fixme()" --detail "Mở khóa các test case bị skip do Bug để chuẩn bị xác thực lại"
   ```
1. Dùng công cụ tìm kiếm trong mã nguồn thư mục `tests/ui/` hoặc `tests/api/` để tìm xem test case nào đang bị gắn cờ liên quan đến mã JIRA_KEY này (thường có chú thích tên Bug hoặc mã Ticket).
2. Xóa bỏ `.fixme` để đổi `test.fixme(...)` thành `test(...)`.

---

### Bước 3: Chạy Kiểm Thử Local (Retest)
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 3 --title "Thực thi kiểm thử lại (Retest)" --detail "Chạy kiểm thử trên UI thật (headed mode 1920x1080) để xác nhận fix"
   ```
1. Chạy lệnh Playwright chỉ định đích danh file kiểm thử vừa sửa hoặc chạy theo tag của ticket (bắt buộc `--headed` theo `playwright_rules.md`):
   ```bash
   npx.cmd playwright test --grep @<JIRA_KEY> --headed
   # Hoặc: npx.cmd playwright test <path/to/test-file.spec.ts> --headed
   ```
2. **Kiểm tra kết quả & Báo cáo:**
   - **Nếu PASS:** Tuyệt vời, Bug đã thực sự được Dev xử lý tận gốc! Gửi báo cáo kết quả local:
     ```bash
     node scripts/integrations/report_local_test.js \
       --ticket <JIRA_KEY> \
       --pass <PASSED_COUNT> \
       --fail 0 \
       --bugs 0 \
       --duration <SECONDS> \
       --files "<PATH_TO_TEST_FILE>" \
       --retest true
     ```
     Đi tiếp tới Bước 4.
   - **Nếu FAIL:** Dừng lại ngay! Bug vẫn còn hoặc fix chưa triệt để. Agent cần khôi phục lại `test.fixme(...)` và chạy lệnh thông báo lỗi về Telegram Bot:
     ```bash
     node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step "RETEST FAIL" --title "Kiểm thử lại thất bại ❌" --detail "Bug chưa được fix triệt để. Đã khôi phục cờ test.fixme() để bảo vệ CI."
     ```
     Đồng thời báo cáo kết quả local:
     ```bash
     node scripts/integrations/report_local_test.js \
       --ticket <JIRA_KEY> \
       --pass <PASSED_COUNT> \
       --fail 0 \
       --bugs <BUGS_COUNT> \
       --duration <SECONDS> \
       --files "<PATH_TO_TEST_FILE>" \
       --retest true
     ```

---

### Bước 4: Đẩy Mã Nguồn Lên GitHub (Git Push)
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 4 --title "Đẩy mã nguồn lên Git & Kích hoạt CI" --detail "Commit mã nguồn đã xác thực PASS và kích hoạt pipeline CI/CD"
   ```
1. Khi Test đã PASS ổn định, Agent tiến hành stage và commit các file vừa gỡ `test.fixme`.
2. Commit message chuẩn: `test: remove fixme and re-enable tests for <JIRA_KEY> bug fix`
3. Thực thi:
   ```bash
   git add .
   git commit -m "test: remove fixme and re-enable tests for <JIRA_KEY> bug fix"
   git push origin main
   ```
4. Báo cáo hoàn tất quá trình Retest cho người dùng, giải thích rằng CI/CD trên Github Actions đã được kích hoạt và Telegram Bot sẽ nhận được báo cáo PASS xanh.

