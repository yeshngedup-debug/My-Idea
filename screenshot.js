const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
  } catch (e) {
    await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 15000 });
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/landing-screenshot.png', fullPage: true });
  console.log('Screenshot saved to /tmp/landing-screenshot.png');
  await browser.close();
})();
