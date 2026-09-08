import { describe, it, expect } from 'vitest';
import {
  difficulties,
  makeDeck,
  freshMatch,
  matchReducer,
  betterResult,
} from './rules';
describe('Khmer Market Match', () => {
  it('builds exactly two of every selected object at every size', () => {
    for (const d of Object.keys(
      difficulties,
    ) as (keyof typeof difficulties)[]) {
      const deck = makeDeck(d, () => 0.4);
      expect(deck).toHaveLength(difficulties[d] * 2);
      for (const object of new Set(deck))
        expect(deck.filter((o) => o === object)).toHaveLength(2);
    }
  });
  it('locks mismatches against rapid third clicks and freezes their countdown when paused', () => {
    let s = matchReducer(
      freshMatch('easy', ['mango', 'dragon', 'mango', 'dragon']),
      { type: 'start', now: 0 },
    );
    for (const index of [0, 0, 1, 2])
      s = matchReducer(s, { type: 'flip', index, now: 100 });
    expect(s.moves).toBe(1);
    expect(s.open).toEqual([0, 1]);
    s = matchReducer(s, { type: 'pause', now: 200 });
    s = matchReducer(s, { type: 'tick', now: 5000, round: 0 });
    expect(s.elapsedMs).toBe(200);
    expect(s.open).toEqual([0, 1]);
    s = matchReducer(s, { type: 'resume', now: 6000 });
    s = matchReducer(s, { type: 'tick', now: 6800, round: 0 });
    expect(s.open).toEqual([]);
    expect(s.elapsedMs).toBe(1000);
  });
  it('restart rejects stale round ticks and clears open cards', () => {
    let s = matchReducer(freshMatch('easy'), { type: 'start', now: 0 });
    s = matchReducer(s, { type: 'flip', index: 0, now: 100 });
    s = matchReducer(s, {
      type: 'reset',
      difficulty: 'hard',
      deck: makeDeck('hard'),
    });
    const current = s;
    s = matchReducer(s, { type: 'tick', now: 5000, round: 0 });
    expect(s).toBe(current);
    expect(s.open).toEqual([]);
    expect(s.moves).toBe(0);
  });
  it('completes exactly once and ignores matched cards', () => {
    let s = matchReducer(freshMatch('easy', ['mango', 'mango']), {
      type: 'start',
      now: 0,
    });
    s = matchReducer(s, { type: 'flip', index: 0, now: 10 });
    s = matchReducer(s, { type: 'flip', index: 1, now: 20 });
    expect(s.phase).toBe('complete');
    expect(s.moves).toBe(1);
    expect(matchReducer(s, { type: 'flip', index: 0, now: 100 }).moves).toBe(1);
  });
  it('ranks fewer moves before speed, then faster time for ties', () => {
    const result = { moves: 8, elapsedMs: 5000, date: '2026-09-08' };
    expect(
      betterResult({ ...result, moves: 7, elapsedMs: 90000 }, result),
    ).toBe(true);
    expect(betterResult({ ...result, elapsedMs: 4999 }, result)).toBe(true);
    expect(betterResult({ ...result, moves: 9, elapsedMs: 1 }, result)).toBe(
      false,
    );
    expect(betterResult(result, result)).toBe(false);
  });
});
