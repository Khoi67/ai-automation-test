import { test, expect } from '../../fixture/page-fixture.js';

/**
 * SCRUM-6: [Auth] Chức năng Quên mật khẩu và Khôi phục quyền truy cập tài khoản
 *
 * Test suite mapped directly to test-cases/SCRUM-6_testcases.md
 */
test.describe('SCRUM-6: Chức năng Quên mật khẩu (UI)', () => {

  test.beforeEach(async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goToLoginPage();
  });

  test('TC_FORGOT_01: Yêu cầu khôi phục mật khẩu thành công với Email hợp lệ (Happy Path)', async ({
    forgotPasswordPage,
    page,
  }) => {
    // 1. Click link Quên mật khẩu
    await forgotPasswordPage.clickForgotPasswordLink();

    // 2. Kỳ vọng form/modal nhập email quên mật khẩu hiển thị
    await expect(
      forgotPasswordPage.inputEmailForgot,
      'Ô nhập Email quên mật khẩu phải hiển thị sau khi click liên kết'
    ).toBeVisible({ timeout: 5000 });

    // 3. Nhập email hợp lệ và submit
    const validEmail = 'test_valid_user@gmail.com';
    await forgotPasswordPage.inputEmailForgot.fill(validEmail);
    await forgotPasswordPage.btnSubmitForgot.click();

    // 4. Kỳ vọng hiển thị thông báo thành công
    await expect(
      forgotPasswordPage.alertSuccess,
      'Hệ thống phải hiển thị thông báo gửi hướng dẫn đặt lại mật khẩu thành công'
    ).toBeVisible();
  });

  test('TC_FORGOT_02: Yêu cầu khôi phục mật khẩu với Email không tồn tại (Negative Path)', async ({
    forgotPasswordPage,
    page,
  }) => {
    await forgotPasswordPage.clickForgotPasswordLink();

    await expect(
      forgotPasswordPage.inputEmailForgot,
      'Ô nhập Email phải hiển thị khi bấm Quên mật khẩu'
    ).toBeVisible({ timeout: 5000 });

    const nonExistentEmail = `nonexistent_user_${Date.now()}@auto.test`;
    await forgotPasswordPage.inputEmailForgot.fill(nonExistentEmail);
    await forgotPasswordPage.btnSubmitForgot.click();

    // Kỳ vọng thông báo lỗi email không tồn tại
    await expect(
      forgotPasswordPage.alertError,
      'Hệ thống phải thông báo lỗi Email không tồn tại'
    ).toBeVisible();
  });

  test('TC_FORGOT_03: Validation khi để trống trường Email (Empty Field)', async ({
    forgotPasswordPage,
  }) => {
    await forgotPasswordPage.clickForgotPasswordLink();

    await expect(
      forgotPasswordPage.inputEmailForgot,
      'Ô nhập Email phải hiển thị khi bấm Quên mật khẩu'
    ).toBeVisible({ timeout: 5000 });

    // Để trống và submit
    await forgotPasswordPage.inputEmailForgot.fill('');
    await forgotPasswordPage.btnSubmitForgot.click();

    // Kiểm tra thông báo yêu cầu nhập email
    const errorText = forgotPasswordPage.page.getByText(/vui lòng nhập email|không được để trống/i);
    await expect(errorText, 'Phải có thông báo lỗi yêu cầu nhập email').toBeVisible();
  });

  test('TC_FORGOT_04: Validation khi nhập Email sai định dạng (Invalid Format)', async ({
    forgotPasswordPage,
  }) => {
    await forgotPasswordPage.clickForgotPasswordLink();

    await expect(
      forgotPasswordPage.inputEmailForgot,
      'Ô nhập Email phải hiển thị khi bấm Quên mật khẩu'
    ).toBeVisible({ timeout: 5000 });

    await forgotPasswordPage.inputEmailForgot.fill('invalid_email_format');
    await forgotPasswordPage.btnSubmitForgot.click();

    // Kiểm tra thông báo lỗi định dạng
    const errorFormat = forgotPasswordPage.page.getByText(/email không hợp lệ|định dạng email sai/i);
    await expect(errorFormat, 'Phải có thông báo lỗi email không hợp lệ').toBeVisible();
  });
});
