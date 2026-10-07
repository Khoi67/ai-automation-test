import { Locator } from '@playwright/test';
import { UIElement } from '../core/element/ui-element.js';
import { BasePage } from './base-page.js';

/**
 * Home Page — landing page with course listings and search.
 * NOTE: Locators are skeleton — must be verified against actual DOM.
 */
export class HomePage extends BasePage {
  // --- Locators ---
  readonly heroSection: UIElement;
  readonly courseCards: UIElement;
  readonly courseCardTitle: UIElement;
  readonly searchInput: UIElement;
  readonly btnViewAll: UIElement;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    // TODO: Request dev team to add data-testid="hero-section"
    this.heroSection = new UIElement(page.locator('.sliderHome').first(), 'heroSection');
    
    // TODO: Request dev team to add data-testid="course-card"
    this.courseCards = new UIElement(page.locator('.cardGlobal, .myCourseItem'), 'courseCards');
    
    // TODO: Request dev team to add data-testid="course-title"
    this.courseCardTitle = new UIElement(page.locator('.cardGlobal h6, .myCourseItem h6'), 'courseCardTitle');
    
    this.searchInput = new UIElement(page.getByPlaceholder(/Tìm kiếm/i).first(), 'searchInput');
    
    // TODO: Request dev team to add data-testid="btn-view-all"
    this.btnViewAll = new UIElement(page.getByRole('button', { name: 'Xem thêm' }).or(page.getByText('Xem thêm')), 'btnViewAll');
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
