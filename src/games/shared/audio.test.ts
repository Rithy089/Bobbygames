import { afterEach, expect, it, vi } from 'vitest';
import { createAudio } from './audio';
import { usePortal } from '../../lib/store';
afterEach(() => vi.unstubAllGlobals());
it('caps effect polyphony and stops nodes, subscriptions and listeners', () => {
  const sources: {
    stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    loop: boolean;
  }[] = [];
  const close = vi.fn(() => Promise.resolve());
  class Context {
    currentTime = 1;
    state = 'running';
    destination = {};
    onstatechange = null;
    createGain() {
      return {
        gain: { value: 0, setTargetAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }
    createBuffer(_channels: number, length: number, rate: number) {
      return {
        duration: length / rate,
        getChannelData: () => new Float32Array(length),
      };
    }
    createBufferSource() {
      const source = {
        loop: false,
        buffer: null,
        onended: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
      };
      sources.push(source);
      return source;
    }
    resume() {
      this.state = 'running';
      return Promise.resolve();
    }
    suspend() {
      this.state = 'suspended';
      return Promise.resolve();
    }
    close = close;
  }
  vi.stubGlobal('AudioContext', Context);
  const previous = usePortal.getState().audio;
  usePortal.getState().setAudio({ sound: true, music: true, effects: true });
  const audio = createAudio('temple-tower');
  audio.activate();
  audio.sync(true);
  for (let i = 0; i < 100; i++) audio.effect('perfect');
  expect(sources.filter((s) => !s.loop)).toHaveLength(8);
  audio.finish('complete');
  expect(sources.filter((s) => !s.loop)).toHaveLength(9);
  audio.sync(false);
  expect(sources.every((s) => s.stop.mock.calls.length === 1)).toBe(true);
  audio.destroy();
  expect(close).toHaveBeenCalledOnce();
  usePortal.getState().setAudio({ music: false });
  expect(sources).toHaveLength(10);
  usePortal.getState().setAudio(previous);
});
it('preserves legacy mute/zero volume and fills separate volume defaults', () => {
  const current = usePortal.getState();
  const merged = usePortal.persist.getOptions().merge!(
    {
      audio: { sound: false, music: false, effects: false, volume: 0 },
      favorites: ['mango-catch'],
      best: { 'mango-catch': 123 },
    },
    current,
  );
  expect(merged.audio).toEqual({
    sound: false,
    music: false,
    effects: false,
    volume: 0,
    musicVolume: 0.6,
    effectsVolume: 0.9,
  });
  expect(merged.best['mango-catch']).toBe(123);
  expect(merged.favorites).toEqual(['mango-catch']);
});
