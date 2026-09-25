/**
 * API data models for Course Management (QuanLyKhoaHoc).
 * Mapped from Swagger definitions.
 */

/** Course model for CRUD operations */
export interface KhoaHocModel {
  maKhoaHoc: string;
  biDanh: string;
  tenKhoaHoc: string;
  moTa: string;
  luotXem: number;
  danhGia: number;
  hinhAnh: string;
  maNhom: string;
  ngayTao: string;
  maDanhMucKhoaHoc: string;
  taiKhoanNguoiTao: string;
}

/** Course enrollment / registration payload */
export interface ThongTinDangKy {
  maKhoaHoc: string;
  taiKhoan: string;
}

/** Course code query model */
export interface MaKhoaHocVM {
  maKhoaHoc: string;
}

/** Course category (expected response shape) */
export interface DanhMucKhoaHoc {
  maDanhMuc: string;
  tenDanhMuc: string;
}

/** Course list item (expected response shape) */
export interface KhoaHocItem {
  maKhoaHoc: string;
  biDanh: string;
  tenKhoaHoc: string;
  moTa: string;
  luotXem: number;
  hinhAnh: string;
  maNhom: string;
  ngayTao: string;
  soLuongHocVien: number;
  nguoiTao: {
    taiKhoan: string;
    hoTen: string;
    maLoaiNguoiDung: string;
    tenLoaiNguoiDung: string;
  };
  danhMucKhoaHoc: {
    maDanhMucKhoaHoc: string;
    tenDanhMucKhoaHoc: string;
  };
}
