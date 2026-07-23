const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard');
  await page.goto('http://localhost:3000/admin/attendance');
  await page.waitForLoadState('networkidle');
  const selects = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('select')).map(s => s.outerHTML);
  });
  console.log(selects);
  await browser.close();
})();
