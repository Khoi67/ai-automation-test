import { expect } from '@playwright/test';
import { test } from '../../../fixture/page-fixture.js';

test.describe('SCRUM-2: User Registration Feature (UI)', { tag: ['@SCRUM-2', '@auth', '@register'] }, () => {
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

    await test.step('Verify error message popup is displayed', async () => {
      const errorMsg = registerPage.getErrorMessageLocator();
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
      await expect(errorMsg).toContainText(/tài khoản đã tồn tại|đã tồn tại/i);
    });
  });

  test('TC_REG_03: Đăng ký thất bại do Email đã được sử dụng', async ({ registerPage, userService }) => {
    const existingEmail = `exist_${Date.now().toString().slice(-8)}@auto.test`;
    // Pre-condition: register account via API so email is already taken
    await userService.register({
      taiKhoan: `u_${Date.now().toString().slice(-8)}`.slice(0, 16),
      matKhau: 'Password@123',
      hoTen: 'Existing User',
      soDT: '0901234567',
      maNhom: 'GP01',
      email: existingEmail,
    });

    await test.step('Fill registration form with existing email', async () => {
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

    await test.step('Verify error message popup is displayed', async () => {
      const errorMsg = registerPage.getErrorMessageLocator();
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
      await expect(errorMsg).toContainText(/email đã tồn tại|đã tồn tại/i);
    });
  });

  test('TC_REG_04: Validation hiển thị khi để trống tất cả các trường', async ({ registerPage }) => {
    await test.step('Click register without filling any field', async () => {
      await registerPage.clickRegister();
    });

    await test.step('Verify validation errors are displayed', async () => {
      await expect(registerPage.errorMsgUsername).toBeVisible();
      await expect(registerPage.errorMsgPassword).toBeVisible();
      await expect(registerPage.errorMsgFullName).toBeVisible();
      await expect(registerPage.errorMsgPhone).toBeVisible();
      await expect(registerPage.errorMsgEmail).toBeVisible();
    });
  });

  test('TC_REG_05: Validation khi nhập sai định dạng Email', async ({ registerPage }) => {
    await test.step('Fill form with invalid email format', async () => {
      await registerPage.fillRegisterForm({
        username: uniqueUsername,
        password: 'Password@123',
        fullName: 'Automation Tester',
        phone: '0901234567',
        email: 'invalid-email-format',
      });
    });

    await test.step('Submit registration', async () => {
      await registerPage.clickRegister();
    });

    await test.step('Verify email format validation error via HTML5 validity', async () => {
      const isInvalid = await registerPage.inputEmail.evaluate((el: HTMLInputElement) => !el.checkValidity());
      expect(isInvalid).toBe(true);
    });
  });
});
