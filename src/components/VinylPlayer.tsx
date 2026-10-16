import React from 'react';
import { Track } from '../types/music';
import { Play, Pause, Disc3, Volume2 } from 'lucide-react';

interface VinylPlayerProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const VinylPlayer: React.FC<VinylPlayerProps> = ({
  track,
  isPlaying,
  onTogglePlay,
}) => {
  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#13131e] via-[#0e0e17] to-[#0a0a10] border border-slate-800/90 p-6 md:p-8 shadow-2xl overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Vinyl Turntable Graphic & Cover Art (lg: 6 cols) */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
            {/* Vinyl Record (slides out when playing) */}
            <div
              className={`absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#0a0a0d] shadow-2xl transition-all duration-700 ease-out flex items-center justify-center border-4 border-slate-900 ${
                isPlaying
                  ? 'translate-x-12 sm:translate-x-16 rotate-6 shadow-amber-500/10'
                  : 'translate-x-0 rotate-0'
              }`}
              style={{
                backgroundImage:
                  'repeating-radial-gradient(circle, #15151c 0px, #0b0b10 2px, #1a1a24 4px, #09090e 6px)'
              }}
            >
              {/* Vinyl grooves shine reflection */}
              <div
                className={`absolute inset-0 rounded-full opacity-40 mix-blend-screen pointer-events-none ${
                  isPlaying ? 'animate-spin-slow' : 'animate-spin-paused'
                }`}
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.18) 45deg, transparent 90deg, rgba(255,255,255,0.18) 225deg, transparent 270deg)'
                }}
              />

              {/* Center Vinyl Label */}
              <div
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-500/40 shadow-inner ${
                  isPlaying ? 'animate-spin-slow' : 'animate-spin-paused'
                }`}
              >
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white/60 shadow" />
                </div>
              </div>
            </div>

            {/* Album Jacket (Front) */}
            <div className="relative z-10 w-56 h-56 sm:w-72 sm:h-72 rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 group cursor-pointer">
              <img
                src={track.coverUrl}
                alt={track.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Subtle vintage sleeve gloss */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/10 pointer-events-none" />

              {/* Hover overlay with big Play button */}
              <div
                onClick={onTogglePlay}
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 hover:scale-110 active:scale-95 transition-transform">
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Track Information & Editorial Context (lg: 6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
          {/* Unboxed Metadata Discipline */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="text-amber-400 font-semibold tracking-wider uppercase">{track.genre}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{track.bpm} BPM</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{track.year}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}</span>
          </div>

          {/* Headline with text-wrap balance */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-display text-balance">
              {track.title}
            </h1>
            <p className="text-base sm:text-lg font-semibold text-slate-300">
              {track.artist}
            </p>
          </div>

          {/* Album Title */}
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            ALBUM: <span className="text-slate-200">{track.album}</span>
          </p>

          {/* Editorial Description */}
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            {track.description}
          </p>

          {/* Quick Action Button */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onTogglePlay}
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Track</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play JUICE Beat</span>
                </>
              )}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pl-2">
              <Disc3 className={`w-3.5 h-3.5 text-amber-500 ${isPlaying ? 'animate-spin' : ''}`} />
              <span>{isPlaying ? 'SPINNING AT 33 ⅓ RPM' : 'TURNTABLE READY'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
