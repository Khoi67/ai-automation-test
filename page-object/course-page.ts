import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Course Page — handles course listing and course detail views.
 * NOTE: Locators are skeleton — must be verified against actual DOM.
 */
export class CoursePage extends BasePage {
  // --- Course Listing Locators ---
  readonly courseList: Locator;
  readonly courseCards: Locator;
  readonly courseCardTitle: Locator;
  readonly courseCardImage: Locator;
  readonly categoryFilter: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  // --- Course Detail Locators ---
  readonly courseTitle: Locator;
  readonly courseDescription: Locator;
  readonly courseImage: Locator;
  readonly btnEnroll: Locator;
  readonly courseViewCount: Locator;

  constructor(page: import('@playwright/test').Page) {
    super(page);

    // Listing
    this.courseList = page.locator('.course-list, .courses-container, [class*="course"]').first();
    this.courseCards = page.locator('.card, .course-card, [class*="course-item"]');
    this.courseCardTitle = page.locator('.card-title, .course-title');
    this.courseCardImage = page.locator('.card-img-top, .course-image img');
    this.categoryFilter = page.locator('.category-filter, select[name="category"]');
    this.paginationNext = page.locator('.pagination .next, [aria-label="Next"]');
    this.paginationPrev = page.locator('.pagination .prev, [aria-label="Previous"]');

    // Detail
    this.courseTitle = page.locator('h1, h2, .course-detail-title').first();
    this.courseDescription = page.locator('.course-description, .course-detail p');
    this.courseImage = page.locator('.course-detail img, .course-image img').first();
    this.btnEnroll = page.getByRole('button', { name: /đăng ký|ghi danh|enroll/i });
    this.courseViewCount = page.locator('.view-count, [class*="luot-xem"]');
  }

  /** Navigate to course listing */
  async goToCourseList(): Promise<void> {
    await this.navigate('/courses');
  }

  /** Get count of course cards on current page */
  async getCourseCardCount(): Promise<number> {
    return this.courseCards.count();
  }

  /** Click on a course card by index */
  async clickCourseByIndex(index: number): Promise<void> {
    await this.courseCards.nth(index).click();
  }

  /** Click on a course card by title text */
  async clickCourseByTitle(title: string): Promise<void> {
    await this.courseCards.filter({ hasText: title }).first().click();
  }

  /** Get course detail title locator for assertion in Test class */
  getCourseTitleLocator(): Locator {
    return this.courseTitle;
  }

  /** Click enroll button on course detail */
  async clickEnroll(): Promise<void> {
    await this.btnEnroll.click();
  }
}
