import { APIUtils } from '../core/api/api.js';
import { KhoaHocModel, ThongTinDangKy, MaKhoaHocVM } from '../data-object/api/course-model.js';
import { MA_NHOM } from '../constant/config-constant.js';

/**
 * Course Management API service (QuanLyKhoaHoc).
 */
export class WrapCourseServices {
  constructor(private readonly api: APIUtils) {}

  /** Get list of all courses */
  async getCourses(tenKhoaHoc = '', maNhom = MA_NHOM) {
    return this.api.get('/api/QuanLyKhoaHoc/LayDanhSachKhoaHoc', {
      params: { tenKhoaHoc, MaNhom: maNhom },
    });
  }

  /** Get course categories */
  async getCourseCategories(tenDanhMuc = '') {
    return this.api.get('/api/QuanLyKhoaHoc/LayDanhMucKhoaHoc', {
      params: { tenDanhMuc },
    });
  }

  /** Get courses by category */
  async getCoursesByCategory(maDanhMuc: string, maNhom = MA_NHOM) {
    return this.api.get('/api/QuanLyKhoaHoc/LayKhoaHocTheoDanhMuc', {
      params: { maDanhMuc, MaNhom: maNhom },
    });
  }

  /** Get paginated course list */
  async getCoursesPaginated(page = 1, pageSize = 10, tenKhoaHoc = '', maNhom = MA_NHOM) {
    return this.api.get('/api/QuanLyKhoaHoc/LayDanhSachKhoaHoc_PhanTrang', {
      params: { tenKhoaHoc, page, pageSize, MaNhom: maNhom },
    });
  }

  /** Get course detail by course code */
  async getCourseInfo(maKhoaHoc: string) {
    return this.api.get('/api/QuanLyKhoaHoc/LayThongTinKhoaHoc', {
      params: { maKhoaHoc },
    });
  }

  /** Get students enrolled in a course */
  async getCourseStudents(maKhoaHoc: string, accessToken: string) {
    return this.api.get('/api/QuanLyKhoaHoc/LayThongTinHocVienKhoaHoc', {
      params: { maKhoaHoc },
      accessToken,
    });
  }

  /** Add a new course (requires accessToken) */
  async addCourse(course: KhoaHocModel, accessToken: string) {
    return this.api.post('/api/QuanLyKhoaHoc/ThemKhoaHoc', {
      data: course,
      accessToken,
    });
  }

  /** Update a course */
  async updateCourse(course: KhoaHocModel) {
    return this.api.put('/api/QuanLyKhoaHoc/CapNhatKhoaHoc', {
      data: course,
    });
  }

  /** Delete a course (requires accessToken) */
  async deleteCourse(maKhoaHoc: string, accessToken: string) {
    return this.api.delete('/api/QuanLyKhoaHoc/XoaKhoaHoc', {
      params: { MaKhoaHoc: maKhoaHoc },
      accessToken,
    });
  }

  /** Enroll user in a course (admin action — GhiDanh) */
  async enrollCourse(enrollment: ThongTinDangKy, accessToken: string) {
    return this.api.post('/api/QuanLyKhoaHoc/GhiDanhKhoaHoc', {
      data: enrollment,
      accessToken,
    });
  }

  /** Register for a course (user action — DangKy) */
  async registerCourse(registration: ThongTinDangKy, accessToken: string) {
    return this.api.post('/api/QuanLyKhoaHoc/DangKyKhoaHoc', {
      data: registration,
      accessToken,
    });
  }

  /** Cancel enrollment */
  async cancelEnrollment(enrollment: ThongTinDangKy, accessToken: string) {
    return this.api.post('/api/QuanLyKhoaHoc/HuyGhiDanh', {
      data: enrollment,
      accessToken,
    });
  }

  /** Get unenrolled students for a course */
  async getUnenrolledStudents(courseCode: MaKhoaHocVM, accessToken: string) {
    return this.api.post('/api/QuanLyNguoiDung/LayDanhSachNguoiDungChuaGhiDanh', {
      data: courseCode,
      accessToken,
    });
  }

  /** Get students pending approval for a course */
  async getPendingStudents(courseCode: MaKhoaHocVM, accessToken: string) {
    return this.api.post('/api/QuanLyNguoiDung/LayDanhSachHocVienChoXetDuyet', {
      data: courseCode,
      accessToken,
    });
  }

  /** Get enrolled students of a course */
  async getEnrolledStudents(courseCode: MaKhoaHocVM, accessToken: string) {
    return this.api.post('/api/QuanLyNguoiDung/LayDanhSachHocVienKhoaHoc', {
      data: courseCode,
      accessToken,
    });
  }
}
