import { test, expect } from '@playwright/test';

test('runner jumps, slides, pauses, ends and preserves a local best', async ({
  page,
  isMobile,
}) => {
  await page.addInitScript(() => {
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (
      this: CanvasRenderingContext2D,
      ...args: Parameters<typeof draw>
    ) {
      const image = args[0];
      if (
        image instanceof HTMLImageElement &&
        /runner-(run-a|run-b|jump|slide)\.webp/.test(image.src)
      )
        Reflect.set(window, 'runnerPose', {
          src: image.src,
          y: Number(args[2]),
        });
      return draw.apply(this, args);
    } as typeof draw;
  });
  await page.clock.install();
  await page.goto('/play/angkor-runner');
  await page.getByRole('button', { name: /Let.s play/, exact: true }).click();
  const pose = () =>
    page.evaluate(
      () => Reflect.get(window, 'runnerPose') as { src: string; y: number },
    );
  await page.keyboard.press('Space');
  await page.clock.runFor(250);
  expect((await pose()).src).toContain('runner-jump');
  expect((await pose()).y).toBeLessThan(300);
  await page.clock.runFor(800);
  if (isMobile) {
    await page.getByRole('button', { name: 'Slide', exact: true }).tap();
  } else await page.keyboard.press('ArrowDown');
  await page.clock.runFor(200);
  expect((await pose()).src).toContain('runner-slide');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const score = await page.getByTestId('score').textContent();
  await page.clock.runFor(2000);
  await expect(page.getByTestId('score')).toHaveText(score!);
  await page
    .getByRole('button', { name: 'Resume', exact: true })
    .first()
    .click();
  await page.clock.runFor(15000);
  await expect(page.getByRole('heading', { name: 'Nice run!' })).toBeVisible();
  const best = Number(await page.getByTestId('score').textContent());
  expect(best).toBeGreaterThan(100);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.getByTestId('score')).toHaveText('0');
  await expect(page.locator('.life-icons')).toHaveAttribute('aria-label', '3');
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('bobby-portal')!).state.best[
          'angkor-runner'
        ],
    ),
  ).toBe(best);
});

test('runner assets, reduced motion and catalog integration', async ({
  page,
}) => {
  const failures: string[] = [];
  page.on('response', (r) => {
    if (r.url().includes('/sprites/') && !r.ok()) failures.push(r.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/play/angkor-runner');
  await page.getByRole('button', { name: /Let.s play/, exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  expect(failures).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto('/recent');
  await expect(page.locator('.game-card h3').first()).toHaveText(
    'Angkor Runner',
  );
  await page.goto('/games?q=Angkor');
  await expect(page.locator('.game-card h3')).toHaveText(['Angkor Runner']);
});
