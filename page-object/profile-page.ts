import { Locator, Page, test } from '@playwright/test';
import { UIElement } from '../core/element/ui-element.js';
import { BasePage } from './base-page.js';

/**
 * Profile Page — handles User Profile information and Avatar management.
 * Pure POM: locators and actions only, no assertions.
 */
export class ProfilePage extends BasePage {
  // --- Locators ---
  readonly avatarContainer: UIElement;
  readonly avatarImg: UIElement;
  readonly fileInput: UIElement;
  readonly btnUploadTrigger: UIElement;
  readonly btnUpdateProfile: UIElement;
  readonly alertSuccess: UIElement;
  readonly alertError: UIElement;
  readonly headerAvatar: UIElement;
  
  // SCRUM-17: Enrolled Courses Locators
  readonly enrolledCourses: UIElement;
  readonly sweetAlertConfirm: UIElement;
  readonly sweetAlertCancel: UIElement;
  readonly tabKhoaHoc: UIElement;
  readonly profileModal: UIElement;

  constructor(page: Page) {
    super(page);
    // TODO: Request dev team to add data-testid="profile-avatar-container"
    this.avatarContainer = new UIElement(page.locator('.avatar, .profile-avatar, .img-avatar').first(), 'avatarContainer');
    // TODO: Request dev team to add data-testid="profile-avatar-img"
    this.avatarImg = new UIElement(page.locator('.avatar img, .profile-avatar img, img[alt*="avatar"]').first(), 'avatarImg');
    // TODO: Request dev team to add data-testid="profile-avatar-upload"
    this.fileInput = new UIElement(page.locator('input[type="file"]'), 'fileInput');
    // TODO: Request dev team to add data-testid="btn-upload-avatar"
    this.btnUploadTrigger = new UIElement(page.locator('button, [role="button"], label').filter({ hasText: /đổi ảnh|tải ảnh|upload|avatar/i }).first(), 'btnUploadTrigger');
    // TODO: Request dev team to add data-testid="btn-update-profile"
    this.btnUpdateProfile = new UIElement(page.getByRole('button', { name: /cập nhật/i }), 'btnUpdateProfile');
    // TODO: Request dev team to add data-testid="alert-success"
    this.alertSuccess = new UIElement(page.locator('.swal2-success, .alert-success, .toast-success'), 'alertSuccess');
    // TODO: Request dev team to add data-testid="alert-error"
    this.alertError = new UIElement(page.locator('.swal2-error, .alert-danger, .toast-error'), 'alertError');
    // TODO: Request dev team to add data-testid="header-avatar"
    this.headerAvatar = new UIElement(page.locator('header img[alt*="avatar"], .header img, header .avatar').first(), 'headerAvatar');

    // SCRUM-17: Enrolled Courses Locators
    this.enrolledCourses = new UIElement(page.locator('.course-item, .card, .course-card, .item'), 'enrolledCourses');
    this.sweetAlertConfirm = new UIElement(page.locator('.swal2-confirm, button:has-text("Đồng ý"), button:has-text("OK")'), 'sweetAlertConfirm');
    this.sweetAlertCancel = new UIElement(page.locator('.swal2-cancel, button:has-text("Hủy")'), 'sweetAlertCancel');
    this.tabKhoaHoc = new UIElement(page.getByRole('button', { name: /^Khóa học$/i }), 'tabKhoaHoc');
    this.profileModal = new UIElement(page.locator('.modal, [role="dialog"], .popup').first(), 'profileModal');
  }

  /** Navigate to Profile Page */
  async goToProfilePage(): Promise<void> {
    await test.step('Navigate to Profile Page (/thongtincanhan)', async () => {
      await this.navigate('/thongtincanhan');
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /** Open Enrolled Courses tab */
  async openKhoaHocTab(): Promise<void> {
    await test.step('Open Khóa học tab', async () => {
      await this.tabKhoaHoc.click();
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

  /** Get specific course card locator by course name */
  getCourseCard(courseName: string): UIElement {
    return this.enrolledCourses.filter({ hasText: courseName }).first();
  }

  /** Click Unenroll button for a specific course */
  async clickUnenroll(courseName: string): Promise<void> {
    await test.step(`Click Unenroll button for course: ${courseName}`, async () => {
      const courseCard = this.getCourseCard(courseName);
      const btnUnenroll = courseCard.locator('button').filter({ hasText: /Hủy ghi danh|Hủy đăng ký|Unenroll/i }).first();
      await btnUnenroll.click();
    });
  }

  /** Confirm SweetAlert dialog */
  async confirmSweetAlert(): Promise<void> {
    await test.step('Confirm SweetAlert dialog', async () => {
      await this.sweetAlertConfirm.click();
    });
  }

  /** Cancel SweetAlert dialog */
  async cancelSweetAlert(): Promise<void> {
    await test.step('Cancel SweetAlert dialog', async () => {
      await this.sweetAlertCancel.click();
    });
  }

  /** Open Profile modal */
  async openProfileModal(): Promise<void> {
    await test.step('Open Profile modal', async () => {
      if (await this.btnUploadTrigger.count() > 0) {
        await this.btnUploadTrigger.first().click().catch(() => {});
      }
    });
  }

  /** Save Profile */
  async saveProfile(): Promise<void> {
    await test.step('Save Profile', async () => {
      await this.btnUpdateProfile.click();
    });
  }

  /** Close Profile modal */
  async closeProfileModal(): Promise<void> {
    await test.step('Close Profile modal', async () => {
      const closeBtn = this.profileModal.locator('button.close, [aria-label="Close"], button:has-text("Đóng"), button:has-text("Hủy")').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
      }
    });
  }

  /** Get error message locator */
  getErrorMessageLocator(): Locator {
    return this.alertError.getLocator();
  }
}
