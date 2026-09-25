import { expect } from '@playwright/test';
import { test } from '../../fixture/page-fixture.js';

test.describe('SCRUM-2: User Registration Feature (UI)', () => {
  let uniqueUsername: string;
  let uniqueEmail: string;

  test.beforeEach(async ({ registerPage }) => {
    // Generate unique data (username must be <= 16 chars per API constraint)
    const suffix = Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    uniqueUsername = `u_${suffix}`.slice(0, 16);
    uniqueEmail = `auto_${suffix}@automation.test`;

    await test.step('Navigate to Register Page', async () => {
      await registerPage.goToRegisterPage();
    });
  });

  test('TC_REG_01: Đăng ký thành công với thông tin hợp lệ', async ({ registerPage }) => {
    await test.step('Fill registration form with valid unique data', async () => {
      await registerPage.fillRegisterForm({
        username: uniqueUsername,
        password: 'Password@123',
        fullName: 'Automation Tester',
        phone: '0901234567',
        email: uniqueEmail,
      });
    });

    await test.step('Submit registration', async () => {
      await registerPage.clickRegister();
    });

    await test.step('Verify success message', async () => {
      const successMsg = registerPage.getSuccessMessageLocator();
      await expect(successMsg).toBeVisible({ timeout: 10000 });
      await expect(successMsg).toContainText(/thành công/i);
    });
  });

  test('TC_REG_02: Đăng ký thất bại do Tài khoản đã tồn tại', async ({ registerPage, userService }) => {
    const existingUsername = `u_${Date.now().toString().slice(-8)}`.slice(0, 16);
    // Pre-condition: register account via API so it definitely exists
    await userService.register({
      taiKhoan: existingUsername,
      matKhau: 'Password@123',
      hoTen: 'Existing User',
      soDT: '0901234567',
      maNhom: 'GP01',
      email: `exist_${Date.now().toString().slice(-8)}@auto.test`,
    });

    await test.step('Fill registration form with an existing username', async () => {
      await registerPage.fillRegisterForm({
        username: existingUsername,
        password: 'Password@123',
        fullName: 'Automation Tester',
        phone: '0901234567',
        email: uniqueEmail,
      });
    });

    await test.step('Submit registration', async () => {
      await registerPage.clickRegister();
    });

    await test.step('Verify error message for existing username', async () => {
      const errorMsg = registerPage.getErrorMessageLocator();
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
      await expect(errorMsg).toContainText(/Tài khoản đã tồn tại/i);
    });
  });

  test('TC_REG_03: Đăng ký thất bại do Email đã tồn tại', async ({ registerPage, userService }) => {
    const existingEmail = `exist_${Date.now().toString().slice(-8)}@auto.test`;
    // Pre-condition: register account with this email via API
    await userService.register({
      taiKhoan: `u_${Date.now().toString().slice(-8)}`.slice(0, 16),
      matKhau: 'Password@123',
      hoTen: 'Existing User',
      soDT: '0901234567',
      maNhom: 'GP01',
      email: existingEmail,
    });

    await test.step('Fill registration form with an existing email', async () => {
      await registerPage.fillRegisterForm({
        username: uniqueUsername,
        password: 'Password@123',
        fullName: 'Automation Tester',
        phone: '0901234567',
        email: existingEmail,
      });
    });

    await test.step('Submit registration', async () => {
      await registerPage.clickRegister();
    });

    await test.step('Verify error message for existing email', async () => {
      const errorMsg = registerPage.getErrorMessageLocator();
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
      await expect(errorMsg).toContainText(/Email đã tồn tại|Email/i);
    });
  });

  test('TC_REG_04: Cảnh báo lỗi Front-end khi bỏ trống trường bắt buộc', async ({ registerPage, page }) => {
    await test.step('Leave username empty and trigger validation', async () => {
      await registerPage.inputUsername.focus();
      await registerPage.inputPassword.focus();
    });

    await test.step('Verify validation warning text', async () => {
      await expect(page.locator('.errorMessage').filter({ hasText: /Tài khoản không được để trống/i })).toBeVisible();
    });
  });

  test('TC_REG_05: Cảnh báo lỗi Front-end khi Email sai định dạng', async ({ registerPage }) => {
    await test.step('Input invalid email format', async () => {
      await registerPage.inputEmail.fill('invalid_email_format');
      await registerPage.inputPassword.focus();
    });

    await test.step('Verify validation warning text for email', async () => {
      await expect(registerPage.inputEmail).toHaveJSProperty('validity.typeMismatch', true);
      await expect(registerPage.inputEmail).toHaveJSProperty('validity.valid', false);
    });
  });
});
