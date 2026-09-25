import { Page, Locator } from '@playwright/test';

/**
 * Header component — shared navigation across all pages.
 * NOTE: Locators are skeleton — must be verified against actual DOM.
 */
export class HeaderComponent {
  // --- Locators ---
  readonly logo: Locator;
  readonly navCourses: Locator;
  readonly navEvents: Locator;
  readonly navBlog: Locator;
  readonly searchInput: Locator;
  readonly btnLogin: Locator;
  readonly btnRegister: Locator;
  readonly userDropdown: Locator;
  readonly userDisplayName: Locator;
  readonly btnLogout: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.locator('header .navbar-brand, header a[href="/"]').first();
    this.navCourses = page.locator('header').getByText('Khóa học');
    this.navEvents = page.locator('header').getByText('Sự kiện');
    this.navBlog = page.locator('header').getByText('Blog');
    this.searchInput = page.locator('header input[type="search"], header input[placeholder*="tìm"]');
    this.btnLogin = page.locator('header').getByText('Đăng nhập');
    this.btnRegister = page.locator('header').getByText('Đăng ký');
    this.userDropdown = page.locator('header .dropdown-toggle, header .user-info');
    this.userDisplayName = page.locator('header .user-name, header .dropdown-toggle');
    this.btnLogout = page.locator('header').getByText('Đăng xuất');
  }

  /** Click login button in header */
  async clickLogin(): Promise<void> {
    await this.btnLogin.click();
  }

  /** Click register button in header */
  async clickRegister(): Promise<void> {
    await this.btnRegister.click();
  }

  /** Search for a course */
  async searchCourse(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
  }

  /** Click user dropdown to show menu */
  async openUserMenu(): Promise<void> {
    await this.userDropdown.click();
  }

  /** Logout from user dropdown */
  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.btnLogout.click();
  }
}
