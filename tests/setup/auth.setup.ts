import { test as setup, expect } from '../../fixture/page-fixture.js';
import path from 'path';
import fs from 'fs';

const authFile = path.resolve('.auth/user.json');

setup(
  'Authenticate as standard test user and save storage state',
  async ({ page, loginPage, authApiWorkflow }) => {
    // Ensure the directory exists
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Ensure test account is available and valid
    const user = await authApiWorkflow.ensureTestAccount();

    // Perform login via UI
    await loginPage.goToLoginPage();
    await loginPage.login(user.taiKhoan, user.matKhau);

    // Assert login successfully redirects away from /login
    await expect(page, 'Redirection after login success').not.toHaveURL(/\/login/, {
      timeout: 15_000,
    });

    // Save the signed-in storage state (cookies + localStorage)
    await page.context().storageState({ path: authFile });
  },
);
