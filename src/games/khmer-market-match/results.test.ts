import { beforeEach, it, expect } from 'vitest';
import { useMatchResults } from './results';
beforeEach(() => useMatchResults.setState({ best: {} }));
it('persists independent bests and never replaces fewer moves with a faster worse run', () => {
  const save = useMatchResults.getState().save,
    date = '2026-09-08T00:00:00.000Z';
  save('easy', { moves: 8, elapsedMs: 20000, date });
  save('easy', { moves: 9, elapsedMs: 10000, date });
  save('hard', { moves: 14, elapsedMs: 50000, date });
  expect(useMatchResults.getState().best.easy?.moves).toBe(8);
  expect(useMatchResults.getState().best.hard?.moves).toBe(14);
  save('easy', { moves: 8, elapsedMs: 19000, date });
  const saved = JSON.parse(localStorage.getItem('bobby-market-best')!).state
    .best;
  expect(saved.easy.elapsedMs).toBe(19000);
  expect(saved.medium).toBeUndefined();
});
