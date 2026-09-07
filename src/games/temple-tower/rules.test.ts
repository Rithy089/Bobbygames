import { describe, it, expect } from 'vitest';
import { place, difficulty, award } from './rules';
describe('Temple Tower', () => {
  it('trims both overhang directions', () => {
    expect(place({ x: 200, width: 200 }, { x: 260, width: 200 })).toMatchObject(
      { x: 260, width: 140, miss: false },
    );
    expect(place({ x: 200, width: 200 }, { x: 150, width: 200 })).toMatchObject(
      { x: 200, width: 150 },
    );
  });
  it('perfect tolerance keeps width and builds combo', () => {
    expect(place({ x: 200, width: 200 }, { x: 206, width: 200 })).toMatchObject(
      { width: 200, perfect: true },
    );
    expect(award(2, 2, true)).toEqual({ height: 3, score: 3, combo: 3 });
  });
  it('no overlap ends game; difficulty caps', () => {
    expect(place({ x: 200, width: 100 }, { x: 400, width: 100 }).miss).toBe(
      true,
    );
    expect(difficulty(20)).toBeGreaterThan(difficulty(1));
    expect(difficulty(1000)).toBe(380);
  });
});
