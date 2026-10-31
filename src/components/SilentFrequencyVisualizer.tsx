import React, { useEffect, useRef } from 'react';
import { Waves } from 'lucide-react';

interface SilentFrequencyVisualizerProps {
  className?: string;
  harmonicRatio?: number; // default 1.0 (432Hz baseline)
  glowColor?: string;
}

/**
 * Pure Mathematical HTML5 Canvas Silent Harmonic Wave Visualizer
 * STRICTLY ZERO AUDIO / ZERO SOUND / NO WEB AUDIO API
 * Generates smooth, soothing harmonic wave dynamics matching 432Hz acoustic mathematics
 */
export const SilentFrequencyVisualizer: React.FC<SilentFrequencyVisualizerProps> = ({
  className = '',
  harmonicRatio = 1.0,
  glowColor = '#f59e0b',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Handle high DPI displays with clamped DPR to prevent memory bloat on iPhone
    let cachedWidth = 400;
    let cachedHeight = 120;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cachedWidth = Math.max(10, Math.floor(rect.width));
      cachedHeight = Math.max(10, Math.floor(rect.height));
      canvas.width = cachedWidth * dpr;
      canvas.height = cachedHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Wave parameters simulating 432Hz harmonic overtones (fundamental + octaves + 5ths)
    const waves = [
      { freq: 0.008 * harmonicRatio, amp: 26, speed: 0.016, color: 'rgba(245, 158, 11, 0.45)', lineWidth: 2.2 }, // Golden 432 fundamental
      { freq: 0.012 * harmonicRatio, amp: 20, speed: 0.022, color: 'rgba(16, 185, 129, 0.40)', lineWidth: 1.8 }, // Emerald 5th harmonic (648Hz ratio)
      { freq: 0.016 * harmonicRatio, amp: 14, speed: 0.028, color: 'rgba(56, 189, 248, 0.40)', lineWidth: 1.5 }, // Sky octave (864Hz ratio)
      { freq: 0.005 * harmonicRatio, amp: 32, speed: 0.010, color: 'rgba(217, 119, 6, 0.25)', lineWidth: 2.8 },  // Deep undertone
      { freq: 0.024 * harmonicRatio, amp: 8,  speed: 0.035, color: 'rgba(244, 244, 245, 0.30)', lineWidth: 1.0 }, // Fine harmonic shimmer
    ];

    // Background floating starlight particles
    const particles: Array<{ x: number; y: number; size: number; speed: number; alpha: number }> = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 200,
        size: Math.random() * 1.8 + 0.6,
        speed: Math.random() * 0.3 + 0.1,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    const render = () => {
      const width = cachedWidth;
      const height = cachedHeight;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle floating particles
      particles.forEach((p) => {
        p.x -= p.speed;
        if (p.x < 0) p.x = width;
        ctx.beginPath();
        ctx.arc(p.x, p.y % height, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha * 0.6})`;
        ctx.fill();
      });

      // 2. Center baseline for wave undulating
      const centerY = height / 2;

      // 3. Draw each harmonic wave layer
      waves.forEach((w, waveIdx) => {
        ctx.beginPath();
        ctx.lineWidth = w.lineWidth;
        ctx.strokeStyle = w.color;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Add soft glow
        ctx.shadowColor = w.color;
        ctx.shadowBlur = 10;

        for (let x = 0; x <= width; x += 3) {
          // Compound sinusoidal calculation for organic liquid resonance
          const y =
            centerY +
            Math.sin(x * w.freq + time * w.speed) * w.amp * Math.sin(time * 0.005 + waveIdx) +
            Math.cos(x * w.freq * 0.5 + time * (w.speed * 0.7)) * (w.amp * 0.35);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Soft subtle gradient fill under the lowest fundamental wave
        if (waveIdx === 0) {
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          const gradient = ctx.createLinearGradient(0, centerY, 0, height);
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      // Reset shadow for next tick
      ctx.shadowBlur = 0;

      time += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [harmonicRatio, glowColor]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-950/70 border border-amber-500/20 shadow-xl ${className}`}>
      {/* Top indicator tag */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 backdrop-blur-md text-[11px] text-amber-300">
        <Waves className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="font-mono tracking-wide">432Hz Harmonic Wave (Visual Resonance)</span>
        <span className="text-slate-400 text-[10px]">· Pure Silent Canvas</span>
      </div>

      <div className="absolute top-3 right-4 z-10 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
        Continuous Organic Motion
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-44 md:h-52 block"
        style={{ width: '100%' }}
      />

      {/* Bottom frequency matrix scale indicator */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-amber-400/90">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Fundamental: 432Hz
          </span>
          <span className="flex items-center gap-1 text-emerald-400/80 hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 5th Harmonic: 648Hz
          </span>
          <span className="flex items-center gap-1 text-sky-400/80 hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Octave: 864Hz
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">Harmonic Golden Ratio Φ 1.618</span>
      </div>
    </div>
  );
};
