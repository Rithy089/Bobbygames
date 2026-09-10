import { useSearchParams } from 'react-router-dom';
import { Search, Gamepad2, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { games } from '../lib/catalog';
import { usePortal } from '../lib/store';
import { useFavorites, useAccount } from '../features/account';
import GameCard from '../components/GameCard';
import { Choice } from '../components/Choice';
import { formatCount } from '../i18n/numbers';
export default function Catalog({
  mode = 'all',
}: {
  mode?: 'all' | 'favorites' | 'recent';
}) {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const { favorites } = useFavorites();
  const account = useAccount();
  const localRecent = usePortal((s) => s.recent);
  const recent = account.user ? account.recent : localRecent;
  const runs = usePortal((s) => s.runs);
  const q = params.get('q') || '';
  const category = params.get('category') || 'all';
  const sort =
    params.get('sort') || (mode === 'recent' ? 'recent' : 'recommended');
  const update = (key: string, value: string) => {
    const p = new URLSearchParams(params);
    p.set(key, value);
    setParams(p);
  };
  const list = games
    .filter(
      (g) =>
        (mode === 'all' ||
          (mode === 'favorites' ? favorites : recent).includes(g.id)) &&
        (category === 'all' || category === g.category) &&
        (t(g.id + '.title') + ' ' + t(g.id + '.description'))
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'recent'
        ? recent.indexOf(a.id) - recent.indexOf(b.id)
        : sort === 'alphabetical'
          ? t(a.id + '.title').localeCompare(t(b.id + '.title'))
          : sort === 'newest'
            ? b.released.localeCompare(a.released)
            : sort === 'popular'
              ? runs.filter((r) => r.game === b.id).length -
                runs.filter((r) => r.game === a.id).length
              : 0,
    );
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">
          {t('original', {
            gameCount: formatCount(games.length, i18n.language),
          })}
        </span>
        <h1>{t(mode === 'all' ? 'allGames' : mode)}</h1>
        <p>
          {t(
            mode === 'favorites'
              ? 'favoriteEmpty'
              : mode === 'recent'
                ? 'recentEmpty'
                : 'quickText',
          )}
        </p>
      </div>
      <div className="catalog-toolbar">
        <div className="search-field">
          <Search size={19} />
          <input
            aria-label={t('search')}
            placeholder={t('search')}
            value={q}
            onChange={(e) => update('q', e.target.value)}
          />
        </div>
        <Choice
          label={t('sort')}
          value={sort}
          onChange={(v) => update('sort', v)}
          options={[
            ...(mode === 'recent' ? ['recent'] : []),
            'recommended',
            'newest',
            'alphabetical',
            'popular',
          ].map((v) => ({ value: v, label: t(v) }))}
        />
      </div>
      <div className="filter-row" aria-label={t('categories')}>
        {['all', 'arcade', 'precision', 'racing', 'memory'].map((c) => (
          <button
            key={c}
            className={'filter ' + (c === category ? 'active' : '')}
            aria-pressed={c === category}
            onClick={() => update('category', c)}
          >
            {c === 'all' ? <Gamepad2 size={17} /> : null}
            {t(c)}
          </button>
        ))}
      </div>
      {list.length ? (
        <div className="game-grid">
          {list.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={36} />
          <h2>{t('noResults')}</h2>
          <button className="button secondary" onClick={() => setParams({})}>
            {t('clear')}
          </button>
        </div>
      )}
    </>
  );
}
