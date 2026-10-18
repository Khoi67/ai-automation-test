import { test, expect } from '../../../fixture/page-fixture.js';

test.describe('SCRUM-7: Course Search', { tag: ['@SCRUM-7', '@course', '@search'] }, () => {
  test.beforeEach(async ({ homePage }) => {
    // Điều hướng tới trang chủ
    await homePage.goToHomePage();
  });

  test('TC_SEARCH_01: Tìm kiếm có kết quả phù hợp (Happy Path)', async ({ homePage, page }) => {
    const keyword = 'React';
    await homePage.searchCourse(keyword);

    // Chờ danh sách khóa học hiển thị (smart wait)
    await expect(homePage.courseCards.getLocator().first()).toBeVisible();
    // Kiểm tra danh sách hiển thị
    const count = await homePage.getCourseCardCount();
    expect(count).toBeGreaterThan(0);

    // Kiểm tra tên các khóa học có chứa từ khóa
    const titles = await homePage.courseCardTitle.allTextContents();
    for (const title of titles) {
      expect(title.toLowerCase()).toContain(keyword.toLowerCase());
    }
  });

  // Đánh dấu fixme do Bug SCRUM-8 trên Jira: Tìm kiếm từ khóa lạ vẫn trả về danh sách khóa học (Retest xác nhận Dev chưa fix)
  test.fixme('TC_SEARCH_02: Tìm kiếm không có kết quả', async ({ homePage, page }) => {
    const keyword = 'xyz123randomnotfound';
    await homePage.searchCourse(keyword);

    // Kiểm tra thông báo không tìm thấy kết quả từ hệ thống (smart wait tự động)
    await expect(page.getByText('Không tìm thấy khóa học nào phù hợp')).toBeVisible();
  });

  test('TC_SEARCH_03: Tìm kiếm với chuỗi rỗng', async ({ homePage }) => {
    // Để trống và submit, verify trang hoạt động bình thường
    await homePage.searchCourse('');
    await expect(homePage.searchInput.getLocator()).toBeVisible();
  });
});
