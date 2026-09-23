import { createLoop } from '../shared/loop';
import { type GameOptions, type Scene, W, H } from '../shared/types';
import { sprite } from '../shared/sprites';
import { drawScenery } from './scenery';
import { drawEnvironment } from './environment';
import { advance, initialState, project, type TrailItem } from './rules';
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
      const reduced = options.reducedMotion?.() ?? false,
        { snapshot } = state;
      const stride = snapshot.distance * 1.35;
      ctx.clearRect(0, 0, W, H);
      const environment = drawEnvironment(ctx, snapshot.distance, reduced);
      drawScenery(ctx, snapshot.distance, reduced, environment);
      ctx.strokeStyle = '#f5d49a';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.55;
      for (const lane of [-0.5, 0.5]) {
        const far = project(lane, 600),
          near = project(lane, -20);
        ctx.beginPath();
        ctx.moveTo(far.x, far.y);
        ctx.lineTo(near.x, near.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!reduced) {
        ctx.strokeStyle = '#be9354';
        for (let i = 0; i < 16; i++) {
          const z = (((i * 22 - snapshot.distance * 3) % 352) + 352) % 352;
          for (const lane of [-0.5, 0.5]) {
            const a = project(lane, z),
              b = project(lane, z + 5);
            ctx.lineWidth = 2 * a.scale;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      const drawItem = (item: TrailItem) => {
        if (item.resolved && item.kind === 'coin') return;
        const p = project(item.lane, item.z);
        if (item.kind === 'coin') {
          // Original fictional token artwork; reduced motion holds the face steady.
          const spin = reduced
            ? 1
            : 0.3 +
              0.7 * Math.abs(Math.cos(snapshot.elapsed * 2.8 + item.z * 0.025));
          ctx.save();
          ctx.translate(p.x, p.y - 55 * p.scale);
          ctx.scale(p.scale * spin, p.scale);
          sprite(ctx, 'runner-coin-v2', -21, -22, 42, 44);
          ctx.restore();
          return;
        }
        let id = 'runner-log-v2',
          width = 122,
          height = 48,
          lift = 0;
        if (item.kind === 'log') {
          id = 'runner-log-v2';
          width = 122;
          height = 48;
          lift = 0;
        }
        if (item.kind === 'branch') {
          id = 'runner-gate-v2';
          width = 200;
          height = 155;
          lift = 0;
        }
        if (item.kind === 'rock') {
          id = item.appearance === 'cart' ? 'runner-cart-v2' : 'runner-rock-v2';
          width = item.appearance === 'cart' ? 140 : 130;
          height = item.appearance === 'cart' ? 112 : 102;
          lift = 0;
        }
        {
          ctx.fillStyle = '#493e27';
          ctx.globalAlpha = 0.18;
          ctx.beginPath();
          ctx.ellipse(
            p.x,
            p.y,
            (width * p.scale) / 2,
            7 * p.scale,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        sprite(
          ctx,
          id,
          p.x - (width * p.scale) / 2,
          p.y - (height + lift) * p.scale,
          width * p.scale,
          height * p.scale,
        );
      };
      const items = [...state.items].sort((a, b) => b.z - a.z);
      for (const item of items) if (item.z >= 0) drawItem(item);
      const p = project(state.lane, 0),
        sliding = state.slide > 0;
      const pose = sliding
        ? 'slide'
        : state.height > 0
          ? 'jump'
          : !reduced && Math.sin(stride) > 0
            ? 'run-b'
            : 'run-a';
      const compression = reduced ? 0 : state.landing / 0.22;
      const width = sliding
          ? 104
          : state.height > 0
            ? 110
            : 68 + compression * 5,
        height = sliding ? 73 : state.height > 0 ? 100 : 148 - compression * 9;
      const bob =
        !reduced && !sliding && state.height === 0
          ? -Math.abs(Math.sin(stride)) * 5
          : 0;
      ctx.fillStyle = '#493e27';
      ctx.globalAlpha = 0.22 - state.height / 1400;
      ctx.beginPath();
      ctx.ellipse(
        p.x,
        503,
        36 - state.height / 12,
        11 - state.height / 40,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.globalAlpha = 1;
      if (!reduced && state.height === 0) {
        // Small footfall/landing dust, analytically aged: no timers or particle allocations.
        for (let i = 0; i < 6; i++) {
          const age = (snapshot.distance * 0.6 + i / 6) % 1;
          ctx.globalAlpha = (1 - age) * (sliding ? 0.2 : 0.11);
          ctx.fillStyle = '#e5c58b';
          ctx.beginPath();
          ctx.ellipse(
            p.x + (i % 2 ? 1 : -1) * (12 + age * 19),
            501 + age * 23,
            3 + age * 9,
            2 + age * 4,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      ctx.save();
      // Lean into lane changes around the grounded feet, rather than sliding upright.
      if (!reduced) {
        ctx.translate(p.x, p.y - state.height);
        ctx.rotate((state.targetLane - state.lane) * 0.14);
        ctx.translate(-p.x, -p.y + state.height);
      }
      sprite(
        ctx,
        'runner-rear-' + pose,
        p.x - width / 2,
        p.y - state.height - height + bob,
        width,
        height,
      );
      ctx.restore();
      if (state.protection > 0) {
        ctx.strokeStyle = '#fff1b3';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(
          p.x,
          p.y - state.height - height / 2,
          width / 2 + 9,
          height / 2 + 8,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
      for (const item of items) if (item.z < 0) drawItem(item);
      if (!reduced)
        for (const r of state.rings) {
          const point = project(r.lane, 0);
          ctx.globalAlpha = 1 - r.age / 0.65;
          ctx.strokeStyle = '#fff1b3';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(point.x, 455, 15 + r.age * 40, 0, Math.PI * 2);
          ctx.stroke();
        }
      ctx.globalAlpha = 1;
      if (state.feedback > 0) {
        const text = state.hit ? '\u22121 \u2665' : '+50';
        ctx.font = 'bold 22px Inter';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#304135';
        ctx.fillStyle = '#fff1bf';
        const y =
          p.y -
          state.height -
          height -
          14 -
          (reduced ? 0 : (0.75 - state.feedback) * 15);
        ctx.strokeText(text, p.x, y);
        ctx.fillText(text, p.x, y);
      }
    },
  };
}
export default function createGame(options: GameOptions) {
  return createLoop(createRunnerScene(options), {
    ...options,
    verticalControls: true,
    swipeControls: true,
  });
}
