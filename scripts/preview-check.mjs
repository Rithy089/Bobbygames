import { chromium } from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('test-results', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: 'dark',
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://127.0.0.1:5173/');
await page
  .getByRole('heading', { name: 'A little play.', exact: false })
  .waitFor();
await page.screenshot({
  path: 'test-results/home-desktop.png',
  fullPage: true,
});
await page.goto('http://127.0.0.1:5173/play/mango-catch');
await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Pause', exact: true }).click();
await page.screenshot({ path: 'test-results/mango-desktop.png' });
console.log(
  JSON.stringify({
    errors,
    paused: await page
      .getByRole('heading', { name: 'Take a little breather.' })
      .isVisible(),
  }),
);
await browser.close();
