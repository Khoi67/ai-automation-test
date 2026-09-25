import { Page, expect } from '@playwright/test';
import { LoginPage } from '../../page-object/login-page.js';
import { HeaderComponent } from '../../page-object/components/header-component.js';

/**
 * Login UI Workflow — orchestrates login user journey.
 */
export class LoginWorkflow {
  private readonly loginPage: LoginPage;
  private readonly header: HeaderComponent;

  constructor(private readonly page: Page) {
    this.loginPage = new LoginPage(page);
    this.header = new HeaderComponent(page);
  }

  /** Navigate to login page and perform login */
  async loginWithCredentials(username: string, password: string): Promise<void> {
    await this.loginPage.goToLoginPage();
    await this.loginPage.login(username, password);
  }

  /** Login and verify successful redirect to home page */
  async loginAndVerifySuccess(username: string, password: string): Promise<void> {
    await this.loginWithCredentials(username, password);
    await expect(
      this.page,
      'Expected to be redirected to home page after successful login',
    ).not.toHaveURL(/\/login/);
  }

  /** Login with invalid credentials and verify error */
  async loginAndVerifyError(username: string, password: string): Promise<void> {
    await this.loginWithCredentials(username, password);
    await expect(
      this.loginPage.getErrorMessageLocator(),
      'Expected login error message to be visible',
    ).toBeVisible();
  }

  /** Logout from current session */
  async logout(): Promise<void> {
    await this.header.logout();
  }
}
