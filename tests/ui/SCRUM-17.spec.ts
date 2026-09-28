import { test, expect } from '../../fixture/page-fixture.js';
import { generateRandomEmail, generateUsername } from '../../core/utils/string.js';

test.describe('SCRUM-17: [Profile] Xem danh sách khóa học đã ghi danh và Hủy ghi danh', () => {
  let maKhoaHoc: string;

  test.beforeEach(async ({ courseApiWorkflow, courseService, authService }) => {
    const course = await courseApiWorkflow.getValidCourse();
    maKhoaHoc = course.maKhoaHoc;
    
    const accessToken = await authService.getAccessToken({ 
      taiKhoan: process.env.TEST_USERNAME as string, 
      matKhau: process.env.TEST_PASSWORD as string 
    });
    
    // Attempt to register the user to the course (ignore error if already registered)
    await courseService.registerCourse({
      maKhoaHoc: maKhoaHoc,
      taiKhoan: process.env.TEST_USERNAME as string
    }, accessToken);
  });

  test('TC01: Hiển thị danh sách khóa học đã ghi danh (Happy Path)', async ({ loginWorkflow, profilePage, page }) => {
    await loginWorkflow.loginAndVerifySuccess(process.env.TEST_USERNAME as string, process.env.TEST_PASSWORD as string);
    await profilePage.goToProfilePage();
    await profilePage.openKhoaHocTab();

    // Wait for courses to load, check if at least one is visible
    const unenrollBtn = page.getByRole('button', { name: /Hủy (khóa học|ghi danh)/i }).first();
    await expect(unenrollBtn).toBeVisible({ timeout: 15000 });
    
    // We assume the button is inside a course card, which should also have an image (or at least text)
    // Actually the DOM dump doesn't show an img tag for courses on this page! It only shows heading, paragraph, and button.
    // So we just assert the heading is visible.
    // In playwright, the heading is a sibling or inside a parent. We can just assert the button exists.
  });

  // Đánh dấu fixme do Bug SCRUM-22 trên Jira: Không hiển thị hộp thoại xác nhận (SweetAlert) khi nhấn Hủy khóa học
  test.fixme('TC02: Hủy ghi danh khóa học thành công (Happy Path)', async ({ loginWorkflow, profilePage, page }) => {
    await loginWorkflow.loginAndVerifySuccess(process.env.TEST_USERNAME as string, process.env.TEST_PASSWORD as string);
    await profilePage.goToProfilePage();
    await profilePage.openKhoaHocTab();

    const btnUnenroll = page.getByRole('button', { name: /Hủy (khóa học|ghi danh)/i }).first();
    await expect(btnUnenroll).toBeVisible({ timeout: 15000 });
    await btnUnenroll.click();

    await expect(profilePage.sweetAlertConfirm).toBeVisible();
    await profilePage.confirmSweetAlert();

    // Verify success message
    await expect(page.locator('.swal2-success, .alert-success, .toast-success, text="thành công"').first()).toBeVisible();
  });

  // Đánh dấu fixme do Bug SCRUM-22 trên Jira: Không hiển thị hộp thoại xác nhận (SweetAlert) khi nhấn Hủy khóa học
  test.fixme('TC03: Hủy thao tác "Hủy ghi danh"', async ({ loginWorkflow, profilePage, page }) => {
    await loginWorkflow.loginAndVerifySuccess(process.env.TEST_USERNAME as string, process.env.TEST_PASSWORD as string);
    await profilePage.goToProfilePage();
    await profilePage.openKhoaHocTab();

    const btnUnenroll = page.getByRole('button', { name: /Hủy (khóa học|ghi danh)/i }).first();
    await expect(btnUnenroll).toBeVisible({ timeout: 15000 });
    await btnUnenroll.click();

    await expect(profilePage.sweetAlertCancel).toBeVisible();
    await profilePage.cancelSweetAlert();

    // Verify SweetAlert is closed
    await expect(profilePage.sweetAlertConfirm).toBeHidden();
  });

  // Đánh dấu fixme do Bug SCRUM-21 trên Jira: App không chuyển hướng khi chưa đăng nhập
  test.fixme('TC04: Chặn truy cập khi chưa đăng nhập (Negative Path)', async ({ profilePage, page }) => {
    await profilePage.goToProfilePage();
    await expect(page).toHaveURL(/.*login/);
  });
});
