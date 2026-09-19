import { describe, it, expect, vi } from 'vitest';
import {
  advance,
  initialState,
  collides,
  difficulty,
  makeRow,
  project,
  type RunnerState,
  type Lane,
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
const tick = (s: RunnerState, seconds: number, input = idle) => {
  for (let i = 0; i < Math.round(seconds / 0.01); i++) {
    s.snapshot.elapsed += 0.01;
    advance(s, 0.01, input, () => 0);
  }
};
describe('Angkor Runner lanes', () => {
  it('moves smoothly one lane per action, including while airborne, and clamps edges', () => {
    const s = initialState();
    advance(s, 0.01, { ...idle, direction: 1, action: true });
    expect(s.lane).toBeGreaterThan(0);
    expect(s.lane).toBeLessThan(1);
    tick(s, 0.2);
    expect(s.lane).toBe(1);
    expect(s.height).toBeGreaterThan(0);
    advance(s, 0.01, { ...idle, direction: 1 });
    tick(s, 0.2);
    expect(s.lane).toBe(1);
    advance(s, 0.01, { ...idle, direction: -1 });
    tick(s, 0.2);
    expect(s.lane).toBe(0);
  });
  it('jumps once per press, rejects double jumps and bounds sliding', () => {
    const s = initialState();
    tick(s, 0.3, { ...idle, up: true });
    expect(s.height).toBeGreaterThan(120);
    const v = s.velocity;
    tick(s, 0.01);
    tick(s, 0.01, { ...idle, up: true });
    expect(s.velocity).toBeLessThan(v);
    tick(s, 1, { ...idle, up: true });
    expect(s.height).toBe(0);
    tick(s, 0.1, { ...idle, down: true });
    expect(s.slide).toBeGreaterThan(0);
    tick(s, 1, { ...idle, down: true });
    expect(s.slide).toBe(0);
    tick(s, 0.01);
    tick(s, 0.01, { ...idle, slideAction: true });
    expect(s.slide).toBeGreaterThan(0);
  });
  it('requires matching lanes and the correct obstacle response', () => {
    const log = {
      z: 0,
      lane: 0 as Lane,
      kind: 'log' as const,
      resolved: false,
    };
    expect(collides(log, 0, 0, false)).toBe(true);
    expect(collides(log, 1, 0, false)).toBe(false);
    expect(collides(log, 0, 90, false)).toBe(false);
    expect(collides({ ...log, kind: 'branch' }, 0, 0, true)).toBe(false);
    expect(collides({ ...log, kind: 'branch' }, 0, 90, false)).toBe(true);
    expect(collides({ ...log, kind: 'rock' }, 0, 144, true)).toBe(true);
  });
  it('resolves swept depth crossings once and protects against repeated impacts', () => {
    const s = initialState();
    s.items = [{ z: 1, lane: 0, kind: 'fruit', resolved: false }];
    advance(s, 0.05, idle);
    expect(s.fruits).toBe(1);
    advance(s, 0.05, idle);
    expect(s.fruits).toBe(1);
    s.items = [
      { z: 1, lane: 0, kind: 'log', resolved: false },
      { z: 1, lane: 0, kind: 'rock', resolved: false },
    ];
    advance(s, 0.05, idle);
    expect(s.snapshot.lives).toBe(2);
    for (let i = 0; i < 2; i++) {
      s.protection = 0;
      s.items = [{ z: 1, lane: 0, kind: 'log', resolved: false }];
      advance(s, 0.05, idle);
    }
    expect(s.snapshot.phase).toBe('over');
    expect(s.snapshot.lives).toBe(0);
  });
  it('uses lane position at contact, not the eventual target lane', () => {
    const s = initialState();
    s.items = [{ z: 0.1, lane: 0, kind: 'rock', resolved: false }];
    advance(s, 0.05, { ...idle, direction: 1 });
    expect(s.snapshot.lives).toBe(2);
    const safe = initialState();
    safe.lane = safe.targetLane = 1;
    safe.items = [{ z: 0.1, lane: 0, kind: 'rock', resolved: false }];
    advance(safe, 0.05, idle);
    expect(safe.snapshot.lives).toBe(3);
  });
  it('leaves a reachable lane and fruit path open in every generated row', () => {
    for (let i = 0; i < 100; i++) {
      const row = makeRow(i, () => (i % 3) / 3);
      const blocked = row.filter((o) => o.kind !== 'fruit').map((o) => o.lane);
      expect(new Set(blocked).size).toBeLessThan(3);
      for (const fruit of row.filter((o) => o.kind === 'fruit'))
        expect(blocked).not.toContain(fruit.lane);
    }
    expect(difficulty(0).speed).toBe(55);
    expect(difficulty(999).speed).toBe(90);
    expect(difficulty(999).interval).toBe(1.65);
    expect(project(0, 0)).toEqual({ x: 400, y: 500, scale: 1 });
    expect(project(1, 200).scale).toBeLessThan(project(1, 0).scale);
  });
  it('supports three minutes of safe lane choices with bounded objects', () => {
    const s = initialState();
    s.snapshot.phase = 'running';
    for (let i = 0; i < 18000; i++) {
      s.snapshot.elapsed += 0.01;
      const threats = s.items.filter(
        (o) => o.kind !== 'fruit' && !o.resolved && o.z < 40 && o.z > 0,
      );
      let direction: -1 | 0 | 1 = 0;
      if (threats.some((o) => o.lane === s.targetLane)) {
        const safe = ([-1, 0, 1] as Lane[]).find(
          (lane) => !threats.some((o) => o.lane === lane),
        )!;
        direction = Math.sign(safe - s.targetLane) as -1 | 0 | 1;
      }
      advance(s, 0.01, { ...idle, direction }, () => 0.9);
      expect(s.items.length).toBeLessThan(35);
    }
    expect(s.snapshot.lives).toBe(3);
    expect(s.snapshot.phase).toBe('running');
    expect(s.rings.length).toBeLessThan(6);
  });
  it('restarts the shared snapshot and scene state', () => {
    const scene = createRunnerScene({
      canvas: document.createElement('canvas'),
      onSnapshot: vi.fn(),
      onFinish: vi.fn(),
      audio: vi.fn(),
    });
    const snapshot = scene.snapshot;
    snapshot.phase = 'running';
    snapshot.elapsed = 40;
    scene.update(0.05, { ...idle, direction: 1 });
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
