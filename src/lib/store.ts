import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isGameId, type GameId } from './catalog';
export type Theme = 'light' | 'dark' | 'system';
export type AudioSettings = {
  sound: boolean;
  music: boolean;
  effects: boolean;
  volume: number;
  musicVolume: number;
  effectsVolume: number;
};
export type Run = {
  game: GameId;
  score: number;
  duration: number;
  date: string;
};
type Portal = {
  language: 'en' | 'km';
  theme: Theme;
  audio: AudioSettings;
  favorites: GameId[];
  recent: GameId[];
  best: Partial<Record<GameId, number>>;
  runs: Run[];
  setLanguage: (v: 'en' | 'km') => void;
  setTheme: (v: Theme) => void;
  setAudio: (v: Partial<AudioSettings>) => void;
  toggleFavorite: (id: GameId) => void;
  visit: (id: GameId) => void;
  finish: (run: Run) => void;
};
export const usePortal = create<Portal>()(
  persist(
    (set) => ({
      language: document.documentElement.lang === 'km' ? 'km' : 'en',
      theme: 'system',
      audio: {
        sound: true,
        music: true,
        effects: true,
        volume: 0.35,
        musicVolume: 0.6,
        effectsVolume: 0.9,
      },
      favorites: [],
      recent: [],
      best: {},
      runs: [],
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setAudio: (v) => set((s) => ({ audio: { ...s.audio, ...v } })),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),
      visit: (id) =>
        set((s) => ({
          recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12),
        })),
      finish: (run) =>
        set((s) => ({
          best:
            run.game === 'khmer-market-match'
              ? s.best
              : {
                  ...s.best,
                  [run.game]: Math.max(s.best[run.game] || 0, run.score),
                },
          runs: [run, ...s.runs].slice(0, 300),
        })),
    }),
    {
      name: 'bobby-portal',
      version: 1,
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== 'object') return current;
        const saved = persisted as Partial<Portal>;
        const ids = (value: unknown) =>
          Array.isArray(value) ? [...new Set(value.filter(isGameId))] : [];
        const runs = Array.isArray(saved.runs)
          ? saved.runs
              .filter(
                (r) =>
                  r &&
                  isGameId(r.game) &&
                  Number.isFinite(r.score) &&
                  r.score >= 0 &&
                  Number.isFinite(r.duration) &&
                  r.duration >= 0 &&
                  typeof r.date === 'string' &&
                  !Number.isNaN(Date.parse(r.date)),
              )
              .slice(0, 300)
          : [];
        const best = Object.fromEntries(
          Object.entries(saved.best || {}).filter(
            ([id, score]) =>
              isGameId(id) && Number.isFinite(score) && score >= 0,
          ),
        );
        return {
          ...current,
          favorites: ids(saved.favorites),
          recent: ids(saved.recent),
          runs,
          best,
          language: saved.language === 'km' ? 'km' : 'en',
          theme: ['dark', 'light', 'system'].includes(saved.theme || '')
            ? saved.theme!
            : 'system',
          audio: {
            sound:
              typeof saved.audio?.sound === 'boolean'
                ? saved.audio.sound
                : true,
            music:
              typeof saved.audio?.music === 'boolean'
                ? saved.audio.music
                : true,
            musicVolume: Number.isFinite(saved.audio?.musicVolume)
              ? Math.max(0, Math.min(1, saved.audio!.musicVolume))
              : 0.6,
            effectsVolume: Number.isFinite(saved.audio?.effectsVolume)
              ? Math.max(0, Math.min(1, saved.audio!.effectsVolume))
              : 0.9,
            effects: saved.audio?.effects !== false,
            volume: Number.isFinite(saved.audio?.volume)
              ? Math.min(1, Math.max(0, saved.audio!.volume))
              : 0.35,
          },
        };
      },
    },
  ),
);
export const achievementRules = [
  { id: 'firstPlay', test: (runs: Run[]) => runs.length > 0 },
  {
    id: 'explorer',
    test: (runs: Run[]) => new Set(runs.map((r) => r.game)).size >= 3,
  },
  {
    id: 'mangoMaster',
    test: (runs: Run[]) =>
      runs.some((r) => r.game === 'mango-catch' && r.score >= 100),
  },
  {
    id: 'towerMaster',
    test: (runs: Run[]) =>
      runs.some((r) => r.game === 'temple-tower' && r.score >= 10),
  },
  {
    id: 'rushMaster',
    test: (runs: Run[]) =>
      runs.some((r) => r.game === 'tuk-tuk-rush' && r.score >= 500),
  },
];
