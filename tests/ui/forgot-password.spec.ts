import { test, expect } from '../../fixture/page-fixture.js';

/**
 * SCRUM-6: [Auth] Chức năng Quên mật khẩu và Khôi phục quyền truy cập tài khoản
 *
 * Test suite mapped directly to test-cases/SCRUM-6_testcases.md
 */
test.describe('SCRUM-6: Chức năng Quên mật khẩu (UI)', () => {

  test.beforeEach(async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goToLoginPage();
    await forgotPasswordPage.clickForgotPasswordLink();
    await expect(
      forgotPasswordPage.inputEmailForgot,
      'Ô nhập Email quên mật khẩu phải hiển thị sau khi click liên kết'
    ).toBeVisible({ timeout: 5000 });
  });

  test('TC_FORGOT_01: Yêu cầu khôi phục mật khẩu thành công với Email hợp lệ (Happy Path)', async ({
    forgotPasswordPage,
  }) => {
    // 1. Nhập email hợp lệ và submit
    const validEmail = `test_valid_${Date.now()}@gmail.com`;
    await forgotPasswordPage.requestPasswordReset(validEmail);

    // 2. Kỳ vọng hiển thị thông báo thành công
    await expect(
      forgotPasswordPage.alertSuccess,
      'Hệ thống phải hiển thị thông báo gửi hướng dẫn đặt lại mật khẩu thành công'
    ).toBeVisible();
  });

  test('TC_FORGOT_02: Yêu cầu khôi phục mật khẩu với Email không tồn tại (Negative Path)', async ({
    forgotPasswordPage,
  }) => {
    const nonExistentEmail = `nonexistent_user_${Date.now()}@auto.test`;
    await forgotPasswordPage.requestPasswordReset(nonExistentEmail);

    // Kỳ vọng thông báo lỗi email không tồn tại
    await expect(
      forgotPasswordPage.alertError,
      'Hệ thống phải thông báo lỗi Email không tồn tại'
    ).toBeVisible();
  });

  test('TC_FORGOT_03: Validation khi để trống trường Email (Empty Field)', async ({
    forgotPasswordPage,
  }) => {
    // Để trống và submit
    await forgotPasswordPage.requestPasswordReset('');

    // Kiểm tra thông báo yêu cầu nhập email
    await expect(
      forgotPasswordPage.errorMsgRequiredEmail,
      'Phải có thông báo lỗi yêu cầu nhập email'
    ).toBeVisible();
  });

  test('TC_FORGOT_04: Validation khi nhập Email sai định dạng (Invalid Format)', async ({
    forgotPasswordPage,
  }) => {
    await forgotPasswordPage.requestPasswordReset('invalid_email_format');

    // Kiểm tra thông báo lỗi định dạng
    await expect(
      forgotPasswordPage.errorMsgInvalidFormat,
      'Phải có thông báo lỗi email không hợp lệ'
    ).toBeVisible();
  });
});
