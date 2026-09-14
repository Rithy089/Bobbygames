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
  clampY,
  moveToward,
  collides,
  scoreFor,
  type RiverItem,
} from './rules';

export function createRiverScene(options: GameOptions): Scene {
  const snapshot = freshSnapshot();
  let x = 400,
    y = config.playerY,
    target = 400,
    targetY = config.playerY,
    lastPointer: number | null = null,
    lastPointerY: number | null = null,
    turn = 0,
    wakeTime = 0;
  let ripples: { x: number; y: number; age: number; bonus: boolean }[] = [];
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
      y = targetY = config.playerY;
      lastPointer = null;
      lastPointerY = null;
      turn = wakeTime = 0;
      ripples = [];
      spawn = 1.2;
      count = baskets = protection = feedback = 0;
      items = [];
    },
    update(dt, input) {
      const d = difficulty(snapshot.elapsed),
        previousX = x,
        previousBoatY = y;
      if (input.pointer === null && lastPointer !== null) {
        target = x;
        targetY = y;
      }
      if (
        input.pointer !== null &&
        (input.pointer !== lastPointer ||
          (input.pointerY ?? null) !== lastPointerY)
      ) {
        target = clampX(input.pointer);
        targetY = clampY(input.pointerY ?? y);
      }
      lastPointer = input.pointer;
      lastPointerY = input.pointerY ?? null;
      if (input.left || input.right || input.up || input.down) {
        target = clampX(
          x + (Number(input.right) - Number(input.left)) * 350 * dt,
        );
        targetY = clampY(
          y + (Number(!!input.down) - Number(!!input.up)) * 350 * dt,
        );
      }
      ({ x, y } = moveToward(x, y, target, targetY, dt));
      turn +=
        (((x - previousX) / Math.max(dt, 0.001) / 350) * 0.22 - turn) *
        (1 - Math.exp(-10 * dt));
      const reduced = options.reducedMotion?.() ?? false;
      ripples = reduced
        ? []
        : ripples
            .map((r) => ({ ...r, age: r.age + dt, y: r.y + 16 * dt }))
            .filter((r) => r.age < 0.85);
      wakeTime += dt;
      if (!reduced && wakeTime > 0.16) {
        wakeTime = 0;
        ripples.push({ x, y: y + 42, age: 0, bonus: false });
      }
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
        if (!collides(previousX, x, item, previousY, previousBoatY, y))
          continue;
        if (item.type === 'basket') {
          baskets++;
          snapshot.combo++;
          caught = true;
          feedback = 0.65;
          if (!reduced)
            ripples.push({ x: item.x, y: item.y, age: 0, bonus: true });
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
      if (!reduced) {
        for (const r of ripples) {
          ctx.strokeStyle = r.bonus ? '#ffe098' : '#d7f4e8';
          ctx.globalAlpha = (1 - r.age / 0.85) * (r.bonus ? 0.8 : 0.3);
          ctx.lineWidth = r.bonus ? 3 : 2;
          ctx.beginPath();
          ctx.ellipse(
            r.x,
            r.y,
            12 + r.age * 30,
            4 + r.age * (r.bonus ? 30 : 9),
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(reduced ? 0 : turn);
      // Keep the original artwork; animate its paddle section with a clipped
      // second pass. Animation time only advances with gameplay, never on pause.
      const stroke = reduced ? 0 : Math.sin(snapshot.elapsed * 5) * 0.12;
      ctx.save();
      ctx.beginPath();
      ctx.rect(-40, -60, 52, 120);
      ctx.clip();
      sprite(ctx, 'mekong-boat', -31, -53, 62, 106);
      ctx.restore();
      ctx.save();
      ctx.translate(12, 4);
      ctx.rotate(stroke);
      ctx.translate(-12, -4);
      ctx.beginPath();
      ctx.rect(12, -60, 28, 120);
      ctx.clip();
      sprite(ctx, 'mekong-boat', -31, -53, 62, 106);
      ctx.restore();
      ctx.restore();
      if (protection > 0) {
        ctx.strokeStyle = '#fff2bf';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x, y, 39, 61, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (feedback > 0) {
        ctx.font = 'bold 22px Inter';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#163e40';
        ctx.fillStyle = caught ? '#fff3bf' : '#ffe0d4';
        const text = caught ? '+50' : '−1 ♥';
        const popupY = Math.max(
          28,
          y - 68 - (reduced ? 0 : (0.65 - feedback) * 14),
        );
        ctx.strokeText(text, x, popupY);
        ctx.fillText(text, x, popupY);
      }
    },
  };
}
export default function createGame(options: GameOptions) {
  return createLoop(createRiverScene(options), {
    ...options,
    freeMovement: true,
  });
}
