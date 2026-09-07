import { test, expect } from '@playwright/test';
test('Mango Catch scoring, pause, restart, game-over and persistence', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.clock.install();
  await page.goto('/play/mango-catch');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.clock.runFor(6500);
  await expect(page.getByTestId('score')).not.toHaveText('0');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const score = await page.getByTestId('score').textContent();
  await page.clock.runFor(2000);
  await expect(page.getByTestId('score')).toHaveText(score!);
  await expect(
    page.getByRole('heading', { name: 'Take a little breather.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.getByTestId('score')).toHaveText('0');
  await page.clock.runFor(6000);
  await page
    .getByRole('button', { name: 'Move left', exact: true })
    .dispatchEvent('pointerdown', { pointerId: 1, clientX: 20 });
  await page.clock.runFor(500);
  await page
    .getByRole('button', { name: 'Move left', exact: true })
    .dispatchEvent('pointerup', { pointerId: 1 });
  await page.clock.runFor(8000);
  await expect(page.getByRole('heading', { name: 'Nice run!' })).toBeVisible();
  await expect(
    page.getByText('Personal best saved on this device.'),
  ).toBeVisible();
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('bobby-portal')!).state.best[
          'mango-catch'
        ],
    ),
  ).toBeGreaterThan(0);
});
for (const game of ['temple-tower', 'tuk-tuk-rush'])
  test(
    game + ' starts, accepts touch input, pauses and restarts',
    async ({ page }) => {
      await page.clock.install();
      await page.goto('/play/' + game);
      await page
        .getByRole('button', { name: 'Let’s play', exact: true })
        .click();
      await page.clock.runFor(game === 'temple-tower' ? 1650 : 1500);
      if (game === 'temple-tower') {
        await page
          .getByRole('button', { name: 'Place block', exact: true })
          .click();
        await page.clock.runFor(60);
        await expect(page.getByTestId('score')).toHaveText('1');
      } else {
        await page
          .getByRole('button', { name: 'Move right', exact: true })
          .dispatchEvent('pointerdown', { pointerId: 2 });
        await page
          .getByRole('button', { name: 'Move right', exact: true })
          .dispatchEvent('pointerup', { pointerId: 2 });
        await page.clock.runFor(250);
        await expect(page.getByTestId('score')).not.toHaveText('0');
      }
      await page.getByRole('button', { name: 'Pause', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Take a little breather.' }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Restart', exact: true }).click();
      await expect(page.getByTestId('score')).toHaveText('0');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    },
  );
test('game animation stops after leaving the route', async ({ page }) => {
  await page.addInitScript(() => {
    const pending = new Set<number>();
    const request = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      const id = request((t) => {
        pending.delete(id);
        cb(t);
      });
      pending.add(id);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      pending.delete(id);
      cancel(id);
    };
    Object.defineProperty(window, 'pendingGameFrames', {
      get: () => pending.size,
    });
  });
  await page.goto('/play/mango-catch');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.locator('.header .brand').click();
  await expect(page.locator('.hero')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, 'pendingGameFrames')))
    .toBe(0);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('Temple Tower and Tuk-Tuk Rush reach game-over and save runs', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.clock.install();
  await page.goto('/play/temple-tower');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.clock.runFor(1750);
  await page.getByRole('button', { name: 'Place block', exact: true }).click();
  await page.clock.runFor(16);
  await expect(page.getByTestId('score')).toHaveText('1');
  await page.getByRole('button', { name: 'Place block', exact: true }).click();
  await page.clock.runFor(16);
  await expect(page.getByRole('heading', { name: 'Nice run!' })).toBeVisible();
  await page.goto('/play/tuk-tuk-rush');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.clock.runFor(4500);
  await expect(page.getByRole('heading', { name: 'Nice run!' })).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('bobby-portal')!).state.runs.length,
    ),
  ).toBe(2);
});
