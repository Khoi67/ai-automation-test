import { Page, Route } from '@playwright/test';

/**
 * NetworkHelper — central utility for network routing, mocking, and isolating tests.
 */
export class NetworkHelper {
  private static readonly DEFAULT_BLOCKED_PATTERNS = [
    '*google-analytics.com*',
    '*googletagmanager.com*',
    '*facebook.net*',
    '*analytics*',
    '*doubleclick.net*',
  ];

  /**
   * Blocks non-critical third-party network requests (analytics, ads, tracking)
   * to speed up page loads and prevent flakiness.
   */
  static async blockThirdParty(page: Page, customPatterns: string[] = []): Promise<void> {
    const patterns = [...this.DEFAULT_BLOCKED_PATTERNS, ...customPatterns];
    for (const pattern of patterns) {
      await page.route(pattern, (route: Route) => route.abort());
    }
  }

  /**
   * Mocks a specific API endpoint response.
   */
  static async mockApiResponse<T>(
    page: Page,
    urlPattern: string | RegExp,
    data: T,
    status = 200,
  ): Promise<void> {
    await page.route(urlPattern, async (route: Route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    });
  }

  /**
   * Simulates network failure or error status code (e.g. 500 Internal Server Error)
   * to test frontend error handling and resilience.
   */
  static async simulateApiError(
    page: Page,
    urlPattern: string | RegExp,
    status = 500,
    errorMessage = 'Internal Server Error',
  ): Promise<void> {
    await page.route(urlPattern, async (route: Route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ message: errorMessage }),
      });
    });
  }

  /**
   * Clears all active routes on the page.
   */
  static async unrouteAll(page: Page): Promise<void> {
    await page.unroute('**/*');
  }
}
