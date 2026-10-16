import React from 'react';
import { STUDIO_BANNER } from '../data/tracks';
import { Sliders, Headphones, Disc, Flame } from 'lucide-react';

export const StudioSpotlight: React.FC = () => {
  return (
    <div className="w-full space-y-8">
      {/* Studio Banner */}
      <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <img
          src={STUDIO_BANNER}
          alt="JUICE Tokyo Recording Studio"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-black/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
              TOKYO RECORDING LAB // SHIBUYA TOWER VIEW
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight text-balance">
              JUICE Sound Collective Session
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Analog mixing console, 808 sub synthesis, and live fruit frequency modulation.
            </p>
          </div>
        </div>
      </div>

      {/* Liner Notes & Production Story */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-xl font-bold text-white font-display">
            01. Concept & Lyric Architecture
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            灼熱のアスファルトと、人混みの熱気に巻かれてオーバーヒート寸前の肉体。思考すらループしてしまう現代の都市の渇きを、未知領域の冷涼なジュースとアサイーで解き放つために生み出されたプロジェクト。
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            重厚な808サブベースとファンキーなコード進行、そして耳に焼き付くフック「ぶち込もうぜ Pouring, pouring / 五感ごと全部飲み込んで 納得行くまで Juice, Juice...」。一口飲むだけで視界が覚醒するようなサウンドデザインを追求しました。
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0e0e18] border border-slate-800/80 space-y-1">
              <span className="text-xs font-mono text-amber-400 uppercase">Mastering Specs</span>
              <p className="text-sm font-semibold text-white">48kHz / 24-bit Hi-Res Master</p>
              <p className="text-xs text-slate-500">True-Peak -0.5 dBTP, Dynamic Range +9 LUFS</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0e0e18] border border-slate-800/80 space-y-1">
              <span className="text-xs font-mono text-purple-400 uppercase">Analog Chain</span>
              <p className="text-sm font-semibold text-white">Tube Saturation & Acai Filter</p>
              <p className="text-xs text-slate-500">Vintage Neve console warmth with modern DSP</p>
            </div>
          </div>
        </div>

        {/* Studio Credits */}
        <div className="md:col-span-4 bg-[#0e0e18] border border-slate-800/80 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
            PRODUCTION CREDITS
          </h4>
          <dl className="space-y-3 text-xs">
            <div>
              <dt className="text-slate-500 font-mono">Executive Producer</dt>
              <dd className="text-white font-semibold mt-0.5">JUICE SOUNDWORKS</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-mono">Vocals & Lyrics</dt>
              <dd className="text-white font-semibold mt-0.5">JUICE ft. SUNFIRE</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-mono">Beat Arrangement & Synthesis</dt>
              <dd className="text-white font-semibold mt-0.5">HYPERFLOW & TOKYO NEON LAB</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-mono">Mix & Sound Design</dt>
              <dd className="text-white font-semibold mt-0.5">Overheat Studio Tokyo</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};
