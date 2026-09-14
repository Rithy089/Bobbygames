import { test, expect } from '@playwright/test';
test('boat moves vertically, diagonally and by touch, with stable pause and reduced motion', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (this: CanvasRenderingContext2D, ...args: Parameters<typeof draw>) {
      const img = args[0];
      if (img instanceof HTMLImageElement && img.src.includes('mekong-boat.webp')) {
        const matrix = this.getTransform();
        Reflect.set(window, 'boatPosition', { x: matrix.e, y: matrix.f, angle: Math.atan2(matrix.b, matrix.a) });
      }
      return draw.apply(this, args);
    } as typeof draw;
  });
  const position = () => page.evaluate(() => Reflect.get(window, 'boatPosition') as {x: number; y: number; angle: number});
  await page.clock.install();
  await page.goto('/play/mekong-boat-journey');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.keyboard.down('w'); await page.clock.runFor(400); await page.keyboard.up('w');
  expect((await position()).y).toBeLessThan(365);
  await page.keyboard.down('ArrowRight'); await page.keyboard.down('ArrowUp');
  const before = await position(); await page.clock.runFor(300);
  await page.keyboard.up('ArrowRight'); await page.keyboard.up('ArrowUp');
  const after = await position();
  expect(after.x).toBeGreaterThan(before.x + 60); expect(after.y).toBeLessThan(before.y - 60);
  const canvas = page.locator('canvas'); const box = (await canvas.boundingBox())!;
  const target = { x: box.x + box.width * 0.4, y: box.y + box.height * 0.7 };
  if (isMobile) await page.touchscreen.tap(target.x, target.y);
  else await page.mouse.move(target.x, target.y);
  await page.clock.runFor(1000);
  expect((await position()).y).toBeCloseTo(420, -1);
  expect((await position()).x).toBeCloseTo(320, -1);
  const up = page.getByRole('button', { name: 'Move up', exact: true });
  await up.dispatchEvent('pointerdown', { pointerId: 3 }); await page.clock.runFor(250);
  await up.dispatchEvent('pointercancel', { pointerId: 3 }); await page.clock.runFor(100);
  const stopped = await position(); await page.clock.runFor(300);
  expect(Math.abs((await position()).y - stopped.y)).toBeLessThan(3);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await canvas.screenshot(); await page.clock.runFor(500);
  expect(await canvas.screenshot()).toEqual(paused);
  await page.locator('.button.primary').filter({ hasText: 'Resume' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.clock.runFor(100);
  expect((await position()).angle).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
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
