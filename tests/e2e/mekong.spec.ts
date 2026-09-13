import { test, expect } from '@playwright/test';
test('Mekong collects bonuses, loses lives, pauses, restarts and saves local results', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.clock.install();
  await page.goto('/play/mekong-boat-journey');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.clock.runFor(5300);
  expect(Number(await page.getByTestId('score').textContent())).toBeGreaterThan(100);
  await expect(page.locator('.life-icons')).toHaveAttribute('aria-label', '3');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const score = await page.getByTestId('score').textContent();
  await page.clock.runFor(2000);
  await expect(page.getByTestId('score')).toHaveText(score!);
  await page.locator('.button.primary').filter({ hasText: 'Resume' }).click();
  await page.clock.runFor(20000);
  await expect(page.getByRole('heading', { name: 'Nice run!' })).toBeVisible();
  await expect(page.locator('.life-icons')).toHaveAttribute('aria-label', '0');
  const best = await page.evaluate(() => JSON.parse(localStorage.getItem('bobby-portal')!).state.best['mekong-boat-journey']);
  expect(best).toBeGreaterThan(100);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.getByTestId('score')).toHaveText('0');
  await expect(page.locator('.life-icons')).toHaveAttribute('aria-label', '3');
  await page.reload();
  await expect(page.locator('.best-pill')).toContainText(String(best));
});

test('Mekong keyboard, pointer and touch steering avoid center hazards', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.clock.install();
  await page.goto('/play/mekong-boat-journey');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.keyboard.down('ArrowLeft');
  await page.clock.runFor(600);
  await page.keyboard.up('ArrowLeft');
  await page.clock.runFor(9000);
  await expect(page.locator('.life-icons')).toHaveAttribute('aria-label', '3');
  const canvas = page.locator('canvas');
  const bounds = (await canvas.boundingBox())!;
  await canvas.dispatchEvent('pointermove', { clientX: bounds.x + bounds.width * 0.72, clientY: bounds.y + bounds.height * 0.8 });
  await page.clock.runFor(1100);
  await page.clock.runFor(7000);
  await expect(page.locator('.life-icons')).toHaveAttribute('aria-label', '3');
  const left = page.getByRole('button', { name: 'Move left', exact: true });
  await left.dispatchEvent('pointerdown', { pointerId: 1 });
  await page.clock.runFor(1100);
  await left.dispatchEvent('pointerup', { pointerId: 1 });
  await page.clock.runFor(9000);
  await expect(page.locator('.life-icons')).toHaveAttribute('aria-label', '3');
  await page.locator('.header .brand').click();
  await page.goto('/recent');
  await expect(page.locator('.game-card h3')).toHaveText('Mekong Boat Journey');
});

test('Mekong assets, metadata, Khmer copy and favorites are connected', async ({ page, request }) => {
  for (const path of ['/art/mekong-boat-journey-480.webp', '/art/mekong-boat-journey-960.webp', ...['bg','boat','log','rock','basket'].map(id => '/sprites/mekong-' + id + '.webp')]) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
  await page.goto('/games?q=Mekong');
  await expect(page.locator('.game-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Favorite Mekong Boat Journey' }).click();
  await page.goto('/favorites');
  await expect(page.locator('.game-card h3')).toHaveText('Mekong Boat Journey');
  await page.goto('/games/mekong-boat-journey');
  await expect(page).toHaveTitle('Mekong Boat Journey — BobbyGames');
  await page.getByRole('button', { name: 'Language', exact: true }).click();
  await expect(page.locator('main h1')).toHaveText('ដំណើរទូកលើទន្លេមេគង្គ');
});
