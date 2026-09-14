import { afterEach, describe, expect, it, vi } from 'vitest';
import { clampX, clampY, moveToward, collides, difficulty, scoreFor, config } from './rules';
import { createRiverScene } from './engine';
import type { GameOptions, Input } from '../shared/types';
const input: Input = {
  left: false,
  right: false,
  pointer: null,
  action: false,
  direction: 0,
};
const options = () =>
  ({
    canvas: document.createElement('canvas'),
    onSnapshot: vi.fn(),
    onFinish: vi.fn(),
    audio: vi.fn(),
  }) satisfies GameOptions;
afterEach(() => vi.restoreAllMocks());
describe('Mekong Boat Journey', () => {
  it('moves in both axes, caps diagonal speed and stays inside the river', () => {
    const diagonal = moveToward(400, 300, 500, 400, 0.1);
    expect(Math.hypot(diagonal.x - 400, diagonal.y - 300)).toBeCloseTo(35);
    expect(moveToward(400, 300, -100, -100, 10)).toEqual({ x: config.left, y: config.top });
    expect(moveToward(400, 300, 1000, 1000, 10)).toEqual({ x: config.right, y: config.bottom });
    expect(clampY(-100)).toBe(config.top);
    expect(moveToward(400, 300, 400, 300, 1)).toEqual({x: 400, y: 300});
  });
  it('checks the moving boat height instead of the old fixed row', () => {
    const rock = { x: 400, y: 290, type: 'rock' as const };
    expect(collides(400, 400, rock, 280, 100, 100)).toBe(false);
    expect(collides(400, 400, rock, 280, 420, 160)).toBe(true);
    expect(collides(400, 400, rock, 280, 200, 210)).toBe(false);
  });
  it('caps difficulty and steering while allowing generous reaction time', () => {
    expect(difficulty(300)).toEqual(difficulty(3000));
    expect(difficulty(120).speed).toBeGreaterThan(difficulty(0).speed);
    expect((config.playerY + 60) / difficulty(300).speed).toBeGreaterThan(1.5);
    expect(clampX(-100)).toBe(config.left);
    expect(clampX(1000)).toBe(config.right);
    expect(scoreFor(25.9, 2)).toBe(125);
  });
  it('detects swept collisions without penalizing a clear passage', () => {
    expect(collides(400, 400, { x: 400, y: 580, type: 'log' }, 380)).toBe(true);
    expect(collides(240, 550, { x: 400, y: 490, type: 'rock' }, 490)).toBe(
      true,
    );
    expect(collides(240, 240, { x: 400, y: 490, type: 'log' }, 480)).toBe(
      false,
    );
  });
  it('awards baskets, loses lives on hazards, ends and resets cleanly', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const o = options(),
      scene = createRiverScene(o);
    scene.snapshot.phase = 'running';
    for (let i = 0; i < 1200 && scene.snapshot.phase === 'running'; i++) {
      scene.snapshot.elapsed += 0.05;
      scene.update(0.05, input);
    }
    expect(o.audio).toHaveBeenCalledWith('catch');
    expect(o.audio).toHaveBeenCalledWith('miss');
    expect(scene.snapshot.score).toBeGreaterThan(50);
    expect(scene.snapshot.lives).toBe(0);
    expect(scene.snapshot.phase).toBe('over');
    scene.reset();
    expect(scene.snapshot).toMatchObject({
      phase: 'ready',
      score: 0,
      lives: 3,
      elapsed: 0,
      distance: 0,
    });
  });
  it('ends the five-minute journey even with lives remaining', () => {
    const scene = createRiverScene(options());
    scene.snapshot.phase = 'running';
    scene.snapshot.elapsed = 300;
    scene.update(0.01, input);
    expect(scene.snapshot.phase).toBe('over');
    expect(scene.snapshot.lives).toBe(3);
  });
});
