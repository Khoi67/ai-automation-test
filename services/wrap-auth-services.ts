import { APIUtils } from '../core/api/api.js';
import { ThongTinDangNhap, LoginResponse } from '../data-object/api/user-model.js';

/**
 * Authentication API service.
 * Handles login and token retrieval.
 */
export class WrapAuthServices {
  constructor(private readonly api: APIUtils) {}

  /** Login and return full response */
  async login(credentials: ThongTinDangNhap) {
    return this.api.post('/api/QuanLyNguoiDung/DangNhap', {
      data: credentials,
    });
  }

  /** Login and extract access token */
  async getAccessToken(credentials: ThongTinDangNhap): Promise<string> {
    const response = await this.login(credentials);
    const body = (await response.json()) as LoginResponse;
    return body.accessToken;
  }

  /** Get user info using access token */
  async getUserInfo(accessToken: string) {
    return this.api.post('/api/QuanLyNguoiDung/ThongTinNguoiDung', {
      accessToken,
    });
  }

  /** Get account info using access token */
  async getAccountInfo(accessToken: string) {
    return this.api.post('/api/QuanLyNguoiDung/ThongTinTaiKhoan', {
      accessToken,
    });
  }
}
