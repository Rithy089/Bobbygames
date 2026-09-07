import { createLoop } from '../shared/loop';
import {
  freshSnapshot,
  type GameOptions,
  type Scene,
  W,
} from '../shared/types';
import { basket, countryside, fruit } from '../shared/draw';
import {
  catchItem,
  catches,
  approach,
  missItem,
  difficulty,
  config,
  type MangoState,
} from './rules';
export default function createGame(options: GameOptions) {
  let state: MangoState = { score: 0, lives: 3, combo: 0, streak: 0 };
  let x = W / 2,
    spawn = 0.5,
    flash = 0;
  let feedback: {
    x: number;
    y: number;
    text: string;
    life: number;
    good: boolean;
  }[] = [];
  let items: {
    x: number;
    y: number;
    type: 'mango' | 'dragon' | 'stone';
    spin: number;
  }[] = [];
  const snapshot = freshSnapshot();
  const scene: Scene = {
    snapshot,
    reset() {
      Object.assign(snapshot, freshSnapshot());
      state = { score: 0, lives: 3, combo: 0, streak: 0 };
      x = W / 2;
      spawn = 0.5;
      items = [];
      flash = 0;
      feedback = [];
    },
    update(dt, input) {
      const d = difficulty(snapshot.elapsed);
      if (input.left || input.right) {
        x += (Number(input.right) - Number(input.left)) * 520 * dt;
        input.pointer = null;
      } else if (input.pointer !== null) x = approach(x, input.pointer, dt);
      x = Math.max(55, Math.min(W - 55, x));
      spawn -= dt;
      flash = Math.max(0, flash - dt);
      feedback = feedback.filter((f) => (f.life -= dt) > 0);
      if (!options.reducedMotion?.()) for (const f of feedback) f.y -= dt * 26;
      if (spawn <= 0) {
        spawn = d.spawn;
        items.push({
          x: 45 + Math.random() * (W - 90),
          y: -30,
          type:
            Math.random() < d.hazardChance
              ? 'stone'
              : Math.random() < 0.2
                ? 'dragon'
                : 'mango',
          spin: Math.random() * 2,
        });
      }
      for (const item of items) {
        const previousY = item.y;
        item.y += d.speed * dt;
        item.spin += dt;
        if (catches(item.x, previousY, item.y, x)) {
          const before = state.score;
          state = catchItem(state, item.type === 'stone');
          feedback.push({
            x: item.x,
            y: config.catchY - 72,
            text:
              item.type === 'stone'
                ? options.labels?.hazard || '−1 ♥'
                : '+' + (state.score - before),
            life: 0.8,
            good: item.type !== 'stone',
          });
          options.audio(item.type === 'stone' ? 'miss' : 'catch');
          if (item.type === 'stone') flash = 0.2;
          item.y = 1000;
        } else if (item.y > 570 && item.y < 900) {
          state = missItem(state, item.type === 'stone');
          if (item.type !== 'stone') {
            options.audio('miss');
            flash = 0.2;
            feedback.push({
              x: item.x,
              y: 550,
              text: options.labels?.missed || '−1 ♥',
              life: 0.8,
              good: false,
            });
          }
          item.y = 1000;
        }
      }
      items = items.filter((i) => i.y < 900);
      Object.assign(snapshot, {
        score: state.score,
        lives: state.lives,
        combo: state.combo,
      });
      if (state.lives <= 0 || snapshot.elapsed >= config.maxSeconds)
        snapshot.phase = 'over';
    },
    draw(ctx) {
      countryside(ctx);
      for (const item of items)
        fruit(
          ctx,
          item.x,
          item.y,
          item.type,
          options.reducedMotion?.() ? 0 : Math.sin(item.spin) * 0.2,
        );
      basket(ctx, x, config.catchY);
      if (state.combo > 1) {
        ctx.fillStyle = '#fff3cd';
        ctx.font = 'bold 21px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('×' + state.combo, x, config.catchY - 52);
      }
      for (const f of feedback) {
        ctx.font = 'bold 18px Inter, Noto Sans Khmer, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = f.good ? '#fff6b7' : '#fff';
        ctx.strokeStyle = f.good ? '#255b3c' : '#813733';
        ctx.lineWidth = 5;
        ctx.strokeText(f.text, Math.max(65, Math.min(735, f.x)), f.y);
        ctx.fillText(f.text, Math.max(65, Math.min(735, f.x)), f.y);
      }
      if (flash > 0) {
        ctx.strokeStyle = '#a33335';
        ctx.lineWidth = 7;
        ctx.strokeRect(3, 3, 794, 594);
      }
    },
  };
  return createLoop(scene, options);
}
