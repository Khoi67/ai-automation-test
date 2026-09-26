import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './base-page.js';

/**
 * Course Page — handles course listing, course detail views, and enrollment actions.
 * Pure Page Object Model: defines locators and user actions only (no assertions).
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

  // --- Modal & Alert Locators ---
  readonly alertModal: Locator;
  readonly alertTitle: Locator;
  readonly alertText: Locator;

  constructor(page: Page) {
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
    this.courseTitle = page.locator('h1, h2, h4, .course-detail-title').first();
    this.courseDescription = page.locator('.course-description, .course-detail p');
    this.courseImage = page.locator('.course-detail img, .course-image img').first();
    this.btnEnroll = page.getByRole('button', { name: /đăng ký|ghi danh|enroll/i }).first();
    this.courseViewCount = page.locator('.view-count, [class*="luot-xem"]');

    // SweetAlert modal
    this.alertModal = page.locator('.swal-modal, .swal2-modal, [role="dialog"]');
    this.alertTitle = page.locator('.swal-title, .swal2-title');
    this.alertText = page.locator('.swal-text, .swal2-html-container');
  }

  /** Navigate to course listing */
  async goToCourseList(): Promise<void> {
    await test.step('Navigate to course listing (/khoahoc)', async () => {
      await this.navigate('/khoahoc');
    });
  }

  /** Navigate to course detail page by course code */
  async goToCourseDetail(courseId: string): Promise<void> {
    await test.step(`Navigate to course detail (/chitiet/${courseId})`, async () => {
      await this.navigate(`/chitiet/${courseId}`);
    });
  }

  /** Get count of course cards on current page */
  async getCourseCardCount(): Promise<number> {
    return this.courseCards.count();
  }

  /** Click on a course card by index */
  async clickCourseByIndex(index: number): Promise<void> {
    await test.step(`Click course card at index ${index}`, async () => {
      await this.courseCards.nth(index).click();
    });
  }

  /** Click on a course card by title text */
  async clickCourseByTitle(title: string): Promise<void> {
    await test.step(`Click course card with title "${title}"`, async () => {
      await this.courseCards.filter({ hasText: title }).first().click();
    });
  }

  /** Click enroll button on course detail */
  async clickEnroll(): Promise<void> {
    await test.step('Click Enroll (Đăng ký) button', async () => {
      await this.btnEnroll.click();
    });
  }

  /** Get course detail title locator for assertion in Test class */
  getCourseTitleLocator(): Locator {
    return this.courseTitle;
  }

  /** Get SweetAlert title locator for assertion in Test class */
  getAlertTitleLocator(): Locator {
    return this.alertTitle;
  }

  /** Get SweetAlert text locator for assertion in Test class */
  getAlertTextLocator(): Locator {
    return this.alertText;
  }

  /** Get SweetAlert modal locator for assertion in Test class */
  getAlertModalLocator(): Locator {
    return this.alertModal;
  }
}
