import React, { useState } from 'react';
import { Track } from '../types/music';
import { Play, Pause, Music, UploadCloud, Search, Sparkles } from 'lucide-react';

interface TrackListProps {
  tracks: Track[];
  currentTrackId: string;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onFileUpload: (file: File) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
  onFileUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [isDragging, setIsDragging] = useState(false);

  // Extract unique genres
  const genres = ['all', ...Array.from(new Set(tracks.map((t) => t.genre)))];

  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || track.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type.startsWith('audio/')) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Search & Genre Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tracks, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0c0c14] border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Interactive Filter Segmented Control (Buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900/80 border border-slate-800 rounded-lg shrink-0">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedGenre === g
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {g === 'all' ? 'All Releases' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Audio Upload Banner */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-2xl border-2 border-dashed p-6 transition-all duration-300 text-center ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-[#0d0d16]/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-white">
            Drop your own audio track here (.mp3, .wav, .m4a)
          </p>
          <p className="text-xs text-slate-500">
            Play any music file through JUICE's real-time spectrum visualizer and DJ effects rack.
          </p>
        </div>
      </div>

      {/* Track List Items */}
      <div className="space-y-2.5">
        {filteredTracks.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm font-mono">
            NO TRACKS MATCH YOUR SEARCH
          </div>
        ) : (
          filteredTracks.map((track, idx) => {
            const isCurrent = track.id === currentTrackId;

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isCurrent) {
                    onTogglePlay();
                  } else {
                    onSelectTrack(track);
                  }
                }}
                className={`group flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-xl transition-all duration-200 cursor-pointer border ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-500/15 via-[#131320] to-[#0d0d16] border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-[#0d0d16] hover:bg-[#12121e] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left: Index / Play Icon & Thumbnail & Titles */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-6 text-center shrink-0">
                    <span className="group-hover:hidden text-xs font-mono tabular-nums text-slate-500">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <button className="hidden group-hover:inline-flex text-amber-400">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                  </div>

                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700/60 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm sm:text-base font-bold truncate font-display ${
                          isCurrent ? 'text-amber-300' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-amber-400 tracking-wider uppercase font-semibold">
                          NOW PLAYING
                        </span>
                      )}
                    </div>
                    {/* Unboxed Metadata Discipline */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                      <span>{track.artist}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="hidden sm:inline">{track.album}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Genre, BPM, Duration */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-xs">
                  <span className="hidden md:inline text-slate-400 font-medium">
                    {track.genre}
                  </span>
                  <span className="hidden sm:inline font-mono text-slate-500 tabular-nums">
                    {track.bpm} BPM
                  </span>
                  <span className="font-mono tabular-nums text-slate-300 font-semibold w-12 text-right">
                    {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
