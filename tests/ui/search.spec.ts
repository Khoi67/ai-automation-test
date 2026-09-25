import { test, expect } from '../../fixture/page-fixture.js';

test.describe('SCRUM-7: Course Search', () => {
  test.beforeEach(async ({ homePage }) => {
    // Điều hướng tới trang chủ
    await homePage.goToHomePage();
  });

  test('TC_SEARCH_01: Tìm kiếm có kết quả phù hợp (Happy Path)', async ({ homePage }) => {
    const keyword = 'React';
    await homePage.searchCourse(keyword);

    // Chờ 1 chút để DOM cập nhật nếu client-side filtering hoặc API
    await homePage.page.waitForTimeout(2000);
    // Kiểm tra danh sách hiển thị
    const count = await homePage.getCourseCardCount();
    expect(count).toBeGreaterThan(0);

    // Kiểm tra tên các khóa học có chứa từ khóa
    const titles = await homePage.courseCardTitle.allTextContents();
    for (const title of titles) {
      expect(title.toLowerCase()).toContain(keyword.toLowerCase());
    }
  });

  test('TC_SEARCH_02: Tìm kiếm không có kết quả', async ({ homePage }) => {
    const keyword = 'xyz123randomnotfound';
    await homePage.searchCourse(keyword);

    await homePage.page.waitForTimeout(2000);
    // Không có khóa học nào
    const count = await homePage.getCourseCardCount();
    expect(count).toBe(0);
  });

  test('TC_SEARCH_03: Tìm kiếm với chuỗi rỗng', async ({ homePage }) => {
    // Để trống và submit
    await homePage.searchCourse('');

    await homePage.page.waitForTimeout(2000);
    // Kiểm tra hiển thị nhiều khóa học
    const count = await homePage.getCourseCardCount();
    expect(count).toBeGreaterThan(0);
  });
});
