import React from 'react';
import { AudioFxState } from '../types/music';
import { audioEngine } from '../services/audioEngine';
import { Sliders, Zap, Sparkles, Volume2, RotateCcw } from 'lucide-react';

interface DjFxRackProps {
  fx: AudioFxState;
  onChangeFx: (updater: (prev: AudioFxState) => AudioFxState) => void;
  onResetFx: () => void;
}

export const DjFxRack: React.FC<DjFxRackProps> = ({ fx, onChangeFx, onResetFx }) => {
  const triggerFxSound = (sound: 'pour' | 'scratch' | 'horn' | 'laser') => {
    switch (sound) {
      case 'pour':
        audioEngine.playJuicePour();
        break;
      case 'scratch':
        audioEngine.playDjScratch();
        break;
      case 'horn':
        audioEngine.playAirHorn();
        break;
      case 'laser':
        audioEngine.playLaserDrop();
        break;
    }
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#13131f] to-[#0c0c14] border border-slate-800/90 p-6 shadow-2xl space-y-6">
      {/* Rack Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-white font-display tracking-wide uppercase">
            SOUND LAB & MASTER FX
          </h3>
          <span className="text-xs text-slate-500 font-mono">DSP ENGINE</span>
        </div>
        <button
          onClick={onResetFx}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Rack</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Section: 3-Band Equalizer (6 cols) */}
        <div className="md:col-span-6 bg-[#0a0a10] border border-slate-900 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center justify-between">
            <span>3-BAND EQUALIZER</span>
            <span className="text-[11px] text-amber-400">ANALOG BIQUAD</span>
          </h4>

          {/* Bass */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">BASS PUNCH (140Hz)</span>
              <span className={`tabular-nums font-bold ${fx.bass > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {fx.bass > 0 ? `+${fx.bass.toFixed(1)}` : fx.bass.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="12"
              step="0.5"
              value={fx.bass}
              onChange={(e) =>
                onChangeFx((prev) => ({ ...prev, bass: parseFloat(e.target.value) }))
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Mid */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">MID PRESENCE (1.1kHz)</span>
              <span className="text-slate-300 tabular-nums font-bold">
                {fx.mid > 0 ? `+${fx.mid.toFixed(1)}` : fx.mid.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={fx.mid}
              onChange={(e) =>
                onChangeFx((prev) => ({ ...prev, mid: parseFloat(e.target.value) }))
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Treble */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">TREBLE AIR (4.5kHz)</span>
              <span className="text-slate-300 tabular-nums font-bold">
                {fx.treble > 0 ? `+${fx.treble.toFixed(1)}` : fx.treble.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={fx.treble}
              onChange={(e) =>
                onChangeFx((prev) => ({ ...prev, treble: parseFloat(e.target.value) }))
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Right Section: DJ Filter & Speed (6 cols) */}
        <div className="md:col-span-6 space-y-4">
          {/* DJ Filter Sweep */}
          <div className="bg-[#0a0a10] border border-slate-900 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 uppercase font-bold">DJ RESONANT FILTER</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {fx.filterCutoff >= 19000 ? 'BYPASS (OPEN)' : `${Math.round(fx.filterCutoff)} Hz`}
              </span>
            </div>
            <input
              type="range"
              min="300"
              max="20000"
              step="100"
              value={fx.filterCutoff}
              onChange={(e) =>
                onChangeFx((prev) => ({ ...prev, filterCutoff: parseFloat(e.target.value) }))
              }
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onChangeFx((prev) => ({ ...prev, filterCutoff: 1200 }))}
                className="px-2.5 py-1 text-[11px] font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
              >
                Sub Club (1.2k)
              </button>
              <button
                onClick={() => onChangeFx((prev) => ({ ...prev, filterCutoff: 4500 }))}
                className="px-2.5 py-1 text-[11px] font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
              >
                Warm Tape (4.5k)
              </button>
              <button
                onClick={() => onChangeFx((prev) => ({ ...prev, filterCutoff: 20000 }))}
                className="px-2.5 py-1 text-[11px] font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
              >
                Full Open (20k)
              </button>
            </div>
          </div>

          {/* Playback Tempo Speed */}
          <div className="bg-[#0a0a10] border border-slate-900 rounded-xl p-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 uppercase font-bold">PLAYBACK SPEED</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {fx.playbackRate.toFixed(2)}x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={fx.playbackRate}
                onChange={(e) =>
                  onChangeFx((prev) => ({ ...prev, playbackRate: parseFloat(e.target.value) }))
                }
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <button
                onClick={() => onChangeFx((prev) => ({ ...prev, playbackRate: 1.0 }))}
                className="px-2 py-0.5 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-400 rounded shrink-0 cursor-pointer"
              >
                1.0x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sound FX Launchpad */}
      <div className="bg-[#09090f] border border-slate-900 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>REAL-TIME DJ SAMPLE PADS (TAP TO TRIGGER)</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">ZERO LATENCY</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => triggerFxSound('pour')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:from-amber-500/20 hover:to-orange-500/15 border border-amber-500/30 active:scale-95 transition-all cursor-pointer group text-center"
          >
            <Sparkles className="w-5 h-5 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white font-display">JUICE POUR</span>
            <span className="text-[10px] text-slate-400 font-mono">Carbonated Fizz</span>
          </button>

          <button
            onClick={() => triggerFxSound('scratch')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 hover:from-purple-500/20 hover:to-indigo-500/15 border border-purple-500/30 active:scale-95 transition-all cursor-pointer group text-center"
          >
            <Sliders className="w-5 h-5 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white font-display">DJ SCRATCH</span>
            <span className="text-[10px] text-slate-400 font-mono">Turntable Chirp</span>
          </button>

          <button
            onClick={() => triggerFxSound('horn')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-br from-rose-500/10 to-red-500/5 hover:from-rose-500/20 hover:to-red-500/15 border border-rose-500/30 active:scale-95 transition-all cursor-pointer group text-center"
          >
            <Volume2 className="w-5 h-5 text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white font-display">AIR HORN</span>
            <span className="text-[10px] text-slate-400 font-mono">Club Riser Horn</span>
          </button>

          <button
            onClick={() => triggerFxSound('laser')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 hover:from-cyan-500/20 hover:to-blue-500/15 border border-cyan-500/30 active:scale-95 transition-all cursor-pointer group text-center"
          >
            <Zap className="w-5 h-5 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white font-display">LASER DROP</span>
            <span className="text-[10px] text-slate-400 font-mono">Pitch Down Zap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
