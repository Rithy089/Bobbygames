import { games } from './catalog';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export function Seo() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  useEffect(() => {
    const path = pathname.replace(/\/$/, '') || '/';
    const game = games.find((g) => g.id === path.split('/')[2]);
    const keys: Record<string, string> = {
      '/games': 'allGames',
      '/categories': 'categories',
      '/discover': 'discover',
      '/about': 'about',
      '/developer': 'developerTitle',
      '/profile': 'profile',
      '/login': 'login',
      '/reset-password': 'reset',
      '/leaderboards': 'leaderboards',
      '/favorites': 'favorites',
      '/recent': 'recent',
      '/privacy': 'privacy',
      '/terms': 'terms',
    };
    const title =
      path === '/'
        ? 'BobbyGames — ' + t('heroTitle').replace('\n', ' ')
        : (game ? t(game.id + '.title') : t(keys[path] || 'notFound')) +
          ' — BobbyGames';
    const description = game ? t(game.id + '.description') : t('footerText');
    const origin = (
      import.meta.env.VITE_SITE_URL ||
      'https://bobbygames.sayrithy089.chatgpt.site'
    ).replace(/\/$/, '');
    const image = origin + (game ? '/art/' + game.id + '-960.webp' : '/og.png');
    document.title = title;
    function meta(key: string, value: string, attribute = 'property') {
      let node = document.querySelector(
        'meta[' + attribute + '="' + key + '"]',
      );
      if (!node) {
        node = document.createElement('meta');
        node.setAttribute(attribute, key);
        document.head.append(node);
      }
      node.setAttribute('content', value);
    }
    meta('description', description, 'name');
    for (const [key, value] of Object.entries({
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:url': origin + path,
      'og:image': image,
    }))
      meta(key, value);
    for (const [key, value] of Object.entries({
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
    }))
      meta(key, value, 'name');
    meta(
      'robots',
      [
        '/login',
        '/profile',
        '/favorites',
        '/recent',
        '/reset-password',
      ].includes(path) ||
        (!game && path !== '/' && !keys[path])
        ? 'noindex,follow'
        : 'index,follow',
      'name',
    );
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.append(link);
    }
    link.setAttribute('href', origin + path);
    let structured = document.querySelector(
      'script[type="application/ld+json"]',
    );
    if (!structured) {
      structured = document.createElement('script');
      structured.setAttribute('type', 'application/ld+json');
      document.head.append(structured);
    }
    structured.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': game ? 'VideoGame' : 'WebSite',
      name: game ? t(game.id + '.title') : 'BobbyGames',
      description,
      url: origin + path,
      image,
      inLanguage: ['en', 'km'],
      ...(game
        ? { isAccessibleForFree: true, gamePlatform: 'Web browser' }
        : {}),
      creator: {
        '@type': 'Person',
        name: 'Say Rithy',
        alternateName: 'Bobby',
        url: 'https://sayrithy-portfolio.vercel.app/',
      },
    });
  }, [pathname, t]);
  return null;
}
