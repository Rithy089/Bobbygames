import { test, expect } from '@playwright/test';
test('home has original games and no game engines downloaded', async ({
  page,
}) => {
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'A little play. A lot of Cambodia.' }),
  ).toBeVisible();
  await expect(page.locator('.game-card')).toHaveCount(3);
  await expect(page.locator('.cover img').first()).toBeVisible();
  expect(requested.some((u) => /engine-/.test(u))).toBe(false);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test('search, categories, sorting and favorites persist', async ({ page }) => {
  await page.goto('/games');
  await page
    .locator('main')
    .getByRole('textbox', { name: 'Find your next little adventure' })
    .fill('Mango');
  await expect(page.locator('.game-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Favorite Mango Catch' }).click();
  await page.goto('/favorites');
  await expect(page.locator('.game-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.game-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Favorite Mango Catch' }).click();
  await expect(page.locator('.game-card')).toHaveCount(0);
  await page.goto('/games');
  await page.getByRole('button', { name: 'Precision', exact: true }).click();
  await expect(page.locator('.game-card h3')).toHaveText(['Temple Tower']);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('combobox', { name: 'Sort games' }).click();
  await page.getByRole('option', { name: 'Newest', exact: true }).click();
  await expect(page.locator('.game-card h3').first()).toHaveText(
    'Tuk-Tuk Rush',
  );
});
test('Khmer and theme survive reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Language', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'km');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'លេងបន្តិច។ ស្គាល់កម្ពុជាច្រើន។' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'ភាសា', exact: true }).click();
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
test('routes, safe developer links and unavailable auth are honest', async ({
  page,
}) => {
  for (const route of [
    '/discover',
    '/about',
    '/profile',
    '/privacy',
    '/terms',
    '/leaderboards',
    '/games/temple-tower',
    '/unknown',
  ]) {
    await page.goto(route);
    await expect(page.locator('main h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page.locator('main h1')).toHaveText(
    'Looks like you took a little detour.',
  );
  await page.goto('/about');
  await expect(
    page.getByRole('link', { name: 'View Bobby’s Portfolio' }),
  ).toHaveAttribute('href', 'https://sayrithy-portfolio.vercel.app/');
  await expect(
    page.getByRole('link', { name: 'View Bobby’s Portfolio' }),
  ).toHaveAttribute('rel', 'noopener noreferrer');
  await page.goto('/login');
  await expect(page.getByText(/Accounts are not connected yet/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Log in', exact: true }),
  ).toBeDisabled();
  await page.goto('/leaderboards');
  await expect(page.getByText(/Global rankings will open/)).toBeVisible();
});
test('mobile menu opens and closes with navigation', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.locator('.sidebar')).toBeVisible();
  await page
    .locator('.sidebar')
    .getByRole('link', { name: 'Favorites', exact: true })
    .click();
  await expect(page).toHaveURL(/favorites/);
  await expect(page.locator('.sidebar')).not.toBeVisible();
});
