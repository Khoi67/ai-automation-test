import { Locator } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Home Page — landing page with course listings and search.
 * NOTE: Locators are skeleton — must be verified against actual DOM.
 */
export class HomePage extends BasePage {
  // --- Locators ---
  readonly heroSection: Locator;
  readonly courseCards: Locator;
  readonly courseCardTitle: Locator;
  readonly searchInput: Locator;
  readonly btnViewAll: Locator;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    // TODO: Request dev team to add data-testid="hero-section"
    this.heroSection = page.locator('.sliderHome').first();
    
    // TODO: Request dev team to add data-testid="course-card"
    this.courseCards = page.locator('.cardGlobal, .myCourseItem');
    
    // TODO: Request dev team to add data-testid="course-title"
    this.courseCardTitle = page.locator('.cardGlobal h6, .myCourseItem h6');
    
    this.searchInput = page.getByPlaceholder(/Tìm kiếm/i).first();
    
    // TODO: Request dev team to add data-testid="btn-view-all"
    this.btnViewAll = page.getByRole('button', { name: 'Xem thêm' }).or(page.getByText('Xem thêm'));
  }

  /** Navigate to home page */
  async goToHomePage(): Promise<void> {
    await this.navigate('/');
  }

  /** Search for a course from the homepage */
  async searchCourse(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
    // Giữ từ khóa hiển thị trong ô tìm kiếm ở trang kết quả để ảnh chụp màn hình bằng chứng rõ ràng
    if (keyword) {
      try {
        await this.searchInput.fill(keyword);
      } catch {}
    }
  }

  /** Get the count of displayed course cards */
  async getCourseCardCount(): Promise<number> {
    return this.courseCards.count();
  }
}
