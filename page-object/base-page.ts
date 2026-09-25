import { Page } from '@playwright/test';
import { BrowserUtils } from '../core/browser/browser-utils.js';

/**
 * Base Page class — common behavior shared across all pages.
 * All Page Objects should extend this class.
 */
export class BasePage {
  protected readonly browserUtils: BrowserUtils;

  constructor(protected readonly page: Page) {
    this.browserUtils = new BrowserUtils(page);
  }

  /** Navigate to a path relative to baseURL */
  async navigate(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /** Get current page URL */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Get page title */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Wait for page to fully load */
  async waitForPageLoad(): Promise<void> {
    await this.browserUtils.waitForPageLoad();
  }
}
