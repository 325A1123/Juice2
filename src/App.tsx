import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Track, AudioFxState } from './types/music';
import { INITIAL_TRACKS, JUICE_HERO_COVER } from './data/tracks';
import { audioEngine } from './services/audioEngine';
import { TopBar } from './components/TopBar';
import { VinylPlayer } from './components/VinylPlayer';
import { AudioVisualizer } from './components/AudioVisualizer';
import { PlayerControls } from './components/PlayerControls';
import { LyricsViewer } from './components/LyricsViewer';
import { DjFxRack } from './components/DjFxRack';
import { TrackList } from './components/TrackList';
import { StudioSpotlight } from './components/StudioSpotlight';
import { Disc3, Sparkles, Music, Sliders, Mic, Radio, Volume2 } from 'lucide-react';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('player');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [fx, setFx] = useState<AudioFxState>({
    bass: 2.5,
    mid: 0,
    treble: 1.5,
    filterCutoff: 20000,
    playbackRate: 1.0,
    reverb: false,
  });

  // Track playback time update loop
  useEffect(() => {
    let animId: number;
    const updateTime = () => {
      if (isPlaying) {
        const time = audioEngine.getCurrentTime();
        setCurrentTime(time);
      }
      animId = requestAnimationFrame(updateTime);
    };
    animId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Load and play track helper
  const playTrack = useCallback(
    async (track: Track, startTime = 0) => {
      try {
        let buffer: AudioBuffer;
        if (track.customFile) {
          buffer = await audioEngine.loadAudioFile(track.customFile);
        } else {
          buffer = await audioEngine.getTrackBuffer(
            track.id,
            track.synthesizerPreset || 'juice_theme',
            track.duration,
            track.bpm
          );
        }

        audioEngine.setVolume(volume);
        audioEngine.setFx(fx);
        audioEngine.playBuffer(buffer, startTime, track.id, fx.playbackRate);
        setIsPlaying(true);
        setCurrentTime(startTime);
      } catch (err) {
        console.error('Audio playback error:', err);
      }
    },
    [volume, fx]
  );

  // Set up onEnded callback
  useEffect(() => {
    audioEngine.setOnEnded(() => {
      if (isLooping) {
        playTrack(currentTrack, 0);
      } else {
        handleNextTrack();
      }
    });
  }, [currentTrack, isLooping, tracks, isShuffle]);

  // Effect to update FX in real-time
  useEffect(() => {
    audioEngine.setFx(fx);
  }, [fx]);

  // Volume change
  const handleChangeVolume = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  // Play / Pause Toggle
  const handleTogglePlay = async () => {
    if (isPlaying) {
      const pausedTime = audioEngine.pause();
      setIsPlaying(false);
      setCurrentTime(pausedTime);
    } else {
      if (audioEngine.getCurrentTime() > 0 && audioEngine.getCurrentTime() < currentTrack.duration - 0.2) {
        audioEngine.resume(fx.playbackRate);
        setIsPlaying(true);
      } else {
        await playTrack(currentTrack, currentTime >= currentTrack.duration - 0.2 ? 0 : currentTime);
      }
    }
  };

  // Seek handler
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    audioEngine.seek(time, fx.playbackRate);
  };

  // Select track
  const handleSelectTrack = async (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    await playTrack(track, 0);
  };

  // Next Track
  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    handleSelectTrack(tracks[nextIndex]);
  };

  // Previous Track
  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    if (currentTime > 3) {
      handleSeek(0);
      return;
    }
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handleSelectTrack(tracks[prevIndex]);
  };

  // Custom Audio File Upload
  const handleFileUpload = async (file: File) => {
    try {
      setStatusMessage(`Decoding audio: ${file.name}...`);
      const buffer = await audioEngine.loadAudioFile(file);
      const customTrack: Track = {
        id: `custom-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'User Track',
        album: 'Custom Upload',
        coverUrl: JUICE_HERO_COVER,
        duration: buffer.duration,
        bpm: 120,
        genre: 'Custom Audio',
        year: '2026',
        description: `Imported audio file: ${file.name} (${Math.round(buffer.duration)}s)`,
        customFile: file,
        lyrics: [
          { id: 'c1', time: 0, text: file.name, subText: 'Custom Audio Playback' },
          { id: 'c2', time: Math.floor(buffer.duration * 0.25), text: 'High-fidelity audio stream active', subText: 'JUICE DSP processing' },
          { id: 'c3', time: Math.floor(buffer.duration * 0.5), text: 'Visualizer frequency sync engaged', subText: 'Real-time analyser active' }
        ]
      };

      setTracks((prev) => [customTrack, ...prev]);
      setCurrentTrack(customTrack);
      setCurrentTime(0);
      await playTrack(customTrack, 0);
      setStatusMessage(`Loaded "${customTrack.title}" successfully!`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to load file', err);
      setStatusMessage('Error decoding audio file. Please try another MP3 or WAV.');
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(currentTrack.duration, currentTime + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleChangeVolume(Math.min(1, volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleChangeVolume(Math.max(0, volume - 0.05));
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleChangeVolume(volume > 0 ? 0 : 0.85);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, currentTrack, volume]);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation Bar */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onFileUpload={handleFileUpload}
        isPlaying={isPlaying}
      />

      {/* Floating Status Toast */}
      {statusMessage && (
        <div className="fixed top-16 right-6 z-50 bg-amber-500 text-slate-950 font-semibold px-4 py-2 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section: Vinyl Turntable Player */}
        <section aria-label="Current Player">
          <VinylPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
          />
        </section>

        {/* Audio Spectrum Visualizer */}
        <section aria-label="Real-time Visualizer">
          <AudioVisualizer isPlaying={isPlaying} bpm={currentTrack.bpm} />
        </section>

        {/* Dynamic Tab Navigation / Views */}
        <section aria-label="Workspace Controls" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                MODULE
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <h2 className="text-lg font-bold text-white font-display capitalize">
                {activeTab === 'player'
                  ? 'Tracklist & Releases'
                  : activeTab === 'lyrics'
                  ? 'Synchronized Lyrics'
                  : activeTab === 'fx'
                  ? 'Sound Lab & FX'
                  : activeTab === 'visualizer'
                  ? 'Visualizer Engine'
                  : 'Studio Session Notes'}
              </h2>
            </div>

            {/* Quick module switcher tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('player')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'player' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tracks
              </button>
              <button
                onClick={() => setActiveTab('lyrics')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'lyrics' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lyrics
              </button>
              <button
                onClick={() => setActiveTab('fx')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'fx' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sound Lab
              </button>
              <button
                onClick={() => setActiveTab('studio')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'studio' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Studio
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          {activeTab === 'player' && (
            <div className="space-y-8">
              <TrackList
                tracks={tracks}
                currentTrackId={currentTrack.id}
                isPlaying={isPlaying}
                onSelectTrack={handleSelectTrack}
                onTogglePlay={handleTogglePlay}
                onFileUpload={handleFileUpload}
              />
            </div>
          )}

          {activeTab === 'lyrics' && (
            <div className="space-y-8">
              <LyricsViewer
                track={currentTrack}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            </div>
          )}

          {activeTab === 'fx' && (
            <div className="space-y-8">
              <DjFxRack
                fx={fx}
                onChangeFx={setFx}
                onResetFx={() =>
                  setFx({
                    bass: 2.5,
                    mid: 0,
                    treble: 1.5,
                    filterCutoff: 20000,
                    playbackRate: 1.0,
                    reverb: false,
                  })
                }
              />
            </div>
          )}

          {activeTab === 'visualizer' && (
            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-[#0c0c14] border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white font-display">
                  Visualizer Rendering Engine
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  JUICE utilizes high-speed Web Audio AnalyserNode FFT Fourier transform matrices, generating 60fps real-time frequency distribution maps across 128 distinct acoustic bands with phosphor trail blur.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <span className="text-amber-400 font-mono">SPECTRUM BARS</span>
                    <p className="text-slate-300">Logarithmic frequency bins with peak hold caps</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <span className="text-purple-400 font-mono">RADIAL PULSE</span>
                    <p className="text-slate-300">Sub-bass harmonic resonance core with orbital spikes</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <span className="text-cyan-400 font-mono">OSCILLOSCOPE</span>
                    <p className="text-slate-300">Real-time time-domain analog voltage waveform</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'studio' && (
            <div className="space-y-8">
              <StudioSpotlight />
            </div>
          )}
        </section>
      </main>

      {/* Persistent Docked Audio Player Controller */}
      <footer className="sticky bottom-0 z-30 w-full px-4 sm:px-6 py-3 bg-[#08080d]/95 backdrop-blur-md border-t border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <PlayerControls
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={currentTrack.duration}
            volume={volume}
            isLooping={isLooping}
            isShuffle={isShuffle}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            onNext={handleNextTrack}
            onPrev={handlePrevTrack}
            onToggleLoop={() => setIsLooping(!isLooping)}
            onToggleShuffle={() => setIsShuffle(!isShuffle)}
            onChangeVolume={handleChangeVolume}
          />
        </div>
      </footer>
    </div>
  );
}
