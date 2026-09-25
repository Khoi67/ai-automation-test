import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/** UI application base URL */
export const UI_BASE_URL = process.env.UI_BASE_URL || 'https://demo2.cybersoft.edu.vn';

/** API server base URL */
export const API_BASE_URL = process.env.API_BASE_URL || 'https://elearningnew.cybersoft.edu.vn';

/** CyberSoft platform token — required for all API requests */
export const TOKEN_CYBERSOFT = process.env.TOKEN_CYBERSOFT?.trim() || '';

/** Test account credentials */
export const TEST_USERNAME = process.env.TEST_USERNAME || '';
export const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

/** Group code for API calls */
export const MA_NHOM = process.env.MA_NHOM || 'GP01';

/** Default timeouts (ms) */
export const TIMEOUTS = {
  ACTION: 15_000,
  NAVIGATION: 30_000,
  EXPECT: 10_000,
  API: 30_000,
} as const;
