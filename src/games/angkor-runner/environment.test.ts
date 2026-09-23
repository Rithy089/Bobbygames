import { describe, it, expect } from 'vitest';
import { environmentAt } from './environment';
describe('runner environments', () => {
  it('cycles forest, courtyard and green trail with smooth bounded crossfades', () => {
    expect(environmentAt(0)).toEqual({ current: 0, next: 1, blend: 0 });
    expect(environmentAt(262.5).blend).toBe(0.5);
    expect(environmentAt(300).current).toBe(1);
    expect(environmentAt(600).current).toBe(2);
    expect(environmentAt(900).current).toBe(0);
    expect(environmentAt(899.999).blend).toBeCloseTo(1, 7);
    for (let d = 0; d < 10000; d += 7) {
      const p = environmentAt(d);
      expect(p.blend).toBeGreaterThanOrEqual(0);
      expect(p.blend).toBeLessThanOrEqual(1);
    }
  });
  it('keeps decorative environment changes still with reduced motion', () => {
    for (const distance of [0, 250, 400, 650, 880, 1800])
      expect(environmentAt(distance, true)).toEqual({
        current: 0,
        next: 0,
        blend: 0,
      });
  });
});
