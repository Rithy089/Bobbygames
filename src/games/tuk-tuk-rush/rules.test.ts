import { describe, it, expect } from 'vitest';
import { difficulty, changeLane, collides, scoreFor } from './rules';
describe('Tuk-Tuk Rush', () => {
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
