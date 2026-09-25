import { test as baseTest } from '../core/fixture/base-fixture.js';
import { HomePage } from '../page-object/home-page.js';
import { LoginPage } from '../page-object/login-page.js';
import { RegisterPage } from '../page-object/register-page.js';
import { CoursePage } from '../page-object/course-page.js';
import { ForgotPasswordPage } from '../page-object/forgot-password-page.js';
import { HeaderComponent } from '../page-object/components/header-component.js';
import { FooterComponent } from '../page-object/components/footer-component.js';
import { LoginWorkflow } from '../workflow/ui/login-workflow.js';
import { CourseWorkflow } from '../workflow/ui/course-workflow.js';
import { WrapAuthServices } from '../services/wrap-auth-services.js';
import { WrapUserServices } from '../services/wrap-user-services.js';
import { WrapCourseServices } from '../services/wrap-course-services.js';
import { AuthApiWorkflow } from '../workflow/api/auth-workflow.js';
import { CourseApiWorkflow } from '../workflow/api/course-workflow.js';

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
});

export { expect } from '@playwright/test';
