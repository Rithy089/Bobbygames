import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  betterResult,
  difficulties,
  type Difficulty,
  type Result,
} from './rules';
type Results = {
  best: Partial<Record<Difficulty, Result>>;
  save: (difficulty: Difficulty, result: Result) => void;
};
export const useMatchResults = create<Results>()(
  persist(
    (set) => ({
      best: {},
      save: (difficulty, result) =>
        set((s) =>
          betterResult(result, s.best[difficulty])
            ? { best: { ...s.best, [difficulty]: result } }
            : s,
        ),
    }),
    {
      name: 'bobby-market-best',
      version: 1,
      merge: (persisted, current) => {
        const saved = (persisted as Partial<Results> | null)?.best;
        const best: Results['best'] = {};
        for (const difficulty of Object.keys(difficulties) as Difficulty[]) {
          const r = saved?.[difficulty];
          if (
            r &&
            Number.isInteger(r.moves) &&
            r.moves >= difficulties[difficulty] &&
            Number.isFinite(r.elapsedMs) &&
            r.elapsedMs >= 0 &&
            typeof r.date === 'string' &&
            !Number.isNaN(Date.parse(r.date))
          )
            best[difficulty] = r;
        }
        return { ...current, best };
      },
    },
  ),
);
