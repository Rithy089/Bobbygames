import { describe, it, expect } from 'vitest';
import { catches, approach } from '../mango-catch/rules';
import { collidesAt } from '../tuk-tuk-rush/rules';
describe('visual collision boundaries', () => {
  it('catches a fruit crossing the rim even between sampled frames', () => {
    expect(catches(400, 470, 550, 400)).toBe(true);
    expect(catches(460, 470, 550, 400)).toBe(false);
    expect(catches(400, 540, 560, 400)).toBe(false);
  });
  it('basket smoothing is frame-rate independent and never overshoots', () => {
    const once = approach(100, 500, 0.1);
    const twice = approach(approach(100, 500, 0.05), 500, 0.05);
    expect(once).toBeCloseTo(twice);
    expect(once).toBeLessThan(500);
    expect(once).toBeGreaterThan(100);
  });
  it('rush hits the visible vehicle, not a selected destination lane', () => {
    const car = { lane: 1, y: 492, type: 'car' };
    expect(collidesAt(400, car)).toBe(true);
    expect(collidesAt(520, car)).toBe(false);
    expect(collidesAt(455, car)).toBe(true);
    expect(collidesAt(465, car)).toBe(false);
  });
  it('rush swept collisions do not tunnel and cones have a generous inset', () => {
    expect(collidesAt(400, { lane: 1, y: 590, type: 'car' }, 390)).toBe(true);
    expect(collidesAt(450, { lane: 1, y: 492, type: 'cone' })).toBe(false);
  });
});
