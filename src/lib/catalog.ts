export type GameId =
  | 'mango-catch'
  | 'temple-tower'
  | 'tuk-tuk-rush'
  | 'khmer-market-match';
export type Game = {
  id: GameId;
  category: 'arcade' | 'precision' | 'racing' | 'memory';
  difficulty: 'easy' | 'medium';
  color: string;
  inputs: ('keyboard' | 'mouse' | 'touch')[];
  released: string;
};
export const games: Game[] = [
  // Existing order stays stable; the newest sort uses release dates.
  {
    id: 'mango-catch',
    category: 'arcade',
    difficulty: 'easy',
    color: '#edbd55',
    inputs: ['keyboard', 'mouse', 'touch'],
    released: '2026-09-04',
  },
  {
    id: 'temple-tower',
    category: 'precision',
    difficulty: 'medium',
    color: '#bc9ee8',
    inputs: ['keyboard', 'mouse', 'touch'],
    released: '2026-09-05',
  },
  {
    id: 'tuk-tuk-rush',
    category: 'racing',
    difficulty: 'medium',
    color: '#ff9479',
    inputs: ['keyboard', 'touch'],
    released: '2026-09-06',
  },
  {
    id: 'khmer-market-match',
    category: 'memory',
    difficulty: 'easy',
    color: '#69aa77',
    inputs: ['keyboard', 'mouse', 'touch'],
    released: '2026-09-08',
  },
];
export const portfolio = 'https://sayrithy-portfolio.vercel.app/';
export const github = 'https://github.com/Rithy089';
export const projectGithub = 'https://github.com/Rithy089/Bobbygames';
export const linkedin = 'https://www.linkedin.com/in/rithy-say-a59aa32a0/';
export const isGameId = (v: unknown): v is GameId =>
  games.some((g) => g.id === v);
export const validName = (v: string) =>
  /^[\p{L}\p{M}\p{N} _-]{3,20}$/u.test(v.trim()) &&
  !/^(admin|administrator|moderator|bobbygames|supabase)$/i.test(v.trim());
