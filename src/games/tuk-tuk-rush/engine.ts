import { createLoop } from '../shared/loop';
import {
  freshSnapshot,
  type GameOptions,
  type Scene,
  W,
  H,
} from '../shared/types';
import { street, vehicle, object, project } from './render';
import { difficulty, changeLane, collidesAt, scoreFor, config } from './rules';
import { steer } from './rules';
export default function createGame(options: GameOptions) {
  const snapshot = freshSnapshot();
  let lane = 1,
    visualX = 400,
    spawn = 0.7,
    scroll = 0,
    coins = 0,
    tokenGlow = 0,
    lean = 0;
  let items: {
    lane: number;
    y: number;
    type: 'coin' | 'car' | 'cone';
    variant: number;
  }[] = [];
  const scene: Scene = {
    snapshot,
    reset() {
      Object.assign(snapshot, freshSnapshot());
      lane = 1;
      visualX = 400;
      spawn = 0.7;
      scroll = 0;
      coins = 0;
      tokenGlow = 0;
      lean = 0;
      items = [];
    },
    update(dt, input) {
      const d = difficulty(snapshot.elapsed);
      if (input.direction) lane = changeLane(lane, input.direction);
      if (input.action && input.pointer !== null) {
        const p = project(400, config.playerY);
        const worldX = 400 + (input.pointer - 400) / p.scale;
        lane = Math.max(
          0,
          Math.min(2, Math.round((worldX - config.lanes[0]) / 120)),
        );
      }
      const previousX = visualX;
      visualX = steer(visualX, config.lanes[lane], dt);
      lean = options.reducedMotion?.()
        ? 0
        : Math.max(
            -0.065,
            Math.min(
              0.065,
              ((visualX - previousX) / Math.max(dt, 0.001)) * 0.00007,
            ),
          );
      snapshot.distance += d.distanceRate * dt;
      scroll += d.speed * dt;
      tokenGlow = Math.max(0, tokenGlow - dt);
      spawn -= dt;
      if (spawn <= 0) {
        spawn = d.spawn;
        const target = Math.floor(Math.random() * 3);
        items.push({
          lane: target,
          y: -70,
          variant: Math.floor(snapshot.elapsed) % 4,
          type:
            Math.random() < 0.28
              ? 'coin'
              : Math.random() < 0.3
                ? 'cone'
                : 'car',
        });
      }
      for (const item of items) {
        const previousY = item.y;
        item.y += d.speed * dt;
        if (collidesAt(visualX, item, previousY)) {
          if (item.type === 'coin') {
            coins++;
            snapshot.combo++;
            tokenGlow = 0.25;
            item.y = 1000;
            options.audio('catch');
          } else {
            snapshot.phase = 'over';
            snapshot.lives = 0;
            options.audio('miss');
            break;
          }
        }
      }
      items = items.filter((i) => i.y < H + 70);
      snapshot.score = scoreFor(snapshot.distance, coins);
      if (snapshot.elapsed >= config.maxSeconds) snapshot.phase = 'over';
    },
    draw(ctx) {
      const reduced = options.reducedMotion?.() ?? false;
      street(ctx, scroll, reduced);
      const drawPlayer = () =>
        vehicle(
          ctx,
          visualX,
          config.playerY,
          'tuk',
          0,
          lean,
          snapshot.phase === 'over',
        );
      let playerDrawn = false;
      for (const item of [...items].sort((a, b) => a.y - b.y)) {
        if (!playerDrawn && item.y > config.playerY) {
          drawPlayer();
          playerDrawn = true;
        }
        const x = config.lanes[item.lane];
        if (item.type === 'car') vehicle(ctx, x, item.y, 'car', item.variant);
        else object(ctx, x, item.y, item.type);
      }
      if (!playerDrawn) drawPlayer();
      if (tokenGlow > 0) {
        const p = project(visualX, config.playerY);
        ctx.fillStyle = '#fff0b9';
        ctx.strokeStyle = '#514631';
        ctx.lineWidth = 3;
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        const y = p.y - 95 - (reduced ? 0 : (0.25 - tokenGlow) * 35);
        ctx.strokeText('+25', p.x, y);
        ctx.fillText('+25', p.x, y);
      }
      if (snapshot.phase === 'over') {
        ctx.strokeStyle = '#c9634d';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, W - 8, H - 8);
      }
    },
  };
  return createLoop(scene, options);
}
