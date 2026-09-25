import { test, expect } from '../../fixture/page-fixture.js';
import { MA_NHOM } from '../../constant/config-constant.js';

/**
 * Course API Tests — V Learning
 *
 * Prerequisites:
 * - API_BASE_URL configured in .env
 * - TOKEN_CYBERSOFT configured in .env
 */
test.describe('Course API', () => {
  test('TC01 — Lấy danh sách khóa học thành công', async ({ courseService }) => {
    await test.step('Get courses list', async () => {
      const response = await courseService.getCourses('', MA_NHOM);
      expect(response.status(), 'Get courses API should return 200').toBe(200);

      const body = await response.json();
      expect(Array.isArray(body), 'Response should be an array of courses').toBe(true);
      expect(body.length, 'Should have at least one course').toBeGreaterThan(0);
    });
  });

  test('TC02 — Lấy danh mục khóa học thành công', async ({ courseService }) => {
    await test.step('Get course categories', async () => {
      const response = await courseService.getCourseCategories();
      expect(response.status(), 'Get categories API should return 200').toBe(200);

      const body = await response.json();
      expect(Array.isArray(body), 'Response should be an array of categories').toBe(true);
      expect(body.length, 'Should have at least one category').toBeGreaterThan(0);
    });
  });

  test('TC03 — Lấy danh sách khóa học theo danh mục', async ({ courseService }) => {
    const category = 'TuDuy';
    await test.step(`Get courses by category: ${category}`, async () => {
      const response = await courseService.getCoursesByCategory(category, MA_NHOM);
      expect(response.status(), 'Get courses by category should return 200').toBe(200);

      const body = await response.json();
      expect(Array.isArray(body), 'Response should be an array').toBe(true);
    });
  });

  test('TC04 — Lấy danh sách khóa học có phân trang', async ({ courseService }) => {
    const page = 1;
    const pageSize = 5;
    await test.step(`Get courses paginated: page ${page}, pageSize ${pageSize}`, async () => {
      const response = await courseService.getCoursesPaginated(page, pageSize, '', MA_NHOM);
      expect(response.status(), 'Paginated courses API should return 200').toBe(200);

      const body = await response.json();
      expect(body.currentPage, 'Current page should be 1').toBe(1);
      expect(body.count, 'Total count should be greater than 0').toBeGreaterThan(0);
    });
  });

  test('TC05 — Tìm kiếm khóa học theo tên', async ({ courseService }) => {
    const keyword = 'lập trình';
    await test.step(`Search courses by keyword: "${keyword}"`, async () => {
      const response = await courseService.getCourses(keyword, MA_NHOM);
      expect(response.status(), 'Search courses API should return 200').toBe(200);

      const body = await response.json();
      expect(Array.isArray(body), 'Response should be an array').toBe(true);
    });
  });
});
