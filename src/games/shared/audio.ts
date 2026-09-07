import { usePortal } from '../../lib/store';
export function createAudio() {
  let context: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  let gain: GainNode | null = null;
  let disposed = false;
  const ensure = () => {
    if (disposed) return null;
    try {
      context ??= new AudioContext();
      if (context.state === 'suspended') void context.resume();
      return context;
    } catch {
      return null;
    }
  };
  const stopMusic = () => {
    if (oscillator) {
      try {
        oscillator.stop();
      } catch {
        /* Already stopped. */
      }
      oscillator.disconnect();
      oscillator = null;
    }
    gain?.disconnect();
    gain = null;
  };
  return {
    activate: () => {
      ensure();
    },
    sync: (running: boolean) => {
      const a = usePortal.getState().audio;
      if (!running || !a.sound || !a.music) {
        stopMusic();
        return;
      }
      const c = ensure();
      if (!c) return;
      if (!oscillator) {
        oscillator = c.createOscillator();
        gain = c.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 130.81;
        oscillator.connect(gain);
        gain.connect(c.destination);
        oscillator.start();
      }
      if (gain) gain.gain.value = a.volume * 0.025;
    },
    effect: (kind: 'catch' | 'miss' | 'perfect') => {
      const a = usePortal.getState().audio;
      if (!a.sound || !a.effects) return;
      const c = ensure();
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = kind === 'miss' ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(
        kind === 'miss' ? 140 : kind === 'perfect' ? 880 : 560,
        c.currentTime,
      );
      o.frequency.exponentialRampToValueAtTime(
        kind === 'miss' ? 60 : 1100,
        c.currentTime + 0.12,
      );
      g.gain.setValueAtTime(Math.max(0.0001, a.volume * 0.1), c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + 0.2);
      o.onended = () => {
        o.disconnect();
        g.disconnect();
      };
    },
    destroy: () => {
      disposed = true;
      stopMusic();
      if (context) {
        void context.close().catch(() => {});
        context = null;
      }
    },
  };
}
