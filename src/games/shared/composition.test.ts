import { describe, it, expect } from 'vitest';
import { soundtrack, soundEffect } from './composition';
import { games } from '../../lib/catalog';
describe('original audio compositions', () => {
  it('generates distinct long, finite soundtracks with bounded peaks and a smooth seam', () => {
    const signatures = new Set<number>();
    for (const game of games) {
      const samples = soundtrack(game.id, 8000);
      expect(samples.length / 8000).toBeGreaterThan(60);
      let energy = 0,
        peak = 0;
      for (const sample of samples) {

        energy += sample * sample;
        peak = Math.max(peak, Math.abs(sample));
      }
      expect(Number.isFinite(energy)).toBe(true);
      expect(Math.sqrt(energy / samples.length)).toBeGreaterThan(0.01);
      expect(peak).toBeLessThan(0.8);
      expect(Math.abs(samples[0] - samples.at(-1)!)).toBeLessThan(0.03);
      signatures.add(samples.length);
      for (const cue of [
        'catch',
        'miss',
        'perfect',
        'flip',
        'complete',
      ] as const) {
        const effect = soundEffect(game.id, cue, 8000);
        expect(effect.some((x) => Math.abs(x) > 0.02)).toBe(true);
        expect(effect.every((x) => Number.isFinite(x) && Math.abs(x) < 1)).toBe(
          true,
        );
      }
    }
    expect(signatures.size).toBe(4);
  });
});
