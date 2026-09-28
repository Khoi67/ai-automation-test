const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(process.env.UI_BASE_URL + '/login');
  await page.fill('input[name="taiKhoan"], input[placeholder*="Tài khoản"]', process.env.TEST_USERNAME);
  await page.fill('input[type="password"]', process.env.TEST_PASSWORD);
  await page.click('button:has-text("Đăng nhập"), button[type="submit"]');
  
  await page.waitForTimeout(2000);
  await page.goto(process.env.UI_BASE_URL + '/thongtincanhan');
  await page.waitForTimeout(5000);
  
  const content = await page.locator('body').innerHTML();
  console.log(content);
  
  await browser.close();
})();
