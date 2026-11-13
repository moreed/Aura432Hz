import React, { useState, useEffect, useRef, useId } from 'react';
import { Play, Pause, RotateCcw, Wind, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';

export interface BreathTechnique {
  id: string;
  name: string;
  subtitle: string;
  inhale: number; // in seconds
  holdIn: number;
  exhale: number;
  holdOut: number;
  benefit: string;
}

export const BREATH_TECHNIQUES: BreathTechnique[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    subtitle: '4 · 4 · 4 · 4',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    benefit: 'Restores nervous system focus and mental equilibrium',
  },
  {
    id: 'calm478',
    name: 'Deep Calm',
    subtitle: '4 · 7 · 8',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 1,
    benefit: 'Soothes anxiety, activates parasympathetic rest',
  },
  {
    id: 'balance55',
    name: 'Coherent Heart',
    subtitle: '5 · 5',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    benefit: 'Harmonizes heart rate variability & inner peace',
  },
  {
    id: 'tranquility',
    name: 'Serenity Rest',
    subtitle: '4 · 2 · 6 · 2',
    inhale: 4,
    holdIn: 2,
    exhale: 6,
    holdOut: 2,
    benefit: 'Gently releases accumulated muscular and mental tension',
  },
];

export type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Stillness';

interface SacredLotusBreathVisualizerProps {
  className?: string;
  size?: number; // base diameter in px
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const SacredLotusBreathVisualizer: React.FC<SacredLotusBreathVisualizerProps> = ({
  className = '',
  size = 350,
}) => {
  const uid = useId().replace(/:/g, '');

  // Selected breath technique
  const [selectedTechnique, setSelectedTechnique] = useState<BreathTechnique>(BREATH_TECHNIQUES[0]);
  const [showGuideMenu, setShowGuideMenu] = useState(false);

  // Animation & breath playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [phaseProgress, setPhaseProgress] = useState(0); // 0 to 1
  const [scale, setScale] = useState(0.8);
  const [petalBloom, setPetalBloom] = useState(0); // 0 (closed) to 1 (fully open)
  const [pulseGlow, setPulseGlow] = useState(0.4);
  const [cycleCount, setCycleCount] = useState(1);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Refs for smooth animation loop
  const animFrameRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number>(Date.now());
  const currentPhaseRef = useRef<BreathPhase>('Inhale');
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const techniqueRef = useRef(selectedTechnique);
  techniqueRef.current = selectedTechnique;

  // Compute duration for current phase based on selected technique
  const getPhaseDuration = (p: BreathPhase, tech: BreathTechnique) => {
    switch (p) {
      case 'Inhale':
        return tech.inhale * 1000;
      case 'Hold':
        return (tech.holdIn || 0.1) * 1000;
      case 'Exhale':
        return tech.exhale * 1000;
      case 'Stillness':
        return (tech.holdOut || 0.1) * 1000;
    }
  };

  // Reset phase when technique changes
  const handleSelectTechnique = (tech: BreathTechnique) => {
    setSelectedTechnique(tech);
    currentPhaseRef.current = 'Inhale';
    setPhase('Inhale');
    phaseStartTimeRef.current = Date.now();
    setPhaseProgress(0);
    setShowGuideMenu(false);
  };

  // Handle user interaction: Tapping the lotus advances or pulses it
  const handleLotusClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev.slice(-3), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1200);
  };

  // Skip to next breath phase interactively
  const handleAdvancePhase = () => {
    const tech = techniqueRef.current;
    let next: BreathPhase = 'Inhale';
    if (currentPhaseRef.current === 'Inhale') {
      next = tech.holdIn > 0 ? 'Hold' : 'Exhale';
    } else if (currentPhaseRef.current === 'Hold') {
      next = 'Exhale';
    } else if (currentPhaseRef.current === 'Exhale') {
      next = tech.holdOut > 0 ? 'Stillness' : 'Inhale';
    } else {
      next = 'Inhale';
      setCycleCount((c) => c + 1);
    }
    currentPhaseRef.current = next;
    setPhase(next);
    phaseStartTimeRef.current = Date.now();
  };

  // Reset breathing cycle
  const handleReset = () => {
    currentPhaseRef.current = 'Inhale';
    setPhase('Inhale');
    phaseStartTimeRef.current = Date.now();
    setPhaseProgress(0);
    setCycleCount(1);
    setIsPlaying(true);
  };

  // Main high-performance animation loop
  useEffect(() => {
    phaseStartTimeRef.current = Date.now();
    let lastStateCommit = 0;

    const animate = () => {
      if (!isPlayingRef.current) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const now = Date.now();
      const tech = techniqueRef.current;
      const duration = getPhaseDuration(currentPhaseRef.current, tech);
      const elapsed = now - phaseStartTimeRef.current;
      const progress = Math.min(elapsed / Math.max(duration, 100), 1);

      // Smooth cosine easing for natural organic lung breath
      const easeInOut = (t: number) => 0.5 - 0.5 * Math.cos(t * Math.PI);
      const eased = easeInOut(progress);

      // Throttle React state commits to ~30fps (every 33ms) to preserve iPhone battery and CPU
      if (now - lastStateCommit >= 33 || elapsed >= duration) {
        lastStateCommit = now;
        setPhaseProgress(progress);

        // Calculate lotus physical expansion, petal flare, and radiance
        if (currentPhaseRef.current === 'Inhale') {
          setScale(0.82 + 0.32 * eased);
          setPetalBloom(eased);
          setPulseGlow(0.35 + 0.5 * eased);
        } else if (currentPhaseRef.current === 'Hold') {
          const shimmer = Math.sin((elapsed / 700) * Math.PI * 2) * 0.015;
          setScale(1.14 + shimmer);
          setPetalBloom(1);
          setPulseGlow(0.85);
        } else if (currentPhaseRef.current === 'Exhale') {
          setScale(1.14 - 0.32 * eased);
          setPetalBloom(1 - eased);
          setPulseGlow(0.85 - 0.5 * eased);
        } else if (currentPhaseRef.current === 'Stillness') {
          setScale(0.82);
          setPetalBloom(0);
          setPulseGlow(0.35);
        }
      }

      // Transition to next phase
      if (elapsed >= duration) {
        phaseStartTimeRef.current = now;
        let next: BreathPhase = 'Inhale';
        if (currentPhaseRef.current === 'Inhale') {
          next = tech.holdIn > 0 ? 'Hold' : 'Exhale';
        } else if (currentPhaseRef.current === 'Hold') {
          next = 'Exhale';
        } else if (currentPhaseRef.current === 'Exhale') {
          next = tech.holdOut > 0 ? 'Stillness' : 'Inhale';
          if (next === 'Inhale') {
            setCycleCount((c) => c + 1);
          }
        } else if (currentPhaseRef.current === 'Stillness') {
          next = 'Inhale';
          setCycleCount((c) => c + 1);
        }

        currentPhaseRef.current = next;
        setPhase(next);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Descriptive mindful guidance for the current phase
  const getPhaseInstruction = () => {
    switch (phase) {
      case 'Inhale':
        return 'Inhale deeply through nose · Expand fully';
      case 'Hold':
        return 'Hold gently with ease · Savor the stillness';
      case 'Exhale':
        return 'Exhale softly through mouth · Release all tension';
      case 'Stillness':
        return 'Rest in peaceful awareness · Center yourself';
    }
  };

  // Petal geometry count
  const OUTER_PETALS = 12;
  const MIDDLE_PETALS = 8;
  const INNER_PETALS = 6;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none w-full max-w-lg mx-auto ${className}`}>
      
      {/* 1. Breathing Guide Header & Technique Selector */}
      <div className="w-full mb-4 flex flex-col items-center">
        <div className="flex items-center justify-between w-full px-2 mb-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold tracking-wider uppercase text-[11px]">
            <Wind className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Breathing Guide</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
              Cycle #{cycleCount}
            </span>
            <button
              type="button"
              onClick={() => setShowGuideMenu(!showGuideMenu)}
              className="text-[11px] px-2.5 py-1 min-h-[28px] rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="Change breathing technique"
            >
              <span>{selectedTechnique.name} ({selectedTechnique.subtitle})</span>
              {showGuideMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Dropdown / Drawer for Breathing Guides */}
        {showGuideMenu && (
          <div className="w-full p-2.5 mb-3 rounded-2xl bg-slate-900/95 border border-amber-500/30 backdrop-blur-xl shadow-2xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-left z-20 transition-all">
            {BREATH_TECHNIQUES.map((tech) => {
              const isSelected = selectedTechnique.id === tech.id;
              return (
                <button
                  type="button"
                  key={tech.id}
                  onClick={() => handleSelectTechnique(tech)}
                  className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-200">{tech.name}</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {tech.subtitle}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{tech.benefit}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Interactive Sacred Lotus Visualizer Body */}
      <div
        onClick={handleLotusClick}
        className="relative flex items-center justify-center cursor-pointer group"
        style={{ width: `${size}px`, height: `${size}px` }}
        title="Tap the Sacred Lotus to interact with your breathwork"
      >
        {/* Radiant Ambient Aura Glow */}
        <div
          className="absolute rounded-full pointer-events-none transition-transform duration-300"
          style={{
            width: `${size * 1.35}px`,
            height: `${size * 1.35}px`,
            background: `radial-gradient(circle, rgba(245, 158, 11, ${pulseGlow * 0.35}) 0%, rgba(16, 185, 129, ${
              pulseGlow * 0.15
            }) 40%, rgba(56, 189, 248, ${pulseGlow * 0.08}) 60%, transparent 75%)`,
            transform: `scale(${scale * 1.08})`,
            filter: 'blur(24px)',
          }}
        />

        {/* Dynamic Click Ripple Rings */}
        {ripples.map((rip) => (
          <span
            key={rip.id}
            className="absolute rounded-full pointer-events-none border-2 border-amber-300/80 animate-ping"
            style={{
              left: `${rip.x}px`,
              top: `${rip.y}px`,
              width: '40px',
              height: '40px',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Sacred Geometry Lotus SVG */}
        <svg
          viewBox="-200 -200 400 400"
          className="w-full h-full overflow-visible transition-transform duration-100 ease-out drop-shadow-[0_0_18px_rgba(245,158,11,0.25)]"
          style={{ transform: `scale(${scale})` }}
        >
          <defs>
            {/* Core Bindu Gradient */}
            <radialGradient id={`coreGrad_${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
              <stop offset="35%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0.15" />
            </radialGradient>

            {/* Outer Petals Gradient with golden-emerald twilight */}
            <linearGradient id={`outerPetalGrad_${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#92400e" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#d97706" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#fde047" stopOpacity="0.95" />
            </linearGradient>

            {/* Middle Petals Gradient */}
            <linearGradient id={`middlePetalGrad_${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#065f46" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="90%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0.95" />
            </linearGradient>

            {/* Inner Petals Gradient */}
            <linearGradient id={`innerPetalGrad_${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#b45309" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>

            {/* Curvature Petals */}
            <path
              id={`outerPetal_${uid}`}
              d="M 0 0 C -36 -45 -40 -128 0 -170 C 40 -128 36 -45 0 0 Z"
            />
            <path
              id={`middlePetal_${uid}`}
              d="M 0 0 C -28 -35 -32 -98 0 -132 C 32 -98 28 -35 0 0 Z"
            />
            <path
              id={`innerPetal_${uid}`}
              d="M 0 0 C -20 -25 -22 -68 0 -94 C 22 -68 20 -25 0 0 Z"
            />

            {/* Bloom & Glow Filters */}
            <filter id={`bloomFilter_${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Cymatic Celestial Ring */}
          <circle
            cx="0"
            cy="0"
            r="182"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="0.8"
            strokeDasharray="3 8"
            opacity="0.35"
            style={{
              transform: `rotate(${phaseProgress * 45}deg)`,
              transformOrigin: '0 0',
              transition: 'transform 0.2s linear',
            }}
          />
          <circle
            cx="0"
            cy="0"
            r="170"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.5"
            strokeDasharray="2 6"
            opacity="0.25"
            style={{
              transform: `rotate(-${phaseProgress * 30}deg)`,
              transformOrigin: '0 0',
              transition: 'transform 0.2s linear',
            }}
          />

          {/* Tier 1: Outer Lotus Petals (12 Petals) */}
          <g opacity="0.9">
            {Array.from({ length: OUTER_PETALS }).map((_, i) => {
              const baseAngle = (360 / OUTER_PETALS) * i;
              // Subtle blooming outward rotation spread
              const bloomSpread = (petalBloom - 0.5) * 4;
              return (
                <use
                  key={`outer-${i}`}
                  href={`#outerPetal_${uid}`}
                  transform={`rotate(${baseAngle + bloomSpread})`}
                  fill={`url(#outerPetalGrad_${uid})`}
                  stroke="#f59e0b"
                  strokeWidth="1.1"
                />
              );
            })}
          </g>

          {/* Tier 2: Middle Lotus Petals (8 Petals) */}
          <g opacity="0.95">
            {Array.from({ length: MIDDLE_PETALS }).map((_, i) => {
              const baseAngle = (360 / MIDDLE_PETALS) * i + 22.5;
              const bloomSpread = (petalBloom - 0.5) * -3;
              return (
                <use
                  key={`mid-${i}`}
                  href={`#middlePetal_${uid}`}
                  transform={`rotate(${baseAngle + bloomSpread})`}
                  fill={`url(#middlePetalGrad_${uid})`}
                  stroke="#fbbf24"
                  strokeWidth="1.3"
                />
              );
            })}
          </g>

          {/* Tier 3: Inner Sacred Lotus Petals (6 Petals) */}
          <g opacity="1">
            {Array.from({ length: INNER_PETALS }).map((_, i) => {
              const baseAngle = (360 / INNER_PETALS) * i;
              return (
                <use
                  key={`inner-${i}`}
                  href={`#innerPetal_${uid}`}
                  transform={`rotate(${baseAngle})`}
                  fill={`url(#innerPetalGrad_${uid})`}
                  stroke="#fef3c7"
                  strokeWidth="1.4"
                />
              );
            })}
          </g>

          {/* Sacred Seed of Life Core */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (360 / 6) * i * (Math.PI / 180);
            const cx = Math.cos(angle) * 24;
            const cy = Math.sin(angle) * 24;
            return (
              <circle
                key={`seed-${i}`}
                cx={cx}
                cy={cy}
                r="24"
                fill="none"
                stroke="#fef3c7"
                strokeWidth="0.9"
                opacity="0.45"
              />
            );
          })}

          {/* Center Golden Core Orb (Bindu) */}
          <circle cx="0" cy="0" r="44" fill={`url(#coreGrad_${uid})`} />
          <circle
            cx="0"
            cy="0"
            r="44"
            fill="none"
            stroke="#fef3c7"
            strokeWidth="1.6"
            strokeDasharray="5 3"
            opacity="0.7"
          />

          {/* Core Pulsing Crown Jewel */}
          <circle
            cx="0"
            cy="0"
            r={7 + pulseGlow * 9}
            fill="#ffffff"
            filter={`url(#bloomFilter_${uid})`}
            opacity="0.95"
          />
        </svg>

        {/* Breathwork Instructions & Guidance Inside Lotus Core */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center justify-center text-center px-4 py-2 rounded-full backdrop-blur-[1px]">
            <span className="text-xs sm:text-sm font-extrabold tracking-[0.28em] uppercase text-amber-50 drop-shadow-[0_2px_12px_rgba(245,158,11,1)]">
              {phase}
            </span>

            {/* Circular breath progress bar */}
            <div className="w-14 h-1.5 bg-amber-950/70 rounded-full mt-1.5 overflow-hidden border border-amber-400/40">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-amber-200 to-white transition-all duration-100 rounded-full"
                style={{ width: `${Math.round(phaseProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Breathing Controls Bar & Real-time Guide Text */}
      <div className="mt-4 w-full flex flex-col items-center text-center space-y-2">
        {/* Real-time Guidance Instruction */}
        <p className="text-xs sm:text-sm text-amber-200/90 font-medium tracking-wide">
          {getPhaseInstruction()}
        </p>

        {/* Interactive Controls Bar: Play/Pause, Advance, Reset */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 min-h-[34px] rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-all inline-flex items-center justify-center gap-1.5 text-xs font-semibold shadow-md cursor-pointer whitespace-nowrap"
            title={isPlaying ? 'Pause breathwork pacing' : 'Resume breathwork pacing'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            type="button"
            onClick={handleAdvancePhase}
            className="px-3 py-1.5 min-h-[34px] rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 transition-all inline-flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer whitespace-nowrap"
            title="Advance to next breath phase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next Phase</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-[34px] h-[34px] inline-flex items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer shrink-0"
            title="Reset breath cycle"
            aria-label="Reset breath cycle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-[10px] text-slate-400 tracking-wider">
          Tap the Sacred Lotus anytime to interact with your breath
        </span>
      </div>
    </div>
  );
};
