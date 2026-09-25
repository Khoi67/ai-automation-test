import { Browser, BrowserContext, Page, chromium } from '@playwright/test';

/**
 * Browser lifecycle management for standalone scripts (non-Playwright Test runner).
 * When using Playwright Test, prefer fixtures and playwright.config.ts instead.
 */
export class BrowserManagement {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  /** Launch browser with optional headed mode */
  async launchBrowser(headless = true): Promise<Browser> {
    this.browser = await chromium.launch({ headless });
    return this.browser;
  }

  /** Create a new browser context */
  async createContext(options?: {
    viewport?: { width: number; height: number };
  }): Promise<BrowserContext> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launchBrowser() first.');
    }
    this.context = await this.browser.newContext({
      viewport: options?.viewport ?? { width: 1920, height: 1080 },
    });
    return this.context;
  }

  /** Create a new page in the current context */
  async createPage(): Promise<Page> {
    if (!this.context) {
      throw new Error('Context not created. Call createContext() first.');
    }
    this.page = await this.context.newPage();
    return this.page;
  }

  /** Get the current page */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Page not created. Call createPage() first.');
    }
    return this.page;
  }

  /** Close all resources */
  async closeAll(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
