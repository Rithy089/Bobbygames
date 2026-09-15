import { describe, it, expect, vi } from 'vitest';
import { createFieldScene } from './engine';
import {
  bundles,
  home,
  config,
  moveToward,
  scoreFor,
  buffaloAt,
  type Point,
} from './rules';
import type { Input } from '../shared/types';
const idle: Input = {
  left: false,
  right: false,
  pointer: null,
  action: false,
  direction: 0,
};
const make = () =>
  createFieldScene({
    canvas: document.createElement('canvas'),
    onSnapshot: vi.fn(),
    onFinish: vi.fn(),
    audio: vi.fn(),
  });
describe('Rice Field Adventure', () => {
  it('normalizes diagonal speed, clamps the field and bounds roaming animals', () => {
    const from = { x: 400, y: 300 },
      next = moveToward(from, { x: 700, y: 500 }, 0.1);
    expect(Math.hypot(next.x - from.x, next.y - from.y)).toBeCloseTo(21.5);
    expect(moveToward(from, { x: -100, y: 1000 }, 10)).toEqual({
      x: 50,
      y: 545,
    });
    for (const t of [0, 10, 30, 90])
      for (const animal of buffaloAt(t)) {
        expect(animal.x).toBeGreaterThanOrEqual(150);
        expect(animal.x).toBeLessThanOrEqual(650);
      }
  });
  it('collects each bundle once and requires returning home for the time bonus', () => {
    const scene = make();
    scene.snapshot.phase = 'running';
    const walk = (p: Point, seconds = 3.5) => {
      for (
        let i = 0;
        i < seconds / 0.05 && scene.snapshot.phase === 'running';
        i++
      ) {
        scene.snapshot.elapsed += 0.05;
        scene.update(0.05, { ...idle, pointer: p.x, pointerY: p.y });
      }
    };
    for (const bundle of bundles) walk(bundle);
    expect(scene.snapshot.combo).toBe(config.total);
    expect(scene.snapshot.score).toBe(1200);
    expect(scene.snapshot.phase).toBe('running');
    walk(bundles.at(-1)!);
    expect(scene.snapshot.combo).toBe(config.total);
    walk(home, 4);
    expect(scene.snapshot.phase).toBe('over');
    expect(scene.snapshot.height).toBe(1);
    expect(scene.snapshot.score).toBeGreaterThan(1200);
    scene.reset();
    expect(scene.snapshot).toMatchObject({
      score: 0,
      combo: 0,
      distance: 90,
      phase: 'ready',
    });
  });
  it('times out without awarding a delivery bonus', () => {
    const scene = make();
    scene.snapshot.phase = 'running';
    scene.snapshot.elapsed = 90;
    scene.update(0.05, idle);
    expect(scene.snapshot).toMatchObject({
      phase: 'over',
      height: 0,
      distance: 0,
      score: 0,
    });
    expect(scoreFor(4, -2, false)).toBe(400);
    expect(scoreFor(12, 30.9, true)).toBe(1350);
  });
});
