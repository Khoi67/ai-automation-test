/**
 * UI test data interfaces for Login.
 */

export interface LoginData {
  username: string;
  password: string;
  expectedResult: 'success' | 'error';
  expectedMessage?: string;
}
