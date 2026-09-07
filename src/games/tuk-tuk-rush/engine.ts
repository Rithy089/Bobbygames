import { createLoop } from '../shared/loop';
import {
  freshSnapshot,
  type GameOptions,
  type Scene,
  W,
  H,
} from '../shared/types';
import { rounded, palm } from '../shared/draw';
import { difficulty, changeLane, collidesAt, scoreFor, config } from './rules';
import { sprite } from '../shared/sprites';
export default function createGame(options: GameOptions) {
  const snapshot = freshSnapshot();
  let lane = 1,
    visualX = 400,
    spawn = 0.7,
    scroll = 0,
    coins = 0,
    tokenGlow = 0;
  let items: { lane: number; y: number; type: 'coin' | 'car' | 'cone' }[] = [];
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
      items = [];
    },
    update(dt, input) {
      const d = difficulty(snapshot.elapsed);
      if (input.direction) lane = changeLane(lane, input.direction);
      visualX += (config.lanes[lane] - visualX) * Math.min(1, dt * 20);
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
      ctx.fillStyle = '#dbbf8d';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#4a5360';
      ctx.fillRect(205, 0, 390, H);
      ctx.fillStyle = '#f5d28c';
      ctx.fillRect(201, 0, 5, H);
      ctx.fillRect(595, 0, 5, H);
      ctx.strokeStyle = '#e1d9bc';
      ctx.lineWidth = 4;
      ctx.setLineDash([42, 40]);
      ctx.lineDashOffset = -(scroll % 82);
      for (const x of [340, 460]) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      for (let i = -1; i < 4; i++) {
        const y = i * 220 + (options.reducedMotion?.() ? 0 : scroll % 220);
        for (const [x, color] of [
          [20, '#bb7860'],
          [620, '#68928b'],
        ] as const) {
          rounded(ctx, x, y, 150, 145, 6, color);
          rounded(ctx, x + 12, y + 14, 126, 28, 3, '#f6dba6');
          ctx.fillStyle = '#45645d';
          ctx.font = 'bold 15px Inter, Noto Sans Khmer, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(x === 20 ? 'ផ្សារ' : 'សួស្តី', x + 75, y + 34);
          rounded(ctx, x + 17, y + 62, 43, 67, 2, '#42535a');
          rounded(ctx, x + 80, y + 65, 52, 38, 2, '#ecd0a0');
          sprite(ctx, 'basket', x + 73, y + 97, 62, 43);
          sprite(ctx, x === 20 ? 'mango' : 'bananas', x + 85, y + 88, 40, 35);
          for (let k = 0; k < 6; k++)
            rounded(
              ctx,
              x + k * 25,
              y + 46,
              25,
              16,
              2,
              k % 2 ? '#ebcba1' : '#c96556',
            );
        }
        palm(ctx, 173, y + 175, 0.45);
        palm(ctx, 615, y + 135, 0.4);
      }
      for (const item of items) {
        const x = config.lanes[item.lane];
        if (item.type === 'coin') {
          ctx.fillStyle = '#ffcf58';
          ctx.beginPath();
          ctx.arc(x, item.y, 19, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#bf8429';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, item.y, 12, 0, Math.PI * 2);
          ctx.stroke();
        } else if (item.type === 'cone') {
          ctx.fillStyle = '#f68b55';
          ctx.beginPath();
          ctx.moveTo(x, item.y - 25);
          ctx.lineTo(x + 24, item.y + 22);
          ctx.lineTo(x - 24, item.y + 22);
          ctx.closePath();
          ctx.fill();
          rounded(ctx, x - 13, item.y + 3, 26, 8, 1, '#f7dfb1');
          rounded(ctx, x - 28, item.y + 20, 56, 7, 2, '#41484c');
        } else {
          rounded(ctx, x - 35, item.y - 47, 70, 94, 12, '#c47065');
          rounded(ctx, x - 27, item.y - 24, 54, 39, 6, '#526b75');
          rounded(ctx, x - 25, item.y + 25, 50, 12, 4, '#e2997e');
          rounded(ctx, x - 28, item.y - 40, 14, 8, 2, '#ffe4a2');
          rounded(ctx, x + 14, item.y - 40, 14, 8, 2, '#ffe4a2');
        }
      }
      const x = visualX,
        y = config.playerY;
      ctx.fillStyle = '#0003';
      ctx.beginPath();
      ctx.ellipse(x, y + 42, 48, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      rounded(ctx, x - 45, y + 7, 12, 36, 5, '#263c43');
      rounded(ctx, x + 33, y + 7, 12, 36, 5, '#263c43');
      rounded(ctx, x - 7, y - 60, 14, 28, 5, '#263c43');
      rounded(ctx, x - 36, y - 36, 72, 80, 11, '#43b6ac');
      rounded(ctx, x - 31, y - 32, 62, 24, 6, '#f4c766');
      rounded(ctx, x - 29, y - 4, 58, 33, 5, '#345e67');
      rounded(ctx, x - 33, y + 33, 66, 9, 4, '#f4c766');
      // Original open passenger cabin, red canopy trim and blue chassis.
      rounded(ctx, x - 37, y - 39, 74, 8, 3, '#b74443');
      rounded(ctx, x - 25, y + 1, 50, 20, 4, '#e4a663');
      rounded(ctx, x - 30, y + 24, 60, 8, 3, '#275a91');
      rounded(ctx, x - 31, y - 6, 4, 39, 1, '#e8d6a3');
      rounded(ctx, x + 27, y - 6, 4, 39, 1, '#e8d6a3');
      rounded(ctx, x - 45, y - 22, 12, 5, 2, '#e8d6a3');
      rounded(ctx, x + 33, y - 22, 12, 5, 2, '#e8d6a3');
      ctx.fillStyle = '#ffe9a6';
      ctx.beginPath();
      ctx.arc(x - 20, y - 20, 6, 0, Math.PI * 2);
      ctx.arc(x + 20, y - 20, 6, 0, Math.PI * 2);
      ctx.fill();
      if (tokenGlow > 0 && !options.reducedMotion?.()) {
        ctx.strokeStyle = '#ffd563';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, 63, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  };
  return createLoop(scene, options);
}
