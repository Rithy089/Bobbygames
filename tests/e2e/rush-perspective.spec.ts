import { test, expect } from '@playwright/test';

test('Rush road taps dodge traffic, keyboard returns, pause and best persist', async ({
  page,
  isMobile,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.clock.install();
  await page.goto('/play/tuk-tuk-rush');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  const canvas = page.locator('canvas');
  const box = (await canvas.boundingBox())!;
  // Select left lane in projected road coordinates, using a real touch on mobile.
  const position = { x: box.width * 0.355, y: box.height * 0.8 };
  if (isMobile) await canvas.tap({ position });
  else await canvas.click({ position });
  await page.clock.runFor(4700);
  await expect(page.getByRole('heading', { name: 'Nice run!' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const score = await page.getByTestId('score').textContent();
  await page.clock.runFor(1200);
  await expect(page.getByTestId('score')).toHaveText(score!);
  await page.locator('.button.primary').filter({ hasText: 'Resume' }).click();
  await canvas.press('ArrowRight');
  await page.clock.runFor(2200);
  await expect(page.getByRole('heading', { name: 'Nice run!' })).toBeVisible();
  const best = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('bobby-portal')!).state.best[
        'tuk-tuk-rush'
      ],
  );
  expect(best).toBeGreaterThan(100);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.getByTestId('score')).toHaveText('0');
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('bobby-portal')!).state.best[
          'tuk-tuk-rush'
        ],
    ),
  ).toBe(best);
});
