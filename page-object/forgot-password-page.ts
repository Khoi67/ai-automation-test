import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Forgot Password Page — handles forgot password UI on the login page.
 * Pure Page Object Model: defines locators and user actions only (no assertions).
 */
export class ForgotPasswordPage extends BasePage {
  // --- Locators ---
  readonly loginForm: Locator;
  readonly linkForgotPassword: Locator;
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly btnLogin: Locator;

  // Forgot password form/modal locators
  readonly forgotPasswordContainer: Locator;
  readonly inputEmailForgot: Locator;
  readonly btnSubmitForgot: Locator;
  readonly alertSuccess: Locator;
  readonly alertError: Locator;
  readonly errorMsgRequiredEmail: Locator;
  readonly errorMsgInvalidFormat: Locator;

  // 404 page locators
  readonly heading404: Locator;
  readonly errorMessage404: Locator;
  readonly btnBackToHome: Locator;

  constructor(page: Page) {
    super(page);

    // Login form locators
    this.loginForm = page.locator('form').filter({ hasText: /đăng nhập/i }).first();
    this.linkForgotPassword = page.getByRole('link', { name: /quên mật khẩu/i });
    this.inputUsername = page.locator('form').filter({ hasText: /đăng nhập/i }).getByPlaceholder(/tài khoản/i);
    this.inputPassword = page.locator('form').filter({ hasText: /đăng nhập/i }).getByPlaceholder(/mật khẩu/i);
    this.btnLogin = page.locator('form').filter({ hasText: /đăng nhập/i }).getByRole('button', { name: /đăng nhập/i });

    // Forgot password elements
    this.forgotPasswordContainer = page.locator('.modal, .popup, [class*="forgot"], form[name*="forgot"]').first();
    this.inputEmailForgot = this.forgotPasswordContainer.getByPlaceholder(/nhập email|email của bạn/i).or(this.forgotPasswordContainer.locator('input[type="email"]'));
    this.btnSubmitForgot = this.forgotPasswordContainer.getByRole('button', { name: /gửi yêu cầu|lấy lại mật khẩu|xác nhận/i });
    this.alertSuccess = page.locator('.alert-success, .toast-success, [class*="success"], [role="alert"]').filter({ hasText: /hướng dẫn|thành công/i });
    this.alertError = page.locator('.alert-danger, .toast-error, [class*="error"], [role="alert"]').filter({ hasText: /không tồn tại|lỗi/i });
    this.errorMsgRequiredEmail = page.getByText(/vui lòng nhập email|không được để trống/i);
    this.errorMsgInvalidFormat = page.getByText(/email không hợp lệ|định dạng email sai/i);

    // 404 page locators
    this.heading404 = page.getByRole('heading', { name: '404' });
    this.errorMessage404 = page.getByRole('heading', { name: /có gì đó sai/i });
    this.btnBackToHome = page.getByRole('link', { name: /quay về trang chủ/i });
  }

  /** Navigate to login page */
  async goToLoginPage(): Promise<void> {
    await test.step('Navigate to login page (/login)', async () => {
      await this.navigate('/login');
    });
  }

  /** Click the "Quên mật khẩu?" link */
  async clickForgotPasswordLink(): Promise<void> {
    await test.step('Click "Quên mật khẩu?" link', async () => {
      await this.linkForgotPassword.click();
    });
  }

  /** Request password reset with an email */
  async requestPasswordReset(email: string): Promise<void> {
    await test.step(`Request password reset for email: '${email}'`, async () => {
      await this.clickForgotPasswordLink();
      if (email) {
        await this.inputEmailForgot.fill(email);
      }
      await this.btnSubmitForgot.click();
    });
  }
}
