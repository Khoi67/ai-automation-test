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
    this.heroSection = page.locator('.carousel, .hero, .banner').first();
    this.courseCards = page.locator('.card, .course-card, [class*="course"]');
    this.courseCardTitle = page.locator('.card-title, .course-title, h4, h5');
    this.searchInput = page.getByPlaceholder(/Tìm kiếm/i).first();
    this.btnViewAll = page.getByText('Xem thêm');
  }

  /** Navigate to home page */
  async goToHomePage(): Promise<void> {
    await this.navigate('/');
  }

  /** Search for a course from the homepage */
  async searchCourse(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
  }

  /** Get the count of displayed course cards */
  async getCourseCardCount(): Promise<number> {
    return this.courseCards.count();
  }
}
