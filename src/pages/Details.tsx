import { useAccount } from '../features/account';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { games } from '../lib/catalog';
import { usePortal } from '../lib/store';
import NotFound from './NotFound';
export default function Details() {
  const { id } = useParams();
  const game = games.find((g) => g.id === id);
  const { t } = useTranslation();
  const account = useAccount();
  const localBest = usePortal((s) => (game ? s.best[game.id] : undefined));
  const best =
    account.user && game
      ? Math.max(
          localBest || 0,
          ...account.runs.filter((r) => r.game === game.id).map((r) => r.score),
        )
      : localBest;
  if (!game) return <NotFound />;
  return (
    <>
      <Link className="text-link" to="/games">
        ← {t('back')}
      </Link>
      <section className="detail-layout">
        <img
          className="detail-cover"
          src={'/art/' + game.id + '-960.webp'}
          alt=""
          width="960"
          height="640"
        />
        <div>
          <span className="eyebrow">
            {t(game.category)} · {t(game.difficulty)}
          </span>
          <h1>{t(game.id + '.title')}</h1>
          <p>{t(game.id + '.description')}</p>
          <div className="detail-tags">
            {game.inputs.map((i) => (
              <span key={i}>{t(i)}</span>
            ))}
          </div>
          <Link to={'/play/' + game.id} className="button primary">
            <Gamepad2 size={21} />
            {t('play')}
            <ArrowRight size={19} />
          </Link>
          {best !== undefined && (
            <p>
              {t('best')}: <b>{best}</b>
            </p>
          )}
        </div>
      </section>
      <section className="prose panel">
        <h2>{t('instructions')}</h2>
        <p>{t(game.id + '.instructions')}</p>
        {game.id === 'temple-tower' && <p className="notice">{t('fantasy')}</p>}
      </section>
    </>
  );
}
