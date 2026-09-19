import { test, expect } from '@playwright/test';

test('four-way swipes, taps and cancelled gestures control the forward runner', async ({
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
      if (image instanceof HTMLImageElement && /runner-rear-/.test(image.src))
        Reflect.set(window, 'rearPose', {
          src: image.src,
          x: Number(args[1]),
          y: Number(args[2]),
        });
      return draw.apply(this, args);
    } as typeof draw;
  });
  await page.clock.install();
  await page.goto('/play/angkor-runner');
  await page.getByRole('button', { name: /Let.s play/, exact: true }).click();
  const canvas = page.locator('canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!,
    x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  const client = await page.context().newCDPSession(page);
  const swipe = async (dx: number, dy: number, cancel = false) => {
    if (isMobile) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y }],
      });
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + dx, y: y + dy }],
      });
      await client.send('Input.dispatchTouchEvent', {
        type: cancel ? 'touchCancel' : 'touchEnd',
        touchPoints: [],
      });
    } else {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + dx, y + dy, { steps: 3 });
      if (cancel) await canvas.dispatchEvent('pointercancel');
      await page.mouse.up();
    }
    await page.clock.runFor(200);
  };
  const pose = () =>
    page.evaluate(
      () =>
        Reflect.get(window, 'rearPose') as {
          src: string;
          x: number;
          y: number;
        },
    );
  await swipe(-65, 0);
  expect((await pose()).x).toBeLessThan(250);
  await swipe(65, 0);
  expect((await pose()).x).toBeGreaterThan(350);
  await swipe(0, -65);
  expect((await pose()).src).toContain('rear-jump');
  await page.clock.runFor(800);
  await swipe(0, 65);
  expect((await pose()).src).toContain('rear-slide');
  await page.clock.runFor(800);
  await swipe(-65, 0, true);
  expect((await pose()).x).toBeGreaterThan(350);
  expect((await pose()).src).toContain('rear-run');
  await swipe(0, 0);
  expect((await pose()).src).toContain('rear-jump');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await canvas.screenshot();
  await page.clock.runFor(1000);
  expect(await canvas.screenshot()).toEqual(paused);
  await client.detach();
});

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
        /runner-rear-(run-a|run-b|jump|slide)\.webp/.test(image.src)
      )
        Reflect.set(window, 'runnerPose', {
          src: image.src,
          y: Number(args[2]),
          x: Number(args[1]),
        });
      return draw.apply(this, args);
    } as typeof draw;
  });
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.clock.install();
  await page.goto('/play/angkor-runner');
  await page.getByRole('button', { name: /Let.s play/, exact: true }).click();
  const pose = () =>
    page.evaluate(
      () =>
        Reflect.get(window, 'runnerPose') as {
          src: string;
          y: number;
          x: number;
        },
    );
  await page.keyboard.press('ArrowLeft');
  await page.clock.runFor(200);
  expect((await pose()).x).toBeLessThan(250);
  await page.keyboard.press('ArrowRight');
  await page.clock.runFor(200);
  expect((await pose()).x).toBeGreaterThan(350);
  await page.keyboard.press('Space');
  await page.clock.runFor(250);
  expect((await pose()).src).toContain('runner-rear-jump');
  expect((await pose()).y).toBeLessThan(300);
  await page.clock.runFor(800);
  if (isMobile) {
    await page.getByRole('button', { name: 'Slide', exact: true }).tap();
  } else await page.keyboard.press('ArrowDown');
  await page.clock.runFor(200);
  expect((await pose()).src).toContain('runner-rear-slide');
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
  isMobile,
}) => {
  const failures: string[] = [];
  page.on('response', (r) => {
    if (r.url().includes('/sprites/') && !r.ok()) failures.push(r.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/play/angkor-runner');
  await page.getByRole('button', { name: /Let.s play/, exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const bounds = await page.locator('canvas').boundingBox();
  if (isMobile) {
    expect(bounds!.height / bounds!.width).toBeGreaterThan(1.1);
    // Portrait cropping preserves at least the 520-world-pixel gameplay corridor.
    expect(bounds!.width / (bounds!.height / 600)).toBeGreaterThanOrEqual(519);
  }
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
