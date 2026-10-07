import { test, expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../../../page-object/login-page.js';
import { ProfilePage } from '../../../page-object/profile-page.js';

/**
 * Test Suite: SCRUM-19 - [Profile] Đổi ảnh đại diện học viên (Upload Profile Avatar)
 *
 * NOTE: Tính năng đổi ảnh đại diện chưa được triển khai trên Web UI của CyberSoft
 * (chỉ có nút "Hồ sơ cá nhân" và "CẬP NHẬT", không có nút/input tải lên avatar).
 * Sử dụng test.fixme() để bảo vệ CI/CD không bị fail theo quy chuẩn CI Safety.
 */
test.describe('SCRUM-19: [Profile] Đổi ảnh đại diện học viên', { tag: ['@SCRUM-19', '@profile', '@avatar'] }, () => {
  const username = process.env.TEST_USERNAME || 'auto_testuser_20260922160653_131';
  const password = process.env.TEST_PASSWORD || 'Password@123';

  const VALID_AVATAR = path.resolve(__dirname, '../../../test-data/ui/avatar.png');
  const LARGE_AVATAR = path.resolve(__dirname, '../../../test-data/ui/large_avatar.png');
  const INVALID_FILE = path.resolve(__dirname, '../../../test-data/ui/document.pdf');

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);

    await loginPage.goToLoginPage();
    await loginPage.login(username, password);
    await profilePage.goToProfilePage();
    await profilePage.openProfileModal();
  });

  // Đánh dấu fixme do Bug/Chưa triển khai trên UI: Giao diện chưa có nút tải lên avatar
  test.fixme('TC01: Cập nhật ảnh đại diện thành công với file hợp lệ (Happy Path)', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.uploadAvatar(VALID_AVATAR);
    await profilePage.saveProfile();

    await expect(page.locator('.swal2-success, .alert-success, .toast-success, text="thành công"').first()).toBeVisible({
      timeout: 10000,
    });
  });

  // Đánh dấu fixme do Bug/Chưa triển khai trên UI: Giao diện chưa có nút tải lên avatar
  test.fixme('TC02: Hệ thống từ chối tải lên file sai định dạng (PDF)', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.uploadAvatar(INVALID_FILE);
    await profilePage.saveProfile();

    await expect(profilePage.getErrorMessageLocator()).toBeVisible({
      timeout: 5000,
    });
  });

  // Đánh dấu fixme do Bug/Chưa triển khai trên UI: Giao diện chưa có nút tải lên avatar
  test.fixme('TC03: Hệ thống từ chối file ảnh vượt quá dung lượng cho phép (>2MB)', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.uploadAvatar(LARGE_AVATAR);
    await profilePage.saveProfile();

    await expect(profilePage.getErrorMessageLocator()).toBeVisible({
      timeout: 5000,
    });
  });

  // Đánh dấu fixme do Bug/Chưa triển khai trên UI: Giao diện chưa có nút tải lên avatar
  test.fixme('TC04: Hủy thao tác cập nhật ảnh và đóng modal', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.uploadAvatar(VALID_AVATAR);
    await profilePage.closeProfileModal();

    await expect(profilePage.profileModal.getLocator()).toBeHidden();
  });
});
