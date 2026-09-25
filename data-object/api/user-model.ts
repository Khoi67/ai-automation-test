/**
 * API data models for User Management (QuanLyNguoiDung).
 * Mapped from Swagger definitions.
 */

/** Login request payload */
export interface ThongTinDangNhap {
  taiKhoan: string;
  matKhau: string;
}

/** User registration payload (public) */
export interface NguoiDungVMM {
  taiKhoan: string;
  matKhau: string;
  hoTen: string;
  soDT: string;
  maNhom: string;
  email: string;
}

/** User model (admin — includes maLoaiNguoiDung) */
export interface NguoiDungVM {
  taiKhoan: string;
  matKhau: string;
  hoTen: string;
  soDT: string;
  maLoaiNguoiDung: string;
  maNhom: string;
  email: string;
}

/** Account query model */
export interface TaiKhoanVM {
  taiKhoan: string;
}

/** Login response (expected shape) */
export interface LoginResponse {
  taiKhoan: string;
  hoTen: string;
  email: string;
  soDT: string;
  maNhom: string;
  maLoaiNguoiDung: string;
  accessToken: string;
}
