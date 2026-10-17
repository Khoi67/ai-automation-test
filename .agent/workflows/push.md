---
description: Quy trình tự động hóa Git Delivery theo Feature Branching — kiểm thử cục bộ, tạo feature branch, commit & push nhánh, sinh Pull Request, chuyển trạng thái Jira và kích hoạt CI/CD.
rules:
  - .agent/rules/automation_rules.md
---

# Workflow: Git Branch Delivery & Jira Transition (/push)

> **Mục tiêu:** Thực hiện tự động hóa quy trình bàn giao mã nguồn an toàn theo chuẩn Enterprise Git Flow:
> 1. **Kiểm thử Pre-Push Quality Gate** (100% Pass / Fixme).
> 2. **Tạo và chuyển sang Feature Branch** (`feat/<JIRA_KEY>`) — **CẤM push trực tiếp vào main**.
> 3. **Git Commit & Push feature branch lên GitHub**.
> 4. **Sinh liên kết Pull Request (PR)** để Reviewer phê duyệt trước khi merge vào main.
> 5. **Cập nhật trạng thái Jira & Kích hoạt CI/CD**.

---

## Các Bước Thực Hiện Chi Tiết

### Bước 0: Pre-Push Quality Gate (Chốt Chặn Kiểm Thử Bắt Buộc)
> **MANDATORY:** Trước khi tạo nhánh, commit hoặc push bất kỳ dòng code nào lên Git, hệ thống **BẮT BUỘC** phải chạy kiểm thử toàn bộ test suite cục bộ:
> ```bash
> npm run typecheck
> npx playwright test
> ```
> - **Nếu có bất kỳ Test Case nào FAILED hoặc có lỗi TypeScript:** **DỪNG NGAY LẬP TỨC!** Tuyệt đối không được phép tạo branch hay push code lên GitHub.
> - **Chỉ khi PASS 100% (hoặc các test case lỗi app đã được gắn cờ `test.fixme()`):** Mới được phép tiếp tục sang Bước 1.

---

### Bước 1: Tạo Feature Branch & Chuyển Nhánh
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 1 --title "Tạo Feature Branch" --detail "Tạo nhánh mới feat/<JIRA_KEY> từ main và chuyển sang nhánh làm việc"
   ```
1. Tạo và checkout sang feature branch mới:
   ```bash
   # Quy ước đặt tên: feat/<JIRA_KEY>
   git checkout -b feat/<JIRA_KEY>
   ```

---

### Bước 2: Git Commit & Push Feature Branch
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 2 --title "Commit & Push Feature Branch" --detail "Đẩy mã nguồn kiểm thử lên nhánh feat/<JIRA_KEY> và sinh Pull Request link"
   ```
1. Stage, commit và push nhánh tính năng:
   ```bash
   git add .
   git commit -m "feat(automation): add test suite and POM for <JIRA_KEY>"
   git push -u origin feat/<JIRA_KEY>
   ```
2. Sinh liên kết mở Pull Request:
   ```
   https://github.com/Khoi67/ai-automation-test/compare/main...feat/<JIRA_KEY>?expand=1
   ```

---

### Bước 3: Cập Nhật Trạng Thái Jira (In Progress vs In Review)
0. **Quy tắc chuyển trạng thái Jira khi Push (MANDATORY):**
   - **Nếu Ticket CÓ BUG** (trong test spec có cờ `test.fixme()` hoặc có linked bugs chưa đóng): **BẮT BUỘC giữ trạng thái `In Progress`** (không chuyển sang `In Review` vì còn Bug đang chờ Dev sửa).
   - **Chỉ khi Ticket SẠCH BUG** (toàn bộ test PASS 100%, không còn cờ `test.fixme()`): **Mới chuyển sang `In Review`**.
1. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 3 --title "Cập nhật trạng thái Jira" --detail "<Giữ In Progress do còn Bug / Chuyển In Review do sạch Bug>"
   ```
2. Cập nhật trạng thái ticket:
   ```bash
   # Nếu có Bug:
   node scripts/integrations/jira/jira_transition.js --issue <JIRA_KEY> --status "In Progress"
   # Nếu không có Bug:
   node scripts/integrations/jira/jira_transition.js --issue <JIRA_KEY> --status "In Review"
   ```

---

### Bước 4: Kích Hoạt & Theo Dõi CI/CD Pipeline
0. Gửi thông báo:
   ```bash
   node scripts/integrations/notify_step.js --ticket <JIRA_KEY> --step 4 --title "Kích Hoạt CI/CD Pipeline" --detail "GitHub Actions đang tự động chạy kiểm thử trên Cloud cho nhánh feat/<JIRA_KEY>"
   ```
1. Theo dõi kết quả build trên GitHub Actions:
   ```bash
   node scripts/integrations/check_ci.js --ticket <JIRA_KEY> --wait true
   ```

---

### Bước 5: Tự Động Merge vào Main & Tự Động Xóa Nhánh khi CI PASS
* **Nếu CI PASS 100%:** GitHub Actions sẽ kích hoạt bước `auto-merge`:
  1. Tự động merge nhánh `feat/<JIRA_KEY>` vào nhánh `main`.
  2. Tự động **xóa luôn nhánh `feat/<JIRA_KEY>` trên GitHub remote** để giữ kho mã nguồn gọn gàng.
  3. Cập nhật Allure Report trên GitHub Pages.
* **Nếu CI FAILED:** Bước `auto-merge` tự động bị chặn lại để bảo vệ nhánh `main` an toàn tuyệt đối, nhánh feature được giữ nguyên để điều tra lỗi. Bot Telegram sẽ gửi cảnh báo kèm log thất bại.

---

### Bước 6: Đồng Bộ & Xóa Nhánh Tại Máy Cục Bộ (Local Branch Cleanup)
Sau khi CI thông báo PASS và Auto-Merge thành công:
1. Chuyển về nhánh `main`:
   ```bash
   git checkout main
   ```
2. Kéo toàn bộ mã nguồn mới nhất vừa được merge về máy:
   ```bash
   git pull origin main
   ```
3. Xóa nhánh feature tại local:
   ```bash
   git branch -D feat/<JIRA_KEY>
   ```
4. Dọn dẹp con trỏ remote tracking đã bị xóa trên GitHub:
   ```bash
   git fetch --prune origin
   ```
*(Hoặc chạy lệnh tự động: `npm run clean:branch`)*

---

### 🚀 Thực Thi Trọn Gói Tự Động Qua Script
Bạn có thể chạy tự động toàn bộ quy trình bằng script tích hợp (đã hỗ trợ auto-branching, auto-merge và local cleanup):
```bash
# 1. Tự động kiểm tra chất lượng, tạo branch feat/<JIRA_KEY>, push và gửi PR link về Telegram
node scripts/integrations/git_push_delivery.js --ticket <JIRA_KEY>

# 2. Kiểm tra và xác thực kết quả CI trên GitHub Actions (tự động merge và dọn dẹp local khi Pass)
node scripts/integrations/check_ci.js --ticket <JIRA_KEY> --wait true
```
Script sẽ tự động chạy từng bước, bảo đảm **nhánh main chỉ được merge khi CI Pass 100%** và **máy local luôn sạch sẽ sau khi hoàn tất**.
