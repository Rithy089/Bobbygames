import { lazy, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Trophy,
  Heart,
} from 'lucide-react';
import { games } from '../lib/catalog';
import { usePortal } from '../lib/store';
import {
  freshSnapshot,
  type Engine,
  type GameOptions,
  type Snapshot,
} from '../games/shared/types';
import { createAudio } from '../games/shared/audio';
import { supabase } from '../lib/supabase';
import { useAccount, refreshAccount } from '../features/account';
import { useQueryClient } from '@tanstack/react-query';
import AudioSettings from '../components/AudioSettings';
import NotFound from './NotFound';
const MarketMatch = lazy(
  () => import('../games/khmer-market-match/MarketMatch'),
);
const loaders: Record<
  string,
  () => Promise<{ default: (options: GameOptions) => Engine }>
> = {
  'mango-catch': () => import('../games/mango-catch/engine'),
  'temple-tower': () => import('../games/temple-tower/engine'),
  'tuk-tuk-rush': () => import('../games/tuk-tuk-rush/engine'),
};
function PlayerGame() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const account = useAccount();
  const sessionRef = useRef<string | null>(null);
  const pending = useRef(false);
  const generation = useRef(0);
  const [starting, setStarting] = useState(false);
  const [scoreMessage, setScoreMessage] = useState('');
  const { t } = useTranslation();
  const labels = useRef({ perfect: '', missed: '', hazard: '' });
  useEffect(() => {
    labels.current = {
      perfect: t('perfectPlacement'),
      missed: t('missedFruit'),
      hazard: t('stoneHit'),
    };
  }, [t]);
  const game = games.find((g) => g.id === id);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const audioRef = useRef<ReturnType<typeof createAudio> | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot>(freshSnapshot);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const localBest = usePortal((s) => (game ? s.best[game.id] || 0 : 0));
  const best = Math.max(
    localBest,
    ...account.runs.filter((r) => r.game === game?.id).map((r) => r.score),
  );
  const audio = usePortal((s) => s.audio);
  const setAudio = usePortal((s) => s.setAudio);
  useEffect(() => {
    if (!game || !canvas.current) return;
    let disposed = false;
    const invalidate = () => {
      generation.current++;
    };
    const sound = createAudio(game.id);
    audioRef.current = sound;
    setLoaded(false);
    setError(false);
    setSnapshot(freshSnapshot());
    usePortal.getState().visit(game.id);
    const loader = loaders[game.id];
    if (!loader) {
      setError(true);
      return () => sound.destroy();
    }
    void loader()
      .then(async (module) => {
        const { loadSprites } = await import('../games/shared/sprites');
        await loadSprites(
          game.id === 'mango-catch'
            ? ['mango', 'dragon', 'basket', 'countryside']
            : game.id === 'tuk-tuk-rush'
              ? []
              : ['tower-bg'],
        );
        if (disposed || !canvas.current) return;
        engine.current = module.default({
          canvas: canvas.current,
          onSnapshot: setSnapshot,
          onFinish: (s) => {
            usePortal.getState().finish({
              game: game.id,
              score: s.score,
              duration: s.elapsed,
              date: new Date().toISOString(),
            });
            const sid = sessionRef.current;
            sessionRef.current = null;
            const uid = useAccount.getState().user?.id;
            if (sid && uid && supabase) {
              setScoreMessage('saving');
              void supabase
                .rpc('submit_score', {
                  p_session: sid,
                  p_score: s.score,
                  p_duration_ms: Math.max(250, Math.round(s.elapsed * 1000)),
                })
                .then(({ data, error }) => {
                  if (disposed) return;
                  setScoreMessage(
                    !error && data?.accepted
                      ? 'scoreAccepted'
                      : 'scoreRejected',
                  );
                  void refreshAccount(uid);
                  void queryClient.invalidateQueries({
                    queryKey: ['leaderboard', game.id],
                  });
                });
            } else setScoreMessage('localScore');
          },
          audio: sound.effect,
          reducedMotion: () =>
            window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          get labels() {
            return labels.current;
          },
        });
        setLoaded(true);
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      invalidate();
      pending.current = false;
      sessionRef.current = null;
      engine.current?.destroy();
      engine.current = null;
      sound.destroy();
      audioRef.current = null;
    };
  }, [game, queryClient]);
  useEffect(() => {
    if (snapshot.phase === 'over') audioRef.current?.finish();
    else audioRef.current?.sync(snapshot.phase === 'running');
  }, [snapshot.phase, audio]);
  if (!game) return <NotFound />;
  const begin = async (restart = false) => {
    if (pending.current) return;
    audioRef.current?.activate();
    if (snapshot.phase === 'paused' && !restart) {
      engine.current?.resume();
      return;
    }
    pending.current = true;
    setStarting(true);
    setScoreMessage('');
    engine.current?.pause();
    sessionRef.current = null;
    const version = ++generation.current;
    if (account.user && supabase) {
      try {
        const { data, error } = await supabase.rpc('start_game', {
          p_game: game.id,
        });
        if (version !== generation.current) return;
        if (error) setScoreMessage('sessionError');
        else {
          sessionRef.current = data as string;
          useAccount.setState((state) => ({
            recent: [game.id, ...state.recent.filter((g) => g !== game.id)],
          }));
        }
      } catch {
        setScoreMessage('sessionError');
      }
    }
    if (version !== generation.current) return;
    if (restart) engine.current?.restart();
    else engine.current?.start();
    pending.current = false;
    setStarting(false);
  };
  const direction = (dir: 'left' | 'right', pressed: boolean) => {
    engine.current?.input(dir, pressed);
  };
  return (
    <>
      <div className="player-heading">
        <Link to={'/games/' + game.id} className="text-link">
          <ArrowLeft size={17} />
          {t('details')}
        </Link>
        <span className="small muted">
          {t(account.user ? 'accountSync' : 'localOnly')}
        </span>
      </div>
      <div className="player-title">
        <div>
          <span className="eyebrow">{t(game.category)}</span>
          <h1>{t(game.id + '.title')}</h1>
        </div>
        <span className="best-pill">
          <Trophy size={18} />
          {t('best')} <b>{best}</b>
        </span>
      </div>
      <div className="game-frame" ref={frame}>
        <div className="scorebar">
          <div>
            <span>{t('score')}</span>
            <b data-testid="score">{snapshot.score}</b>
          </div>
          <div>
            <span>{t('best')}</span>
            <b>{best}</b>
          </div>
          {game.id === 'mango-catch' ? (
            <div>
              <span>{t('lives')}</span>
              <b
                className="life-icons"
                role="img"
                aria-label={String(snapshot.lives)}
              >
                {[0, 1, 2].map((i) => (
                  <Heart
                    key={i}
                    size={19}
                    fill={i < snapshot.lives ? 'currentColor' : 'none'}
                    opacity={i < snapshot.lives ? 1 : 0.3}
                  />
                ))}
              </b>
            </div>
          ) : (
            <div>
              <span>
                {t(game.id === 'temple-tower' ? 'height' : 'distance')}
              </span>
              <b>
                {game.id === 'temple-tower'
                  ? snapshot.height
                  : Math.floor(snapshot.distance) + ' m'}
              </b>
            </div>
          )}
          <div>
            <span>{t('combo')}</span>
            <b>×{snapshot.combo || 1}</b>
          </div>
        </div>
        <div className="game-stage">
          <canvas
            ref={canvas}
            tabIndex={0}
            aria-label={t(game.id + '.title') + ' — ' + t('controls')}
            aria-describedby="game-instructions"
          />
          {(!loaded || error) && (
            <div className="game-overlay">
              <h2>{t(error ? 'errorTitle' : 'loading')}</h2>
              {error && (
                <Link to="/games" className="button primary">
                  {t('back')}
                </Link>
              )}
            </div>
          )}
          {loaded && snapshot.phase !== 'running' && (
            <div className="game-overlay">
              <span className="overlay-symbol">
                {snapshot.phase === 'over' ? (
                  <Trophy size={34} />
                ) : (
                  <Play size={34} />
                )}
              </span>
              <h2>
                {t(
                  snapshot.phase === 'ready'
                    ? 'ready'
                    : snapshot.phase === 'paused'
                      ? 'paused'
                      : 'gameOver',
                )}
              </h2>
              <p>
                {snapshot.phase === 'ready'
                  ? t(game.id + '.hint')
                  : snapshot.phase === 'paused'
                    ? t('pausedText')
                    : t('yourScore')}
              </p>
              {snapshot.phase === 'over' && (
                <>
                  <strong className="final-score">{snapshot.score}</strong>
                  <p role="status" className="small">
                    {t(scoreMessage || 'localScore')}
                  </p>
                </>
              )}
              <button
                className="button primary"
                disabled={starting}
                onClick={() => void begin(snapshot.phase === 'over')}
              >
                <Play size={18} fill="currentColor" />
                {t(
                  starting
                    ? 'loading'
                    : snapshot.phase === 'ready'
                      ? 'start'
                      : snapshot.phase === 'paused'
                        ? 'resume'
                        : 'playAgain',
                )}
              </button>
            </div>
          )}
        </div>
        <div className="game-toolbar">
          <div className="row">
            <button
              className="icon-button"
              aria-label={t(snapshot.phase === 'paused' ? 'resume' : 'pause')}
              disabled={
                !loaded ||
                snapshot.phase === 'ready' ||
                snapshot.phase === 'over'
              }
              onClick={() =>
                snapshot.phase === 'paused' ? begin() : engine.current?.pause()
              }
            >
              {snapshot.phase === 'paused' ? (
                <Play size={19} />
              ) : (
                <Pause size={19} />
              )}
            </button>
            <button
              className="icon-button"
              aria-label={t('restart')}
              disabled={!loaded || starting}
              onClick={() => void begin(true)}
            >
              <RotateCcw size={19} />
            </button>
            <button
              className="icon-button"
              aria-label={t('sound')}
              aria-pressed={audio.sound}
              onClick={() => setAudio({ sound: !audio.sound })}
            >
              {audio.sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
            </button>
          </div>
          <span className="small muted desktop-instruction">
            {t(game.id + '.hint')}
          </span>
          <button
            className="icon-button"
            aria-label={t('fullScreen')}
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void frame.current?.requestFullscreen().catch(() => {});
            }}
          >
            <Maximize size={18} />
          </button>
        </div>
        <div className="touch-controls">
          {game.id === 'temple-tower' ? (
            <button
              className="button primary"
              onClick={() => engine.current?.input('action', true)}
              disabled={snapshot.phase !== 'running'}
            >
              {t('drop')}
            </button>
          ) : (
            (['left', 'right'] as const).map((dir) => (
              <button
                key={dir}
                className="button secondary"
                aria-label={t(dir === 'left' ? 'moveLeft' : 'moveRight')}
                disabled={snapshot.phase !== 'running'}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  direction(dir, true);
                }}
                onPointerUp={() => direction(dir, false)}
                onPointerCancel={() => direction(dir, false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') direction(dir, true);
                }}
                onKeyUp={() => direction(dir, false)}
              >
                {dir === 'left' ? <ArrowLeft /> : <ArrowRight />}
                {t(dir === 'left' ? 'moveLeft' : 'moveRight')}
              </button>
            ))
          )}
        </div>
      </div>
      <div className="player-information">
        <section className="panel">
          <h2>{t('instructions')}</h2>
          <p id="game-instructions">{t(game.id + '.instructions')}</p>
          {game.id === 'temple-tower' && (
            <p className="notice">{t('fantasy')}</p>
          )}
        </section>
        <section className="panel">
          <h2>{t('settings')}</h2>
          <AudioSettings />
        </section>
      </div>
    </>
  );
}

export default function Player() {
  const { id } = useParams();
  if (id === 'khmer-market-match') return <MarketMatch />;
  return <PlayerGame key={id} />;
}
