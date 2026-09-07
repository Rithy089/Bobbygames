import { test, expect } from '@playwright/test';
test('static sharing metadata is game-specific without executing JavaScript', async ({
  request,
}) => {
  for (const [path, title, image] of [
    ['/', 'BobbyGames', '/og.png'],
    ['/games/mango-catch/', 'Mango Catch', '/art/mango-catch-960.webp'],
    ['/games/temple-tower/', 'Temple Tower', '/art/temple-tower-960.webp'],
  ]) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html).toContain('property="og:title" content="' + title);
    expect(html).toContain(image);
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('application/ld+json');
  }
  expect((await request.get('/sitemap.xml')).ok()).toBe(true);
  expect((await request.get('/robots.txt')).ok()).toBe(true);
});
