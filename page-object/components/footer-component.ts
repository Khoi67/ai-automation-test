import { Page, Locator } from '@playwright/test';

/**
 * Footer component — shared footer across all pages.
 * NOTE: Locators are skeleton — must be verified against actual DOM.
 */
export class FooterComponent {
  readonly footerContainer: Locator;
  readonly copyrightText: Locator;

  constructor(private readonly page: Page) {
    this.footerContainer = page.locator('footer');
    this.copyrightText = page.locator('footer .copyright, footer p');
  }

  /** Verify footer is visible */
  async isVisible(): Promise<boolean> {
    return this.footerContainer.isVisible();
  }
}
