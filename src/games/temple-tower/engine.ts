import { createLoop } from '../shared/loop';
import {
  freshSnapshot,
  type GameOptions,
  type Scene,
  W,
  H,
} from '../shared/types';
import { rounded } from '../shared/draw';
import { place, difficulty, config, award, type Block } from './rules';
export default function createGame(options: GameOptions) {
  const snapshot = freshSnapshot();
  let blocks: Block[] = [{ x: 285, width: config.baseWidth }];
  let moving: Block = { x: 60, width: config.baseWidth };
  let direction = 1,
    pulse = 0;
  let fragments: { x: number; y: number; width: number; vy: number }[] = [];
  const scene: Scene = {
    snapshot,
    reset() {
      Object.assign(snapshot, freshSnapshot());
      blocks = [{ x: 285, width: config.baseWidth }];
      moving = { x: 60, width: config.baseWidth };
      direction = 1;
      pulse = 0;
      fragments = [];
    },
    update(dt, input) {
      moving.x += direction * difficulty(snapshot.height) * dt;
      if (moving.x < 25) {
        moving.x = 25;
        direction = 1;
      }
      if (moving.x + moving.width > W - 25) {
        moving.x = W - 25 - moving.width;
        direction = -1;
      }
      pulse = Math.max(0, pulse - dt);
      for (const f of fragments) {
        f.vy += 900 * dt;
        f.y += f.vy * dt;
      }
      fragments = fragments.filter((f) => f.y < H + 100);
      if (input.action) {
        const result = place(blocks[blocks.length - 1], moving);
        if (result.miss) {
          snapshot.phase = 'over';
          options.audio('miss');
          return;
        }
        const viewTop = 490 - Math.min(blocks.length, 12) * config.blockHeight;
        if (!result.perfect) {
          const cut = moving.width - result.width;
          fragments.push({
            x: moving.x < result.x ? moving.x : result.x + result.width,
            y: viewTop,
            width: cut,
            vy: 0,
          });
        }
        blocks.push({ x: result.x, width: result.width });
        Object.assign(
          snapshot,
          award(snapshot.height, snapshot.combo, result.perfect),
        );
        options.audio(result.perfect ? 'perfect' : 'catch');
        pulse = result.perfect ? 0.3 : 0;
        direction = blocks.length % 2 ? 1 : -1;
        moving = {
          x: direction === 1 ? 25 : W - 25 - result.width,
          width: result.width,
        };
      }
      if (snapshot.elapsed >= config.maxSeconds) snapshot.phase = 'over';
    },
    draw(ctx) {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#453d6b');
      bg.addColorStop(0.6, '#c18394');
      bg.addColorStop(1, '#e9b885');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f6c28e';
      ctx.beginPath();
      ctx.arc(615, 180, 68, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = ['#716281', '#826a84', '#967687'][i];
        ctx.beginPath();
        ctx.moveTo(0, 440 + i * 45);
        for (let x = 0; x <= 850; x += 100)
          ctx.lineTo(x, 370 + i * 50 + Math.sin(x * 0.016 + i) * 30);
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.fill();
      }
      rounded(ctx, 195, 521, 410, 34, 9, '#544252');
      const start = Math.max(0, blocks.length - 12);
      const drawBlock = (b: Block, y: number, index: number) => {
        const color = ['#dec29b', '#cda47c', '#d9b58a', '#e7c89f'][index % 4];
        rounded(ctx, b.x, y, b.width, config.blockHeight - 2, 3, color);
        rounded(ctx, b.x + 3, y + 3, Math.max(0, b.width - 6), 5, 2, '#fae2b3');
        ctx.strokeStyle = '#a17c62';
        ctx.lineWidth = 2;
        for (let x = b.x + 14; x < b.x + b.width - 10; x += 24) {
          ctx.beginPath();
          ctx.moveTo(x, y + 11);
          ctx.lineTo(x + 6, y + 18);
          ctx.lineTo(x, y + 24);
          ctx.lineTo(x - 6, y + 18);
          ctx.closePath();
          ctx.stroke();
        }
      };
      blocks
        .slice(start)
        .forEach((b, i) =>
          drawBlock(b, 490 - i * config.blockHeight, start + i),
        );
      drawBlock(
        moving,
        490 - Math.min(blocks.length, 12) * config.blockHeight,
        blocks.length,
      );
      ctx.strokeStyle = '#ffffff22';
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.moveTo(400, 30);
      ctx.lineTo(400, 510);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const f of fragments)
        rounded(ctx, f.x, f.y, f.width, 28, 3, '#b48e73');
      if (pulse > 0) {
        ctx.fillStyle = '#ffe7b6';
        ctx.font = 'bold 25px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦ ×' + snapshot.combo, 400, 60);
      }
    },
  };
  return createLoop(scene, options);
}
