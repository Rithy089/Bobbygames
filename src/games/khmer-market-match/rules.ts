export const difficulties = { easy: 6, medium: 8, hard: 12 } as const;
export type Difficulty = keyof typeof difficulties;
export const objects = [
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
] as const;
export type MarketObject = (typeof objects)[number];
export type Result = { moves: number; elapsedMs: number; date: string };
export function betterResult(next: Result, previous?: Result) {
  return (
    !previous ||
    next.moves < previous.moves ||
    (next.moves === previous.moves && next.elapsedMs < previous.elapsedMs)
  );
}
export function makeDeck(
  difficulty: Difficulty,
  random: () => number = Math.random,
): MarketObject[] {
  const selected = objects.slice(0, difficulties[difficulty]);
  const deck = [...selected, ...selected];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
export type MatchState = {
  deck: MarketObject[];
  difficulty: Difficulty;
  round: number;
  phase: 'ready' | 'running' | 'paused' | 'complete';
  open: number[];
  matched: number[];
  moves: number;
  elapsedMs: number;
  lastTime: number;
  remaining: number;
  feedback: 'choose' | 'match' | 'mismatch';
};
export const freshMatch = (
  difficulty: Difficulty,
  deck = makeDeck(difficulty),
  round = 0,
): MatchState => ({
  deck,
  difficulty,
  round,
  phase: 'ready',
  open: [],
  matched: [],
  moves: 0,
  elapsedMs: 0,
  lastTime: 0,
  remaining: 0,
  feedback: 'choose',
});
export type MatchAction =
  | { type: 'reset'; difficulty: Difficulty; deck: MarketObject[] }
  | { type: 'start' | 'pause' | 'resume'; now: number }
  | { type: 'flip'; index: number; now: number }
  | { type: 'tick'; now: number; round: number };
function advance(state: MatchState, now: number): MatchState {
  if (state.phase !== 'running') return state;
  const delta = Math.max(0, now - state.lastTime);
  const remaining = Math.max(0, state.remaining - delta);
  return {
    ...state,
    lastTime: now,
    elapsedMs: state.elapsedMs + delta,
    remaining,
    ...(state.remaining > 0 && remaining === 0
      ? { open: [], feedback: 'choose' as const }
      : {}),
  };
}
export function matchReducer(
  state: MatchState,
  action: MatchAction,
): MatchState {
  if (action.type === 'reset')
    return freshMatch(action.difficulty, action.deck, state.round + 1);
  if (action.type === 'tick' && action.round !== state.round) return state;
  const s = advance(state, action.now);
  if (action.type === 'start' && s.phase === 'ready')
    return { ...s, phase: 'running', lastTime: action.now };
  if (action.type === 'pause' && s.phase === 'running')
    return { ...s, phase: 'paused' };
  if (action.type === 'resume' && s.phase === 'paused')
    return { ...s, phase: 'running', lastTime: action.now };
  if (
    action.type !== 'flip' ||
    s.phase !== 'running' ||
    s.remaining > 0 ||
    s.open.length === 2 ||
    !Number.isInteger(action.index) ||
    action.index < 0 ||
    action.index >= s.deck.length ||
    s.open.includes(action.index) ||
    s.matched.includes(action.index)
  )
    return s;
  const open = [...s.open, action.index];
  if (open.length === 1) return { ...s, open };
  const match = s.deck[open[0]] === s.deck[open[1]];
  const matched = match ? [...s.matched, ...open] : s.matched;
  return {
    ...s,
    open,
    matched,
    moves: s.moves + 1,
    feedback: match ? 'match' : 'mismatch',
    remaining: match ? 480 : 900,
    phase: matched.length === s.deck.length ? 'complete' : 'running',
  };
}
export const formatTime = (ms: number) =>
  `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
