import { test, expect } from '../../fixture/page-fixture.js';
import { ThongTinDangNhap } from '../../data-object/api/user-model.js';

/**
 * SCRUM-24: [API-Course] API Đăng ký và Hủy ghi danh khóa học dành cho học viên
 * 
 * Rules applied:
 * - .agent/rules/api_rules.md: Token lifecycle, status assertions, data isolation, anti-false healing.
 * - .agent/rules/automation_rules.md: 5-Tier DRY POM, traceability, clean code.
 */
test.describe(
  'SCRUM-24: API Đăng ký và Hủy ghi danh khóa học',
  { tag: ['@SCRUM-24', '@api', '@enroll'] },
  () => {
    let testCourseId: string = '';

    test.beforeAll(async ({ courseApiWorkflow }) => {
      // Pre-condition: Lấy một mã khóa học hợp lệ thực tế từ hệ thống
      const validCourse = await courseApiWorkflow.getValidCourse();
      testCourseId = validCourse.maKhoaHoc;
    });

    test('TC_API_ENROLL_01 — Đăng ký khóa học thành công với Token hợp lệ (Happy Path)', async ({
      authApiWorkflow,
      courseService,
    }) => {
      // 1. Tạo tài khoản học viên mới độc lập & lấy Bearer token
      const { accessToken, credentials } = await authApiWorkflow.createAccountAndGetAccessToken();

      // 2. Gửi request Đăng ký khóa học
      const startTime = Date.now();
      const response = await courseService.registerCourse(
        {
          maKhoaHoc: testCourseId,
          taiKhoan: credentials.taiKhoan,
        },
        accessToken,
      );
      const duration = Date.now() - startTime;

      // 3. Assertions chuẩn theo api_rules.md
      expect(response.status(), 'API Đăng ký khóa học phải trả về HTTP 200 OK').toBe(200);
      expect(duration, 'Response time của API phải dưới 2000ms').toBeLessThan(2000);

      // Verify response body
      const text = await response.text();
      expect(text.length, 'Response text không được để trống').toBeGreaterThan(0);
    });

    test('TC_API_ENROLL_02 — Chặn đăng ký khi không truyền Bearer Token (Unauthorized)', async ({
      authApiWorkflow,
      courseService,
    }) => {
      // 1. Tạo tài khoản test
      const { credentials } = await authApiWorkflow.createAccountAndGetAccessToken();

      // 2. Gửi request không truyền accessToken (omitted)
      const response = await courseService.registerCourse(
        {
          maKhoaHoc: testCourseId,
          taiKhoan: credentials.taiKhoan,
        },
        '', // Không có token
      );

      // 3. Verify hệ thống từ chối (401 Unauthorized hoặc mã lỗi không cho phép)
      expect(
        response.status(),
        'API phải từ chối khi không có Authorization header (không được trả về 200)',
      ).not.toBe(200);
    });

    test('TC_API_ENROLL_03 — Chặn đăng ký khi truyền Token không hợp lệ', async ({
      authApiWorkflow,
      courseService,
    }) => {
      // 1. Tạo tài khoản test
      const { credentials } = await authApiWorkflow.createAccountAndGetAccessToken();

      // 2. Gửi request kèm Token giả/hết hạn
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
      const response = await courseService.registerCourse(
        {
          maKhoaHoc: testCourseId,
          taiKhoan: credentials.taiKhoan,
        },
        invalidToken,
      );

      // 3. Verify hệ thống từ chối
      expect(
        response.status(),
        'API phải từ chối token không hợp lệ (HTTP 401 hoặc 403, không được là 200)',
      ).not.toBe(200);
    });

    test('TC_API_ENROLL_04 — Chặn đăng ký trùng lặp khóa học đã ghi danh (Conflict / Anti-False Healing)', async ({
      authApiWorkflow,
      courseService,
    }) => {
      // 1. Tạo tài khoản và đăng ký lần 1 thành công
      const { accessToken, credentials } = await authApiWorkflow.createAccountAndGetAccessToken();
      const firstEnroll = await courseService.registerCourse(
        {
          maKhoaHoc: testCourseId,
          taiKhoan: credentials.taiKhoan,
        },
        accessToken,
      );
      expect(firstEnroll.status(), 'Lần đăng ký đầu tiên phải thành công (200)').toBe(200);

      // 2. Gửi lại request Đăng ký lần 2 với cùng mã khóa học
      const duplicateEnroll = await courseService.registerCourse(
        {
          maKhoaHoc: testCourseId,
          taiKhoan: credentials.taiKhoan,
        },
        accessToken,
      );

      // 3. Anti-False Healing: Hệ thống BẮT BUỘC phải từ chối việc đăng ký trùng lặp
      expect(
        duplicateEnroll.status(),
        'Hệ thống phải chặn đăng ký trùng lặp (không được trả về 200 OK lần 2)',
      ).not.toBe(200);
    });

    test('TC_API_ENROLL_05 — Hủy ghi danh khóa học thành công (Happy Path)', async ({
      authApiWorkflow,
      courseService,
    }) => {
      // 1. Tạo tài khoản và đăng ký khóa học trước
      const { accessToken, credentials } = await authApiWorkflow.createAccountAndGetAccessToken();
      const enrollRes = await courseService.registerCourse(
        {
          maKhoaHoc: testCourseId,
          taiKhoan: credentials.taiKhoan,
        },
        accessToken,
      );
      expect(enrollRes.status(), 'Đăng ký thành công để chuẩn bị cho test hủy ghi danh').toBe(200);

      // 2. Gửi request Hủy ghi danh
      const unenrollRes = await courseService.cancelEnrollment(
        {
          maKhoaHoc: testCourseId,
          taiKhoan: credentials.taiKhoan,
        },
        accessToken,
      );

      // 3. Assertions
      expect(unenrollRes.status(), 'Hủy ghi danh phải trả về HTTP 200 OK').toBe(200);
    });

    test('TC_API_ENROLL_06 — Chặn hủy ghi danh khi không có AccessToken', async ({
      authApiWorkflow,
      courseService,
    }) => {
      // 1. Tạo tài khoản test
      const { credentials } = await authApiWorkflow.createAccountAndGetAccessToken();

      // 2. Gửi request Hủy ghi danh không kèm token
      const unenrollRes = await courseService.cancelEnrollment(
        {
          maKhoaHoc: testCourseId,
          taiKhoan: credentials.taiKhoan,
        },
        '', // Không có token
      );

      // 3. Verify hệ thống từ chối
      expect(
        unenrollRes.status(),
        'Không được phép hủy ghi danh khi thiếu token xác thực',
      ).not.toBe(200);
    });
  },
);
