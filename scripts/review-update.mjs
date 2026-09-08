import { chromium, devices } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch();
await fs.mkdir('outputs/review', { recursive: true });
try {
  for (const [name, options] of [
    ['desktop', { viewport: { width: 1440, height: 1050 } }],
    ['mobile', devices['Pixel 5']],
  ]) {
    const context = await browser.newContext({
      ...options,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    await page.clock.install();
    for (const route of [
      '/discover',
      '/play/mango-catch',
      '/play/temple-tower',
      '/play/tuk-tuk-rush',
      '/play/khmer-market-match',
    ]) {
      await page.goto('http://127.0.0.1:5173' + route);
      await page.locator('h1').waitFor();
      if (route.startsWith('/play')) {
        await page
          .getByRole('button', { name: 'Let’s play', exact: true })
          .click();
        if (route.endsWith('khmer-market-match')) {
          await page.locator('.match-card').nth(0).click();
          await page.locator('.match-card').nth(2).click();
        } else await page.clock.runFor(1600);
        await page
          .locator('.game-frame')
          .screenshot({
            path: `outputs/review/${name}-${route.split('/').pop()}.png`,
          });
      } else {
        await page
          .locator('.culture-picture img')
          .first()
          .evaluate((img) => img.decode());
        await page.screenshot({ path: `outputs/review/${name}-discover.png` });
      }
    }
    await page.goto('http://127.0.0.1:5173/play/khmer-market-match');
    await page.getByRole('button', { name: 'Language', exact: true }).click();
    await page.getByRole('button', { name: /^រូបរាង:|^Theme:/ }).count();
    await page.screenshot({ path: `outputs/review/${name}-market-km.png` });
    await context.close();
  }
} finally {
  await browser.close();
}
