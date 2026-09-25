import { test as base, APIRequestContext } from '@playwright/test';
import { API_BASE_URL, TOKEN_CYBERSOFT } from '../../constant/config-constant.js';
import { APIUtils } from '../api/api.js';

/**
 * Base fixture providing shared API context and utilities.
 * Extended by page-fixture.ts to compose Page Objects and Workflows.
 */
export type BaseFixtures = {
  /** Playwright APIRequestContext pre-configured with base URL and TokenCybersoft */
  apiContext: APIRequestContext;
  /** APIUtils wrapper for convenient HTTP calls */
  apiUtils: APIUtils;
};

export const test = base.extend<BaseFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: TOKEN_CYBERSOFT ? {
        TokenCybersoft: TOKEN_CYBERSOFT,
      } : {},
    });
    await use(context);
    await context.dispose();
  },

  apiUtils: async ({ apiContext }, use) => {
    const apiUtils = new APIUtils(apiContext);
    await use(apiUtils);
  },
});

export { expect } from '@playwright/test';
