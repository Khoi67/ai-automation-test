const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Login
  await page.goto('https://demo2.cybersoft.edu.vn/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="text"]', 'auto_testuser_20260922160653_131');
  await page.fill('input[type="password"]', 'Password@123');
  await page.getByRole('button', { name: /đăng nhập/i }).first().click();
  
  await page.waitForTimeout(3000);
  
  // Go to profile
  await page.goto('https://demo2.cybersoft.edu.vn/thongtincanhan', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const profileHtml = await page.innerHTML('body');
  
  const fs = require('fs');
  fs.writeFileSync('scratch/profile_body.html', profileHtml);
  
  console.log('Saved profile body');
  await browser.close();
})();
