import { sprite } from '../shared/sprites';

export const environments = [
  'runner-forward-bg',
  'runner-angkor-vista-bg',
  'runner-siem-reap-river-bg',
  'runner-courtyard-bg',
  'runner-green-trail-bg',
] as const;
export const segmentDistance = 550;
export const transitionDistance = 140;
// Distance-based scenery freezes naturally on pause and returns to forest on restart.
export function environmentAt(distance: number, reduced = false) {
  const progress =
    Math.max(0, distance) % (segmentDistance * environments.length);
  const current = Math.floor(progress / segmentDistance);
  const t = Math.max(
    0,
    ((progress % segmentDistance) - (segmentDistance - transitionDistance)) /
      transitionDistance,
  );
  return reduced
    ? { current, next: current, blend: 0 }
    : {
        current,
        next: (current + 1) % environments.length,
        blend: t * t * (3 - 2 * t),
      };
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
  const weights = environments.map(() => 0);
  weights[phase.current] += 1 - phase.blend;
  weights[phase.next] += phase.blend;
  return weights;
}
