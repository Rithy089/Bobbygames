import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('market active cards respect reduced motion, language changes and accessibility', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto('/play/khmer-market-match');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.locator('.match-card').first().click();
  await page.getByRole('button', { name: 'Language', exact: true }).click();
  await expect(page.locator('.match-board img')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'km');
  expect(
    await page
      .locator('.match-card')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
import {
  makeDeck,
  difficulties,
  type Difficulty,
} from '../../src/games/khmer-market-match/rules';
for (const difficulty of Object.keys(difficulties) as Difficulty[])
  test(`market ${difficulty}: keyboard/touch completion and separate local best`, async ({
    page,
    isMobile,
  }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.5;
    });
    await page.clock.install();
    await page.goto('/play/khmer-market-match');
    await page
      .getByRole('group', { name: 'Board size' })
      .getByRole('button')
      .nth(Object.keys(difficulties).indexOf(difficulty))
      .click();
    await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
    const cards = page.locator('.match-card');
    expect(await cards.count()).toBe(difficulties[difficulty] * 2);
    await expect(cards.first()).toHaveAttribute('aria-label', /face down/);
    await expect(cards.locator('img')).toHaveCount(0);
    const deck = makeDeck(difficulty, () => 0.5);
    for (const object of new Set(deck)) {
      const indices = deck.flatMap((o, i) => (o === object ? [i] : []));
      await expect(cards.nth(indices[0])).toHaveAttribute(
        'aria-disabled',
        'false',
      );
      await cards.nth(indices[0]).focus();
      await cards.nth(indices[0]).press('Enter');
      await expect(cards.nth(indices[0])).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      if (isMobile) await cards.nth(indices[1]).tap();
      else await cards.nth(indices[1]).click();
      await page.clock.runFor(650);
    }
    await expect(
      page.getByRole('heading', { name: 'Market complete!' }),
    ).toBeVisible();
    await expect(page.getByTestId('match-moves')).toHaveText(
      String(difficulties[difficulty]),
    );
    const saved = await page.evaluate(
      () => JSON.parse(localStorage.getItem('bobby-market-best')!).state.best,
    );
    expect(saved[difficulty].moves).toBe(difficulties[difficulty]);
    expect(saved[difficulty].elapsedMs).toBeGreaterThan(0);
    await page.reload();
    await expect(page.locator('.match-bests')).toContainText(
      difficulties[difficulty] + ' moves',
    );
    await page.goto('/recent');
    await expect(page.locator('.game-card h3')).toContainText([
      'Khmer Market Match',
    ]);
  });
test('market rapid clicks, paused hidden cards, restart and timer cleanup', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.clock.install();
  await page.goto('/play/khmer-market-match');
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  const cards = page.locator('.match-card'),
    deck = makeDeck('easy', () => 0.5),
    other = deck.findIndex((o) => o !== deck[0]);
  await cards.nth(0).click();
  await cards.nth(0).dispatchEvent('click');
  await cards.nth(other).click();
  await cards.nth(11).dispatchEvent('click');
  await expect(page.getByTestId('match-moves')).toHaveText('1');
  await expect(cards.locator('img')).toHaveCount(2);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(cards.locator('img')).toHaveCount(0);
  const time = await page.getByTestId('match-time').textContent();
  await page.clock.runFor(5000);
  await expect(page.getByTestId('match-time')).toHaveText(time!);
  await page
    .getByRole('button', { name: 'Resume', exact: true })
    .first()
    .click();
  await page.clock.runFor(1000);
  await expect(cards.locator('img')).toHaveCount(0);
  await cards.first().press('Enter');
  await cards.first().press('ArrowRight');
  await expect(cards.nth(1)).toBeFocused();
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await page.clock.runFor(5000);
  await expect(page.getByTestId('match-moves')).toHaveText('0');
  await expect(page.getByTestId('match-time')).toHaveText('0:00');
  await expect(cards.locator('img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Let’s play', exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(
    page.getByRole('heading', { name: 'Take a little breather.' }),
  ).toBeVisible();
  await page.goto('/games');
  await page.clock.runFor(5000);
  expect(
    await page.evaluate(() => localStorage.getItem('bobby-market-best')),
  ).toBeNull();
});
