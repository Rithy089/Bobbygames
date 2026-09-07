export const config = {
  lanes: [280, 400, 520],
  playerY: 492,
  maxSeconds: 3600,
};
export const difficulty = (seconds: number) => ({
  speed: Math.min(510, 230 + seconds * 3),
  spawn: Math.max(0.65, 1.35 - seconds * 0.009),
  distanceRate: Math.min(100, 30 + seconds * 0.9),
});
export const changeLane = (lane: number, direction: number) =>
  Math.max(0, Math.min(2, lane + direction));
export const collides = (
  lane: number,
  item: { lane: number; y: number; type: string },
) =>
  lane === item.lane &&
  Math.abs(item.y - config.playerY) < (item.type === 'coin' ? 37 : 49);
export const scoreFor = (distance: number, coins: number) =>
  Math.floor(distance) + coins * 25;
