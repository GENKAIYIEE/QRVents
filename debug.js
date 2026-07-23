const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard');
  await page.goto('http://localhost:3000/admin/attendance');
  await page.waitForLoadState('networkidle');
  const selectEvent = await page.locator('select').first();
  const optionValue = await selectEvent.evaluate((sel) => {
    const options = Array.from(sel.options);
    const opt = options.find(o => o.text.includes('Test Export Event'));
    return opt ? opt.value : null;
  });
  await selectEvent.selectOption(optionValue);
  await page.waitForTimeout(2000);
  
  const btn = page.getByText('Export CSV', { exact: false });
  const disabled = await btn.isDisabled();
  console.log('Is Export button disabled?', disabled);
  
  const logsCount = await page.locator('tbody tr').count();
  console.log('Number of rows in table:', logsCount);

  if (!disabled) {
      console.log('Triggering export...');
      const [download] = await Promise.all([
          page.waitForEvent('download'),
          btn.click()
      ]);
      console.log('Downloaded to:', await download.path());
  }

  await page.screenshot({ path: 'attendance_page.png' });
  await browser.close();
})();
