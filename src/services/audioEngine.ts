import { AudioFxState } from '../types/music';

class JuiceAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private djFilter: BiquadFilterNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;

  // Track playback state
  private startTime = 0;
  private pauseOffset = 0;
  private isPlaying = false;
  private currentTrackId: string | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private onEndedCallback: (() => void) | null = null;

  // Initialize or return AudioContext
  public initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.82;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // 3-Band Equalizer
      this.bassFilter = this.ctx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
      this.bassFilter.gain.setValueAtTime(2.5, this.ctx.currentTime); // Slight default punch

      this.midFilter = this.ctx.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);
      this.midFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);
      this.midFilter.gain.setValueAtTime(0, this.ctx.currentTime);

      this.trebleFilter = this.ctx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.setValueAtTime(4500, this.ctx.currentTime);
      this.trebleFilter.gain.setValueAtTime(1.5, this.ctx.currentTime);

      // DJ Filter (Lowpass sweep)
      this.djFilter = this.ctx.createBiquadFilter();
      this.djFilter.type = 'lowpass';
      this.djFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
      this.djFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      // Chain: Source -> Bass -> Mid -> Treble -> DJ Filter -> Analyser -> Master -> Destination
      this.bassFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.djFilter);
      this.djFilter.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setVolume(volume: number): void {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public setFx(fx: AudioFxState): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.bassFilter) this.bassFilter.gain.setTargetAtTime(fx.bass, now, 0.05);
    if (this.midFilter) this.midFilter.gain.setTargetAtTime(fx.mid, now, 0.05);
    if (this.trebleFilter) this.trebleFilter.gain.setTargetAtTime(fx.treble, now, 0.05);
    if (this.djFilter) this.djFilter.frequency.setTargetAtTime(fx.filterCutoff, now, 0.05);

    if (this.currentSource && this.currentSource.playbackRate) {
      this.currentSource.playbackRate.setTargetAtTime(fx.playbackRate, now, 0.05);
    }
  }

  public setOnEnded(callback: () => void): void {
    this.onEndedCallback = callback;
  }

  /**
   * Prepares or retrieves synthesized audio buffer for preset
   */
  public async getTrackBuffer(trackId: string, preset: string, duration: number, bpm: number): Promise<AudioBuffer> {
    const cached = this.bufferCache.get(trackId);
    if (cached) return cached;

    const ctx = this.initContext();
    const buffer = await this.renderSynthesizedTrack(preset, duration, bpm, ctx.sampleRate);
    this.bufferCache.set(trackId, buffer);
    return buffer;
  }

  /**
   * Decodes an uploaded audio file (MP3/WAV/etc.)
   */
  public async loadAudioFile(file: File): Promise<AudioBuffer> {
    const ctx = this.initContext();
    const arrayBuf = await file.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuf);
    return decoded;
  }

  /**
   * Play an AudioBuffer starting from a specific offset
   */
  public playBuffer(buffer: AudioBuffer, offset = 0, trackId: string, playbackRate = 1.0): void {
    this.initContext();
    if (!this.ctx || !this.bassFilter) return;

    this.stopSource();

    this.currentBuffer = buffer;
    this.currentTrackId = trackId;
    this.pauseOffset = Math.max(0, Math.min(buffer.duration, offset));

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.connect(this.bassFilter);

    source.onended = () => {
      if (this.isPlaying && this.getCurrentTime() >= buffer.duration - 0.2) {
        this.isPlaying = false;
        this.pauseOffset = 0;
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      }
    };

    source.start(0, this.pauseOffset);
    this.startTime = this.ctx.currentTime;
    this.currentSource = source;
    this.isPlaying = true;
  }

  public pause(): number {
    if (!this.isPlaying) return this.pauseOffset;
    const current = this.getCurrentTime();
    this.stopSource();
    this.pauseOffset = current;
    this.isPlaying = false;
    return this.pauseOffset;
  }

  public resume(playbackRate = 1.0): void {
    if (!this.currentBuffer || !this.currentTrackId) return;
    this.playBuffer(this.currentBuffer, this.pauseOffset, this.currentTrackId, playbackRate);
  }

  public seek(targetTime: number, playbackRate = 1.0): void {
    if (!this.currentBuffer || !this.currentTrackId) {
      this.pauseOffset = targetTime;
      return;
    }
    const clamped = Math.max(0, Math.min(this.currentBuffer.duration, targetTime));
    this.pauseOffset = clamped;
    if (this.isPlaying) {
      this.playBuffer(this.currentBuffer, clamped, this.currentTrackId, playbackRate);
    }
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.ctx) return this.pauseOffset;
    const elapsed = this.ctx.currentTime - this.startTime;
    const rate = this.currentSource ? this.currentSource.playbackRate.value : 1.0;
    const current = this.pauseOffset + elapsed * rate;
    if (this.currentBuffer) {
      return Math.min(this.currentBuffer.duration, current);
    }
    return current;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stopSource(): void {
    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {
        // already stopped
      }
      this.currentSource = null;
    }
  }

  // --- Sound Effects Rack (Play instant DJ FX) ---
  public playJuicePour(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    // Generate carbonated sparkling pour effect using modulated bandpass noise
    const bufferSize = ctx.sampleRate * 1.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.8));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 1.1);
    filter.Q.value = 4.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    if (this.analyser) {
      gain.connect(this.analyser);
    } else {
      gain.connect(ctx.destination);
    }
    noise.start(now);
  }

  public playDjScratch(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(540, now + 0.08);
    osc.frequency.linearRampToValueAtTime(120, now + 0.16);
    osc.frequency.linearRampToValueAtTime(680, now + 0.24);
    osc.frequency.linearRampToValueAtTime(50, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    if (this.analyser) gain.connect(this.analyser);
    else gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playAirHorn(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    // Classic dancehall air horn trio: F#, A, C#
    const freqs = [370, 440, 554];
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      // Pitch drop
      osc.frequency.linearRampToValueAtTime(f * 1.05, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(f * 0.9, now + 0.4);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);

      osc.connect(gain);
      if (this.analyser) gain.connect(this.analyser);
      else gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    });
  }

  public playLaserDrop(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    if (this.analyser) gain.connect(this.analyser);
    else gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
  }

  // --- High Fidelity Multi-Track Audio Synthesizer (Offline Rendering) ---
  private async renderSynthesizedTrack(
    preset: string,
    duration: number,
    bpm: number,
    sampleRate: number
  ): Promise<AudioBuffer> {
    const totalFrames = Math.ceil(duration * sampleRate);
    const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

    const secondsPerBeat = 60 / bpm;
    const sixteenth = secondsPerBeat / 4;
    const totalBars = Math.ceil(duration / (secondsPerBeat * 4));

    // Master bus in offline context
    const master = offlineCtx.createGain();
    master.gain.value = 0.85;

    // Subtle master compressor for punchy mix
    const comp = offlineCtx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-14, 0);
    comp.knee.setValueAtTime(8, 0);
    comp.ratio.setValueAtTime(3.5, 0);
    comp.attack.setValueAtTime(0.005, 0);
    comp.release.setValueAtTime(0.12, 0);

    master.connect(comp);
    comp.connect(offlineCtx.destination);

    // Create drums & instrument patterns based on preset
    this.scheduleDrumAndMelodyGrid(offlineCtx, master, preset, duration, bpm, secondsPerBeat, sixteenth, totalBars);

    return await offlineCtx.startRendering();
  }

  private scheduleDrumAndMelodyGrid(
    ctx: OfflineAudioContext,
    dest: GainNode,
    preset: string,
    duration: number,
    bpm: number,
    beatLen: number,
    sixteenth: number,
    bars: number
  ): void {
    const isJuice = preset === 'juice_theme';
    const isDesert = preset === 'desert_loop';
    const isNeon = preset === 'neon_void';
    const isOverheat = preset === 'overheat';

    // Scales for melodies and chords
    // Juice: F# Minor / Doric Funk (F#, G#, A, B, C#, D#, E)
    // Desert: D Minor (D, E, F, G, A, Bb, C)
    // Neon: A Minor / C Major Funk (A, C, D, E, G)
    // Overheat: F Minor trap (F, G#, Bb, C, C#)
    const juiceChordProgression = [
      [185.0, 220.0, 277.18, 329.63], // F#m7
      [146.83, 220.0, 277.18, 329.63], // Dmaj7
      [220.0, 277.18, 329.63, 440.0],  // A7
      [164.81, 246.94, 329.63, 392.0]  // E9
    ];

    const desertChordProgression = [
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [116.54, 146.83, 174.61, 220.0], // Bbmaj7
      [130.81, 164.81, 196.0, 246.94], // C7
      [110.0, 164.81, 196.0, 261.63]   // Am7
    ];

    const chords = isDesert ? desertChordProgression : juiceChordProgression;

    // Loop through each bar
    for (let bar = 0; bar < bars; bar++) {
      const barStartTime = bar * beatLen * 4;
      if (barStartTime >= duration) break;

      const chordIdx = bar % chords.length;
      const currentChord = chords[chordIdx];
      const rootFreq = currentChord[0] / 2; // Bass frequency

      // 1. Kick Drum scheduling
      for (let beat = 0; beat < 4; beat++) {
        const beatTime = barStartTime + beat * beatLen;
        if (beatTime >= duration) break;

        let shouldKick = false;
        let kickVelocity = 0.85;

        if (isJuice) {
          // Bouncy funk-hop kick on 1, 1.75, 3
          shouldKick = (beat === 0) || (beat === 2);
          if (beat === 1) {
            // Synco kick on 1.75
            this.triggerKick(ctx, dest, beatTime + sixteenth * 3, 0.7);
          }
        } else if (isDesert) {
          // Chillhop slow kick on 1, and 2.5
          shouldKick = (beat === 0);
          if (beat === 2) this.triggerKick(ctx, dest, beatTime + sixteenth * 2, 0.65);
        } else if (isNeon) {
          // Four on the floor disco/future-funk kick
          shouldKick = true;
          kickVelocity = beat === 0 ? 0.95 : 0.8;
        } else if (isOverheat) {
          // Fast trap bounce
          shouldKick = (beat === 0) || (beat === 2);
          if (beat === 3) this.triggerKick(ctx, dest, beatTime + sixteenth * 2, 0.75);
        }

        if (shouldKick) {
          this.triggerKick(ctx, dest, beatTime, kickVelocity);
        }

        // 2. Snare / Claps on beat 2 & 4
        if (beat === 1 || beat === 3) {
          const isHard = beat === 3;
          this.triggerSnare(ctx, dest, beatTime, isHard ? 0.85 : 0.75, isOverheat ? 'clap' : 'snare');
        }
      }

      // 3. Hi-Hats pattern (16th notes with velocity swing)
      for (let s = 0; s < 16; s++) {
        const hatTime = barStartTime + s * sixteenth;
        if (hatTime >= duration) break;

        let hatVol = (s % 4 === 0) ? 0.28 : (s % 2 === 0 ? 0.2 : 0.12);
        const isOpen = (s === 6 || s === 14) && (isJuice || isNeon);
        if (isOpen) hatVol = 0.35;

        if (isOverheat && s >= 12) {
          // 32nd note hihat roll in trap mode
          this.triggerHiHat(ctx, dest, hatTime, 0.2, false);
          this.triggerHiHat(ctx, dest, hatTime + sixteenth / 2, 0.18, false);
        } else {
          this.triggerHiHat(ctx, dest, hatTime, hatVol, isOpen);
        }
      }

      // 4. Bassline
      this.scheduleBassline(ctx, dest, barStartTime, beatLen, sixteenth, rootFreq, isJuice, isDesert, isNeon, isOverheat);

      // 5. Synth Chords (Keys / Rhodes / Brass)
      this.scheduleKeysChords(ctx, dest, barStartTime, beatLen, sixteenth, currentChord, isJuice, isDesert, isNeon);

      // 6. Lead melody / Funk Hooks
      this.scheduleLeadHook(ctx, dest, barStartTime, beatLen, sixteenth, currentChord, bar, isJuice, isDesert, isNeon);
    }
  }

  // --- Instrument Generators ---
  private triggerKick(ctx: OfflineAudioContext, dest: GainNode, time: number, velocity: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private triggerSnare(ctx: OfflineAudioContext, dest: GainNode, time: number, velocity: number, type: 'snare' | 'clap'): void {
    // Noise buffer for snare crack
    const noiseLength = type === 'clap' ? 0.22 : 0.18;
    const bufferSize = Math.floor(ctx.sampleRate * noiseLength);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(type === 'clap' ? 1200 : 850, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + noiseLength);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);

    noise.start(time);

    // Tone body for snare
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

    oscGain.gain.setValueAtTime(velocity * 0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private triggerHiHat(ctx: OfflineAudioContext, dest: GainNode, time: number, velocity: number, isOpen: boolean): void {
    const dur = isOpen ? 0.28 : 0.045;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(time);
  }

  private scheduleBassline(
    ctx: OfflineAudioContext,
    dest: GainNode,
    barTime: number,
    beatLen: number,
    sixteenth: number,
    rootFreq: number,
    isJuice: boolean,
    isDesert: boolean,
    isNeon: boolean,
    isOverheat: boolean
  ): void {
    const bassRiffs = isJuice
      ? [
          { timeOffset: 0, dur: sixteenth * 2.5, pitchMult: 1.0 },
          { timeOffset: sixteenth * 3, dur: sixteenth * 1.5, pitchMult: 1.0 },
          { timeOffset: sixteenth * 6, dur: sixteenth * 2, pitchMult: 1.189 }, // Minor 3rd
          { timeOffset: sixteenth * 8, dur: sixteenth * 3, pitchMult: 1.334 }, // 4th
          { timeOffset: sixteenth * 12, dur: sixteenth * 1.8, pitchMult: 1.498 }, // 5th
          { timeOffset: sixteenth * 14, dur: sixteenth * 1.8, pitchMult: 0.89 } // Lower dominant
        ]
      : isNeon
      ? [
          // Rolling synth bass
          { timeOffset: 0, dur: sixteenth * 1.8, pitchMult: 1.0 },
          { timeOffset: sixteenth * 2, dur: sixteenth * 1.8, pitchMult: 1.0 },
          { timeOffset: sixteenth * 4, dur: sixteenth * 1.8, pitchMult: 1.334 },
          { timeOffset: sixteenth * 6, dur: sixteenth * 1.8, pitchMult: 1.0 },
          { timeOffset: sixteenth * 8, dur: sixteenth * 1.8, pitchMult: 1.498 },
          { timeOffset: sixteenth * 10, dur: sixteenth * 1.8, pitchMult: 1.334 },
          { timeOffset: sixteenth * 12, dur: sixteenth * 1.8, pitchMult: 1.189 },
          { timeOffset: sixteenth * 14, dur: sixteenth * 1.8, pitchMult: 1.0 }
        ]
      : isOverheat
      ? [
          // 808 deep sustain
          { timeOffset: 0, dur: beatLen * 1.8, pitchMult: 0.5 },
          { timeOffset: beatLen * 2, dur: beatLen * 1.5, pitchMult: 0.5 },
          { timeOffset: beatLen * 3.5, dur: beatLen * 0.5, pitchMult: 0.59 }
        ]
      : [
          // Desert mellow sustained bass
          { timeOffset: 0, dur: beatLen * 2.2, pitchMult: 1.0 },
          { timeOffset: beatLen * 2.5, dur: beatLen * 1.2, pitchMult: 1.189 }
        ];

    bassRiffs.forEach((note) => {
      const startTime = barTime + note.timeOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = isOverheat ? 'sine' : isJuice ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(rootFreq * note.pitchMult, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isJuice ? 480 : 320, startTime);
      filter.Q.value = 2.5;

      gain.gain.setValueAtTime(0.38, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(startTime);
      osc.stop(startTime + note.dur + 0.05);
    });
  }

  private scheduleKeysChords(
    ctx: OfflineAudioContext,
    dest: GainNode,
    barTime: number,
    beatLen: number,
    sixteenth: number,
    chord: number[],
    isJuice: boolean,
    isDesert: boolean,
    isNeon: boolean
  ): void {
    const hits = isJuice
      ? [
          { timeOffset: sixteenth * 2, dur: sixteenth * 1.8 },
          { timeOffset: sixteenth * 6, dur: sixteenth * 2.5 },
          { timeOffset: sixteenth * 11, dur: sixteenth * 3.5 }
        ]
      : isDesert
      ? [
          { timeOffset: 0, dur: beatLen * 2.2 },
          { timeOffset: beatLen * 2, dur: beatLen * 1.8 }
        ]
      : [
          // Future funk stabs
          { timeOffset: sixteenth * 3, dur: sixteenth * 1.5 },
          { timeOffset: sixteenth * 7, dur: sixteenth * 1.5 },
          { timeOffset: sixteenth * 11, dur: sixteenth * 1.5 },
          { timeOffset: sixteenth * 15, dur: sixteenth * 1.5 }
        ];

    hits.forEach((hit) => {
      const startTime = barTime + hit.timeOffset;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = isDesert ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isDesert ? 800 : 1800, startTime);
        filter.frequency.exponentialRampToValueAtTime(isDesert ? 400 : 700, startTime + hit.dur);

        gain.gain.setValueAtTime(0.07, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + hit.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(startTime);
        osc.stop(startTime + hit.dur + 0.02);
      });
    });
  }

  private scheduleLeadHook(
    ctx: OfflineAudioContext,
    dest: GainNode,
    barTime: number,
    beatLen: number,
    sixteenth: number,
    chord: number[],
    barNum: number,
    isJuice: boolean,
    isDesert: boolean,
    isNeon: boolean
  ): void {
    if (barNum % 2 === 1 && !isNeon) return; // Call and response structure

    // Pentatonic notes above chord
    const base = chord[0] * 2;
    const leadNotes = isJuice
      ? [
          { s: 4, dur: sixteenth * 1.8, pitch: base * 1.2 },
          { s: 6, dur: sixteenth * 1.8, pitch: base * 1.334 },
          { s: 8, dur: sixteenth * 2.5, pitch: base * 1.5 },
          { s: 12, dur: sixteenth * 3.5, pitch: base * 1.2 }
        ]
      : [
          { s: 0, dur: sixteenth * 1.5, pitch: base },
          { s: 2, dur: sixteenth * 1.5, pitch: base * 1.189 },
          { s: 4, dur: sixteenth * 1.5, pitch: base * 1.334 },
          { s: 6, dur: sixteenth * 1.5, pitch: base * 1.5 }
        ];

    leadNotes.forEach((note) => {
      const startTime = barTime + note.s * sixteenth;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.pitch, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, startTime);
      filter.frequency.exponentialRampToValueAtTime(1000, startTime + note.dur);

      gain.gain.setValueAtTime(0.065, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(startTime);
      osc.stop(startTime + note.dur + 0.02);
    });
  }
}

export const audioEngine = new JuiceAudioEngine();
