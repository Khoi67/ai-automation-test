import { test, expect } from '../../fixture/page-fixture.js';
import { ThongTinDangNhap } from '../../data-object/api/user-model.js';

/**
 * SCRUM-14: [Enroll] Đăng ký ghi danh tham gia khóa học dành cho học viên
 */
test.describe('Course Enrollment UI (SCRUM-14)', () => {
  const DEFAULT_COURSE_ID = '000123456';

  test('TC_ENROLL_01 — Chuyển hướng đến trang Đăng nhập khi khách vãng lai (Guest) nhấn Đăng ký', async ({
    coursePage,
    page,
  }) => {
    await test.step('1. Truy cập trực tiếp trang chi tiết khóa học khi chưa đăng nhập', async () => {
      await coursePage.goToCourseDetail(DEFAULT_COURSE_ID);
    });

    await test.step('2. Nhấn nút Đăng ký ghi danh khóa học', async () => {
      await coursePage.clickEnroll();
    });

    await test.step('3. Xác nhận hệ thống chuyển hướng người dùng đến trang /login', async () => {
      await expect(
        page,
        'Khách chưa đăng nhập bấm Đăng ký phải bị chuyển hướng đến /login',
      ).toHaveURL(/\/login/);
    });
  });

  test('TC_ENROLL_02 — Cảnh báo chặn ghi danh trùng lặp khi đã đăng ký khóa học này trước đó', async ({
    loginPage,
    coursePage,
    authApiWorkflow,
    page,
  }) => {
    let testUser: ThongTinDangNhap;

    await test.step('Pre-condition: Đăng nhập với tài khoản đã ghi danh khóa học này từ trước', async () => {
      testUser = await authApiWorkflow.ensureTestAccount();
      await loginPage.goToLoginPage();
      await loginPage.login(testUser.taiKhoan, testUser.matKhau);
      await expect(page).not.toHaveURL(/\/login/);
    });

    await test.step('1. Truy cập trang khóa học đã ghi danh và nhấn Đăng ký lại', async () => {
      await coursePage.goToCourseDetail(DEFAULT_COURSE_ID);
      await coursePage.clickEnroll();
    });

    await test.step('2. Xác nhận popup cảnh báo trùng lặp hiển thị đúng nội dung', async () => {
      await expect(
        coursePage.getAlertTitleLocator(),
        'Hệ thống phải hiển thị thông báo Đã đăng ký khóa học này rồi!',
      ).toHaveText(/Đã đăng ký khóa học này rồi!/i);
    });
  });

  test('TC_ENROLL_03 — Ghi danh thành công khóa học mới khi học viên đã đăng nhập', async ({
    loginPage,
    coursePage,
    authApiWorkflow,
    page,
  }) => {
    let testUser: ThongTinDangNhap;

    await test.step('Pre-condition: Tạo tài khoản học viên mới hoàn toàn và đăng nhập', async () => {
      const accountData = await authApiWorkflow.createAccountAndGetAccessToken();
      testUser = accountData.credentials;
      await loginPage.goToLoginPage();
      await loginPage.login(testUser.taiKhoan, testUser.matKhau);
      await expect(page).not.toHaveURL(/\/login/);
    });

    await test.step('1. Truy cập trang chi tiết khóa học', async () => {
      await coursePage.goToCourseDetail(DEFAULT_COURSE_ID);
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
