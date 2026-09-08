import { test, expect } from '@playwright/test';
test('discovery illustrations load with accessible bilingual text and preserved developer links', async ({
  page,
}) => {
  await page.goto('/discover');
  await expect(page.locator('.culture-picture img')).toHaveCount(8);
  for (const img of await page.locator('.culture-picture img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        img.evaluate(
          (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expect(img).toHaveAttribute('alt', /illustrat/i);
    await expect(img).toHaveAttribute('width', '960');
  }
  await expect(
    page
      .locator('footer')
      .getByRole('link', { name: 'Source code', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/Rithy089/Bobbygames');
  await expect(
    page.locator('footer').getByRole('link', { name: 'GitHub', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/Rithy089');
  await expect(
    page
      .locator('footer')
      .getByRole('link', { name: 'Portfolio', exact: true }),
  ).toHaveAttribute('href', 'https://sayrithy-portfolio.vercel.app/');
  await page.getByRole('button', { name: 'Language', exact: true }).click();
  await expect(page.locator('.culture-picture img').first()).toHaveAttribute(
    'alt',
    /រូបគំនូរ/,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
