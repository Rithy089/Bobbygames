export const config = {
  lives: 3,
  basketWidth: 102,
  catchY: 520,
  maxSeconds: 3600,
};
export type MangoState = {
  score: number;
  lives: number;
  streak: number;
  combo: number;
};
export const difficulty = (seconds: number) => ({
  speed: Math.min(350, 145 + seconds * 2.5),
  spawn: Math.max(0.48, 1.15 - seconds * 0.008),
  hazardChance: Math.min(0.27, 0.13 + seconds * 0.001),
});
export function catchItem(s: MangoState, hazard: boolean): MangoState {
  if (hazard)
    return { ...s, lives: Math.max(0, s.lives - 1), streak: 0, combo: 0 };
  const streak = s.streak + 1;
  const combo = Math.min(5, 1 + Math.floor(streak / 5));
  return { ...s, score: s.score + 10 * combo, streak, combo };
}
export function missItem(s: MangoState, hazard: boolean): MangoState {
  return hazard
    ? s
    : { ...s, lives: Math.max(0, s.lives - 1), streak: 0, combo: 0 };
}
export const isOver = (s: MangoState) => s.lives <= 0;
