import { Locator, Page, test } from '@playwright/test';
import { UIElement } from '../core/element/ui-element.js';
import { BasePage } from './base-page.js';

/**
 * Course Page — handles course listing, course detail views, and enrollment actions.
 * Pure Page Object Model: defines locators and user actions only (no assertions).
 */
export class CoursePage extends BasePage {
  // --- Course Listing Locators ---
  readonly courseList: UIElement;
  readonly courseCards: UIElement;
  readonly courseCardTitle: UIElement;
  readonly courseCardImage: UIElement;
  readonly categoryFilter: UIElement;
  readonly paginationNext: UIElement;
  readonly paginationPrev: UIElement;

  // --- Course Detail Locators ---
  readonly courseTitle: UIElement;
  readonly courseDescription: UIElement;
  readonly courseImage: UIElement;
  readonly btnEnroll: UIElement;
  readonly courseViewCount: UIElement;

  // --- Modal & Alert Locators ---
  readonly alertModal: UIElement;
  readonly alertTitle: UIElement;
  readonly alertText: UIElement;

  constructor(page: Page) {
    super(page);

    // Listing
    // TODO: Request dev team to add data-testid="course-list"
    this.courseList = new UIElement(page.locator('.courseListPage').first(), 'courseList');
    // TODO: Request dev team to add data-testid="course-card"
    this.courseCards = new UIElement(page.locator('.cardGlobal'), 'courseCards');
    // TODO: Request dev team to add data-testid="course-card-title"
    this.courseCardTitle = new UIElement(page.locator('.cardGlobal h6'), 'courseCardTitle');
    // TODO: Request dev team to add data-testid="course-card-image"
    this.courseCardImage = new UIElement(page.locator('.cardGlobal img'), 'courseCardImage');
    // TODO: Request dev team to add data-testid="category-filter"
    this.categoryFilter = new UIElement(page.locator('.courseCateList').first(), 'categoryFilter'); // Current DOM uses ul/li, not select
    this.paginationNext = new UIElement(page.locator('.paginationPages a').filter({ hasText: 'Sau' }), 'paginationNext');
    this.paginationPrev = new UIElement(page.locator('.paginationPages a').filter({ hasText: 'Trước' }), 'paginationPrev');

    // Detail
    // TODO: Request dev team to add data-testid="course-detail-title"
    this.courseTitle = new UIElement(page.locator('h4.titleDetailCourse').first(), 'courseTitle');
    // TODO: Request dev team to add data-testid="course-description"
    this.courseDescription = new UIElement(page.locator('.textDiscripts').first(), 'courseDescription');
    // TODO: Request dev team to add data-testid="course-image"
    this.courseImage = new UIElement(page.locator('.sideBarCourseDetail img').first(), 'courseImage');
    this.btnEnroll = new UIElement(page.getByRole('button', { name: /đăng ký/i }).first(), 'btnEnroll');
    // TODO: Request dev team to add data-testid="course-enroll-count"
    this.courseViewCount = new UIElement(page.locator('.sideBarDetailContent li').filter({ hasText: 'Ghi danh' }), 'courseViewCount');

    // SweetAlert modal
    this.alertModal = new UIElement(page.locator('.swal-modal, .swal2-modal, [role="dialog"]'), 'alertModal');
    this.alertTitle = new UIElement(page.locator('.swal-title, .swal2-title'), 'alertTitle');
    this.alertText = new UIElement(page.locator('.swal-text, .swal2-html-container'), 'alertText');
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
    return this.courseTitle.getLocator();
  }

  /** Get SweetAlert title locator for assertion in Test class */
  getAlertTitleLocator(): Locator {
    return this.alertTitle.getLocator();
  }

  /** Get SweetAlert text locator for assertion in Test class */
  getAlertTextLocator(): Locator {
    return this.alertText.getLocator();
  }

  /** Get SweetAlert modal locator for assertion in Test class */
  getAlertModalLocator(): Locator {
    return this.alertModal.getLocator();
  }
}
