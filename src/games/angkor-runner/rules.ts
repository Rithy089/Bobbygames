import { freshSnapshot, type Input } from '../shared/types';

export const config = {
  ground: 450,
  playerX: 160,
  gravity: 1800,
  jumpSpeed: 720,
  slideSeconds: 0.75,
  protection: 1.4,
};
export type TrailItem = {
  x: number;
  kind: 'log' | 'branch' | 'fruit';
  resolved: boolean;
};
export const difficulty = (seconds: number) => ({
  speed: Math.min(410, 240 + Math.max(0, seconds) * 1.1),
  interval: Math.max(1.7, 2.5 - Math.max(0, seconds) * 0.006),
});
export const body = (height: number, sliding: boolean) => ({
  left: 147,
  right: 173,
  top: config.ground - height - (sliding ? 28 : 64),
  bottom: config.ground - height - 4,
});
export function collides(
  item: TrailItem,
  previousX: number,
  height: number,
  sliding: boolean,
) {
  const player = body(height, sliding);
  const bounds =
    item.kind === 'log'
      ? { width: 54, top: 414, bottom: 450 }
      : item.kind === 'branch'
        ? { width: 90, top: 365, bottom: 405 }
        : { width: 26, top: 404, bottom: 430 };
  return (
    item.x < player.right &&
    previousX + bounds.width > player.left &&
    player.bottom > bounds.top &&
    player.top < bounds.bottom
  );
}
export function initialState() {
  return {
    snapshot: freshSnapshot(),
    height: 0,
    velocity: 0,
    slide: 0,
    protection: 0,
    spawn: 1.5,
    count: 0,
    fruits: 0,
    previousJump: false,
    previousSlide: false,
    feedback: 0,
    hit: false,
    items: [] as TrailItem[],
    rings: [] as { x: number; age: number }[],
  };
}
export type RunnerState = ReturnType<typeof initialState>;
export function advance(
  state: RunnerState,
  dt: number,
  input: Input,
  random: () => number = Math.random,
): ('catch' | 'miss' | 'perfect')[] {
  const cues: ('catch' | 'miss' | 'perfect')[] = [];
  const { snapshot } = state;
  const d = difficulty(snapshot.elapsed);
  const jump = !!input.up || input.action;
  const slide = !!input.down || !!input.slideAction;
  state.slide = Math.max(0, state.slide - dt);
  state.protection = Math.max(0, state.protection - dt);
  state.feedback = Math.max(0, state.feedback - dt);
  if (jump && !state.previousJump && state.height === 0 && state.slide === 0)
    state.velocity = config.jumpSpeed;
  if (
    slide &&
    !state.previousSlide &&
    state.height === 0 &&
    state.velocity === 0
  )
    state.slide = config.slideSeconds;
  state.previousJump = jump;
  state.previousSlide = slide;
  state.height = Math.max(
    0,
    state.height + state.velocity * dt - (config.gravity * dt * dt) / 2,
  );
  state.velocity = state.height > 0 ? state.velocity - config.gravity * dt : 0;
  snapshot.distance += (d.speed * dt) / 12;
  state.spawn -= dt;
  if (state.spawn <= 0) {
    const kind =
      state.count < 2
        ? state.count === 0
          ? 'log'
          : 'branch'
        : random() < 0.5
          ? 'log'
          : 'branch';
    state.items.push(
      { x: 850, kind, resolved: false },
      { x: 1030, kind: 'fruit', resolved: false },
    );
    state.count++;
    state.spawn += d.interval;
  }
  state.rings = state.rings
    .map((r) => ({ x: r.x - d.speed * dt, age: r.age + dt }))
    .filter((r) => r.age < 0.65);
  for (const item of state.items) {
    const previousX = item.x;
    item.x -= d.speed * dt;
    if (item.resolved) continue;
    if (collides(item, previousX, state.height, state.slide > 0)) {
      item.resolved = true;
      if (item.kind === 'fruit') {
        state.fruits++;
        snapshot.combo++;
        state.hit = false;
        state.feedback = 0.65;
        state.rings.push({ x: config.playerX, age: 0 });
        cues.push(snapshot.combo % 3 === 0 ? 'perfect' : 'catch');
      } else if (state.protection === 0) {
        snapshot.lives--;
        snapshot.combo = 0;
        state.protection = config.protection;
        state.hit = true;
        state.feedback = 0.75;
        cues.push('miss');
      }
    } else if (item.x < 105 && item.kind === 'fruit') {
      item.resolved = true;
      snapshot.combo = 0;
    }
  }
  state.items = state.items.filter((item) => item.x > -150);
  snapshot.score = Math.floor(snapshot.distance) + state.fruits * 50;
  if (snapshot.lives <= 0) snapshot.phase = 'over';
  return cues;
}
