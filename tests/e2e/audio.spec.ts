import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const contexts: AudioContext[] = [];
    const analysers: AnalyserNode[] = [];
    const sources = new Set<AudioBufferSourceNode>();
    const Native = window.AudioContext;
    class ObservedContext extends Native {
      constructor() {
        super();
        contexts.push(this);
        const analyser = super.createAnalyser();
        analyser.connect(this.destination);
        analysers.push(analyser);
      }
      createGain() {
        const gain = super.createGain();
        const nativeConnect = gain.connect.bind(gain);
        gain.connect = ((destination: AudioNode) =>
          nativeConnect(
            destination === this.destination
              ? analysers[contexts.indexOf(this)]
              : destination,
          )) as typeof gain.connect;
        return gain;
      }
      createBufferSource() {
        const source = super.createBufferSource();
        const start = source.start.bind(source),
          stop = source.stop.bind(source);
        source.start = (...args) => {
          sources.add(source);
          start(...args);
        };
        source.stop = (...args) => {
          sources.delete(source);
          stop(...args);
        };
        source.addEventListener('ended', () => sources.delete(source));
        return source;
      }
    }
    window.AudioContext = ObservedContext;
    Object.assign(window, {
      audioProbe: {
        contexts,
        sources,
        rms: () => {
          const analyser = analysers.at(-1);
          if (!analyser) return 0;
          const data = new Float32Array(analyser.fftSize);
          analyser.getFloatTimeDomainData(data);
          return Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length);
        },
      },
    });
  });
});
const probe = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const p = Reflect.get(window, 'audioProbe') as {
      contexts: AudioContext[];
      sources: Set<AudioBufferSourceNode>;
      rms: () => number;
    };
    return {
      states: p.contexts.map((c) => c.state),
      tracks: [...p.sources].filter((s) => s.loop).length,
      voices: p.sources.size,
      rms: p.rms(),
    };
  });

test('music stays audible when sound effects are switched off in every game', async ({
  page,
}) => {
  for (const game of [
    'mango-catch',
    'temple-tower',
    'tuk-tuk-rush',
    'khmer-market-match',
  ]) {
    await page.goto('/play/' + game);
    await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
    const effects = page.getByRole('button', {
      name: 'Sound effects',
      exact: true,
    });
    if ((await effects.getAttribute('aria-pressed')) === 'true')
      await effects.click();
    await expect(effects).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.getByRole('switch', { name: 'Music', exact: true }),
    ).toBeChecked();
    await expect(
      page.getByRole('switch', { name: 'Mute all audio', exact: true }),
    ).not.toBeChecked();
    await expect.poll(async () => (await probe(page)).tracks).toBe(1);
    await expect
      .poll(async () => (await probe(page)).rms)
      .toBeGreaterThan(0.0005);
    if (game === 'khmer-market-match') {
      await page.locator('.match-card').first().click();
      expect((await probe(page)).voices).toBe(1);
    }
  }
});
test('each game produces real audio after Start and releases its track on navigation', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const game of [
    'mango-catch',
    'temple-tower',
    'tuk-tuk-rush',
    'khmer-market-match',
  ]) {
    await page.goto('/play/' + game);
    expect((await probe(page)).states).toHaveLength(0);
    await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
    await expect.poll(async () => (await probe(page)).tracks).toBe(1);
    await expect
      .poll(async () => (await probe(page)).rms)
      .toBeGreaterThan(0.0005);
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Restart', exact: true }).click();
      if (game === 'khmer-market-match')
        await page
          .getByRole('button', { name: 'Let’s play', exact: true })
          .click();
      await expect.poll(async () => (await probe(page)).tracks).toBe(1);
    }
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect
      .poll(async () => (await probe(page)).states.at(-1))
      .toBe('suspended');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(
      page.getByRole('heading', { name: 'Take a little breather.' }),
    ).toBeVisible();
    expect((await probe(page)).tracks).toBe(0);
    await page.locator('.button.primary').filter({ hasText: 'Resume' }).click();
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await expect
      .poll(async () => (await probe(page)).states.at(-1))
      .toBe('suspended');
    await page.locator('.button.primary').filter({ hasText: 'Resume' }).click();
    await expect.poll(async () => (await probe(page)).tracks).toBe(1);
    await page.locator('.header .brand').click();
    await expect
      .poll(async () => (await probe(page)).states.every((s) => s === 'closed'))
      .toBe(true);
    expect((await probe(page)).voices).toBe(0);
  }
  expect(errors).toEqual([]);
});
test('blocked resume has a working Enable sound retry', async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      constructor() {
        super();
        void this.suspend();
      }
      resume() {
        return Reflect.get(window, 'allowAudioRetry')
          ? super.resume()
          : Promise.reject(
              new DOMException(
                'Injected playback restriction',
                'NotAllowedError',
              ),
            );
      }
    };
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/play/temple-tower');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await expect(
    page.getByText(
      'Playback is paused or blocked by your browser. Press Enable sound to retry.',
    ),
  ).toBeVisible();
  await page.evaluate(() => Reflect.set(window, 'allowAudioRetry', true));
  await page.getByRole('button', { name: 'Enable sound', exact: true }).click();
  await expect.poll(async () => (await probe(page)).tracks).toBe(1);
  await expect
    .poll(async () => (await probe(page)).rms)
    .toBeGreaterThan(0.0005);
  expect(errors).toEqual([]);
});

