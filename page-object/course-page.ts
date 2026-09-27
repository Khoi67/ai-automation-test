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
    // TODO: Request dev team to add data-testid="course-list"
    this.courseList = page.locator('.courseListPage').first();
    // TODO: Request dev team to add data-testid="course-card"
    this.courseCards = page.locator('.cardGlobal');
    // TODO: Request dev team to add data-testid="course-card-title"
    this.courseCardTitle = page.locator('.cardGlobal h6');
    // TODO: Request dev team to add data-testid="course-card-image"
    this.courseCardImage = page.locator('.cardGlobal img');
    // TODO: Request dev team to add data-testid="category-filter"
    this.categoryFilter = page.locator('.courseCateList').first(); // Current DOM uses ul/li, not select
    this.paginationNext = page.locator('.paginationPages a').filter({ hasText: 'Sau' });
    this.paginationPrev = page.locator('.paginationPages a').filter({ hasText: 'Trước' });

    // Detail
    // TODO: Request dev team to add data-testid="course-detail-title"
    this.courseTitle = page.locator('h4.titleDetailCourse').first();
    // TODO: Request dev team to add data-testid="course-description"
    this.courseDescription = page.locator('.textDiscripts').first();
    // TODO: Request dev team to add data-testid="course-image"
    this.courseImage = page.locator('.sideBarCourseDetail img').first();
    this.btnEnroll = page.getByRole('button', { name: /đăng ký/i }).first();
    // TODO: Request dev team to add data-testid="course-enroll-count"
    this.courseViewCount = page.locator('.sideBarDetailContent li').filter({ hasText: 'Ghi danh' });

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
