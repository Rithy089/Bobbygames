import { useEffect, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  difficulties,
  freshMatch,
  makeDeck,
  matchReducer,
  formatTime,
  type Difficulty,
} from './rules';
import { useMatchResults } from './results';
import { usePortal } from '../../lib/store';
import { createAudio } from '../shared/audio';
import AudioSettings from '../../components/AudioSettings';

export default function MarketMatch() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(matchReducer, undefined, () =>
    freshMatch('easy'),
  );
  const [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false);
  const audio = useRef<ReturnType<typeof createAudio> | null>(null);
  const savedRound = useRef(-1),
    soundedMove = useRef('');
  const board = useRef<HTMLDivElement>(null),
    startButton = useRef<HTMLButtonElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const best = useMatchResults((s) => s.best);
  const sound = usePortal((s) => s.audio);
  useEffect(() => {
    if (
      state.phase === 'paused' ||
      (state.phase === 'ready' && state.round > 0)
    )
      startButton.current?.focus({ preventScroll: true });
  }, [state.phase, state.round]);
  useEffect(() => {
    let disposed = false;
    const instance = createAudio();
    audio.current = instance;
    usePortal.getState().visit('khmer-market-match');
    void import('../shared/sprites')
      .then((m) =>
        m.loadSprites([
          'mango',
          'dragon',
          'bananas',
          'coconut',
          'basket',
          'tuk-tuk',
          'rice',
          'fish',
          'fan',
          'teapot',
          'watermelon',
          'krama',
        ]),
      )
      .then(() => {
        if (!disposed) setLoaded(true);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    const pause = () => dispatch({ type: 'pause', now: performance.now() });
    const visibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', pause);
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', pause);
      instance.destroy();
      audio.current = null;
    };
  }, []);
  useEffect(() => {
    if (state.phase !== 'running') return;
    const timer = window.setInterval(
      () =>
        dispatch({ type: 'tick', now: performance.now(), round: state.round }),
      100,
    );
    return () => window.clearInterval(timer);
  }, [state.phase, state.round]);
  useEffect(() => {
    audio.current?.sync(state.phase === 'running');
  }, [state.phase, sound]);
  useEffect(() => {
    const key = state.round + ':' + state.moves;
    if (state.moves > 0 && soundedMove.current !== key) {
      soundedMove.current = key;
      audio.current?.effect(state.feedback === 'match' ? 'perfect' : 'miss');
    }
  }, [state.moves, state.round, state.feedback]);
  useEffect(() => {
    if (state.phase !== 'complete' || savedRound.current === state.round)
      return;
    savedRound.current = state.round;
    const result = {
      moves: state.moves,
      elapsedMs: state.elapsedMs,
      date: new Date().toISOString(),
    };
    useMatchResults.getState().save(state.difficulty, result);
    usePortal
      .getState()
      .finish({
        game: 'khmer-market-match',
        score: 0,
        duration: state.elapsedMs / 1000,
        date: result.date,
      });
    resultHeading.current?.focus({ preventScroll: true });
  }, [
    state.phase,
    state.round,
    state.difficulty,
    state.moves,
    state.elapsedMs,
  ]);
  const begin = () => {
    audio.current?.activate();
    dispatch({
      type: state.phase === 'paused' ? 'resume' : 'start',
      now: performance.now(),
    });
    board.current
      ?.querySelector<HTMLButtonElement>('button')
      ?.focus({ preventScroll: true });
  };
  const restart = (difficulty = state.difficulty) => {
    dispatch({ type: 'reset', difficulty, deck: makeDeck(difficulty) });
    startButton.current?.focus({ preventScroll: true });
  };
  const playing = state.phase === 'running';
  return (
    <>
      <div className="player-heading">
        <Link className="text-link" to="/games/khmer-market-match">
          <ArrowLeft size={17} />
          {t('details')}
        </Link>
        <span className="small muted">{t('localOnly')}</span>
      </div>
      <div className="player-title">
        <div>
          <span className="eyebrow">{t('memory')}</span>
          <h1>{t('khmer-market-match.title')}</h1>
        </div>
        <span className="best-pill">
          <Trophy size={18} />
          {t('best')}:{' '}
          {best[state.difficulty]
            ? `${best[state.difficulty]!.moves} ${t('match.moves')} · ${formatTime(best[state.difficulty]!.elapsedMs)}`
            : '—'}
        </span>
      </div>
      <div
        className="match-settings"
        role="group"
        aria-label={t('match.difficulty')}
      >
        {(Object.keys(difficulties) as Difficulty[]).map((d) => (
          <button
            key={d}
            className={'filter ' + (state.difficulty === d ? 'active' : '')}
            aria-pressed={state.difficulty === d}
            onClick={() => restart(d)}
          >
            {t(d)} · {difficulties[d]} {t('match.pairs')}
          </button>
        ))}
      </div>
      <p className="small muted">{t('match.changeSize')}</p>
      <section
        className="game-frame match-frame"
        aria-label={t('khmer-market-match.title')}
      >
        <div className="scorebar">
          <div>
            <span>{t('match.moves')}</span>
            <b data-testid="match-moves">{state.moves}</b>
          </div>
          <div>
            <span>{t('match.time')}</span>
            <b data-testid="match-time">{formatTime(state.elapsedMs)}</b>
          </div>
          <div>
            <span>{t('match.pairs')}</span>
            <b>
              {state.matched.length / 2} / {difficulties[state.difficulty]}
            </b>
          </div>
        </div>
        <div className="match-stage">
          <div
            className={'match-board size-' + state.difficulty}
            ref={board}
            role="group"
            aria-label={t('match.board')}
            aria-describedby="match-instructions"
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
                e.preventDefault();
                if (playing)
                  dispatch({ type: 'pause', now: performance.now() });
                return;
              }
              const buttons = Array.from(
                e.currentTarget.querySelectorAll<HTMLButtonElement>('button'),
              );
              const index = buttons.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              const cols = window
                .getComputedStyle(e.currentTarget)
                .gridTemplateColumns.split(' ').length;
              const offset =
                e.key === 'ArrowRight'
                  ? 1
                  : e.key === 'ArrowLeft'
                    ? -1
                    : e.key === 'ArrowDown'
                      ? cols
                      : e.key === 'ArrowUp'
                        ? -cols
                        : 0;
              if (offset && index >= 0) {
                e.preventDefault();
                buttons[
                  (index + offset + buttons.length) % buttons.length
                ]?.focus();
              }
            }}
          >
            {state.deck.map((object, index) => {
              const matched = state.matched.includes(index);
              const face =
                state.phase !== 'paused' &&
                (matched || state.open.includes(index));
              const blocked =
                !playing ||
                matched ||
                state.open.includes(index) ||
                state.remaining > 0;
              return (
                <button
                  key={state.round + ':' + index}
                  className={
                    'match-card ' +
                    (face ? 'face-up' : 'face-down') +
                    (matched ? ' matched' : '')
                  }
                  aria-label={
                    t('match.card', { number: index + 1 }) +
                    ', ' +
                    (face
                      ? t('match.objects.' + object) +
                        ', ' +
                        t(matched ? 'match.matched' : 'match.faceUp')
                      : t('match.faceDown'))
                  }
                  aria-pressed={face}
                  aria-disabled={blocked}
                  tabIndex={state.phase === 'running' ? 0 : -1}
                  onClick={() => {
                    if (!blocked)
                      dispatch({ type: 'flip', index, now: performance.now() });
                  }}
                >
                  {face ? (
                    <>
                      <img
                        src={`/sprites/${object}.webp`}
                        alt=""
                        width="256"
                        height="256"
                        draggable="false"
                      />
                      <span aria-hidden="true">
                        {matched ? '✓ ' : ''}
                        {t('match.objects.' + object)}
                      </span>
                    </>
                  ) : (
                    <span className="card-back-mark" aria-hidden="true">
                      ✦
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {state.phase !== 'running' && (
            <div className="game-overlay match-overlay">
              <span className="overlay-symbol">
                {state.phase === 'complete' ? (
                  <Trophy size={30} />
                ) : (
                  <Play size={30} />
                )}
              </span>
              <h2 ref={resultHeading} tabIndex={-1}>
                {t(
                  failed
                    ? 'errorTitle'
                    : !loaded
                      ? 'loading'
                      : state.phase === 'complete'
                        ? 'match.complete'
                        : state.phase === 'paused'
                          ? 'paused'
                          : 'ready',
                )}
              </h2>
              <p>
                {state.phase === 'complete'
                  ? `${state.moves} ${t('match.moves')} · ${formatTime(state.elapsedMs)}`
                  : t(
                      state.phase === 'paused'
                        ? 'pausedText'
                        : 'khmer-market-match.hint',
                    )}
              </p>
              {state.phase === 'complete' && (
                <p className="small">{t('match.saved')}</p>
              )}
              {!failed && (
                <button
                  ref={startButton}
                  className="button primary"
                  disabled={!loaded}
                  onClick={() =>
                    state.phase === 'complete' ? restart() : begin()
                  }
                >
                  <Play size={18} />
                  {t(
                    state.phase === 'complete'
                      ? 'playAgain'
                      : state.phase === 'paused'
                        ? 'resume'
                        : 'start',
                  )}
                </button>
              )}
              {failed && (
                <Link to="/games" className="button secondary">
                  {t('back')}
                </Link>
              )}
            </div>
          )}
        </div>
        <p className="match-feedback" role="status" aria-live="polite">
          {t(
            state.phase === 'complete'
              ? 'match.complete'
              : state.phase === 'paused'
                ? 'paused'
                : 'match.' + state.feedback,
          )}
        </p>
        <div className="game-toolbar">
          <div className="row">
            <button
              className="icon-button"
              aria-label={t(state.phase === 'paused' ? 'resume' : 'pause')}
              disabled={state.phase === 'ready' || state.phase === 'complete'}
              onClick={() =>
                state.phase === 'paused'
                  ? begin()
                  : dispatch({ type: 'pause', now: performance.now() })
              }
            >
              {state.phase === 'paused' ? (
                <Play size={19} />
              ) : (
                <Pause size={19} />
              )}
            </button>
            <button
              className="icon-button"
              aria-label={t('restart')}
              onClick={() => restart()}
            >
              <RotateCcw size={19} />
            </button>
            <button
              className="icon-button"
              aria-label={t('sound')}
              aria-pressed={sound.sound}
              onClick={() =>
                usePortal.getState().setAudio({ sound: !sound.sound })
              }
            >
              {sound.sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
            </button>
          </div>
          <span className="small muted">{t('match.ranking')}</span>
        </div>
      </section>
      <div className="player-information">
        <section className="panel">
          <h2>{t('instructions')}</h2>
          <p id="match-instructions">{t('khmer-market-match.instructions')}</p>
          <p>{t('match.ranking')}</p>
        </section>
        <section className="panel">
          <h2>{t('settings')}</h2>
          <AudioSettings />
        </section>
      </div>
      <section className="panel section">
        <h2>{t('match.personalBests')}</h2>
        <div className="match-bests">
          {(Object.keys(difficulties) as Difficulty[]).map((d) => (
            <div key={d}>
              <h3>{t(d)}</h3>
              <p>
                {best[d]
                  ? `${best[d]!.moves} ${t('match.moves')} · ${formatTime(best[d]!.elapsedMs)}`
                  : t('match.noResult')}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
