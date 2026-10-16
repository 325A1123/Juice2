export interface LyricLine {
  id: string;
  time: number; // in seconds
  text: string;
  subText?: string; // Romaji or English translation
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // in seconds
  bpm: number;
  genre: string;
  year: string;
  lyrics: LyricLine[];
  description: string;
  synthesizerPreset?: 'juice_theme' | 'desert_loop' | 'neon_void' | 'overheat';
  customAudioUrl?: string;
  customFile?: File;
}

export type VisualizerMode = 'bars' | 'radial' | 'wave';

export interface AudioFxState {
  bass: number; // -10 to +10 dB
  mid: number;  // -10 to +10 dB
  treble: number; // -10 to +10 dB
  filterCutoff: number; // 200Hz to 20000Hz
  playbackRate: number; // 0.75 to 1.5
  reverb: boolean;
}
