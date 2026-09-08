import { create } from 'zustand';
export type AudioStatus =
  | 'idle'
  | 'ready'
  | 'blocked'
  | 'unavailable'
  | 'failed';
export const useAudioStatus = create<{
  status: AudioStatus;
  enable: (() => void) | null;
}>(() => ({ status: 'idle', enable: null }));
