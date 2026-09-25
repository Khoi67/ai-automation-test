import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const UI_BASE_URL = process.env.UI_BASE_URL || 'https://demo2.cybersoft.edu.vn';
const API_BASE_URL = process.env.API_BASE_URL || 'https://elearningnew.cybersoft.edu.vn';

const rawToken = process.env.TOKEN_CYBERSOFT?.trim();

if (process.env.CI && !rawToken) {
  throw new Error(
    'TOKEN_CYBERSOFT is required in CI but was not provided.',
  );
}

if (rawToken && /[\r\n]/.test(rawToken)) {
  throw new Error('TOKEN_CYBERSOFT contains invalid newline characters.');
}

const apiHeaders: Record<string, string> = rawToken
  ? { TokenCybersoft: rawToken }
  : {};

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['allure-playwright', { detail: false, suiteTitle: false }],
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
        viewport: { width: 1920, height: 1080 },
        headless: !!process.env.CI,
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: apiHeaders,
      },
    },
  ],
});
