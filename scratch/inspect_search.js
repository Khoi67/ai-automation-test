const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to home and search for React
  await page.goto('https://demo2.cybersoft.edu.vn/', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder(/Tìm kiếm/i).first().fill('React');
  await page.keyboard.press('Enter');
  
  // Wait for results to load
  await page.waitForTimeout(3000);
  
  const searchHtml = await page.innerHTML('body');
  const fs = require('fs');
  fs.writeFileSync('scratch/search_body.html', searchHtml);
  
  console.log('Saved search body');
  await browser.close();
})();
