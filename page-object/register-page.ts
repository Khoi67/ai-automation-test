import { Locator, Page } from '@playwright/test';
import { UIElement } from '../core/element/ui-element.js';
import { BasePage } from './base-page.js';

/**
 * Register Page — handles user registration UI.
 * Pure Page Object Model: defines locators and actions only (no assertions).
 */
export class RegisterPage extends BasePage {
  // --- Locators ---
  readonly inputUsername: UIElement;
  readonly inputPassword: UIElement;
  readonly inputFullName: UIElement;
  readonly inputPhone: UIElement;
  readonly inputEmail: UIElement;
  readonly selectGroup: UIElement;
  readonly btnRegister: UIElement;
  readonly successMessage: UIElement;
  readonly errorMessage: UIElement;
  readonly errorMsgUsername: UIElement;
  readonly errorMsgPassword: UIElement;
  readonly errorMsgFullName: UIElement;
  readonly errorMsgPhone: UIElement;
  readonly errorMsgEmail: UIElement;

  constructor(page: Page) {
    super(page);
    const registerForm = page.locator('form').filter({ hasText: /đăng ký/i }).first();
    this.inputUsername = new UIElement(registerForm.locator('input[name="taiKhoan"], #taiKhoan'), 'inputUsername');
    this.inputPassword = new UIElement(registerForm.locator('input[name="matKhau"], input[type="password"], #matKhau'), 'inputPassword');
    this.inputFullName = new UIElement(registerForm.locator('input[name="hoTen"], #hoTen'), 'inputFullName');
    this.inputPhone = new UIElement(registerForm.locator('input[name="soDT"], input[name="soDt"], #soDt'), 'inputPhone');
    this.inputEmail = new UIElement(registerForm.locator('input[name="email"], input[type="email"], #email'), 'inputEmail');
    this.selectGroup = new UIElement(registerForm.locator('select[name="maNhom"], #maNhom'), 'selectGroup');
    this.btnRegister = new UIElement(registerForm.getByRole('button', { name: 'Đăng ký', exact: true }), 'btnRegister');
    this.successMessage = new UIElement(page.locator('.swal-title'), 'successMessage');
    this.errorMessage = new UIElement(page.locator('.swal-title'), 'errorMessage');
    this.errorMsgUsername = new UIElement(registerForm.locator('.errorMessage').filter({ hasText: /tài khoản/i }).first(), 'errorMsgUsername');
    this.errorMsgFullName = new UIElement(registerForm.locator('.errorMessage').filter({ hasText: /tên/i }).first(), 'errorMsgFullName');
    this.errorMsgPassword = new UIElement(registerForm.locator('.errorMessage').nth(2), 'errorMsgPassword');
    this.errorMsgEmail = new UIElement(registerForm.locator('.errorMessage').filter({ hasText: /email/i }).first(), 'errorMsgEmail');
    this.errorMsgPhone = new UIElement(registerForm.locator('.errorMessage').filter({ hasText: /số điện thoại/i }).first(), 'errorMsgPhone');
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
    return this.successMessage.getLocator();
  }

  /** Getter for error message locator to assert in Test class */
  getErrorMessageLocator(): Locator {
    return this.errorMessage.getLocator();
  }
}
