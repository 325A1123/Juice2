import React, { useEffect, useRef, useState } from 'react';
import { Track, LyricLine } from '../types/music';
import { Mic, Languages, FastForward } from 'lucide-react';

interface LyricsViewerProps {
  track: Track;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const LyricsViewer: React.FC<LyricsViewerProps> = ({
  track,
  currentTime,
  onSeek,
}) => {
  const [showTranslations, setShowTranslations] = useState(true);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active lyric index
  let activeIndex = -1;
  for (let i = track.lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= track.lyrics[i].time) {
      activeIndex = i;
      break;
    }
  }

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#12121d] to-[#0a0a10] border border-slate-800/90 p-6 md:p-8 shadow-2xl flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <Mic className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-white font-display tracking-wide uppercase">
            LIVE SYNCHRONIZED LYRICS
          </h3>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            CLICK ANY LINE TO JUMP
          </span>
        </div>

        <button
          onClick={() => setShowTranslations(!showTranslations)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            showTranslations
              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{showTranslations ? 'English Subtitles ON' : 'English Subtitles OFF'}</span>
        </button>
      </div>

      {/* Lyrics Scrollable Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-8 space-y-6 scroll-smooth pr-2"
      >
        {track.lyrics.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-mono">
            NO LYRICS DATA AVAILABLE FOR THIS TRACK
          </div>
        ) : (
          track.lyrics.map((line: LyricLine, index: number) => {
            const isActive = index === activeIndex;
            const isPassed = index < activeIndex;

            return (
              <div
                key={line.id}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(line.time)}
                className={`group cursor-pointer p-3 rounded-xl transition-all duration-300 flex items-start gap-4 ${
                  isActive
                    ? 'bg-amber-500/10 border-l-2 border-amber-400 pl-4 scale-[1.01]'
                    : isPassed
                    ? 'opacity-40 hover:opacity-80'
                    : 'opacity-55 hover:opacity-90'
                }`}
              >
                {/* Timestamp */}
                <span className={`text-xs font-mono tabular-nums shrink-0 mt-1 ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-600 group-hover:text-slate-400'
                }`}>
                  {Math.floor(line.time / 60)}:{String(Math.floor(line.time % 60)).padStart(2, '0')}
                </span>

                {/* Lyric Text */}
                <div className="space-y-1">
                  <p
                    className={`font-display text-lg sm:text-2xl font-bold transition-colors ${
                      isActive
                        ? 'text-white drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                        : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {line.text}
                  </p>
                  {showTranslations && line.subText && (
                    <p
                      className={`text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-amber-300/90'
                          : 'text-slate-500 group-hover:text-slate-400'
                      }`}
                    >
                      {line.subText}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono shrink-0">
        <span>CURRENT TRACK: {track.title}</span>
        <div className="flex items-center gap-1 text-slate-400">
          <FastForward className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive timeline seeker</span>
        </div>
      </div>
    </div>
  );
};
