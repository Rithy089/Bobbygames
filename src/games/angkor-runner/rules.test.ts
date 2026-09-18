import { describe, it, expect, vi } from 'vitest';
import {
  advance,
  initialState,
  collides,
  difficulty,
  type RunnerState,
} from './rules';
import { createRunnerScene } from './engine';
import type { Input } from '../shared/types';
const idle: Input = {
  left: false,
  right: false,
  pointer: null,
  action: false,
  direction: 0,
};
const tick = (state: RunnerState, seconds: number, input = idle) => {
  for (let i = 0; i < Math.round(seconds / 0.01); i++) {
    state.snapshot.elapsed += 0.01;
    advance(state, 0.01, input, () => 0);
  }
};
describe('Angkor Runner', () => {
  it('jumps once per press, lands, and rejects double jumping', () => {
    const s = initialState();
    tick(s, 0.3, { ...idle, up: true });
    expect(s.height).toBeGreaterThan(120);
    const v = s.velocity;
    tick(s, 0.01);
    tick(s, 0.01, { ...idle, up: true });
    expect(s.velocity).toBeLessThan(v);
    tick(s, 1, { ...idle, up: true });
    expect(s.height).toBe(0);
    tick(s, 0.01);
    tick(s, 0.1, { ...idle, action: true });
    expect(s.height).toBeGreaterThan(50);
  });
  it('slides for a limited time and requires release to repeat', () => {
    const s = initialState();
    tick(s, 0.1, { ...idle, down: true });
    expect(s.slide).toBeGreaterThan(0);
    tick(s, 1, { ...idle, down: true });
    expect(s.slide).toBe(0);
    tick(s, 0.01);
    tick(s, 0.1, { ...idle, down: true });
    expect(s.slide).toBeGreaterThan(0);
  });
  it('uses swept hitboxes and appropriate jump/slide clearance', () => {
    const log = { x: 100, kind: 'log' as const, resolved: false },
      branch = { ...log, kind: 'branch' as const };
    expect(collides(log, 250, 0, false)).toBe(true);
    expect(collides(log, 250, 90, false)).toBe(false);
    expect(collides(log, 250, 0, true)).toBe(true);
    expect(collides(branch, 250, 0, false)).toBe(true);
    expect(collides(branch, 250, 0, true)).toBe(false);
  });
  it('awards a fruit once, limits impact damage and ends at zero lives', () => {
    const s = initialState();
    s.items = [{ x: 160, kind: 'fruit', resolved: false }];
    advance(s, 0.01, idle);
    expect(s.fruits).toBe(1);
    expect(s.snapshot.score).toBe(50);
    advance(s, 0.01, idle);
    expect(s.fruits).toBe(1);
    s.items = [
      { x: 160, kind: 'log', resolved: false },
      { x: 162, kind: 'branch', resolved: false },
    ];
    advance(s, 0.01, idle);
    expect(s.snapshot.lives).toBe(2);
    expect(s.snapshot.combo).toBe(0);
    for (let i = 0; i < 2; i++) {
      s.protection = 0;
      s.items = [{ x: 160, kind: 'log', resolved: false }];
      advance(s, 0.01, idle);
    }
    expect(s.snapshot.phase).toBe('over');
    expect(s.snapshot.lives).toBe(0);
  });
  it('caps speed, leaves reaction gaps and bounds spawned objects during a long run', () => {
    expect(difficulty(0).speed).toBe(240);
    expect(difficulty(500).speed).toBe(410);
    expect(difficulty(500).interval).toBe(1.7);
    const s = initialState();
    s.snapshot.lives = 1000;
    tick(s, 600);
    expect(s.items.length).toBeLessThan(12);
    expect(s.rings.length).toBeLessThan(5);
  });
  it('keeps alternating obstacles passable through three minutes of acceleration', () => {
    const s = initialState();
    s.snapshot.phase = 'running';
    let order = 0;
    for (let i = 0; i < 18000; i++) {
      s.snapshot.elapsed += 0.01;
      const log = s.items.some(
        (item) =>
          !item.resolved && item.kind === 'log' && item.x < 250 && item.x > 80,
      );
      const branch = s.items.some(
        (item) =>
          !item.resolved &&
          item.kind === 'branch' &&
          item.x < 220 &&
          item.x > 50,
      );
      advance(s, 0.01, { ...idle, up: log, down: branch }, () => order++ % 2);
    }
    expect(s.snapshot.lives).toBe(3);
    expect(s.snapshot.phase).toBe('running');
    expect(s.snapshot.distance).toBeGreaterThan(4000);
  });
  it('restarts all state while preserving the shared snapshot reference', () => {
    const scene = createRunnerScene({
      canvas: document.createElement('canvas'),
      onSnapshot: vi.fn(),
      onFinish: vi.fn(),
      audio: vi.fn(),
    });
    const snapshot = scene.snapshot;
    snapshot.phase = 'running';
    snapshot.elapsed = 40;
    scene.update(0.05, idle);
    scene.reset();
    expect(scene.snapshot).toBe(snapshot);
    expect(snapshot).toMatchObject({
      phase: 'ready',
      score: 0,
      lives: 3,
      elapsed: 0,
      distance: 0,
    });
  });
});
