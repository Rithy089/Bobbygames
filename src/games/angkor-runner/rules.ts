import { freshSnapshot, type Input } from '../shared/types';
import { environmentAt } from './environment';
export const config = {
  gravity: 1800,
  jumpSpeed: 720,
  slideSeconds: 0.75,
  protection: 1.4,
  spawnDepth: 240,
  laneSpeed: 8,
};
export type Lane = -1 | 0 | 1;
export type TrailItem = {
  z: number;
  lane: Lane;
  kind: 'log' | 'branch' | 'rock' | 'coin';
  resolved: boolean;
  appearance?: 'cart' | 'baskets' | 'planter' | 'bamboo';
  intro?: boolean;
};
export const difficulty = (seconds: number) => ({
  speed: Math.min(90, 55 + Math.max(0, seconds) * 0.2),
  interval: Math.max(1.65, 2.4 - Math.max(0, seconds) * 0.004),
});
export const clampLane = (lane: number): Lane =>
  Math.max(-1, Math.min(1, lane)) as Lane;
// A fixed camera: this projection is shared by trail marks and objects.
export function project(lane: number, z: number) {
  const scale = 1 / (1 + Math.max(-35, z) / 80);
  return { x: 400 + lane * 170 * scale, y: 155 + 345 * scale, scale };
}
export function makeRow(
  count: number,
  random: () => number,
  zone = 0,
  zoneRow = count,
): TrailItem[] {
  const safe = ((count % 3) - 1) as Lane;
  const intro = count < 3 || (zone > 0 && zoneRow === 0);
  const blocked: Lane[] = intro
    ? [0]
    : ([-1, 0, 1] as Lane[]).filter((lane) => lane !== safe);
  const kinds = (
    zone === 1
      ? ['branch', 'rock', 'branch']
      : zone === 2
        ? ['log', 'rock', 'branch']
        : zone === 3
          ? ['rock', 'branch', 'log']
          : ['log', 'branch', 'rock']
  ) as ('log' | 'branch' | 'rock')[];
  const items: TrailItem[] = blocked.map((lane) => {
    const kind =
      count === 0
        ? 'log'
        : count === 1 || (zone === 1 && zoneRow === 0)
          ? 'branch'
          : zone === 2 && zoneRow === 0
            ? 'log'
            : zone === 3 && zoneRow === 0
              ? 'rock'
              : zone === 4 && zoneRow === 0
                ? 'log'
                : kinds[Math.min(2, Math.floor(random() * 3))];
    const appearance =
      zone === 2 && kind === 'log'
        ? 'baskets'
        : zone === 3 && kind === 'rock'
          ? 'planter'
          : zone === 4 && kind === 'log'
            ? 'bamboo'
            : kind === 'rock' && count >= 6 && count % 2 === 0 && zone !== 4
              ? 'cart'
              : undefined;
    return {
      lane,
      z: config.spawnDepth,
      kind,
      resolved: false,
      appearance,
      intro: zone > 0 && zoneRow === 0,
    };
  });
  const coinLane = intro ? -1 : safe;
  for (const z of [205, 220, 235])
    items.push({ lane: coinLane, z, kind: 'coin', resolved: false });
  return items;
}
export function collides(
  item: TrailItem,
  lane: number,
  height: number,
  sliding: boolean,
) {
  if (Math.abs(item.lane - lane) > 0.42) return false;
  if (item.kind === 'coin') return height < 100;
  if (item.kind === 'log') return height < 42;
  if (item.kind === 'branch') return !sliding || height > 15;
  return true;
}
export function initialState() {
  return {
    snapshot: freshSnapshot(),
    lane: 0,
    targetLane: 0 as Lane,
    height: 0,
    velocity: 0,
    slide: 0,
    protection: 0,
    spawn: 0.8,
    count: 0,
    zone: 0,
    zoneRows: 0,
    coins: 0,
    previousJump: false,
    previousSlide: false,
    feedback: 0,
    landing: 0,
    hit: false,
    items: [] as TrailItem[],
    rings: [] as { lane: number; age: number }[],
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
  const oldLane = state.lane,
    oldHeight = state.height;
  if (input.direction)
    state.targetLane = clampLane(state.targetLane + input.direction);
  const move = state.targetLane - state.lane;
  state.lane +=
    Math.sign(move) * Math.min(Math.abs(move), config.laneSpeed * dt);
  const jump = !!input.up || input.action,
    slide = !!input.down || !!input.slideAction;
  state.slide = Math.max(0, state.slide - dt);
  state.protection = Math.max(0, state.protection - dt);
  state.feedback = Math.max(0, state.feedback - dt);
  state.landing = Math.max(0, state.landing - dt);
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
  if (oldHeight > 0 && state.height === 0) state.landing = 0.22;
  snapshot.distance += (d.speed * dt) / 3;
  state.spawn -= dt;
  if (state.spawn <= 0) {
    const zone = environmentAt(snapshot.distance).current;
    if (zone !== state.zone) {
      state.zone = zone;
      state.zoneRows = 0;
    }
    state.items.push(...makeRow(state.count++, random, zone, state.zoneRows++));
    state.spawn += d.interval;
  }
  state.rings = state.rings
    .map((r) => ({ ...r, age: r.age + dt }))
    .filter((r) => r.age < 0.65);
  for (const item of state.items) {
    const previousZ = item.z;
    item.z -= d.speed * dt;
    if (item.resolved || previousZ < 0 || item.z > 0) continue;
    item.resolved = true;
    const fraction = previousZ / (previousZ - item.z);
    const lane = oldLane + (state.lane - oldLane) * fraction,
      height = oldHeight + (state.height - oldHeight) * fraction;
    if (collides(item, lane, height, state.slide > 0)) {
      if (item.kind === 'coin') {
        state.coins++;
        snapshot.combo++;
        state.hit = false;
        state.feedback = 0.65;
        state.rings.push({ lane: state.lane, age: 0 });
        cues.push(snapshot.combo % 3 === 0 ? 'perfect' : 'catch');
      } else if (state.protection === 0) {
        snapshot.lives--;
        snapshot.combo = 0;
        state.protection = config.protection;
        state.hit = true;
        state.feedback = 0.75;
        cues.push('miss');
      }
    } else if (item.kind === 'coin') snapshot.combo = 0;
  }
  state.items = state.items.filter((item) => item.z > -35);
  snapshot.score = Math.floor(snapshot.distance) + state.coins * 50;
  if (snapshot.lives <= 0) snapshot.phase = 'over';
  return cues;
}
