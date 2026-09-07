import fs from 'node:fs';
import { loadEnv } from 'vite';
const env = loadEnv('production', process.cwd(), 'VITE_');
const origin = (
  process.env.VITE_SITE_URL ||
  env.VITE_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL
    : '') ||
  'https://bobbygames.sayrithy089.chatgpt.site'
).replace(/\/$/, '');
const parsed = new URL(origin);
if (!['http:', 'https:'].includes(parsed.protocol))
  throw Error('Invalid site origin');
const description =
  'Play original mini-games inspired by Cambodia. Created by Say Rithy (Bobby), a web developer in Phnom Penh.';
const titles = {
  '/': 'BobbyGames — A little play. A lot of Cambodia.',
  '/games': 'All games — BobbyGames',
  '/categories': 'Game categories — BobbyGames',
  '/discover': 'Discover Cambodia — BobbyGames',
  '/about': 'About Bobby — BobbyGames',
  '/developer': 'Say Rithy (Bobby) — BobbyGames',
  '/leaderboards': 'Leaderboards — BobbyGames',
  '/privacy': 'Privacy — BobbyGames',
  '/terms': 'Terms — BobbyGames',
  '/login': 'Log in — BobbyGames',
  '/profile': 'My profile — BobbyGames',
  '/favorites': 'Favorites — BobbyGames',
  '/recent': 'Recently played — BobbyGames',
  '/reset-password': 'Reset password — BobbyGames',
};
const gameData = [
  [
    'mango-catch',
    'Mango Catch',
    'Catch mangoes and dragon fruit, avoid stones, and keep your basket’s combo alive.',
  ],
  [
    'temple-tower',
    'Temple Tower',
    'Stack an original fantasy sandstone tower inspired by Khmer architecture.',
  ],
  [
    'tuk-tuk-rush',
    'Tuk-Tuk Rush',
    'Drive a tuk-tuk along an original Phnom Penh-inspired street. Avoid traffic and collect safe bonus tokens.',
  ],
];
const pages = Object.entries(titles).map(([path, title]) => ({
  path,
  title,
  description,
  image: '/og.png',
  game: false,
}));
for (const [id, title, desc] of gameData)
  for (const prefix of ['/games/', '/play/'])
    pages.push({
      path: prefix + id,
      title: title + ' — BobbyGames',
      description: desc,
      image: '/art/' + id + '-960.webp',
      game: true,
    });
const base = fs.readFileSync('dist/index.html', 'utf8');
const escape = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
for (const page of pages) {
  const url = origin + page.path;
  const schema = page.game
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: page.title.replace(' — BobbyGames', ''),
        description: page.description,
        url,
        image: origin + page.image,
        gamePlatform: 'Web browser',
        applicationCategory: 'Game',
        operatingSystem: 'Any',
        inLanguage: ['en', 'km'],
        isAccessibleForFree: true,
        author: {
          '@type': 'Person',
          name: 'Say Rithy',
          alternateName: 'Bobby',
          url: 'https://sayrithy-portfolio.vercel.app/',
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'BobbyGames',
        url: origin,
        description,
        inLanguage: ['en', 'km'],
        creator: {
          '@type': 'Person',
          name: 'Say Rithy',
          alternateName: 'Bobby',
          url: 'https://sayrithy-portfolio.vercel.app/',
        },
      };
  const tags =
    '<link rel="canonical" href="' +
    escape(url) +
    '"/>' +
    Object.entries({
      'og:title': page.title,
      'og:description': page.description,
      'og:type': 'website',
      'og:url': url,
      'og:image': origin + page.image,
      'og:site_name': 'BobbyGames',
    })
      .map(
        ([key, value]) =>
          '<meta property="' + key + '" content="' + escape(value) + '"/>',
      )
      .join('') +
    '<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="' +
    escape(page.title) +
    '"/><meta name="twitter:description" content="' +
    escape(page.description) +
    '"/><meta name="twitter:image" content="' +
    escape(origin + page.image) +
    '"/><script type="application/ld+json">' +
    JSON.stringify(schema).replaceAll('<', '\\u003c') +
    '</script>';
  const html = base
    .replace(/<title>.*?<\/title>/, '<title>' + escape(page.title) + '</title>')
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?\s*>/,
      '<meta name="description" content="' + escape(page.description) + '"/>',
    )
    .replace('</head>', tags + '</head>');
  const destination =
    page.path === '/' ? 'dist/index.html' : 'dist' + page.path + '/index.html';
  fs.mkdirSync(destination.slice(0, destination.lastIndexOf('/')), {
    recursive: true,
  });
  fs.writeFileSync(destination, html);
}
const privateRoutes = [
  '/profile',
  '/login',
  '/reset-password',
  '/favorites',
  '/recent',
];
fs.writeFileSync(
  'dist/robots.txt',
  'User-agent: *\nAllow: /\n' +
    privateRoutes.map((p) => 'Disallow: ' + p + '\n').join('') +
    'Sitemap: ' +
    origin +
    '/sitemap.xml\n',
);
fs.writeFileSync(
  'dist/sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    pages
      .filter((p) => !privateRoutes.includes(p.path))
      .map((p) => '<url><loc>' + escape(origin + p.path) + '</loc></url>')
      .join('') +
    '</urlset>',
);
console.log(
  'Generated metadata for ' + pages.length + ' routes, sitemap and robots.',
);
