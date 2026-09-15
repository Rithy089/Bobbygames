import { test, expect } from '@playwright/test';

test('keyboard and touch movement collect rice with reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/play/rice-field-adventure');
  await page.getByRole('button', { name: /Let.s play/, exact: true }).click();
  await page.locator('canvas').focus();
  await page.keyboard.down('ArrowUp');
  await page.clock.runFor(1000);
  await page.keyboard.up('ArrowUp');
  const right = page.getByRole('button', { name: 'Move right', exact: true });
  await right.scrollIntoViewIfNeeded();
  const box = (await right.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.clock.runFor(200);
  await page.mouse.up();
  await page.clock.runFor(150);
  await expect(page.getByTestId('score')).toHaveText('100');
});

test('harvest, delivery, pause, restart and local best on a responsive field', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.clock.install();
  await page.goto('/play/rice-field-adventure');
  await page.getByRole('button', { name: /Let.s play/, exact: true }).click();
  const canvas = page.locator('canvas');
  const visit = async (x: number, y: number, ms = 3500) => {
    const box = (await canvas.boundingBox())!;
    await canvas.dispatchEvent('pointermove', {
      clientX: box.x + (x / 800) * box.width,
      clientY: box.y + (y / 600) * box.height,
    });
    await page.clock.runFor(ms);
  };
  await visit(180, 120);
  await expect(page.getByTestId('score')).toHaveText('200');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.clock.runFor(3000);
  await expect(page.getByTestId('score')).toHaveText('200');
  await page
    .getByRole('button', { name: 'Resume', exact: true })
    .first()
    .click();
  for (const [x, y] of [
    [330, 110],
    [490, 120],
    [670, 110],
    [130, 300],
    [310, 280],
    [485, 300],
    [700, 280],
    [220, 480],
    [370, 490],
    [540, 475],
    [700, 490],
  ])
    await visit(x, y);
  await expect(page.getByTestId('score')).toHaveText('1200');
  await visit(90, 500, 4000);
  await expect(
    page.getByRole('heading', { name: 'Harvest delivered!' }),
  ).toBeVisible();
  const best = Number(await page.getByTestId('score').textContent());
  expect(best).toBeGreaterThan(1200);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.getByTestId('score')).toHaveText('0');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('bobby-portal')!).state.best[
          'rice-field-adventure'
        ],
    ),
  ).toBe(best);
});
