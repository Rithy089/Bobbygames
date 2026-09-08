import type { GameId } from '../../lib/catalog';
export type Cue = 'catch' | 'miss' | 'perfect' | 'flip' | 'complete';
const themes: Record<
  GameId,
  { bpm: number; root: number; melody: number[]; warmth: number }
> = {
  'mango-catch': {
    bpm: 100,
    root: 60,
    melody: [0, 4, 7, 9, 7, 4, 2, 4, 7, 12, 9, 7, 4, 2, 0, 2],
    warmth: 0.2,
  },
  'temple-tower': {
    bpm: 72,
    root: 57,
    melody: [0, 7, 12, 14, 12, 7, 4, 7, 9, 7, 4, 2, 0, 4, 7, 4],
    warmth: 0.08,
  },
  'tuk-tuk-rush': {
    bpm: 112,
    root: 62,
    melody: [0, 4, 7, 4, 9, 7, 4, 2, 4, 7, 12, 9, 7, 4, 2, 0],
    warmth: 0.35,
  },
  'khmer-market-match': {
    bpm: 84,
    root: 55,
    melody: [0, 4, 7, 12, 9, 7, 4, 2, 0, 2, 4, 7, 4, 2, 0, 7],
    warmth: 0.12,
  },
};
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
function note(
  data: Float32Array,
  rate: number,
  at: number,
  duration: number,
  midi: number,
  level: number,
  warmth = 0.15,
) {
  const start = Math.floor(at * rate),
    length = Math.floor(duration * rate),
    f = hz(midi);
  for (let i = 0; i < length; i++) {
    const t = i / rate,
      env =
        Math.min(1, t / 0.018) *
        Math.exp(-t / (duration * 0.3)) *
        Math.min(1, (duration - t) / 0.07);
    const wave =
      Math.sin(2 * Math.PI * f * t) +
      warmth * Math.sin(2 * Math.PI * f * 2 * t);
    data[(start + i) % data.length] += wave * env * level;
  }
}
// Original 32-bar arrangements with four evolving 8-bar phrases. Every note tail
// wraps into the start of the buffer, so looping has no hard cut or new timer.
export function soundtrack(game: GameId, rate = 22050) {
  const theme = themes[game],
    beat = 60 / theme.bpm,
    data = new Float32Array(Math.ceil(128 * beat * rate));
  const harmony = [0, 5, 9, 7, 0, 9, 5, 7];
  for (let bar = 0; bar < 32; bar++) {
    const chord = harmony[bar % 8],
      phrase = Math.floor(bar / 8);
    note(
      data,
      rate,
      bar * 4 * beat,
      3.8 * beat,
      theme.root - 24 + chord,
      0.1,
      0.05,
    );
    for (let voice = 0; voice < 3; voice++)
      note(
        data,
        rate,
        (bar * 4 + voice * 0.12) * beat,
        3.3 * beat,
        theme.root - 12 + chord + [0, 4, 7][voice],
        0.035,
        0.08,
      );
    const count = game === 'temple-tower' ? 2 : 4;
    for (let step = 0; step < count; step++) {
      // Breathing space at phrase endings; alternate registers and responses.
      if (bar % 8 === 7 && step > 0) continue;
      const index = (bar * count + step + phrase * 3) % theme.melody.length;
      note(
        data,
        rate,
        (bar * 4 + (step * 4) / count) * beat,
        beat * (game === 'temple-tower' ? 2.7 : 1.3),
        theme.root + theme.melody[index] + (phrase === 2 ? 12 : 0),
        0.115,
        theme.warmth,
      );
      if (game === 'tuk-tuk-rush' || game === 'mango-catch')
        note(
          data,
          rate,
          (bar * 4 + step + 0.5) * beat,
          0.12,
          theme.root - 12,
          0.018,
          0.1,
        );
    }
  }
  if (game === 'tuk-tuk-rush') {
    // Quiet, smooth engine ambience integrated into the loop; no separate track.
    for (let i = 0; i < data.length; i++) {
      const t = i / rate;
      data[i] +=
        0.012 *
        Math.sin(2 * Math.PI * 56 * t) *
        (0.8 + 0.2 * Math.sin(2 * Math.PI * 2 * t));
    }
  }
  for (let i = 0; i < data.length; i++) data[i] = Math.tanh(data[i] * 0.85);
  // A tiny seam blend also makes the engine cycle continuous.
  const seam = Math.floor(rate * 0.015);
  for (let i = 0; i < seam; i++) {
    const a = i / seam;
    data[i] = data[data.length - seam + i] * (1 - a) + data[i] * a;
  }
  return data;
}
export function soundEffect(game: GameId, cue: Cue, rate = 22050) {
  const duration =
    cue === 'complete'
      ? 1.2
      : cue === 'perfect'
        ? 0.65
        : cue === 'miss'
          ? 0.3
          : 0.22;
  const data = new Float32Array(Math.ceil(rate * duration));
  const root = themes[game].root;
  const notes =
    cue === 'complete'
      ? [0, 4, 7, 12]
      : cue === 'perfect'
        ? [4, 7, 12]
        : cue === 'miss'
          ? [-19, -24]
          : cue === 'flip'
            ? [7]
            : [0, 7];
  for (let n = 0; n < notes.length; n++)
    note(
      data,
      rate,
      n * (cue === 'complete' ? 0.16 : 0.055),
      duration - n * 0.08,
      root + notes[n] + (cue === 'miss' ? 0 : 12),
      cue === 'flip' ? 0.13 : 0.28,
      0.12,
    );
  if (game === 'temple-tower' && cue === 'catch') {
    let seed = 123;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] += (seed / 4294967296 - 0.5) * 0.3 * Math.exp((-i / rate) * 35);
    }
  }
  for (let i = 0; i < data.length; i++) data[i] = Math.tanh(data[i]);
  return data;
}
