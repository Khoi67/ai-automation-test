const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://demo2.cybersoft.edu.vn/', { waitUntil: 'domcontentloaded' });
  
  // Wait for 3 seconds to let client-side JS render
  await page.waitForTimeout(3000);
  
  // Dump body html
  const html = await page.innerHTML('body');
  const fs = require('fs');
  fs.writeFileSync('scratch/home_body.html', html);
  
  console.log('Saved home body to scratch/home_body.html');
  await browser.close();
})();
