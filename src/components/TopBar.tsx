import React, { useRef } from 'react';
import { Upload, Disc3 } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onFileUpload: (file: File) => void;
  isPlaying: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onFileUpload,
  isPlaying,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090f]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onSelectTab('player')}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-violet-600 p-[1.5px] transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full bg-[#0b0b12] rounded-[7px] flex items-center justify-center">
                <Disc3 className={`w-4 h-4 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} />
              </div>
            </div>
            <span className="text-xl font-black tracking-wider text-white font-display uppercase whitespace-nowrap">
              JUICE<span className="text-amber-400 font-mono text-base font-normal ml-0.5">.</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('player')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'player'
                ? 'text-white border-amber-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Player
          </button>
          <button
            onClick={() => onSelectTab('visualizer')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'visualizer'
                ? 'text-white border-amber-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Visualizer
          </button>
          <button
            onClick={() => onSelectTab('lyrics')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'lyrics'
                ? 'text-white border-amber-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Lyrics Sync
          </button>
          <button
            onClick={() => onSelectTab('fx')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'fx'
                ? 'text-white border-amber-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Sound Lab & FX
          </button>
          <button
            onClick={() => onSelectTab('studio')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'studio'
                ? 'text-white border-amber-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Studio Session
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 hover:from-amber-300 hover:to-orange-300 rounded-lg shadow-md shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Load Audio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
