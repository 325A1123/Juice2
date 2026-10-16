import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { VisualizerMode } from '../types/music';
import { BarChart3, Disc, Activity, Sparkles } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  bpm: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, bpm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const [glowBoost, setGlowBoost] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let idleAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const analyser = audioEngine.getAnalyser();

      // Clear with dark trail for organic phosphor glow
      ctx.fillStyle = 'rgba(10, 10, 16, 0.28)';
      ctx.fillRect(0, 0, width, height);

      let dataArray: Uint8Array;
      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        if (mode === 'wave') {
          analyser.getByteTimeDomainData(dataArray as any);
        } else {
          analyser.getByteFrequencyData(dataArray as any);
        }
      } else {
        // Idle animation when audio is paused
        const bufferLength = 64;
        dataArray = new Uint8Array(bufferLength);
        idleAngle += (bpm / 60) * 0.03;
        for (let i = 0; i < bufferLength; i++) {
          const val = 20 + Math.sin(idleAngle + i * 0.2) * 15 + Math.sin(idleAngle * 0.5 + i * 0.1) * 10;
          dataArray[i] = Math.max(8, val);
        }
      }

      // Render based on selected mode
      if (mode === 'bars') {
        renderBars(ctx, dataArray, width, height, glowBoost);
      } else if (mode === 'radial') {
        renderRadial(ctx, dataArray, width, height, glowBoost, idleAngle);
      } else if (mode === 'wave') {
        renderWave(ctx, dataArray, width, height, glowBoost);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, isPlaying, bpm, glowBoost]);

  // Handle responsive canvas size
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width * window.devicePixelRatio;
        canvasRef.current.height = rect.height * window.devicePixelRatio;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const renderBars = (
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    width: number,
    height: number,
    boost: boolean
  ) => {
    const count = 48;
    const barWidth = (width / count) * 0.72;
    const gap = (width / count) * 0.28;

    for (let i = 0; i < count; i++) {
      const dataIndex = Math.floor((i / count) * (data.length * 0.75));
      const value = data[dataIndex] || 0;
      const percent = value / 255;
      const barHeight = Math.max(4, percent * (height * 0.82));
      const x = i * (barWidth + gap) + gap / 2;
      const y = height - barHeight;

      // Dynamic color gradient: Amber -> Neon Orange -> Hot Violet -> Electric Cyan
      const grad = ctx.createLinearGradient(0, height, 0, y);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.4, '#ff6b00');
      grad.addColorStop(0.8, '#d946ef');
      grad.addColorStop(1, '#38bdf8');

      ctx.fillStyle = grad;
      if (boost && percent > 0.4) {
        ctx.shadowColor = '#ff6b00';
        ctx.shadowBlur = percent * 18;
      } else {
        ctx.shadowBlur = 0;
      }

      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Peak cap dot
      if (percent > 0.15) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, Math.max(0, y - 4), barWidth, 2);
      }
    }
    ctx.shadowBlur = 0;
  };

  const renderRadial = (
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    width: number,
    height: number,
    boost: boolean,
    rotation: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.22;

    // Calculate bass energy
    let bassEnergy = 0;
    for (let i = 0; i < 8; i++) {
      bassEnergy += data[i] || 0;
    }
    const bassScale = 1 + (bassEnergy / (8 * 255)) * 0.35;
    const activeRadius = baseRadius * bassScale;

    // Center pulsating ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, activeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 3;
    if (boost) {
      ctx.shadowColor = '#ff6b00';
      ctx.shadowBlur = 24;
    }
    ctx.stroke();

    // Secondary inner core
    ctx.beginPath();
    ctx.arc(centerX, centerY, activeRadius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 107, 0, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Orbital frequency spikes
    const count = 64;
    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const dataIndex = Math.floor((i / count) * (data.length * 0.7));
      const val = data[dataIndex] || 0;
      const spikeLen = (val / 255) * (Math.min(width, height) * 0.26);

      const angle = i * angleStep + rotation;
      const x1 = centerX + Math.cos(angle) * activeRadius;
      const y1 = centerY + Math.sin(angle) * activeRadius;
      const x2 = centerX + Math.cos(angle) * (activeRadius + spikeLen + 4);
      const y2 = centerY + Math.sin(angle) * (activeRadius + spikeLen + 4);

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, '#ff6b00');
      grad.addColorStop(0.6, '#a855f7');
      grad.addColorStop(1, '#38bdf8');

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  };

  const renderWave = (
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    width: number,
    height: number,
    boost: boolean
  ) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    if (boost) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
    }

    ctx.beginPath();
    const sliceWidth = width / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();

    // Ghost parallel waveform for holographic depth
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 107, 0, 0.45)';
    ctx.shadowBlur = 0;
    ctx.stroke();
  };

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#11111a] to-[#0a0a10] border border-slate-800/80 p-5 shadow-2xl overflow-hidden group">
      {/* Visualizer header & mode switcher */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-white tracking-wide font-display">
            AUDIO SPECTRUM CORE
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {isPlaying ? 'ACTIVE // 48kHz' : 'IDLE // STANDBY'}
          </span>
        </div>

        {/* Mode switcher tabs (functional segmented buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
          <button
            onClick={() => setMode('bars')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mode === 'bars'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Frequency Bars"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Spectrum</span>
          </button>
          <button
            onClick={() => setMode('radial')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mode === 'radial'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Radial Pulse"
          >
            <Disc className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Radial</span>
          </button>
          <button
            onClick={() => setMode('wave')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mode === 'wave'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Oscilloscope"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Waveform</span>
          </button>
          <button
            onClick={() => setGlowBoost(!glowBoost)}
            className={`px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              glowBoost ? 'text-amber-400' : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle Neon Glow"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-56 sm:h-72 rounded-xl bg-[#09090f] overflow-hidden border border-slate-900 flex items-center justify-center">
        {/* Subtle grid backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />

        <canvas
          ref={canvasRef}
          className="w-full h-full block relative z-10"
        />

        {/* Ambient bottom glow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};
