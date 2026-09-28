import { test, expect } from '../../../fixture/page-fixture.js';
import { ThongTinDangNhap } from '../../../data-object/api/user-model.js';

/**
 * SCRUM-14: [Enroll] Đăng ký ghi danh tham gia khóa học dành cho học viên
 */
test.describe('Course Enrollment UI (SCRUM-14)', { tag: ['@SCRUM-14', '@course', '@enroll'] }, () => {

  test.fixme('TC_ENROLL_01 — Chuyển hướng đến trang Đăng nhập khi khách vãng lai (Guest) nhấn Đăng ký', async ({
    coursePage,
    courseApiWorkflow,
    page,
  }) => {
    let testCourseId: string = '';

    await test.step('Pre-condition: Lấy một khóa học có sẵn trên hệ thống', async () => {
      const course = await courseApiWorkflow.getValidCourse();
      testCourseId = course.maKhoaHoc;
    });

    await test.step('1. Truy cập trang chi tiết khóa học khi chưa đăng nhập', async () => {
      await coursePage.goToCourseDetail(testCourseId);
    });

    await test.step('2. Nhấn nút Đăng ký ghi danh', async () => {
      await coursePage.clickEnroll();
    });

    await test.step('3. Xác nhận hệ thống chuyển hướng về trang /login', async () => {
      await expect(
        page,
        'Chưa đăng nhập mà nhấn Đăng ký phải bị chuyển hướng đến /login',
      ).toHaveURL(/\/login/);
    });
  });

  test.fixme('TC_ENROLL_02 — Cảnh báo khi học viên nhấn Đăng ký lại khóa học đã ghi danh trước đó', async ({
    loginPage,
    coursePage,
    authApiWorkflow,
    courseApiWorkflow,
    courseService,
    page,
  }) => {
    let testUser: ThongTinDangNhap;
    let testCourseId: string = '';
    let accessToken: string = '';

    await test.step('Pre-condition: Lấy một khóa học có sẵn trên hệ thống', async () => {
      const course = await courseApiWorkflow.getValidCourse();
      testCourseId = course.maKhoaHoc;
    });

    await test.step('Pre-condition: Tạo tài khoản học viên mới và ghi danh khóa học qua API', async () => {
      const accountData = await authApiWorkflow.createAccountAndGetAccessToken();
      testUser = accountData.credentials;
      accessToken = accountData.accessToken;

      await courseService.registerCourse(
        { maKhoaHoc: testCourseId, taiKhoan: testUser.taiKhoan },
        accessToken,
      );
    });

    await test.step('Pre-condition: Đăng nhập vào hệ thống', async () => {
      await loginPage.goToLoginPage();
      await loginPage.login(testUser.taiKhoan, testUser.matKhau);
      await expect(page).not.toHaveURL(/\/login/);
    });

    await test.step('1. Truy cập trang khóa học đã ghi danh và nhấn Đăng ký lại', async () => {
      await coursePage.goToCourseDetail(testCourseId);
      await coursePage.clickEnroll();
    });

    await test.step('2. Xác nhận popup cảnh báo trùng lặp hiển thị đúng nội dung', async () => {
      await expect(
        coursePage.getAlertTitleLocator(),
        'Hệ thống phải hiển thị thông báo Đã đăng ký khóa học này rồi!',
      ).toHaveText(/Đã đăng ký khóa học này rồi!/i);
    });
  });

  test.fixme('TC_ENROLL_03 — Ghi danh thành công khóa học mới khi học viên đã đăng nhập', async ({
    loginPage,
    coursePage,
    authApiWorkflow,
    courseApiWorkflow,
    page,
  }) => {
    let testUser: ThongTinDangNhap;
    let testCourseId: string = '';

    await test.step('Pre-condition: Lấy một khóa học có sẵn trên hệ thống', async () => {
      const course = await courseApiWorkflow.getValidCourse();
      testCourseId = course.maKhoaHoc;
    });

    await test.step('Pre-condition: Tạo tài khoản học viên mới hoàn toàn và đăng nhập', async () => {
      const accountData = await authApiWorkflow.createAccountAndGetAccessToken();
      testUser = accountData.credentials;
      await loginPage.goToLoginPage();
      await loginPage.login(testUser.taiKhoan, testUser.matKhau);
      await expect(page).not.toHaveURL(/\/login/);
    });

    await test.step('1. Truy cập trang chi tiết khóa học', async () => {
      await coursePage.goToCourseDetail(testCourseId);
    });

    await test.step('2. Nhấn nút Đăng ký ghi danh khóa học', async () => {
      await coursePage.clickEnroll();
    });

    await test.step('3. Xác nhận hiển thị thông báo đăng ký thành công', async () => {
      await expect(
        coursePage.getAlertTitleLocator(),
        'Hệ thống phải hiển thị thông báo Đăng kí thành công',
      ).toHaveText(/Đăng k[í|ý] thành công/i);
    });
  });
});
