import { APIUtils } from '../../core/api/api.js';
import { WrapCourseServices } from '../../services/wrap-course-services.js';
import { AuthApiWorkflow } from './auth-workflow.js';
import { KhoaHocModel } from '../../data-object/api/course-model.js';
import { generateCourseCode, formatDateDDMMYYYY } from '../../core/utils/string.js';
import { MA_NHOM, TEST_USERNAME, TEST_PASSWORD } from '../../constant/config-constant.js';
import { expect } from '@playwright/test';

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

  /**
   * Lấy một khóa học có sẵn từ hệ thống để làm Test Data.
   * Giải pháp an toàn khi không có tài khoản GV (Giáo Vụ) để tạo mới khóa học.
   */
  async getValidCourse(): Promise<KhoaHocModel> {
    const res = await this.courseService.getCoursesPaginated(1, 10, '', MA_NHOM);
    expect(res.status(), 'Failed to fetch courses').toBe(200);
    const body = await res.json();
    expect(body.items.length, 'No courses available in system').toBeGreaterThan(0);
    // Chọn khóa học đầu tiên trong danh sách
    return body.items[0];
  }
}
