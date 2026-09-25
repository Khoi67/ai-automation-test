import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Login Page — handles user authentication UI.
 * Pure Page Object Model: defines locators and user actions only (no assertions).
 */
export class LoginPage extends BasePage {
  // --- Locators ---
  readonly loginForm: Locator;
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly btnLogin: Locator;
  readonly errorMessage: Locator;
  readonly linkRegister: Locator;

  constructor(page: Page) {
    super(page);
    this.loginForm = page.locator('form').filter({ hasText: /đăng nhập/i });
    this.inputUsername = this.loginForm.getByPlaceholder(/tài khoản|username/i);
    this.inputPassword = this.loginForm.getByPlaceholder(/mật khẩu|password/i);
    this.btnLogin = this.loginForm.getByRole('button', { name: /đăng nhập/i });
    this.errorMessage = page.locator('.swal-title, .swal2-title');
    this.linkRegister = page.getByRole('link', { name: /đăng ký/i }).or(page.getByText('Đăng ký'));
  }

  /** Navigate to login page */
  async goToLoginPage(): Promise<void> {
    await test.step(`Navigate to login page (URL: /login)`, async () => {
      await this.navigate('/login');
    });
  }

  /** Fill login form with credentials */
  async fillLoginForm(username: string, password: string): Promise<void> {
    await test.step(`Fill login form with credentials`, async () => {
      if (username) {
        await this.inputUsername.fill(username);
      } else {
        await this.inputUsername.clear();
      }
      if (password) {
        await this.inputPassword.fill(password);
      } else {
        await this.inputPassword.clear();
      }
    });
  }

  /** Click the login button */
  async clickLogin(): Promise<void> {
    await test.step(`Click Login button`, async () => {
      await this.btnLogin.click();
    });
  }

  /** Perform full login action: fill form + click submit */
  async login(username: string, password: string): Promise<void> {
    await test.step(`Login action with Username: '${username}'`, async () => {
      await this.fillLoginForm(username, password);
      await this.clickLogin();
    });
  }

  /** Getter for error message locator to be asserted in Test class */
  getErrorMessageLocator(): Locator {
    return this.errorMessage;
  }
}

