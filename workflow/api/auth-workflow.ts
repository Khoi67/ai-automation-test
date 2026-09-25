import { APIUtils } from '../../core/api/api.js';
import { WrapAuthServices } from '../../services/wrap-auth-services.js';
import { WrapUserServices } from '../../services/wrap-user-services.js';
import { generateUsername, generateEmail, generatePhoneNumber } from '../../core/utils/string.js';
import { MA_NHOM, TEST_USERNAME, TEST_PASSWORD } from '../../constant/config-constant.js';
import { expect } from '@playwright/test';
import { ThongTinDangNhap } from '../../data-object/api/user-model.js';

/**
 * Auth API Workflow — orchestrates authentication setup for tests.
 */
export class AuthApiWorkflow {
  private readonly authService: WrapAuthServices;
  private readonly userService: WrapUserServices;

  constructor(apiUtils: APIUtils) {
    this.authService = new WrapAuthServices(apiUtils);
    this.userService = new WrapUserServices(apiUtils);
  }

  /**
   * Ensures the static test account exists.
   * Tries to login first. If it fails, registers the account.
   */
  async ensureTestAccount(): Promise<ThongTinDangNhap> {
    const username = TEST_USERNAME || 'auto_testuser_20260922160653_131';
    const password = TEST_PASSWORD || 'Password@123';

    // Check if the account can login
    const loginResponse = await this.authService.login({ taiKhoan: username, matKhau: password });
    if (loginResponse.status() === 200) {
      return { taiKhoan: username, matKhau: password };
    }

    // If login failed, register the account
    const email = generateEmail('test');
    const phone = generatePhoneNumber();

    const registerResponse = await this.userService.register({
      taiKhoan: username,
      matKhau: password,
      hoTen: 'Auto Test User',
      soDT: phone,
      maNhom: MA_NHOM,
      email: email,
    });

    expect(registerResponse.status(), 'API DangKy should return 200').toBe(200);

    return {
      taiKhoan: username,
      matKhau: password,
    };
  }

  /**
   * Register a new account and immediately login to get an access token.
   * Replaces the old static default account logic.
   */
  async createAccountAndGetAccessToken(): Promise<{ accessToken: string; credentials: ThongTinDangNhap }> {
    const credentials = await this.ensureTestAccount();
    const accessToken = await this.getAccessToken(credentials.taiKhoan, credentials.matKhau);
    return { accessToken, credentials };
  }
  /** Login with custom credentials and return access token */
  async getAccessToken(username: string, password: string): Promise<string> {
    return this.authService.getAccessToken({
      taiKhoan: username,
      matKhau: password,
    });
  }

  /**
   * Delete a dynamic account to cleanup test data
   */
  async deleteDynamicAccount(credentials: ThongTinDangNhap): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(credentials.taiKhoan, credentials.matKhau);
      const deleteResponse = await this.userService.deleteUser(credentials.taiKhoan, accessToken);
      expect(deleteResponse.status(), 'API XoaNguoiDung should return 200').toBe(200);
    } catch {
      // Ignored: Best effort cleanup, server may not allow user deletion
    }
  }
}
