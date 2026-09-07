import { describe, it, expect } from 'vitest';
import { catchItem, missItem, difficulty, isOver } from './rules';
describe('Mango Catch rules', () => {
  it('rewards consecutive catches with bounded combos', () => {
    let s = { score: 0, lives: 3, streak: 0, combo: 0 };
    for (let i = 0; i < 5; i++) s = catchItem(s, false);
    expect(s.score).toBe(60);
    expect(s.combo).toBe(2);
    for (let i = 0; i < 100; i++) s = catchItem(s, false);
    expect(s.combo).toBe(5);
  });
  it('hazards and misses cost lives but missed hazards are safe', () => {
    const s = { score: 30, lives: 1, streak: 3, combo: 1 };
    expect(isOver(catchItem(s, true))).toBe(true);
    expect(missItem(s, false).streak).toBe(0);
    expect(missItem(s, true)).toEqual(s);
  });
  it('increases difficulty with safe bounds', () => {
    expect(difficulty(60).speed).toBeGreaterThan(difficulty(0).speed);
    expect(difficulty(6000).spawn).toBe(0.48);
    expect(difficulty(6000).speed).toBe(350);
  });
});
