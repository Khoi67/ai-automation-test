import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Profile Page — handles User Profile information and Avatar management.
 * Pure POM: locators and actions only, no assertions.
 */
export class ProfilePage extends BasePage {
  // --- Locators ---
  readonly avatarContainer: Locator;
  readonly avatarImg: Locator;
  readonly fileInput: Locator;
  readonly btnUploadTrigger: Locator;
  readonly btnUpdateProfile: Locator;
  readonly alertSuccess: Locator;
  readonly alertError: Locator;
  readonly headerAvatar: Locator;

  constructor(page: Page) {
    super(page);
    // TODO: Request dev team to add data-testid="profile-avatar-container"
    this.avatarContainer = page.locator('.avatar, .profile-avatar, .img-avatar').first();
    // TODO: Request dev team to add data-testid="profile-avatar-img"
    this.avatarImg = page.locator('.avatar img, .profile-avatar img, img[alt*="avatar"]').first();
    // TODO: Request dev team to add data-testid="profile-avatar-upload"
    this.fileInput = page.locator('input[type="file"]');
    // TODO: Request dev team to add data-testid="btn-upload-avatar"
    this.btnUploadTrigger = page.locator('button, [role="button"], label').filter({ hasText: /đổi ảnh|tải ảnh|upload|avatar/i }).first();
    // TODO: Request dev team to add data-testid="btn-update-profile"
    this.btnUpdateProfile = page.getByRole('button', { name: /cập nhật/i });
    // TODO: Request dev team to add data-testid="alert-success"
    this.alertSuccess = page.locator('.swal2-success, .alert-success, .toast-success');
    // TODO: Request dev team to add data-testid="alert-error"
    this.alertError = page.locator('.swal2-error, .alert-danger, .toast-error');
    // TODO: Request dev team to add data-testid="header-avatar"
    this.headerAvatar = page.locator('header img[alt*="avatar"], .header img, header .avatar').first();
  }

  /** Navigate to Profile Page */
  async goToProfilePage(): Promise<void> {
    await test.step('Navigate to Profile Page (/thongtincanhan)', async () => {
      await this.navigate('/thongtincanhan');
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /** Upload avatar file */
  async uploadAvatar(filePath: string): Promise<void> {
    await test.step(`Upload avatar file: ${filePath}`, async () => {
      // If file input exists, set input directly
      if (await this.fileInput.count() > 0) {
        await this.fileInput.setInputFiles(filePath);
      } else {
        // Try clicking trigger button to reveal input
        await this.btnUploadTrigger.click({ timeout: 5000 });
        await this.fileInput.setInputFiles(filePath);
      }
    });
  }

  /** Click update profile button */
  async clickUpdate(): Promise<void> {
    await test.step('Click Update Profile button', async () => {
      await this.btnUpdateProfile.click();
    });
  }
}
