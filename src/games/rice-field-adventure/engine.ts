import { createLoop } from '../shared/loop';
import {
  freshSnapshot,
  type Scene,
  type GameOptions,
  W,
  H,
} from '../shared/types';
import { sprite } from '../shared/sprites';
import {
  config,
  home,
  bundles,
  buffaloAt,
  distance,
  moveToward,
  scoreFor,
  type Point,
} from './rules';

export function createFieldScene(options: GameOptions): Scene {
  const snapshot = freshSnapshot();
  snapshot.distance = config.seconds;
  let position = { ...home },
    target = { ...home },
    penalty = 0,
    protection = 0,
    walking = false,
    facing = 1;
  let pointer: Point | null = null;
  let collected = new Set<number>();
  let particles: (Point & { age: number })[] = [];
  let feedback = 0,
    bumped = false;
  return {
    snapshot,
    reset() {
      Object.assign(snapshot, freshSnapshot(), { distance: config.seconds });
      position = { ...home };
      target = { ...home };
      pointer = null;
      penalty = protection = feedback = 0;
      walking = false;
      facing = 1;
      collected = new Set();
      particles = [];
    },
    update(dt, input) {
      if (input.pointer === null && pointer) target = { ...position };
      if (
        input.pointer !== null &&
        (input.pointer !== pointer?.x || input.pointerY !== pointer?.y)
      ) {
        target = { x: input.pointer, y: input.pointerY ?? position.y };
      }
      pointer =
        input.pointer === null
          ? null
          : { x: input.pointer, y: input.pointerY ?? position.y };
      if (input.left || input.right || input.up || input.down)
        target = {
          x:
            position.x +
            (Number(input.right) - Number(input.left)) * config.speed * dt,
          y:
            position.y +
            (Number(!!input.down) - Number(!!input.up)) * config.speed * dt,
        };
      const next = moveToward(position, target, dt);
      walking = distance(position, next) > 0.01;
      if (Math.abs(next.x - position.x) > 0.1)
        facing = next.x > position.x ? 1 : -1;
      protection = Math.max(0, protection - dt);
      feedback = Math.max(0, feedback - dt);
      const hit = buffaloAt(snapshot.elapsed).some(
        (animal) => distance(next, animal) < 43,
      );
      if (hit && protection === 0) {
        penalty += config.bumpPenalty;
        protection = 1.4;
        bumped = true;
        feedback = 0.8;
        options.audio('miss');
      } else position = next;
      particles = options.reducedMotion?.()
        ? []
        : particles
            .map((p) => ({ ...p, age: p.age + dt }))
            .filter((p) => p.age < 0.65);
      bundles.forEach((bundle, id) => {
        if (
          !collected.has(id) &&
          distance(position, bundle) < config.pickupRadius
        ) {
          collected.add(id);
          particles.push({ ...bundle, age: 0 });
          bumped = false;
          feedback = 0.65;
          options.audio(collected.size % 4 === 0 ? 'perfect' : 'catch');
        }
      });
      snapshot.combo = collected.size;
      snapshot.distance = Math.max(
        0,
        config.seconds - snapshot.elapsed - penalty,
      );
      const delivered =
        collected.size === config.total &&
        distance(position, home) < config.homeRadius &&
        snapshot.distance > 0;
      snapshot.height = delivered ? 1 : 0;
      snapshot.score = scoreFor(collected.size, snapshot.distance, delivered);
      if (delivered || snapshot.distance === 0) {
        snapshot.phase = 'over';
        walking = false;
        if (delivered) options.audio('perfect');
      }
    },
    draw(ctx) {
      const reduced = options.reducedMotion?.() ?? false;
      ctx.clearRect(0, 0, W, H);
      sprite(ctx, 'rice-bg', 0, 0, W, H);
      const ready = collected.size === config.total;
      ctx.fillStyle = ready ? '#fff2a7' : '#f3ddb0';
      ctx.globalAlpha = ready ? 0.5 : 0.22;
      ctx.beginPath();
      ctx.ellipse(
        home.x,
        home.y + 13,
        48 + (!reduced && ready ? Math.sin(snapshot.elapsed * 3) * 3 : 0),
        29,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.globalAlpha = 1;
      sprite(ctx, 'rice-cart', home.x - 34, home.y - 48, 68, 85);
      bundles.forEach((bundle, id) => {
        if (collected.has(id)) return;
        const bob = reduced ? 0 : Math.sin(snapshot.elapsed * 2.8 + id) * 2;
        ctx.fillStyle = '#fff0a6';
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.ellipse(bundle.x, bundle.y + 13, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        sprite(ctx, 'rice-bundle', bundle.x - 19, bundle.y - 27 + bob, 38, 48);
      });
      for (const animal of buffaloAt(snapshot.elapsed)) {
        sprite(ctx, 'rice-buffalo', animal.x - 27, animal.y - 38, 54, 76);
      }
      if (!reduced)
        for (const p of particles) {
          ctx.globalAlpha = 1 - p.age / 0.65;
          ctx.strokeStyle = '#fff3ad';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 14 + p.age * 34, 0, Math.PI * 2);
          ctx.stroke();
        }
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(position.x, position.y);
      if (!reduced && walking)
        ctx.rotate(Math.sin(snapshot.elapsed * 13) * 0.045);
      ctx.scale(facing, 1);
      sprite(
        ctx,
        'rice-farmer',
        -20,
        -34 + (!reduced && walking ? Math.sin(snapshot.elapsed * 13) * 1.5 : 0),
        40,
        64,
      );
      ctx.restore();
      if (protection > 0) {
        ctx.strokeStyle = '#fff7db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(position.x, position.y, 31, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (feedback > 0) {
        const text = bumped ? '−5 s' : '+100';
        ctx.font = 'bold 21px Inter';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#334124';
        ctx.fillStyle = '#fff8d7';
        const y = Math.max(
          24,
          position.y - 45 - (reduced ? 0 : (0.8 - feedback) * 12),
        );
        ctx.strokeText(text, position.x, y);
        ctx.fillText(text, position.x, y);
      }
    },
  };
}
export default function createGame(options: GameOptions) {
  return createLoop(createFieldScene(options), {
    ...options,
    freeMovement: true,
  });
}
