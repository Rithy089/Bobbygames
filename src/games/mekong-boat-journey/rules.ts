export const config = {
  left: 205,
  right: 595,
  top: 70,
  bottom: 535,
  playerY: 490,
  maxSeconds: 300,
  bonus: 50,
};
export type RiverItem = {
  x: number;
  y: number;
  type: 'basket' | 'log' | 'rock';
};
export const difficulty = (seconds: number) => ({
  speed: Math.min(310, 145 + Math.max(0, seconds) * 1.1),
  interval: Math.max(1.05, 1.85 - Math.max(0, seconds) * 0.004),
});
export const clampX = (x: number) =>
  Math.max(config.left, Math.min(config.right, x));
export const clampY = (y: number) =>
  Math.max(config.top, Math.min(config.bottom, y));
export function moveToward(
  x: number,
  y: number,
  targetX: number,
  targetY: number,
  dt: number,
) {
  const dx = clampX(targetX) - x,
    dy = clampY(targetY) - y;
  const distance = Math.hypot(dx, dy),
    step = Math.min(distance, 350 * Math.max(0, dt));
  return {
    x: clampX(x + (distance ? (dx / distance) * step : 0)),
    y: clampY(y + (distance ? (dy / distance) * step : 0)),
  };
}
export const scoreFor = (distance: number, baskets: number) =>
  Math.floor(distance) + baskets * config.bonus;
// Inset hull and obstacle bounds. Swept relative positions prevent tunnelling
// during a large frame or a lateral movement across an obstacle.
export function collides(
  previousX: number,
  x: number,
  item: RiverItem,
  previousY: number,
  previousBoatY = config.playerY,
  boatY = config.playerY,
) {
  const halfX = item.type === 'log' ? 57 : item.type === 'rock' ? 43 : 40;
  const halfY = item.type === 'log' ? 42 : 48;
  let enter = 0,
    exit = 1;
  for (const [start, end, radius] of [
    [previousX - item.x, x - item.x, halfX],
    [previousY - previousBoatY, item.y - boatY, halfY],
  ]) {
    const delta = end - start;
    if (Math.abs(delta) < 0.00001) {
      if (Math.abs(start) >= radius) return false;
    } else {
      const a = (-radius - start) / delta,
        b = (radius - start) / delta;
      enter = Math.max(enter, Math.min(a, b));
      exit = Math.min(exit, Math.max(a, b));
      if (enter >= exit) return false;
    }
  }
  return true;
}
