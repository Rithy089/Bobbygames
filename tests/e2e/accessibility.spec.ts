import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('portal and player controls have no automated WCAG A/AA violations', async ({
  page,
}) => {
  test.setTimeout(60000);
  for (const theme of ['dark', 'light'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const route of [
      '/',
      '/games',
      '/play/mango-catch',
      '/profile',
      '/login',
      '/discover',
    ]) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  }
});
test('200 percent text remains within mobile layout', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expect(page.locator('.hero h1')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
