const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Inspect /khoahoc
  await page.goto('https://demo2.cybersoft.edu.vn/khoahoc', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const khoahocHtml = await page.innerHTML('body');
  const fs = require('fs');
  fs.writeFileSync('scratch/khoahoc_body.html', khoahocHtml);
  
  // Inspect /chitiet/0NJSD
  await page.goto('https://demo2.cybersoft.edu.vn/chitiet/0NJSD', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const chitietHtml = await page.innerHTML('body');
  fs.writeFileSync('scratch/chitiet_body.html', chitietHtml);
  
  console.log('Saved khoahoc and chitiet body');
  await browser.close();
})();
