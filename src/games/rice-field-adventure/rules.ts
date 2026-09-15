export type Point = { x: number; y: number };
export const config = {
  seconds: 240,
  rounds: 3,
  speed: 215,
  pickupRadius: 29,
  homeRadius: 48,
  bumpPenalty: 5,
  total: 12,
};
export const home: Point = { x: 90, y: 500 };
export const bundles: Point[] = [
  { x: 180, y: 120 },
  { x: 330, y: 110 },
  { x: 490, y: 120 },
  { x: 670, y: 110 },
  { x: 130, y: 300 },
  { x: 310, y: 280 },
  { x: 485, y: 300 },
  { x: 700, y: 280 },
  { x: 220, y: 480 },
  { x: 370, y: 490 },
  { x: 540, y: 475 },
  { x: 700, y: 490 },
];
export const bundlesFor = (round: number): Point[] =>
  bundles.map((p, i) =>
    round === 0
      ? p
      : round === 1
        ? { x: p.y > 440 ? Math.max(190, 800 - p.x) : 800 - p.x, y: p.y }
        : { x: p.x + (i % 2 ? -30 : 30), y: p.y + (i % 2 ? 20 : -20) },
  );
export const buffaloAt = (seconds: number): Point[] => [
  { x: 400 + Math.sin(seconds * 0.43) * 250, y: 210 },
  { x: 400 + Math.sin(seconds * 0.37 + 2) * 250, y: 385 },
];
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export function moveToward(from: Point, target: Point, dt: number): Point {
  const dx = Math.max(50, Math.min(750, target.x)) - from.x;
  const dy = Math.max(55, Math.min(545, target.y)) - from.y;
  const length = Math.hypot(dx, dy),
    step = Math.min(length, config.speed * Math.max(0, dt));
  return {
    x: from.x + (length ? (dx / length) * step : 0),
    y: from.y + (length ? (dy / length) * step : 0),
  };
}
export const scoreFor = (
  collected: number,
  secondsLeft: number,
  delivered: boolean,
) =>
  collected * 100 + (delivered ? Math.max(0, Math.floor(secondsLeft)) * 5 : 0);