test('saved mute remains silent and new independent volumes persist', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'bobby-portal',
      JSON.stringify({
        version: 1,
        state: {
          audio: { sound: false, music: true, effects: true, volume: 0.35 },
        },
      }),
    ),
  );
  for (const game of [
    'mango-catch',
    'tuk-tuk-rush',
    'khmer-market-match',
    'temple-tower',
  ]) {
    await page.goto('/play/' + game);
    await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
    expect((await probe(page)).states).toHaveLength(0);
  }
  await page
    .getByRole('switch', { name: 'Mute all audio', exact: true })
    .click();
  await expect.poll(async () => (await probe(page)).tracks).toBe(1);
  await page.getByRole('slider', { name: 'Music volume', exact: true }).focus();
  await page.keyboard.press('Home');
  await expect.poll(async () => (await probe(page)).rms).toBeLessThan(0.0001);
  await page
    .getByRole('slider', { name: 'Sound-effects volume', exact: true })
    .focus();
  await page.keyboard.press('Home');
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem('bobby-portal')!).state.audio,
  );
  expect(saved.musicVolume).toBe(0);
  expect(saved.effectsVolume).toBe(0);
  expect(saved.volume).toBe(0.35);
});
test('failed audio preparation does not stop gameplay or masquerade as browser blocking', async ({
  page,
}) => {
  await page.addInitScript(() => {
    AudioContext.prototype.createBuffer = () => {
      throw new Error('Injected synthesis failure');
    };
  });
  await page.goto('/play/tuk-tuk-rush');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await expect(
    page.getByText(
      'The soundtrack or sound effect could not be prepared. You can keep playing silently.',
    ),
  ).toBeVisible();
  await expect(page.getByTestId('score')).not.toHaveText('0');
  await expect(
    page.getByText(
      'Playback is paused or blocked by your browser. Press Enable sound to retry.',
    ),
  ).toHaveCount(0);
});

test('effects-only card audio follows its own volume independently of music', async ({
  page,
}) => {
  await page.goto('/play/khmer-market-match');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  for (const name of ['Music volume', 'Sound-effects volume']) {
    await page.getByRole('slider', { name, exact: true }).focus();
    await page.keyboard.press('Home');
  }
  await expect.poll(async () => (await probe(page)).rms).toBeLessThan(0.0001);
  await page.locator('.match-card').nth(0).click();
  expect((await probe(page)).rms).toBeLessThan(0.0001);
  await page
    .getByRole('slider', { name: 'Sound-effects volume', exact: true })
    .focus();
  await page.keyboard.press('End');
  await page.locator('.match-card').nth(1).click();
  await expect
    .poll(async () => (await probe(page)).rms, { intervals: [20, 30, 50] })
    .toBeGreaterThan(0.0005);
});
