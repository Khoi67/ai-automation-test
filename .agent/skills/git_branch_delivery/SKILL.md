---
name: Git Branch Delivery
description: Skill quản lý quy trình phân nhánh (Branching Strategy) và bàn giao mã nguồn tự động qua Feature Branch và Pull Request thay vì push trực tiếp vào main.
---

# Git Branch Delivery Agent

**Mục tiêu:** Đảm bảo toàn bộ mã nguồn Automation Tests được kiểm soát chặt chẽ theo mô hình Git Flow / GitHub Flow chuẩn Enterprise. **Tuyệt đối không push trực tiếp vào nhánh `main`**.

---

## 🎯 1. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1. **Nhánh `main` là Protected Branch:**
   - Nhánh `main` chỉ nhận code thông qua Pull Request (PR) sau khi đã được Review và CI/CD kiểm thử thành công.
   - Không được phép chạy `git push origin main` từ môi trường local.
2. **Feature Branching Strategy:**
   - Mỗi tác vụ/ticket kiểm thử phải được triển khai trên một nhánh độc lập.
   - Quy ước đặt tên nhánh (Naming Convention):
     - `feat/<JIRA_KEY>` hoặc `feat/<JIRA_KEY>-<short-description>` (VD: `feat/SCRUM-17-view-courses`)
     - `fix/<JIRA_KEY>` (khi sửa lỗi automation test hoặc heal locator)
     - `test/<JIRA_KEY>` (khi bổ sung test suite mới)
3. **Pre-Push Quality Gate:**
   - 100% test case phải PASS (hoặc các test app bug đã được gắn cờ `test.fixme()`) trước khi tạo nhánh và push.

---

## 🔄 2. QUY TRÌNH BÀN GIAO THEO NHÁNH (5 BƯỚC CHUẨN)

### Bước 1: Kiểm Tra Cổng Chất Lượng Cục Bộ (Quality Gate)
Trước khi tạo nhánh hoặc commit:
```bash
npm run typecheck
npx playwright test
```
*Nếu có lỗi typing hoặc test fail: DỪNG LẠI và sửa lỗi ngay.*

---

### Bước 2: Tạo và Chuyển Sang Feature Branch
Kiểm tra nhánh hiện tại:
```bash
git branch --show-current
```
Nếu đang ở `main` hoặc nhánh khác:
```bash
# Tạo nhánh mới và chuyển sang nhánh đó
git checkout -b feat/<JIRA_KEY>
```

---

### Bước 3: Conventional Commit
Thực hiện staging và commit với message chuẩn ngữ nghĩa:
```bash
git status
git add .
git commit -m "feat(automation): add test suite and POM for <JIRA_KEY>"
```

---

### Bước 4: Đẩy Nhánh Lên Remote (Push with Upstream)
Đẩy nhánh tính năng lên GitHub:
```bash
git push -u origin feat/<JIRA_KEY>
```

---

### Bước 5: Sinh Liên Kết Pull Request & Báo Cáo
Tự động trích xuất GitHub Remote URL để tạo link mở Pull Request:
```
https://github.com/<OWNER>/<REPO>/compare/main...feat/<JIRA_KEY>?expand=1
```
* Gửi thông báo kèm link PR về nhóm Telegram của dự án.
* Chuyển trạng thái Jira sang `In Review` (nếu không có Bug) hoặc giữ `In Progress` (nếu có Bug fixme).

---

### Bước 6: Tự Động Merge vào Main khi CI PASS & Xóa Nhánh (Auto-Merge & Cleanup)
1. **GitHub Actions Tự Động Kích Hoạt:**
   - Ngay khi push nhánh `feat/<JIRA_KEY>`, workflow Cloud sẽ tự động kích hoạt job `test`.
2. **Cơ chế Auto-Merge Chặn Lỗi (Quality Gate Protection):**
   - **Nếu CI PASS 100%:** Job `auto-merge` trong `.github/workflows/playwright.yml` sẽ **tự động merge nhánh feature vào `main`**.
   - **Nếu CI FAILED:** Job `auto-merge` sẽ bị **SKIP / CHẶN HOÀN TOÀN**, nhánh `main` được bảo vệ nguyên vẹn 100%, đồng thời bot Telegram gửi thông báo thất bại ngay lập tức để QA/Dev xử lý.
3. **Tự Động Xóa Nhánh Trên Remote (Remote Housekeeping):**
   - Ngay sau khi merge thành công vào `main`, GitHub Actions tự động thực hiện xóa nhánh `feat/<JIRA_KEY>` trên GitHub (`git push origin --delete feat/<JIRA_KEY>`) để tránh ứ đọng các nhánh rác đã hoàn thành trên server.
4. **Tự Động Đồng Bộ & Xóa Nhánh Tại Máy Cục Bộ (Local Branch Cleanup):**
   - Sau khi CI/CD đã tự động merge vào `main` và xóa nhánh trên GitHub remote, máy local cần được giải phóng và đồng bộ về trạng thái sạch sẽ:
     ```bash
     # 1. Chuyển về nhánh chính
     git checkout main

     # 2. Kéo toàn bộ code vừa được CI Auto-Merge về máy
     git pull origin main

     # 3. Xóa nhánh feature tại local
     git branch -D feat/<JIRA_KEY>

     # 4. Đồng bộ xóa các con trỏ tracking đã bị xóa trên GitHub
     git fetch --prune origin
     ```
   - *Hoặc dùng lệnh script tự động:* `npm run clean:branch`
   - *Kết quả:* Repository ở cả Remote lẫn Local luôn ở trạng thái sạch sẽ tuyệt đối, không tồn đọng nhánh rác, sẵn sàng cho ticket tiếp theo!

---

## 🛡️ 3. ANTI-PATTERNS (CÁC ĐIỀU CẤM)

| ❌ Điều cấm | ✅ Hành động đúng |
| :--- | :--- |
| `git push origin main` | `git push -u origin feat/<JIRA_KEY>` |
| Push khi test local còn FAILED | Chạy `npx playwright test` đạt 100% pass/fixme trước khi push |
| Đặt tên nhánh tùy tiện (`test1`, `my-branch`) | Tuân thủ convention: `feat/<JIRA_KEY>` |
| Dùng `git pull` hoặc rebase gây ghi đè code | Giữ nguyên trạng thái local theo quy định `GEMINI.md` |
