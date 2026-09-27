import { test, expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../../page-object/login-page.js';
import { ProfilePage } from '../../page-object/profile-page.js';

/**
 * Test Suite: SCRUM-19 - [Profile] Đổi ảnh đại diện học viên (Upload Profile Avatar)
 */
test.describe('SCRUM-19: [Profile] Đổi ảnh đại diện học viên', () => {
  const username = process.env.TEST_USERNAME || 'auto_testuser_20260922160653_131';
  const password = process.env.TEST_PASSWORD || 'Password@123';

  const VALID_AVATAR = path.resolve(__dirname, '../../test-data/ui/avatar.png');
  const LARGE_AVATAR = path.resolve(__dirname, '../../test-data/ui/large_avatar.png');
  const INVALID_FILE = path.resolve(__dirname, '../../test-data/ui/document.pdf');

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goToLoginPage();
    await loginPage.login(username, password);
    // Chờ chuyển hướng sau khi đăng nhập
    await page.waitForTimeout(1000);
  });

  // Đánh dấu fixme do Bug SCRUM-20 trên Jira: Chưa có tính năng tải lên ảnh đại diện trong trang cá nhân
  test.fixme('TC_AVATAR_01: Tải lên ảnh đại diện hợp lệ thành công (Happy Path)', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goToProfilePage();

    // Verification 1: Trang cá nhân phải cung cấp tính năng/nút tải lên ảnh đại diện
    const hasUploadControl = (await profilePage.fileInput.count() > 0) || (await profilePage.btnUploadTrigger.count() > 0);
    expect(hasUploadControl, 'Trang cá nhân phải cung cấp nút hoặc input để tải lên ảnh đại diện').toBeTruthy();

    // Thực hiện tải ảnh
    await profilePage.uploadAvatar(VALID_AVATAR);
    await profilePage.clickUpdate();

    // Assertion: Thông báo thành công
    await expect(profilePage.alertSuccess, 'Phải hiển thị thông báo cập nhật ảnh thành công').toBeVisible({ timeout: 5000 });
  });

  // Đánh dấu fixme do Bug SCRUM-20 trên Jira: Chưa có tính năng tải lên ảnh đại diện trong trang cá nhân
  test.fixme('TC_AVATAR_02: Chặn tải lên file ảnh vượt quá dung lượng 2MB', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goToProfilePage();

    const hasUploadControl = (await profilePage.fileInput.count() > 0) || (await profilePage.btnUploadTrigger.count() > 0);
    expect(hasUploadControl, 'Trang cá nhân phải cung cấp nút hoặc input để tải lên ảnh đại diện').toBeTruthy();

    await profilePage.uploadAvatar(LARGE_AVATAR);
    await expect(profilePage.alertError, 'Phải hiển thị cảnh báo file ảnh vượt quá 2MB').toBeVisible({ timeout: 5000 });
  });

  // Đánh dấu fixme do Bug SCRUM-20 trên Jira: Chưa có tính năng tải lên ảnh đại diện trong trang cá nhân
  test.fixme('TC_AVATAR_03: Chặn tải lên định dạng file không phải ảnh', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goToProfilePage();

    const hasUploadControl = (await profilePage.fileInput.count() > 0) || (await profilePage.btnUploadTrigger.count() > 0);
    expect(hasUploadControl, 'Trang cá nhân phải cung cấp nút hoặc input để tải lên ảnh đại diện').toBeTruthy();

    await profilePage.uploadAvatar(INVALID_FILE);
    await expect(profilePage.alertError, 'Phải hiển thị cảnh báo định dạng file không hợp lệ').toBeVisible({ timeout: 5000 });
  });
});
