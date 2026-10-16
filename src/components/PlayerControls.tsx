import React, { useRef } from 'react';
import { Track } from '../types/music';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface PlayerControlsProps {
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLooping: boolean;
  isShuffle: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onChangeVolume: (vol: number) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isLooping,
  isShuffle,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
  onToggleLoop,
  onToggleShuffle,
  onChangeVolume,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    const clamped = Math.max(0, secs);
    const m = Math.floor(clamped / 60);
    const s = Math.floor(clamped % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percent * duration);
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-[#0d0d16]/95 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl">
      {/* Scrubber / Progress Bar */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-mono tabular-nums text-slate-400 w-10 text-right">
          {formatTime(currentTime)}
        </span>

        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="relative flex-1 h-2 sm:h-2.5 bg-slate-800 rounded-full cursor-pointer group"
        >
          {/* Active progress with gradient */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-75"
            style={{ width: `${percent}%` }}
          />

          {/* Scrubber thumb handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-amber-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${percent}%` }}
          />
        </div>

        <span className="text-xs font-mono tabular-nums text-slate-400 w-10 text-left">
          {formatTime(duration)}
        </span>
      </div>

      {/* Main Controls Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Track Micro Info (Left) */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-lg object-cover border border-slate-700/80 shrink-0"
          />
          <div className="min-w-0 flex-1 sm:max-w-xs">
            <h4 className="text-sm font-bold text-white truncate font-display">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Center Control Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isShuffle ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSeek(Math.max(0, currentTime - 10))}
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onPrev}
            className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Primary Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 10))}
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Fast Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleLoop}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isLooping ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Loop"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Control (Right) */}
        <div className="flex items-center gap-2.5 w-full sm:w-44 justify-end">
          <button
            onClick={() => onChangeVolume(volume > 0 ? 0 : 0.85)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-24 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          <span className="text-[11px] font-mono tabular-nums text-slate-400 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
