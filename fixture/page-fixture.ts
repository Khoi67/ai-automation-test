import { test as baseTest } from '../core/fixture/base-fixture.js';
import { HomePage } from '../page-object/home-page.js';
import { LoginPage } from '../page-object/login-page.js';
import { RegisterPage } from '../page-object/register-page.js';
import { CoursePage } from '../page-object/course-page.js';
import { ForgotPasswordPage } from '../page-object/forgot-password-page.js';
import { HeaderComponent } from '../page-object/components/header-component.js';
import { FooterComponent } from '../page-object/components/footer-component.js';
import { ProfilePage } from '../page-object/profile-page.js';
import { CartPage } from '../page-object/cart-page.js';
import { LoginWorkflow } from '../workflow/ui/login-workflow.js';
import { CourseWorkflow } from '../workflow/ui/course-workflow.js';
import { WrapAuthServices } from '../services/wrap-auth-services.js';
import { WrapUserServices } from '../services/wrap-user-services.js';
import { WrapCourseServices } from '../services/wrap-course-services.js';
import { AuthApiWorkflow } from '../workflow/api/auth-workflow.js';
import { CourseApiWorkflow } from '../workflow/api/course-workflow.js';

import { ThongTinDangNhap } from '../data-object/api/user-model.js';

export type IsolatedUserSession = {
  credentials: ThongTinDangNhap;
  accessToken: string;
  injectAuthToPage: () => Promise<void>;
};

/**
 * Page fixture — composes Page Objects, Workflows and Services.
 * Tests import { test, expect } from this file.
 */
export type PageFixtures = {
  // Page Objects
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  coursePage: CoursePage;
  forgotPasswordPage: ForgotPasswordPage;
  profilePage: ProfilePage;
  cartPage: CartPage;
  headerComponent: HeaderComponent;
  footerComponent: FooterComponent;

  // UI Workflows
  loginWorkflow: LoginWorkflow;
  courseWorkflow: CourseWorkflow;

  // API Services
  authService: WrapAuthServices;
  userService: WrapUserServices;
  courseService: WrapCourseServices;

  // API Workflows
  authApiWorkflow: AuthApiWorkflow;
  courseApiWorkflow: CourseApiWorkflow;

  // Isolated dynamic user with auto-teardown (Solves Race Condition & DB Pollution)
  isolatedUser: IsolatedUserSession;
};

export const test = baseTest.extend<PageFixtures>({
  // --- Page Objects ---
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  coursePage: async ({ page }, use) => {
    await use(new CoursePage(page));
  },

  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  headerComponent: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },

  footerComponent: async ({ page }, use) => {
    await use(new FooterComponent(page));
  },

  // --- UI Workflows ---
  loginWorkflow: async ({ page }, use) => {
    await use(new LoginWorkflow(page));
  },

  courseWorkflow: async ({ page }, use) => {
    await use(new CourseWorkflow(page));
  },

  // --- API Services ---
  authService: async ({ apiUtils }, use) => {
    await use(new WrapAuthServices(apiUtils));
  },

  userService: async ({ apiUtils }, use) => {
    await use(new WrapUserServices(apiUtils));
  },

  courseService: async ({ apiUtils }, use) => {
    await use(new WrapCourseServices(apiUtils));
  },

  // --- API Workflows ---
  authApiWorkflow: async ({ apiUtils }, use) => {
    await use(new AuthApiWorkflow(apiUtils));
  },

  courseApiWorkflow: async ({ apiUtils }, use) => {
    await use(new CourseApiWorkflow(apiUtils));
  },

  // --- Isolated User Session with Auto-Teardown ---
  isolatedUser: async ({ page, authApiWorkflow, authService }, use) => {
    // 1. Setup: Create unique dynamic user via API
    const user = await authApiWorkflow.createDynamicAccount();
    const loginRes = await authService.login(user);
    const body = await loginRes.json();
    const accessToken = body.accessToken;

    const credentialsPayload = {
      taiKhoan: body.taiKhoan,
      email: body.email,
      soDT: body.soDT,
      maNhom: body.maNhom,
      maLoaiNguoiDung: body.maLoaiNguoiDung,
      hoTen: body.hoTen,
      accessToken: accessToken,
      hinhAnh: body.hinhAnh || '',
    };

    const injectAuthToPage = async () => {
      await page.addInitScript((creds) => {
        window.localStorage.setItem('credentials', JSON.stringify(creds));
      }, credentialsPayload);
    };

    try {
      // 2. Yield to test
      await use({
        credentials: user,
        accessToken,
        injectAuthToPage,
      });
    } finally {
      // 3. Teardown: Clean up user from DB after test completes (even if test fails)
      await authApiWorkflow.deleteDynamicAccount(user);
    }
  },
});

export { expect } from '@playwright/test';
