import { test, expect } from '../../fixture/page-fixture.js';
import { ThongTinDangNhap } from '../../data-object/api/user-model.js';

/**
 * Auth API Tests — V Learning
 *
 * Prerequisites:
 * - API_BASE_URL configured in .env
 * - TOKEN_CYBERSOFT configured in .env
 */
test.describe('Auth API', () => {
  let validUser: ThongTinDangNhap;

  test.beforeEach(async ({ authApiWorkflow }) => {
    await test.step('Ensure test account exists', async () => {
      validUser = await authApiWorkflow.ensureTestAccount();
    });
  });

  test('TC01 — Login API thành công — trả về accessToken', async ({ authService }) => {
    await test.step('Call Login API', async () => {
      const response = await authService.login(validUser);
      expect(response.status(), 'Login API should return 200').toBe(200);

      const body = await response.json();
      expect(body.accessToken, 'Response should contain accessToken').toBeTruthy();
      expect(body.taiKhoan, 'Response taiKhoan should match input').toBe(validUser.taiKhoan);
    });
  });

  test('TC02 — Login API thất bại với mật khẩu sai', async ({ authService }) => {
    await test.step('Call Login API with wrong password', async () => {
      const response = await authService.login({
        taiKhoan: validUser.taiKhoan,
        matKhau: 'completely_wrong_password_12345',
      });
      expect(response.status(), 'Login API with wrong password should not return 200').not.toBe(200);
    });
  });

  test('TC03 — Lấy thông tin tài khoản sau khi login', async ({ authService }) => {
    let accessToken = '';
    await test.step('Get access token', async () => {
      accessToken = await authService.getAccessToken(validUser);
    });

    await test.step('Call Get Account Info API', async () => {
      const response = await authService.getAccountInfo(accessToken);
      expect(response.status(), 'Account info API should return 200').toBe(200);

      const body = await response.json();
      expect(body.taiKhoan, 'Account info should match logged-in user').toBe(validUser.taiKhoan);
    });
  });
});
