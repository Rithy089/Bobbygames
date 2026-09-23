import { describe, it, expect } from 'vitest';
import {
  environmentAt,
  segmentDistance,
  transitionDistance,
} from './environment';
describe('runner environments', () => {
  it('cycles five environments after longer stays with smooth bounded crossfades', () => {
    expect(segmentDistance).toBe(550);
    expect(transitionDistance).toBe(140);
    expect(environmentAt(0)).toEqual({ current: 0, next: 1, blend: 0 });
    expect(environmentAt(409).blend).toBe(0);
    expect(environmentAt(480).blend).toBe(0.5);
    expect(environmentAt(550).current).toBe(1);
    expect(environmentAt(1100).current).toBe(2);
    expect(environmentAt(1650).current).toBe(3);
    expect(environmentAt(2200).current).toBe(4);
    expect(environmentAt(2750).current).toBe(0);
    expect(environmentAt(2749.999).blend).toBeCloseTo(1, 7);
    for (let d = 0; d < 10000; d += 7) {
      const p = environmentAt(d);
      expect(p.blend).toBeGreaterThanOrEqual(0);
      expect(p.blend).toBeLessThanOrEqual(1);
    }
  });
  it('shows each setting without crossfade under reduced motion', () => {
    for (const distance of [0, 480, 600, 1150, 2200, 2750]) {
      const phase = environmentAt(distance, true);
      expect(phase.current).toBe(Math.floor((distance % 2750) / 550));
      expect(phase.next).toBe(phase.current);
      expect(phase.blend).toBe(0);
    }
  });
});
