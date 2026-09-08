import { usePortal } from '../../lib/store';
import { useAudioStatus, type AudioStatus } from '../../lib/audio-status';
import type { GameId } from '../../lib/catalog';
import { soundtrack, soundEffect, type Cue } from './composition';
export function createAudio(game: GameId = 'mango-catch') {
  let context: AudioContext | null = null,
    musicBus: GainNode | null = null,
    effectsBus: GainNode | null = null;
  let track: AudioBufferSourceNode | null = null,
    buffer: AudioBuffer | null = null;
  let disposed = false,
    activated = false,
    running = false,
    offset = 0,
    started = 0,
    lastEffect = -1;
  const voices = new Set<AudioBufferSourceNode>();
  const effects = new Map<Cue, AudioBuffer>();
  const status = (value: AudioStatus) => {
    if (!disposed) useAudioStatus.setState({ status: value });
  };
  const makeBuffer = (samples: Float32Array) => {
    const b = context!.createBuffer(1, samples.length, 22050);
    b.getChannelData(0).set(samples);
    return b;
  };
  const stopEffects = () => {
    for (const voice of voices) {
      voice.onended = null;
      try {
        voice.stop();
      } catch {
        /* ended */
      }
      voice.disconnect();
    }
    voices.clear();
  };
  const stopMusic = () => {
    if (!track) return;
    offset =
      (offset + context!.currentTime - started) % (buffer?.duration || 1);
    track.onended = null;
    try {
      track.stop();
    } catch {
      /* ended */
    }
    track.disconnect();
    track = null;
  };
  const apply = () => {
    if (!context || disposed) return;
    const a = usePortal.getState().audio;
    musicBus!.gain.setTargetAtTime(
      a.sound && a.music ? a.volume * a.musicVolume : 0,
      context.currentTime,
      0.025,
    );
    effectsBus!.gain.setTargetAtTime(
      a.sound && a.effects ? a.volume * a.effectsVolume : 0,
      context.currentTime,
      0.015,
    );
    if (!running || document.hidden || !a.sound) {
      stopMusic();
      stopEffects();
      return;
    }
    if (!a.music) {
      stopMusic();
      return;
    }
    if (context.state !== 'running' || track) return;
    try {
      buffer ??= makeBuffer(soundtrack(game));
      track = context.createBufferSource();
      track.buffer = buffer;
      track.loop = true;
      track.connect(musicBus!);
      started = context.currentTime;
      track.start(0, offset);
      status('ready');
    } catch {
      stopMusic();
      status('failed');
    }
  };
  const resume = () => {
    if (!context || disposed) return;
    if (context.state === 'running') {
      status('ready');
      apply();
      return;
    }
    status('blocked');
    void context
      .resume()
      .then(() => {
        if (disposed) return;
        if (context!.state !== 'running') {
          status('blocked');
          return;
        }
        status('ready');
        apply();
        if (!running || document.hidden)
          void context!.suspend().catch(() => {});
      })
      .catch(() => status('blocked'));
  };
  const activate = () => {
    if (disposed) return;
    activated = true;
    if (!usePortal.getState().audio.sound) return;
    if (!context)
      try {
        context = new AudioContext();
        musicBus = context.createGain();
        effectsBus = context.createGain();
        musicBus.gain.value = 0;
        effectsBus.gain.value = 0;
        musicBus.connect(context.destination);
        effectsBus.connect(context.destination);
        context.onstatechange = () => {
          if (
            running &&
            usePortal.getState().audio.sound &&
            !document.hidden &&
            context?.state === 'suspended'
          )
            status('blocked');
        };
      } catch {
        status('unavailable');
        return;
      }
    resume();
  };
  const sync = (play: boolean) => {
    running = play;
    if (!context) {
      if (play && activated) activate();
      return;
    }
    if (!play || document.hidden || !usePortal.getState().audio.sound) {
      apply();
      void context
        .suspend()
        .then(() => {
          if (running && !document.hidden && usePortal.getState().audio.sound)
            resume();
        })
        .catch(() => {});
    } else resume();
  };
  const visibility = () => {
    if (document.hidden) {
      running = false;
      apply();
      void context?.suspend().catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', visibility);
  const unsubscribe = usePortal.subscribe((state, previous) => {
    if (state.audio !== previous.audio) sync(running);
  });
  useAudioStatus.setState({ status: 'idle', enable: activate });
  const api = {
    activate,
    sync,
    finish: (cue?: Cue) => {
      running = false;
      stopMusic();
      if (cue) {
        stopEffects();
        api.effect(cue);
      }
      if (!voices.size) void context?.suspend().catch(() => {});
    },
    effect: (cue: Cue) => {
      const a = usePortal.getState().audio;
      if (
        disposed ||
        !activated ||
        !context ||
        context.state !== 'running' ||
        document.hidden ||
        !a.sound ||
        !a.effects ||
        voices.size >= 8
      )
        return;
      if (
        (cue === 'catch' || cue === 'flip') &&
        context.currentTime - lastEffect < 0.04
      )
        return;
      lastEffect = context.currentTime;
      try {
        let b = effects.get(cue);
        if (!b) {
          b = makeBuffer(soundEffect(game, cue));
          effects.set(cue, b);
        }
        const voice = context.createBufferSource();
        voice.buffer = b;
        voice.connect(effectsBus!);
        voices.add(voice);
        voice.onended = () => {
          voice.disconnect();
          voices.delete(voice);
          if (!running && !voices.size) void context?.suspend().catch(() => {});
        };
        voice.start();
      } catch {
        status('failed');
      }
    },
    destroy: () => {
      disposed = true;
      unsubscribe();
      document.removeEventListener('visibilitychange', visibility);
      stopMusic();
      stopEffects();
      buffer = null;
      effects.clear();
      if (context) {
        context.onstatechange = null;
        void context.close().catch(() => {});
      }
      musicBus?.disconnect();
      effectsBus?.disconnect();
      context = null;
      if (useAudioStatus.getState().enable === activate)
        useAudioStatus.setState({ status: 'idle', enable: null });
    },
  };
  return api;
}
