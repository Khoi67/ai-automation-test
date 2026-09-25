import { Page } from '@playwright/test';

/**
 * Reusable browser/page utilities.
 * Keep these pure page-level helpers — no domain logic.
 */
export class BrowserUtils {
  constructor(private readonly page: Page) {}

  /** Wait for page to reach 'load' state */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
  }

  /** Wait for DOM content to be loaded */
  async waitForDOMReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Scroll to a specific element */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /** Get the current page URL */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Get the page title */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /** Accept browser dialog (alert/confirm/prompt) */
  async acceptDialog(): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  /** Dismiss browser dialog */
  async dismissDialog(): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  }
}
