import { test, expect } from '../../fixture/page-fixture.js';

/**
 * SCRUM-6: [Auth] Chức năng Quên mật khẩu và Khôi phục quyền truy cập tài khoản
 *
 * Test suite cho tính năng Quên mật khẩu trên demo2.cybersoft.edu.vn.
 * Lưu ý: Chức năng chưa implement hoàn chỉnh trên hệ thống.
 * Tests kiểm tra hiện trạng thực tế (link tồn tại, hành vi click, trang 404).
 *
 * Pre-conditions:
 * - UI_BASE_URL configured in .env (https://demo2.cybersoft.edu.vn)
 */
test.describe('SCRUM-6: Chức năng Quên mật khẩu (UI)', () => {

  test.beforeEach(async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goToLoginPage();
  });

  test('TC_FORGOT_01: Xác nhận link "Quên mật khẩu?" hiển thị trên trang Đăng nhập', async ({
    forgotPasswordPage,
  }) => {
    // Verify link "Quên mật khẩu?" is visible on login page
    await expect(
      forgotPasswordPage.linkForgotPassword,
      'Link "Quên mật khẩu?" phải hiển thị trên trang Đăng nhập'
    ).toBeVisible();

    // Verify the link is clickable (has role=link)
    await expect(
      forgotPasswordPage.linkForgotPassword,
      'Link phải có thể click được'
    ).toBeEnabled();
  });

  test('TC_FORGOT_02: Kiểm tra hành vi khi click link "Quên mật khẩu?"', async ({
    forgotPasswordPage,
    page,
  }) => {
    // Click the forgot password link
    await forgotPasswordPage.clickForgotPasswordLink();

    // Verify URL changes to /login# (anchor link)
    await expect(page, 'URL phải chứa /login sau khi click').toHaveURL(/\/login/);

    // Verify the page does NOT navigate away — login form elements still visible
    await expect(
      forgotPasswordPage.inputUsername,
      'Ô Tài khoản phải vẫn hiển thị sau khi click link'
    ).toBeVisible();

    await expect(
      forgotPasswordPage.inputPassword,
      'Ô Mật khẩu phải vẫn hiển thị sau khi click link'
    ).toBeVisible();

    await expect(
      forgotPasswordPage.btnLogin,
      'Nút Đăng nhập phải vẫn hiển thị sau khi click link'
    ).toBeVisible();
  });

  test('TC_FORGOT_03: Kiểm tra trang /forgot-password trả về 404', async ({
    forgotPasswordPage,
  }) => {
    // Navigate directly to /forgot-password
    await forgotPasswordPage.goToForgotPasswordPage();

    // Verify 404 heading is displayed
    await expect(
      forgotPasswordPage.heading404,
      'Trang phải hiển thị tiêu đề "404"'
    ).toBeVisible();

    // Verify error message
    await expect(
      forgotPasswordPage.errorMessage404,
      'Trang phải hiển thị thông báo "Có gì đó sai ở đây"'
    ).toBeVisible();

    // Verify "Quay về trang chủ" link exists
    await expect(
      forgotPasswordPage.btnBackToHome,
      'Phải có link "Quay về trang chủ"'
    ).toBeVisible();
  });

  test('TC_FORGOT_04: Link "Quên mật khẩu?" không ảnh hưởng đến form Đăng nhập', async ({
    forgotPasswordPage,
  }) => {
    const testUsername = 'admin';
    const testPassword = 'admin123';

    // Fill login form first
    await forgotPasswordPage.fillLoginForm(testUsername, testPassword);

    // Click forgot password link
    await forgotPasswordPage.clickForgotPasswordLink();

    // Verify form data is preserved after clicking the link
    const usernameValue = await forgotPasswordPage.getUsernameValue();
    const passwordValue = await forgotPasswordPage.getPasswordValue();

    expect(usernameValue, 'Giá trị Tài khoản phải giữ nguyên sau khi click link').toBe(testUsername);
    expect(passwordValue, 'Giá trị Mật khẩu phải giữ nguyên sau khi click link').toBe(testPassword);

    // Verify login still works after clicking the link
    await forgotPasswordPage.clickLoginButton();
  });
});
