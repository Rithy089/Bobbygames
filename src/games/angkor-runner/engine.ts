import { createLoop } from '../shared/loop';
import { type GameOptions, type Scene, W, H } from '../shared/types';
import { sprite } from '../shared/sprites';
import { advance, initialState, config } from './rules';

export function createRunnerScene(options: GameOptions): Scene {
  const state = initialState();
  return {
    snapshot: state.snapshot,
    reset() {
      const next = initialState();
      Object.assign(state.snapshot, next.snapshot);
      Object.assign(state, { ...next, snapshot: state.snapshot });
    },
    update(dt, input) {
      for (const cue of advance(state, dt, input)) options.audio(cue);
    },
    draw(ctx) {
      const reduced = options.reducedMotion?.() ?? false;
      const { snapshot } = state;
      ctx.clearRect(0, 0, W, H);
      sprite(ctx, 'runner-bg', 0, 0, W, H);
      // Sparse trail markers convey travel without moving the whole background.
      ctx.strokeStyle = '#bc9859';
      ctx.lineWidth = 3;
      if (!reduced)
        for (let i = 0; i < 9; i++) {
          const x =
            ((((i * 110 - snapshot.distance * 12) % 990) + 990) % 990) - 80;
          ctx.beginPath();
          ctx.moveTo(x, 468 + (i % 3) * 12);
          ctx.lineTo(x + 18, 468 + (i % 3) * 12);
          ctx.stroke();
        }
      for (const item of state.items) {
        if (item.resolved && item.kind === 'fruit') continue;
        if (item.kind === 'log')
          sprite(ctx, 'runner-log', item.x - 27, 418, 108, 32);
        else if (item.kind === 'branch')
          sprite(ctx, 'runner-branch', item.x - 6, 365, 110, 40);
        else sprite(ctx, 'mango', item.x - 3, 400, 32, 36);
      }
      const sliding = state.slide > 0;
      const pose = sliding
        ? 'slide'
        : state.height > 0
          ? 'jump'
          : !reduced && Math.floor(snapshot.elapsed * 8) % 2
            ? 'run-b'
            : 'run-a';
      const width = sliding ? 88 : 80,
        height = sliding ? 48 : state.height > 0 ? 75 : 84;
      ctx.fillStyle = '#543e29';
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.ellipse(config.playerX, 453, sliding ? 42 : 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      sprite(
        ctx,
        'runner-' + pose,
        config.playerX - width / 2,
        config.ground - state.height - height,
        width,
        height,
      );
      if (state.protection > 0) {
        ctx.strokeStyle = '#fff0b9';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(
          config.playerX,
          config.ground - state.height - height / 2,
          width / 2 + 8,
          height / 2 + 8,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
      if (!reduced)
        for (const ring of state.rings) {
          ctx.globalAlpha = 1 - ring.age / 0.65;
          ctx.strokeStyle = '#ffe09a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ring.x, 410, 12 + ring.age * 35, 0, Math.PI * 2);
          ctx.stroke();
        }
      ctx.globalAlpha = 1;
      if (state.feedback > 0) {
        const text = state.hit ? '−1 ♥' : '+50';
        ctx.font = 'bold 22px Inter';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#304135';
        ctx.fillStyle = '#fff1bf';
        const y =
          330 - state.height - (reduced ? 0 : (0.75 - state.feedback) * 15);
        ctx.strokeText(text, config.playerX, y);
        ctx.fillText(text, config.playerX, y);
      }
    },
  };
}
export default function createGame(options: GameOptions) {
  return createLoop(createRunnerScene(options), {
    ...options,
    verticalControls: true,
  });
}
