import { Locator, Page, test } from '@playwright/test';
import { UIElement } from '../core/element/ui-element.js';
import { BasePage } from './base-page.js';

/**
 * Forgot Password Page — handles forgot password UI on the login page.
 * Pure Page Object Model: defines locators and user actions only (no assertions).
 */
export class ForgotPasswordPage extends BasePage {
  // --- Locators ---
  readonly loginForm: UIElement;
  readonly linkForgotPassword: UIElement;
  readonly inputUsername: UIElement;
  readonly inputPassword: UIElement;
  readonly btnLogin: UIElement;

  // Forgot password form/modal locators
  readonly forgotPasswordContainer: UIElement;
  readonly inputEmailForgot: UIElement;
  readonly btnSubmitForgot: UIElement;
  readonly alertSuccess: UIElement;
  readonly alertError: UIElement;
  readonly errorMsgRequiredEmail: UIElement;
  readonly errorMsgInvalidFormat: UIElement;

  // 404 page locators
  readonly heading404: UIElement;
  readonly errorMessage404: UIElement;
  readonly btnBackToHome: UIElement;

  constructor(page: Page) {
    super(page);

    // Login form locators
    this.loginForm = new UIElement(page.locator('form').filter({ hasText: /đăng nhập/i }).first(), 'loginForm');
    this.linkForgotPassword = new UIElement(page.getByRole('link', { name: /quên mật khẩu/i }), 'linkForgotPassword');
    this.inputUsername = new UIElement(page.locator('form').filter({ hasText: /đăng nhập/i }).getByPlaceholder(/tài khoản/i), 'inputUsername');
    this.inputPassword = new UIElement(page.locator('form').filter({ hasText: /đăng nhập/i }).getByPlaceholder(/mật khẩu/i), 'inputPassword');
    this.btnLogin = new UIElement(page.locator('form').filter({ hasText: /đăng nhập/i }).getByRole('button', { name: /đăng nhập/i }), 'btnLogin');

    // Forgot password elements
    this.forgotPasswordContainer = new UIElement(page.locator('.modal, .popup, [class*="forgot"], form[name*="forgot"]').first(), 'forgotPasswordContainer');
    this.inputEmailForgot = this.forgotPasswordContainer.getByPlaceholder(/nhập email|email của bạn/i).or(this.forgotPasswordContainer.locator('input[type="email"]'));
    this.btnSubmitForgot = this.forgotPasswordContainer.getByRole('button', { name: /gửi yêu cầu|lấy lại mật khẩu|xác nhận/i });
    this.alertSuccess = new UIElement(page.locator('.alert-success, .toast-success, [class*="success"], [role="alert"]').filter({ hasText: /hướng dẫn|thành công/i }), 'alertSuccess');
    this.alertError = new UIElement(page.locator('.alert-danger, .toast-error, [class*="error"], [role="alert"]').filter({ hasText: /không tồn tại|lỗi/i }), 'alertError');
    this.errorMsgRequiredEmail = new UIElement(page.getByText(/vui lòng nhập email|không được để trống/i), 'errorMsgRequiredEmail');
    this.errorMsgInvalidFormat = new UIElement(page.getByText(/email không hợp lệ|định dạng email sai/i), 'errorMsgInvalidFormat');

    // 404 page locators
    this.heading404 = new UIElement(page.getByRole('heading', { name: '404' }), 'heading404');
    this.errorMessage404 = new UIElement(page.getByRole('heading', { name: /có gì đó sai/i }), 'errorMessage404');
    this.btnBackToHome = new UIElement(page.getByRole('link', { name: /quay về trang chủ/i }), 'btnBackToHome');
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
