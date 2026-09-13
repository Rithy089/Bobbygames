import { createLoop } from '../shared/loop';
import {
  freshSnapshot,
  type GameOptions,
  type Scene,
  W,
  H,
} from '../shared/types';
import { sprite } from '../shared/sprites';
import {
  config,
  difficulty,
  clampX,
  collides,
  scoreFor,
  type RiverItem,
} from './rules';

export function createRiverScene(options: GameOptions): Scene {
  const snapshot = freshSnapshot();
  let x = 400,
    target = 400,
    lastPointer: number | null = null;
  let spawn = 1.2,
    count = 0,
    baskets = 0,
    protection = 0,
    feedback = 0,
    caught = false;
  let items: RiverItem[] = [];
  return {
    snapshot,
    reset() {
      Object.assign(snapshot, freshSnapshot());
      x = target = 400;
      lastPointer = null;
      spawn = 1.2;
      count = baskets = protection = feedback = 0;
      items = [];
    },
    update(dt, input) {
      const d = difficulty(snapshot.elapsed),
        previousX = x;
      if (input.pointer !== null && input.pointer !== lastPointer) {
        target = clampX(input.pointer);
        lastPointer = input.pointer;
      }
      if (input.left || input.right)
        target = clampX(
          x + (Number(input.right) - Number(input.left)) * 350 * dt,
        );
      x = clampX(x + Math.max(-350 * dt, Math.min(350 * dt, target - x)));
      protection = Math.max(0, protection - dt);
      feedback = Math.max(0, feedback - dt);
      snapshot.distance += (d.speed * dt) / 10;
      spawn -= dt;
      if (spawn <= 0) {
        spawn += d.interval;
        count++;
        // One object per row, always leaving a wide navigable channel.
        items.push({
          x: 260 + Math.floor(Math.random() * 3) * 140,
          y: -60,
          type: count % 3 === 1 ? 'basket' : count % 2 === 0 ? 'log' : 'rock',
        });
      }
      for (const item of items) {
        const previousY = item.y;
        item.y += d.speed * dt;
        if (!collides(previousX, x, item, previousY)) continue;
        if (item.type === 'basket') {
          baskets++;
          snapshot.combo++;
          caught = true;
          feedback = 0.65;
          options.audio(snapshot.combo % 3 === 0 ? 'perfect' : 'catch');
          item.y = H + 100;
        } else if (protection === 0) {
          snapshot.lives--;
          snapshot.combo = 0;
          protection = 1.5;
          caught = false;
          feedback = 0.65;
          item.y = H + 100;
          options.audio('miss');
          if (snapshot.lives === 0) {
            snapshot.phase = 'over';
            break;
          }
        }
      }
      items = items.filter((item) => item.y < H + 70);
      snapshot.score = scoreFor(snapshot.distance, baskets);
      if (snapshot.elapsed >= config.maxSeconds) snapshot.phase = 'over';
    },
    draw(ctx) {
      const reduced = options.reducedMotion?.() ?? false;
      ctx.clearRect(0, 0, W, H);
      sprite(ctx, 'mekong-bg', 0, 0, W, H);
      // Subtle water strokes and wake; the banks stay still for visual comfort.
      ctx.strokeStyle = '#def5de';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.18;
      for (let i = 0; i < 9; i++) {
        const y =
          ((i * 79 + (reduced ? 0 : snapshot.distance * 1.6)) % 650) - 25;
        const wx = 250 + ((i * 97) % 290);
        ctx.beginPath();
        ctx.moveTo(wx, y);
        ctx.quadraticCurveTo(wx + 15, y + 4, wx + 30, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const item of items) {
        const w = item.type === 'log' ? 100 : 66,
          h = item.type === 'log' ? 38 : 62;
        sprite(
          ctx,
          'mekong-' + item.type,
          item.x - w / 2,
          item.y - h / 2,
          w,
          h,
        );
      }
      if (!reduced && snapshot.phase === 'running') {
        ctx.strokeStyle = '#d7f4e8';
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 16, 514);
        ctx.lineTo(x - 28, 553);
        ctx.moveTo(x + 16, 514);
        ctx.lineTo(x + 28, 553);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      sprite(ctx, 'mekong-boat', x - 31, config.playerY - 53, 62, 106);
      if (protection > 0) {
        ctx.strokeStyle = '#fff2bf';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x, config.playerY, 39, 61, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (feedback > 0) {
        ctx.font = 'bold 22px Inter';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#163e40';
        ctx.fillStyle = caught ? '#fff3bf' : '#ffe0d4';
        const text = caught ? '+50' : '−1 ♥';
        ctx.strokeText(text, x, 420);
        ctx.fillText(text, x, 420);
      }
    },
  };
}
export default function createGame(options: GameOptions) {
  return createLoop(createRiverScene(options), options);
}
