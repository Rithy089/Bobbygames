import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Globe, Monitor, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { games, isGameId } from '../lib/catalog';
import { usePortal } from '../lib/store';
import { useAccount, avatarColors } from '../features/account';
import { Choice } from '../components/Choice';
type Row = {
  display_name: string;
  avatar: number;
  score: number;
  game_id: string;
  created_at: string;
};
export default function Leaderboard() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const game = isGameId(params.get('game'))
    ? params.get('game')!
    : 'mango-catch';
  const [scope, setScope] = useState('global');
  const account = useAccount();
  const localRuns = usePortal((s) => s.runs);
  const result = useQuery({
    queryKey: ['leaderboard', game],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase.rpc('leaderboard', {
        p_game: game,
      });
      if (error) throw error;
      return data as Row[];
    },
    enabled: scope === 'global' && !!supabase,
  });
  const rows: Row[] =
    scope === 'global'
      ? result.data || []
      : (account.user ? account.runs : localRuns)
          .filter((r) => r.game === game)
          .sort((a, b) => b.score - a.score)
          .slice(0, 20)
          .map((r) => ({
            display_name: account.profile?.display_name || t('guest'),
            avatar: account.profile?.avatar || 0,
            score: r.score,
            game_id: r.game,
            created_at: r.date,
          }));
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">{t('community')}</span>
        <h1>{t('leaderboards')}</h1>
        <p>{t('noScores')}</p>
      </div>
      <div className="catalog-toolbar">
        <div className="filter-row">
          <button
            className={'filter ' + (scope === 'global' ? 'active' : '')}
            aria-pressed={scope === 'global'}
            onClick={() => setScope('global')}
          >
            <Globe size={17} />
            {t('global')}
          </button>
          <button
            className={'filter ' + (scope === 'personal' ? 'active' : '')}
            aria-pressed={scope === 'personal'}
            onClick={() => setScope('personal')}
          >
            <Monitor size={17} />
            {t('personal')}
          </button>
        </div>
        <Choice
          label={t('games')}
          value={game}
          options={games.map((g) => ({
            value: g.id,
            label: t(g.id + '.title'),
          }))}
          onChange={(v) => setParams({ game: v })}
        />
      </div>
      {scope === 'global' && !supabase && (
        <p className="notice">{t('offlineBoard')}</p>
      )}
      {result.isError && scope === 'global' && (
        <p className="notice" role="alert">
          {t('syncError')}{' '}
          <button className="text-link" onClick={() => void result.refetch()}>
            {t('tryAgain')}
          </button>
        </p>
      )}
      {result.isLoading && scope === 'global' ? (
        <p role="status">{t('loading')}</p>
      ) : rows.length ? (
        <div className="leaderboard-table">
          <table>
            <thead>
              <tr>
                <th>{t('rank')}</th>
                <th>{t('player')}</th>
                <th>{t('score')}</th>
                <th>{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.created_at + i}>
                  <td>
                    {i === 0 ? <Trophy className="gold" size={21} /> : i + 1}
                  </td>
                  <td>
                    <span
                      className="rank-avatar"
                      style={{
                        background: avatarColors[r.avatar] || avatarColors[0],
                      }}
                    >
                      {r.display_name.slice(0, 1)}
                    </span>
                    {r.display_name}
                  </td>
                  <td>
                    <b>{r.score}</b>
                  </td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <Trophy size={46} />
          <h2>{t('empty')}</h2>
          <p>{t('finishRun')}</p>
          <Link className="button primary" to={'/play/' + game}>
            {t('play')}
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </>
  );
}
