import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Register Page — handles user registration UI.
 * Pure Page Object Model: defines locators and actions only (no assertions).
 */
export class RegisterPage extends BasePage {
  // --- Locators ---
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly inputFullName: Locator;
  readonly inputPhone: Locator;
  readonly inputEmail: Locator;
  readonly selectGroup: Locator;
  readonly btnRegister: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    const registerForm = page.locator('form').filter({ hasText: /đăng ký/i }).first();
    this.inputUsername = registerForm.locator('input[name="taiKhoan"], #taiKhoan');
    this.inputPassword = registerForm.locator('input[name="matKhau"], input[type="password"], #matKhau');
    this.inputFullName = registerForm.locator('input[name="hoTen"], #hoTen');
    this.inputPhone = registerForm.locator('input[name="soDT"], input[name="soDt"], #soDt');
    this.inputEmail = registerForm.locator('input[name="email"], input[type="email"], #email');
    this.selectGroup = registerForm.locator('select[name="maNhom"], #maNhom');
    this.btnRegister = registerForm.getByRole('button', { name: 'Đăng ký', exact: true });
    this.successMessage = page.locator('.swal-title');
    this.errorMessage = page.locator('.swal-title');
  }

  /** Navigate to register page */
  async goToRegisterPage(): Promise<void> {
    await this.navigate('/login');
    // On the login page, click the register link/tab
    await this.page.locator('#signUp').click();
  }

  /** Fill the registration form */
  async fillRegisterForm(data: {
    username: string;
    password: string;
    fullName: string;
    phone: string;
    email: string;
    group?: string;
  }): Promise<void> {
    await this.inputUsername.fill(data.username);
    await this.inputPassword.fill(data.password);
    await this.inputFullName.fill(data.fullName);
    await this.inputPhone.fill(data.phone);
    await this.inputEmail.fill(data.email);
    if (data.group) {
      await this.selectGroup.selectOption({ value: data.group });
    }
  }

  /** Click register button */
  async clickRegister(): Promise<void> {
    await this.btnRegister.click();
  }

  /** Getter for success message locator to assert in Test class */
  getSuccessMessageLocator(): Locator {
    return this.successMessage;
  }

  /** Getter for error message locator to assert in Test class */
  getErrorMessageLocator(): Locator {
    return this.errorMessage;
  }
}
