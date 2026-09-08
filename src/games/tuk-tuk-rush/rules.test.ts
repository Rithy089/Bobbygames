import { describe, it, expect } from 'vitest';
import {
  difficulty,
  changeLane,
  collides,
  scoreFor,
  steer,
  config,
} from './rules';
import { project } from './render';
describe('Tuk-Tuk Rush', () => {
  it('steers consistently across frame rates without overshooting', () => {
    const simulate = (fps: number) => {
      let x = 400;
      for (let i = 0; i < fps / 2; i++) x = steer(x, 520, 1 / fps);
      return x;
    };
    expect(simulate(30)).toBeCloseTo(simulate(120), 8);
    expect(simulate(60)).toBeLessThanOrEqual(520);
    expect(steer(400, 280, 0)).toBe(400);
  });
  it('projects lanes consistently and keeps foreground hazards readable', () => {
    const far = project(520, -70),
      near = project(520, config.playerY);
    expect(near.scale).toBeGreaterThan(far.scale);
    expect(near.y).toBeGreaterThan(far.y);
    expect(project(280, config.playerY).x + near.x).toBeCloseTo(800);
    expect(project(400, config.playerY).x).toBe(400);
    expect(120 * near.scale).toBeGreaterThan(90 * near.scale);
  });
  it('lane changes stay on road', () => {
    expect(changeLane(0, -1)).toBe(0);
    expect(changeLane(2, 1)).toBe(2);
    expect(changeLane(1, -1)).toBe(0);
  });
  it('collisions respect lane and longitudinal distance', () => {
    expect(collides(1, { lane: 1, y: 490, type: 'car' })).toBe(true);
    expect(collides(0, { lane: 1, y: 490, type: 'car' })).toBe(false);
    expect(collides(1, { lane: 1, y: 300, type: 'car' })).toBe(false);
  });
  it('distance and safe tokens score correctly', () => {
    expect(scoreFor(101.9, 2)).toBe(151);
  });
  it('speed and spawn rate increase within bounds', () => {
    expect(difficulty(60).speed).toBeGreaterThan(difficulty(0).speed);
    expect(difficulty(9999)).toEqual({
      speed: 510,
      spawn: 0.65,
      distanceRate: 100,
    });
  });
});
