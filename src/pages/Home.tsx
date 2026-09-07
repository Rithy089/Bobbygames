import { useAccount } from '../features/account';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Sparkles,
  Globe,
  MousePointer2,
  Zap,
  Heart,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { games } from '../lib/catalog';
import { usePortal } from '../lib/store';
import GameCard from '../components/GameCard';
export default function Home() {
  const { t } = useTranslation();
  const account = useAccount();
  const localRecent = usePortal((s) => s.recent);
  const recent = account.user ? account.recent : localRecent;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" />
            {t('heroEyebrow')}
          </span>
          <h1>
            {t('heroTitle')
              .split('\n')
              .map((line, i) => (
                <span key={line} className={i === 1 ? 'gold' : ''}>
                  {line}
                  <br />
                </span>
              ))}
          </h1>
          <p>{t('heroText')}</p>
          <div className="hero-badges">
            <span>
              <Sparkles size={15} />
              {t('original')}
            </span>
            <span>
              <MousePointer2 size={15} />
              {t('noDownload')}
            </span>
            <span>
              <Heart size={15} />
              {t('freePlay')}
            </span>
          </div>
        </div>
        <Link to="/play/mango-catch" className="hero-game">
          <img
            src="/art/mango-catch-960.webp"
            width="960"
            height="640"
            alt=""
            fetchPriority="high"
          />
          <div className="hero-game-shade" />
          <span className="hero-game-label">
            <Zap size={14} />
            {t('featuredGame')}
          </span>
          <div className="hero-game-bottom">
            <div>
              <span className="small">01 / 03</span>
              <h2>{t('mango-catch.title')}</h2>
              <p>{t('mango-catch.hint')}</p>
            </div>
            <span className="big-play" aria-label={t('play')}>
              <Play fill="currentColor" size={23} />
            </span>
          </div>
        </Link>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t('featured')}</span>
            <h2>{t('quickPlay')}</h2>
            <p>{t('quickText')}</p>
          </div>
          <Link className="text-link" to="/games">
            {t('viewAll')}
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="game-grid">
          {games.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>
      {recent.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <h2>{t('recent')}</h2>
          </div>
          <div className="game-grid">
            {recent.map((id) => (
              <GameCard key={id} game={games.find((g) => g.id === id)!} />
            ))}
          </div>
        </section>
      )}
      <section className="culture-banner">
        <div className="culture-emblem" aria-hidden="true">
          <Globe size={60} strokeWidth={1} />
          <span>កម្ពុជា</span>
        </div>
        <div>
          <span className="eyebrow">{t('cultureEyebrow')}</span>
          <h2>{t('cultureTitle')}</h2>
          <p>{t('cultureText')}</p>
        </div>
        <Link className="button secondary" to="/discover">
          {t('discover')}
          <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
