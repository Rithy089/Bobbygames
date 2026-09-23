import { test, expect } from '@playwright/test';

test('a continuous run reaches Angkor and riverside scenes, then restart restores forest', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.addInitScript(() => {
    Math.random = () => 0; // Logs after the introductory branch; normal collision rules.
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    let threats: number[] = [];
    CanvasRenderingContext2D.prototype.drawImage = function (
      this: CanvasRenderingContext2D,
      ...args: Parameters<typeof draw>
    ) {
      const image = args[0];
      if (image instanceof HTMLImageElement) {
        if (
          /runner-(forward|angkor-vista|siem-reap-river|courtyard|green-trail)-bg/.test(
            image.src,
          )
        ) {
          threats = [];
          Reflect.set(window, 'runnerEnvironment', image.src);
        }
        if (/runner-(log-v2|gate-v2)\.webp/.test(image.src)) {
          const scale =
            Number(args[3]) / (image.src.includes('gate') ? 200 : 122);
          const bottom = Number(args[2]) + Number(args[4]);
          if (bottom > 395 && bottom < 500)
            threats.push(
              Math.round(
                (Number(args[1]) + Number(args[3]) / 2 - 400) / (170 * scale),
              ),
            );
        }
        if (/runner-rear-/.test(image.src))
          Reflect.set(window, 'runnerThreats', [...threats]);
      }
      return draw.apply(this, args);
    } as typeof draw;
  });
  await page.clock.install();
  await page.goto('/play/angkor-runner');
  await page.getByRole('button', { name: /Let.s play/, exact: true }).click();
  let lane = 0;
  const seen = new Set<string>();
  let riversideFrames = 0;
  for (let i = 0; i < 330; i++) {
    const threats = await page.evaluate(
      () => (Reflect.get(window, 'runnerThreats') as number[]) || [],
    );
    if (threats.includes(lane)) {
      const safe = [-1, 0, 1].find((value) => !threats.includes(value))!;
      while (lane !== safe) {
        await page.keyboard.press(lane < safe ? 'ArrowRight' : 'ArrowLeft');
        lane += lane < safe ? 1 : -1;
        await page.clock.runFor(140);
      }
    }
    await page.clock.runFor(200);
    const environment = await page.evaluate(() =>
      String(Reflect.get(window, 'runnerEnvironment')),
    );
    seen.add(environment.split('/').pop()!);
    if (environment.includes('siem-reap-river')) riversideFrames++;
    if (environment.includes('angkor-vista') && i % 20 === 0)
      await page.locator('canvas').screenshot({
        path: `outputs/review/runner-angkor-${test.info().project.name}.png`,
      });
    if (environment.includes('siem-reap-river') && i % 20 === 0)
      await page.locator('canvas').screenshot({
        path: `outputs/review/runner-river-${test.info().project.name}.png`,
      });
    if (riversideFrames > 12) break;
  }
  expect([...seen]).toEqual(
    expect.arrayContaining([
      'runner-forward-bg.webp',
      'runner-angkor-vista-bg.webp',
      'runner-siem-reap-river-bg.webp',
    ]),
  );
  await expect(
    page.getByRole('heading', { name: 'Nice run!' }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await page.locator('canvas').screenshot();
  await page.clock.runFor(1500);
  expect(await page.locator('canvas').screenshot()).toEqual(paused);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await page.clock.runFor(50);
  expect(
    await page.evaluate(() => Reflect.get(window, 'runnerEnvironment')),
  ).toContain('runner-forward-bg');
});
