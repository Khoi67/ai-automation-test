---
description: Quy trình tự động hóa Git Delivery khi người dùng phê duyệt Push code — bao gồm Git Commit & Push, chuyển trạng thái Jira sang In Review, và kích hoạt CI/CD.
rules:
  - .agent/rules/automation_rules.md
---

# Workflow: Git Delivery & Jira Transition (/push)

> **Mục tiêu:** Thực hiện tự động hóa 3 bước bàn giao mã nguồn sau khi test local đạt chuẩn và được phê duyệt:
> 1. **Git Commit & Push lên main**
> 2. **Chuyển Jira sang In Review**
> 3. **Kích hoạt CI/CD (GitHub Actions)**

---

## Các Bước Thực Hiện Chi Tiết

### Bước 1: Git Commit & Push lên main
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 1 --title "Git Commit & Push lên main" --detail "Tạo commit và đẩy mã nguồn kiểm thử lên nhánh main"
   ```
1. Stage và commit toàn bộ thay đổi:
   ```bash
   git add .
   git commit -m "feat(automation): add test suite and POM for <JIRA_KEY>"
   git push origin main
   ```

---

### Bước 2: Cập Nhật Trạng Thái Jira (In Progress vs In Review)
0. **Quy tắc chuyển trạng thái Jira khi Push (MANDATORY):**
   - **Nếu Ticket CÓ BUG** (trong test spec có cờ `test.fixme()` hoặc có linked bugs chưa đóng): **BẮT BUỘC giữ trạng thái `In Progress`** (không chuyển sang `In Review` vì còn Bug đang chờ Dev sửa).
   - **Chỉ khi Ticket SẠCH BUG** (toàn bộ test PASS 100%, không còn cờ `test.fixme()`): **Mới chuyển sang `In Review`**.
1. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 2 --title "Cập nhật trạng thái Jira" --detail "<Giữ In Progress do còn Bug / Chuyển In Review do sạch Bug>"
   ```
2. Cập nhật trạng thái ticket:
   ```bash
   # Nếu có Bug:
   node scripts/integrations/jira/jira_transition.js --issue <JIRA_KEY> --status "In Progress"
   # Nếu không có Bug:
   node scripts/integrations/jira/jira_transition.js --issue <JIRA_KEY> --status "In Review"
   ```

---

### Bước 3: Kích Hoạt CI/CD Pipeline
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 3 --title "Kích Hoạt CI/CD Pipeline" --detail "GitHub Actions đang tự động chạy kiểm thử trên Cloud và cập nhật Allure Report"
   ```
1. Dọn dẹp cờ duyệt:
   - Xóa file `scratch/push_trigger.txt` (nếu có).

---

### Bước 4: Kiểm Tra CI/CD Trên GitHub Actions
0. Gửi thông báo & theo dõi trạng thái:
   ```bash
   node scripts/integrations/check_ci.js --ticket <JIRA_KEY> --wait true
   ```
1. Script sẽ tự động theo dõi workflow run trên GitHub Actions cho tới khi hoàn tất và gửi thông báo kết quả PASS/FAIL cùng link Allure Report về Telegram.

---

### Hoặc Thực Thi Trọn Gói Qua Script
Bạn có thể chạy tự động toàn bộ quy trình bằng các script tích hợp:
```bash
# 1. Bàn giao Git, chuyển Jira và kích hoạt CI
node scripts/integrations/git_push_delivery.js --ticket <JIRA_KEY>

# 2. Kiểm tra và xác thực kết quả CI trên GitHub Actions
node scripts/integrations/check_ci.js --ticket <JIRA_KEY> --wait true
```
Script sẽ tự động chạy từng bước, gửi thông báo step về Telegram và hiển thị thông báo hoàn tất bàn giao kèm link Allure Report.
