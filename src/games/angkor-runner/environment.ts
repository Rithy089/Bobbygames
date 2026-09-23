import { sprite } from '../shared/sprites';

export const environments = [
  'runner-forward-bg',
  'runner-courtyard-bg',
  'runner-green-trail-bg',
] as const;
// Distance-based scenery freezes naturally on pause and returns to forest on restart.
export function environmentAt(distance: number, reduced = false) {
  const progress = Math.max(0, distance) % 900;
  const current = Math.floor(progress / 300);
  const t = Math.max(0, ((progress % 300) - 225) / 75);
  return reduced
    ? { current: 0, next: 0, blend: 0 }
    : { current, next: (current + 1) % 3, blend: t * t * (3 - 2 * t) };
}
export function drawEnvironment(
  ctx: CanvasRenderingContext2D,
  distance: number,
  reduced: boolean,
) {
  const phase = environmentAt(distance, reduced);
  ctx.save();
  sprite(ctx, environments[phase.current], 0, 0, 800, 600);
  if (phase.blend > 0) {
    ctx.globalAlpha = phase.blend;
    sprite(ctx, environments[phase.next], 0, 0, 800, 600);
  }
  ctx.restore();
  const weights = [0, 0, 0];
  weights[phase.current] += 1 - phase.blend;
  weights[phase.next] += phase.blend;
  return weights;
}
