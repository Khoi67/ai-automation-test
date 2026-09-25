import { APIUtils } from '../core/api/api.js';
import { NguoiDungVM, NguoiDungVMM, TaiKhoanVM } from '../data-object/api/user-model.js';
import { MA_NHOM } from '../constant/config-constant.js';

/**
 * User Management API service (QuanLyNguoiDung).
 */
export class WrapUserServices {
  constructor(private readonly api: APIUtils) {}

  /** Get user type list */
  async getUserTypes() {
    return this.api.get('/api/QuanLyNguoiDung/LayDanhSachLoaiNguoiDung');
  }

  /** Register a new user (public endpoint) */
  async register(user: NguoiDungVMM) {
    return this.api.post('/api/QuanLyNguoiDung/DangKy', { data: user });
  }

  /** Get list of users */
  async getUsers(keyword = '', maNhom = MA_NHOM) {
    return this.api.get('/api/QuanLyNguoiDung/LayDanhSachNguoiDung', {
      params: { MaNhom: maNhom, tuKhoa: keyword },
    });
  }

  /** Get paginated user list */
  async getUsersPaginated(page = 1, pageSize = 10, keyword = '', maNhom = MA_NHOM) {
    return this.api.get('/api/QuanLyNguoiDung/LayDanhSachNguoiDung_PhanTrang', {
      params: { MaNhom: maNhom, tuKhoa: keyword, page, pageSize },
    });
  }

  /** Search users by keyword */
  async searchUsers(keyword: string, maNhom = MA_NHOM) {
    return this.api.get('/api/QuanLyNguoiDung/TimKiemNguoiDung', {
      params: { MaNhom: maNhom, tuKhoa: keyword },
    });
  }

  /** Add a new user (admin — requires accessToken) */
  async addUser(user: NguoiDungVM, accessToken: string) {
    return this.api.post('/api/QuanLyNguoiDung/ThemNguoiDung', {
      data: user,
      accessToken,
    });
  }

  /** Update user info (admin — requires accessToken) */
  async updateUser(user: NguoiDungVM, accessToken: string) {
    return this.api.put('/api/QuanLyNguoiDung/CapNhatThongTinNguoiDung', {
      data: user,
      accessToken,
    });
  }

  /** Delete a user (admin — requires accessToken) */
  async deleteUser(taiKhoan: string, accessToken: string) {
    return this.api.delete('/api/QuanLyNguoiDung/XoaNguoiDung', {
      params: { TaiKhoan: taiKhoan },
      accessToken,
    });
  }

  /** Get courses not enrolled by user */
  async getUnenrolledCourses(taiKhoan: string, accessToken: string) {
    return this.api.post('/api/QuanLyNguoiDung/LayDanhSachKhoaHocChuaGhiDanh', {
      accessToken,
    });
  }

  /** Get courses pending approval for a user */
  async getPendingCourses(account: TaiKhoanVM, accessToken: string) {
    return this.api.post('/api/QuanLyNguoiDung/LayDanhSachKhoaHocChoXetDuyet', {
      data: account,
      accessToken,
    });
  }

  /** Get approved courses for a user */
  async getApprovedCourses(account: TaiKhoanVM, accessToken: string) {
    return this.api.post('/api/QuanLyNguoiDung/LayDanhSachKhoaHocDaXetDuyet', {
      data: account,
      accessToken,
    });
  }
}
