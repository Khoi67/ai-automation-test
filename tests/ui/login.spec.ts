import { test, expect } from '../../fixture/page-fixture.js';
import { ThongTinDangNhap } from '../../data-object/api/user-model.js';

/**
 * Login UI Tests — V Learning
 *
 * Prerequisites:
 * - UI_BASE_URL configured in .env
 *
 * NOTE: Locators are skeleton and need DOM verification.
 * Run `npx playwright codegen <URL>` to inspect actual selectors.
 */
test.describe('Login UI', () => {
  let validUser: ThongTinDangNhap;

  test.beforeEach(async ({ loginPage, authApiWorkflow }) => {
    await test.step('Pre-condition: Ensure test account and go to login page', async () => {
      validUser = await authApiWorkflow.ensureTestAccount();
      await loginPage.goToLoginPage();
    });
  });

  test('TC01 — Login thành công với tài khoản hợp lệ', async ({ loginPage, page }) => {
    await loginPage.login(validUser.taiKhoan, validUser.matKhau);

    await test.step('Verify login success state and redirection', async () => {
      // Assert URL redirects away from /login
      await expect(
        page,
        'Sau khi login thành công, URL chuyển hướng khỏi /login',
      ).not.toHaveURL(/\/login/);
    });
  });

  test('TC02 — Login thất bại với mật khẩu sai', async ({ loginPage }) => {
    await loginPage.login(validUser.taiKhoan, 'wrong_password_invalid');

    await test.step('Verify error message popup is displayed', async () => {
      await expect(
        loginPage.getErrorMessageLocator(),
        'Thông báo lỗi phải hiển thị khi nhập sai mật khẩu',
      ).toBeVisible();
    });
  });

  test('TC03 — Login thất bại khi để trống tài khoản', async ({ loginPage }) => {
    await loginPage.login('', validUser.matKhau);

    await test.step('Verify error message popup is displayed', async () => {
      await expect(
        loginPage.getErrorMessageLocator(),
        'Thông báo lỗi phải hiển thị khi để trống tài khoản',
      ).toBeVisible();
    });
  });
});

