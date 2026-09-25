import { APIUtils } from '../../core/api/api.js';
import { WrapCourseServices } from '../../services/wrap-course-services.js';
import { AuthApiWorkflow } from './auth-workflow.js';
import { KhoaHocModel } from '../../data-object/api/course-model.js';
import { generateCourseCode, formatDateDDMMYYYY } from '../../core/utils/string.js';
import { MA_NHOM } from '../../constant/config-constant.js';

/**
 * Course API Workflow — orchestrates course CRUD with setup/cleanup.
 */
export class CourseApiWorkflow {
  private readonly courseService: WrapCourseServices;
  private readonly authWorkflow: AuthApiWorkflow;

  constructor(apiUtils: APIUtils) {
    this.courseService = new WrapCourseServices(apiUtils);
    this.authWorkflow = new AuthApiWorkflow(apiUtils);
  }

  /** Create a course and return the course code for cleanup */
  async createTestCourse(prefix = 'TEST'): Promise<{ course: KhoaHocModel; accessToken: string }> {
    const { accessToken } = await this.authWorkflow.createAccountAndGetAccessToken();
    const courseCode = generateCourseCode(prefix);

    const course: KhoaHocModel = {
      maKhoaHoc: courseCode,
      biDanh: courseCode.toLowerCase(),
      tenKhoaHoc: `Auto Test Course ${courseCode}`,
      moTa: `Automated test course created at ${new Date().toISOString()}`,
      luotXem: 0,
      danhGia: 0,
      hinhAnh: 'https://via.placeholder.com/300',
      maNhom: MA_NHOM,
      ngayTao: formatDateDDMMYYYY(),
      maDanhMucKhoaHoc: 'TuDuy',
      taiKhoanNguoiTao: '',
    };

    await this.courseService.addCourse(course, accessToken);
    return { course, accessToken };
  }

  /** Delete a course by code — for cleanup */
  async deleteCourse(maKhoaHoc: string, accessToken: string): Promise<void> {
    await this.courseService.deleteCourse(maKhoaHoc, accessToken);
  }
}
