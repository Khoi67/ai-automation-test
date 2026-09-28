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

### Bước 2: Chuyển Jira sang In Review
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 2 --title "Chuyển Jira sang In Review" --detail "Cập nhật trạng thái ticket trên Jira sang In Review"
   ```
1. Cập nhật trạng thái ticket:
   ```bash
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

### Hoặc Thực Thi Trọn Gói Qua Script
Bạn có thể chạy toàn bộ 3 bước trên tự động bằng 1 lệnh duy nhất:
```bash
node scripts/integrations/git_push_delivery.js --ticket <JIRA_KEY>
```
Script sẽ tự động chạy từng bước, gửi thông báo step về Telegram và hiển thị thông báo hoàn tất bàn giao.
