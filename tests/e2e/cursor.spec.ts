import { test, expect } from '@playwright/test';

test('portfolio cursor follows mouse, labels links and yields to native controls', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const cursor = page.locator('.bobby-custom-cursor');
  await page.mouse.move(350, 200);
  if (isMobile) {
    await expect(cursor).toBeHidden();
    return;
  }
  await expect(cursor).toBeVisible();
  await expect(cursor).toHaveCSS('pointer-events', 'none');
  await page.locator('.header .brand').hover();
  await expect(cursor.locator('span')).toHaveText('GO');
  await page.locator('.header-search input').hover();
  await expect(cursor).toBeHidden();
  await page.goto('/play/mango-catch');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.locator('canvas').hover();
  await expect(cursor).toBeHidden();
  await page.locator('.header .brand').hover();
  await expect(cursor).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(cursor).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(360, 210);
  await expect(cursor).toBeHidden();
  expect(await page.locator('html').getAttribute('class')).not.toContain(
    'bobby-cursor-active',
  );
});
