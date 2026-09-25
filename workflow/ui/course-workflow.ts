import { Page, expect } from '@playwright/test';
import { HomePage } from '../../page-object/home-page.js';
import { CoursePage } from '../../page-object/course-page.js';

/**
 * Course UI Workflow — orchestrates course browsing journey.
 */
export class CourseWorkflow {
  private readonly homePage: HomePage;
  private readonly coursePage: CoursePage;

  constructor(private readonly page: Page) {
    this.homePage = new HomePage(page);
    this.coursePage = new CoursePage(page);
  }

  /** Navigate to home and verify course cards are displayed */
  async verifyHomePageHasCourses(): Promise<void> {
    await this.homePage.goToHomePage();
    const count = await this.homePage.getCourseCardCount();
    expect(count, 'Expected at least one course card on home page').toBeGreaterThan(0);
  }

  /** Search for a course from the home page */
  async searchCourseFromHome(keyword: string): Promise<void> {
    await this.homePage.goToHomePage();
    await this.homePage.searchCourse(keyword);
  }

  /** Navigate to course listing and click a course by index */
  async viewCourseDetail(courseIndex = 0): Promise<void> {
    await this.coursePage.goToCourseList();
    await this.coursePage.clickCourseByIndex(courseIndex);
  }

  /** Navigate to course listing and click a course by title */
  async viewCourseByTitle(title: string): Promise<void> {
    await this.coursePage.goToCourseList();
    await this.coursePage.clickCourseByTitle(title);
    await expect(
      this.coursePage.getCourseTitleLocator(),
      `Expected course title to contain: "${title}"`,
    ).toContainText(title);
  }
}
