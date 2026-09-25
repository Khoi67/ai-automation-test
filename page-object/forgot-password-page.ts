import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Forgot Password Page — handles forgot password UI on the login page.
 * Pure Page Object Model: defines locators and user actions only (no assertions).
 *
 * Note: On demo2.cybersoft.edu.vn, the "Quên mật khẩu?" link exists on the login page
 * but currently points to "#" (feature not fully implemented).
 */
export class ForgotPasswordPage extends BasePage {
  // --- Locators ---
  /** Login form container (scoped to the sign-in side) */
  readonly loginForm: Locator;

  /** "Quên mật khẩu?" link on the login form */
  readonly linkForgotPassword: Locator;

  /** Username input on login form */
  readonly inputUsername: Locator;

  /** Password input on login form */
  readonly inputPassword: Locator;

  /** Login button */
  readonly btnLogin: Locator;

  /** 404 page heading */
  readonly heading404: Locator;

  /** 404 error message */
  readonly errorMessage404: Locator;

  /** "Quay về trang chủ" button on 404 page */
  readonly btnBackToHome: Locator;

  constructor(page: Page) {
    super(page);

    // Login page locators (scoped to login form)
    this.loginForm = page.locator('form').filter({ hasText: /đăng nhập/i }).first();
    this.linkForgotPassword = page.getByRole('link', { name: /quên mật khẩu/i });
    this.inputUsername = page.locator('form').filter({ hasText: /đăng nhập/i }).getByPlaceholder(/tài khoản/i);
    this.inputPassword = page.locator('form').filter({ hasText: /đăng nhập/i }).getByPlaceholder(/mật khẩu/i);
    this.btnLogin = page.locator('form').filter({ hasText: /đăng nhập/i }).getByRole('button', { name: /đăng nhập/i });

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

  /** Navigate directly to /forgot-password (expected 404) */
  async goToForgotPasswordPage(): Promise<void> {
    await test.step('Navigate directly to /forgot-password', async () => {
      await this.navigate('/forgot-password');
    });
  }

  /** Click the "Quên mật khẩu?" link */
  async clickForgotPasswordLink(): Promise<void> {
    await test.step('Click "Quên mật khẩu?" link', async () => {
      await this.linkForgotPassword.click();
    });
  }

  /** Fill login form with credentials */
  async fillLoginForm(username: string, password: string): Promise<void> {
    await test.step(`Fill login form (username: '${username}')`, async () => {
      await this.inputUsername.fill(username);
      await this.inputPassword.fill(password);
    });
  }

  /** Click login button */
  async clickLoginButton(): Promise<void> {
    await test.step('Click login button', async () => {
      await this.btnLogin.click();
    });
  }

  /** Get current value of username input */
  async getUsernameValue(): Promise<string> {
    return this.inputUsername.inputValue();
  }

  /** Get current value of password input */
  async getPasswordValue(): Promise<string> {
    return this.inputPassword.inputValue();
  }
}
