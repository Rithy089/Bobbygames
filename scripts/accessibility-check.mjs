import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const b = await chromium.launch();
for (const colorScheme of ['dark', 'light']) {
  const context = await b.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme,
  });
  const page = await context.newPage();
  for (const route of [
    '/',
    '/games',
    '/play/mango-catch',
    '/profile',
    '/login',
    '/discover',
  ]) {
    await page.goto('http://127.0.0.1:5173' + route);
    await page.locator('main h1').waitFor();
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    console.log(
      JSON.stringify({
        colorScheme,
        route,
        violations: r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      }),
    );
  }
  await context.close();
}
await b.close();
