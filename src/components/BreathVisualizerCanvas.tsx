import React, { useId } from 'react';
import {
  Play,
  Pause,
  CircleDot,
  Flower2,
  Waves,
  Volume2,
  VolumeX,
  Heart,
} from 'lucide-react';

export type BreathAnimationStyle = 'orb' | 'lotus' | 'wave';

export interface BreathPhaseItem {
  name: string;
  duration: number;
  cue: string;
  type: 'inhale' | 'hold' | 'exhale';
}

export interface BreathVisualizerCanvasProps {
  isActive: boolean;
  isInitialState: boolean;
  isZenMode: boolean;
  isCoherenceSync: boolean;
  audioCueEnabled: boolean;
  patternName: string;
  patternDesc: string;
  phases: BreathPhaseItem[];
  phaseIndex: number;
  phaseElapsed: number;
  completedCycles: number;
  animationStyle: BreathAnimationStyle;
  onChangeAnimationStyle: (style: BreathAnimationStyle) => void;
  onToggleActive: () => void;
  onToggleAudioCue: () => void;
  orbRippleRef?: React.RefObject<HTMLDivElement | null>;
}

const ANIMATION_OPTIONS: Array<{
  id: BreathAnimationStyle;
  label: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'orb', label: 'Luminous Orb', subtitle: 'Expanding radial sphere', icon: CircleDot },
  { id: 'lotus', label: 'Sacred Lotus', subtitle: 'Blooming geometric petals', icon: Flower2 },
  { id: 'wave', label: 'Harmonic Wave', subtitle: 'Rising & settling tide', icon: Waves },
];

export const BreathVisualizerCanvas: React.FC<BreathVisualizerCanvasProps> = ({
  isActive,
  isInitialState,
  isZenMode,
  isCoherenceSync,
  audioCueEnabled,
  patternName,
  patternDesc,
  phases,
  phaseIndex,
  phaseElapsed,
  completedCycles,
  animationStyle,
  onChangeAnimationStyle,
  onToggleActive,
  onToggleAudioCue,
  orbRippleRef,
}) => {
  const uid = useId().replace(/:/g, '');
  const currentPhase = phases[phaseIndex] || phases[0];
  const phaseProgress = Math.min(1, Math.max(0, phaseElapsed / Math.max(0.1, currentPhase.duration)));
  const secondsRemaining = Math.max(0, currentPhase.duration - phaseElapsed).toFixed(1);

  // Smooth cosine easing for natural diaphragmatic expansion (0 = empty, 1 = full)
  const isHoldEmpty =
    currentPhase.type === 'hold' && currentPhase.name.toLowerCase().includes('empty');

  let breathEased = 0.28;
  if (!isActive && phaseElapsed === 0) {
    breathEased = 0.28;
  } else if (currentPhase.type === 'inhale') {
    breathEased = 0.5 - 0.5 * Math.cos(Math.PI * phaseProgress);
  } else if (currentPhase.type === 'hold') {
    breathEased = isHoldEmpty ? 0.04 : 1.0;
  } else if (currentPhase.type === 'exhale') {
    breathEased = 0.5 + 0.5 * Math.cos(Math.PI * phaseProgress);
  }

  // Phase color palette (Aurora Teal for Inhale, Warm Sanctuary Gold for Hold, Cosmic Lavender for Exhale)
  const phasePalette =
    !isActive && isInitialState
      ? {
          accentHex: '#48E1D0',
          secondaryHex: '#38bdf8',
          glowRgba: 'rgba(72, 225, 208, 0.22)',
          textClass: 'text-sky-300',
          badgeBgClass: 'bg-sky-500/15 border-sky-400/35 text-sky-200',
        }
      : currentPhase.type === 'inhale'
      ? {
          accentHex: '#48E1D0',
          secondaryHex: '#38bdf8',
          glowRgba: 'rgba(72, 225, 208, 0.34)',
          textClass: 'text-sky-300',
          badgeBgClass: 'bg-sky-500/20 border-sky-400/45 text-sky-200',
        }
      : currentPhase.type === 'hold'
      ? {
          accentHex: '#fbbf24',
          secondaryHex: '#f59e0b',
          glowRgba: 'rgba(251, 191, 36, 0.28)',
          textClass: 'text-amber-300',
          badgeBgClass: 'bg-amber-500/20 border-amber-400/45 text-amber-200',
        }
      : {
          accentHex: '#A99AFB',
          secondaryHex: '#818cf8',
          glowRgba: 'rgba(169, 154, 251, 0.32)',
          textClass: 'text-indigo-300',
          badgeBgClass: 'bg-indigo-500/20 border-indigo-400/45 text-indigo-200',
        };

  // Outer precision SVG progress arc
  const ringRadius = 122;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset = ringCircumference - phaseProgress * ringCircumference;

  // Derived animation geometry
  const orbScale = 0.76 + breathEased * 0.42; // 0.76 -> 1.18
  const lotusBloomScale = 0.62 + breathEased * 0.38; // 0.62 -> 1.00
  const lotusSpreadDeg = (breathEased - 0.35) * 14;
  // Tide offset inside 200x200 wave viewport (-100..+100): rises from +62 (bottom) to -62 (top)
  const waveYOffset = 62 - breathEased * 124;
  const waveHorizontalShift = (phaseProgress * 120 + completedCycles * 37) % 120;

  return (
    <section
      aria-label="Breathwork Visualizer Stage"
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950/75 border border-slate-800/90 shadow-2xl transition-colors duration-500 ${
        isZenMode ? 'p-4 sm:p-7' : 'p-4 sm:p-6'
      }`}
    >
      {/* Subtle Atmospheric Radial Field synced to active breath phase */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 48%, ${phasePalette.glowRgba} 0%, transparent 64%)`,
          opacity: isActive ? 0.55 + breathEased * 0.45 : 0.35,
        }}
      />

      {/* Top Visualizer Bar: Session Context + 3-Option Animation Mode Switcher */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
          <span className="font-semibold text-slate-100">{patternName}</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-400">
            {currentPhase.name} ({currentPhase.duration}s)
          </span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="text-slate-400">
            Sound: <strong className={audioCueEnabled ? 'text-amber-300 font-semibold' : 'text-slate-400 font-medium'}>
              {audioCueEnabled ? 'Sanctuary Bowls' : 'Muted'}
            </strong>
          </span>
        </div>

        {/* 3 Inhale & Exhale Animation Options */}
        <div
          role="radiogroup"
          aria-label="Inhale and exhale animation style"
          className="grid grid-cols-3 sm:inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 w-full lg:w-auto"
        >
          {ANIMATION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = animationStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChangeAnimationStyle(opt.id)}
                title={`${opt.label}: ${opt.subtitle}`}
                className={`min-h-[34px] px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selected
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50 shadow-sm'
                    : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${selected ? 'text-sky-300' : 'text-slate-400'}`} />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Central Visual Canvas */}
      <div className={`relative z-10 flex flex-col items-center justify-center ${isZenMode ? 'py-6 sm:py-8' : 'py-5 sm:py-6'}`}>
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none">
          {/* Outer Coherence Micro-Ripple Ring */}
          <div
            ref={orbRippleRef}
            aria-hidden="true"
            className="absolute inset-2 rounded-full border border-sky-400/20 pointer-events-none transition-transform duration-150"
            style={{
              transform: `scale(${(0.92 + breathEased * 0.14).toFixed(3)})`,
              opacity: isCoherenceSync ? 0.85 : 0.35,
              boxShadow: isCoherenceSync
                ? `0 0 36px ${phasePalette.glowRgba}`
                : undefined,
            }}
          />

          {/* Precision Circular Phase Progress Track + Cardinal Ticks */}
          <svg
            viewBox="0 0 280 280"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* Cardinal alignment ticks */}
            <g stroke="rgba(148, 163, 184, 0.28)" strokeWidth="1.5" strokeLinecap="round">
              <line x1="140" y1="6" x2="140" y2="14" />
              <line x1="274" y1="140" x2="266" y2="140" />
              <line x1="140" y1="274" x2="140" y2="266" />
              <line x1="6" y1="140" x2="14" y2="140" />
            </g>

            {/* Track circle */}
            <circle
              cx="140"
              cy="140"
              r={ringRadius}
              fill="none"
              stroke="rgba(148, 163, 184, 0.16)"
              strokeWidth="3.5"
            />

            {/* Active Phase Arc */}
            <circle
              cx="140"
              cy="140"
              r={ringRadius}
              fill="none"
              stroke={phasePalette.accentHex}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringDashOffset}
              transform="rotate(-90 140 140)"
              style={{
                transition: 'stroke-dashoffset 60ms linear, stroke 350ms ease',
                filter: `drop-shadow(0 0 8px ${phasePalette.glowRgba})`,
              }}
            />
          </svg>

          {/* ============================================================== */}
          {/* ANIMATION OPTION 1: LUMINOUS ORB                               */}
          {/* ============================================================== */}
          {animationStyle === 'orb' && (
            <div aria-hidden="true" className="relative w-52 h-52 flex items-center justify-center pointer-events-none">
              {/* Soft outer bloom */}
              <div
                className="absolute rounded-full transition-transform duration-100 ease-out"
                style={{
                  width: '188px',
                  height: '188px',
                  transform: `scale(${(orbScale * 1.06).toFixed(3)})`,
                  background: `radial-gradient(circle, ${phasePalette.glowRgba} 0%, transparent 72%)`,
                }}
              />
              {/* Secondary orbital halo */}
              <div
                className="absolute rounded-full border transition-transform duration-100 ease-out"
                style={{
                  width: '164px',
                  height: '164px',
                  transform: `scale(${orbScale.toFixed(3)})`,
                  borderColor: phasePalette.accentHex,
                  opacity: 0.35 + breathEased * 0.4,
                }}
              />
              {/* Core sculpted orb */}
              <div
                className="rounded-full border shadow-2xl transition-transform duration-100 ease-out"
                style={{
                  width: '136px',
                  height: '136px',
                  transform: `scale(${orbScale.toFixed(3)})`,
                  borderColor: phasePalette.accentHex,
                  background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.22) 0%, ${phasePalette.glowRgba} 48%, rgba(8,19,33,0.72) 100%)`,
                  boxShadow: `0 0 36px ${phasePalette.glowRgba}, inset 0 0 24px rgba(255,255,255,0.12)`,
                }}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* ANIMATION OPTION 2: SACRED LOTUS                               */}
          {/* ============================================================== */}
          {animationStyle === 'lotus' && (
            <div aria-hidden="true" className="relative w-56 h-56 flex items-center justify-center pointer-events-none">
              <svg
                viewBox="-150 -150 300 300"
                className="w-full h-full overflow-visible transition-transform duration-100 ease-out"
                style={{ transform: `scale(${lotusBloomScale.toFixed(3)})` }}
              >
                <defs>
                  <linearGradient id={`lotusOuter_${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor={phasePalette.secondaryHex} stopOpacity="0.16" />
                    <stop offset="60%" stopColor={phasePalette.accentHex} stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.88" />
                  </linearGradient>
                  <linearGradient id={`lotusInner_${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor={phasePalette.accentHex} stopOpacity="0.22" />
                    <stop offset="70%" stopColor={phasePalette.accentHex} stopOpacity="0.72" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
                  </linearGradient>
                  <path
                    id={`lotusOuterPetal_${uid}`}
                    d="M 0 0 C -26 -34 -30 -96 0 -126 C 30 -96 26 -34 0 0 Z"
                  />
                  <path
                    id={`lotusMidPetal_${uid}`}
                    d="M 0 0 C -20 -26 -24 -74 0 -98 C 24 -74 20 -26 0 0 Z"
                  />
                  <path
                    id={`lotusInnerPetal_${uid}`}
                    d="M 0 0 C -14 -18 -16 -52 0 -70 C 16 -52 14 -18 0 0 Z"
                  />
                </defs>

                {/* Subtle cymatic halo */}
                <circle
                  cx="0"
                  cy="0"
                  r={72 + breathEased * 44}
                  fill="none"
                  stroke={phasePalette.accentHex}
                  strokeWidth="0.9"
                  strokeDasharray="3 6"
                  opacity={0.28 + breathEased * 0.35}
                />

                {/* Tier 1: 12 Outer Petals */}
                <g opacity={0.68 + breathEased * 0.32}>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (360 / 12) * i + lotusSpreadDeg;
                    const radialScale = 0.72 + breathEased * 0.28;
                    return (
                      <use
                        key={`lo-${i}`}
                        href={`#lotusOuterPetal_${uid}`}
                        transform={`rotate(${angle.toFixed(2)}) scale(1, ${radialScale.toFixed(3)})`}
                        fill={`url(#lotusOuter_${uid})`}
                        stroke={phasePalette.accentHex}
                        strokeWidth="1"
                      />
                    );
                  })}
                </g>

                {/* Tier 2: 8 Middle Petals */}
                <g opacity={0.78 + breathEased * 0.22}>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (360 / 8) * i + 22.5 - lotusSpreadDeg * 0.7;
                    const radialScale = 0.78 + breathEased * 0.22;
                    return (
                      <use
                        key={`lm-${i}`}
                        href={`#lotusMidPetal_${uid}`}
                        transform={`rotate(${angle.toFixed(2)}) scale(1, ${radialScale.toFixed(3)})`}
                        fill={`url(#lotusInner_${uid})`}
                        stroke={phasePalette.secondaryHex}
                        strokeWidth="1.1"
                      />
                    );
                  })}
                </g>

                {/* Tier 3: 6 Inner Crown Petals */}
                <g opacity="0.95">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const angle = (360 / 6) * i + lotusSpreadDeg * 0.45;
                    return (
                      <use
                        key={`li-${i}`}
                        href={`#lotusInnerPetal_${uid}`}
                        transform={`rotate(${angle.toFixed(2)})`}
                        fill={`url(#lotusInner_${uid})`}
                        stroke="#fef3c7"
                        strokeWidth="1.1"
                      />
                    );
                  })}
                </g>

                {/* Center Bindu ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={34 + breathEased * 6}
                  fill="rgba(8, 19, 33, 0.35)"
                  stroke={phasePalette.accentHex}
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          )}

          {/* ============================================================== */}
          {/* ANIMATION OPTION 3: HARMONIC WAVE                              */}
          {/* ============================================================== */}
          {animationStyle === 'wave' && (
            <div aria-hidden="true" className="relative w-52 h-52 flex items-center justify-center pointer-events-none">
              <svg
                viewBox="-100 -100 200 200"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <clipPath id={`wavePortalClip_${uid}`}>
                    <circle cx="0" cy="0" r="96" />
                  </clipPath>
                  <linearGradient id={`waveFillBack_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={phasePalette.secondaryHex} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={phasePalette.secondaryHex} stopOpacity="0.12" />
                  </linearGradient>
                  <linearGradient id={`waveFillFront_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={phasePalette.accentHex} stopOpacity="0.72" />
                    <stop offset="100%" stopColor={phasePalette.secondaryHex} stopOpacity="0.22" />
                  </linearGradient>
                </defs>

                {/* Portal backdrop */}
                <circle
                  cx="0"
                  cy="0"
                  r="96"
                  fill="rgba(8, 19, 33, 0.48)"
                  stroke={phasePalette.accentHex}
                  strokeWidth="1.4"
                  strokeOpacity="0.55"
                />

                {/* Horizon elevation guides */}
                <g stroke="rgba(148, 163, 184, 0.22)" strokeWidth="0.8" strokeDasharray="3 4">
                  <line x1="-84" y1="-40" x2="84" y2="-40" />
                  <line x1="-92" y1="0" x2="92" y2="0" />
                  <line x1="-84" y1="40" x2="84" y2="40" />
                </g>

                {/* Clipped Rising & Settling Harmonic Waves */}
                <g clipPath={`url(#wavePortalClip_${uid})`}>
                  {/* Back harmonic wave */}
                  <g
                    style={{
                      transform: `translate(${(-waveHorizontalShift * 0.7).toFixed(1)}px, ${(waveYOffset + 6).toFixed(1)}px)`,
                      transition: 'transform 80ms linear',
                    }}
                  >
                    <path
                      d="M -240 0 Q -210 -12 -180 0 T -120 0 T -60 0 T 0 0 T 60 0 T 120 0 T 180 0 T 240 0 L 240 200 L -240 200 Z"
                      fill={`url(#waveFillBack_${uid})`}
                    />
                  </g>

                  {/* Front primary tide wave */}
                  <g
                    style={{
                      transform: `translate(${(waveHorizontalShift - 60).toFixed(1)}px, ${waveYOffset.toFixed(1)}px)`,
                      transition: 'transform 80ms linear',
                    }}
                  >
                    <path
                      d="M -240 0 Q -210 -14 -180 0 T -120 0 T -60 0 T 0 0 T 60 0 T 120 0 T 180 0 T 240 0 L 240 200 L -240 200 Z"
                      fill={`url(#waveFillFront_${uid})`}
                    />
                    <path
                      d="M -240 0 Q -210 -14 -180 0 T -120 0 T -60 0 T 0 0 T 60 0 T 120 0 T 180 0 T 240 0"
                      fill="none"
                      stroke="#ffffff"
                      strokeOpacity="0.65"
                      strokeWidth="1.5"
                    />
                  </g>
                </g>

                {/* Subtle cymatic ring matching breath depth */}
                <circle
                  cx="0"
                  cy="0"
                  r={46 + breathEased * 44}
                  fill="none"
                  stroke={phasePalette.accentHex}
                  strokeWidth="1"
                  strokeOpacity={0.2 + breathEased * 0.35}
                />
              </svg>
            </div>
          )}

          {/* Centered Interactive Readout & Tap-to-Toggle Trigger */}
          <button
            type="button"
            onClick={onToggleActive}
            title={
              isActive
                ? 'Click to pause breathwork'
                : isInitialState
                ? 'Click to start breathwork'
                : 'Click to resume breathwork'
            }
            aria-label={isActive ? 'Pause breathwork' : 'Start or resume breathwork'}
            className="absolute inset-6 rounded-full bg-transparent border-0 flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none group"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/65 backdrop-blur-md border border-slate-700/60 flex flex-col items-center justify-center px-2 shadow-lg transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-95">
              <span className={`text-[11px] uppercase tracking-[0.14em] font-bold flex items-center gap-1 ${phasePalette.textClass}`}>
                {!isActive && isInitialState ? (
                  <>
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Ready</span>
                  </>
                ) : !isActive ? (
                  <>
                    <Pause className="w-2.5 h-2.5" />
                    <span>Paused</span>
                  </>
                ) : (
                  <span>{currentPhase.name}</span>
                )}
              </span>

              <span className="text-3xl sm:text-4xl font-light text-slate-100 font-mono tabular-nums tracking-tight leading-none my-1">
                {secondsRemaining}
                <span className="text-base text-slate-400 ml-0.5">s</span>
              </span>

              <span className="text-[10px] text-slate-400 tracking-wide group-hover:text-sky-300 transition-colors">
                {!isActive && isInitialState
                  ? 'Tap to begin'
                  : !isActive
                  ? 'Tap to resume'
                  : `${currentPhase.duration}s phase`}
              </span>
            </div>
          </button>
        </div>

        {/* Phase Sequence Progress Strip */}
        <div className="mt-4 w-full max-w-md grid gap-2" style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))` }}>
          {phases.map((p, idx) => {
            const isCurrent = idx === phaseIndex;
            const isCompleted = isActive && idx < phaseIndex;
            const fillPct = isCurrent
              ? Math.round(phaseProgress * 100)
              : isCompleted
              ? 100
              : 0;
            return (
              <div
                key={`${p.name}-${idx}`}
                className={`px-2.5 py-2 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-slate-900/90 border-sky-400/50 text-slate-100'
                    : 'bg-slate-900/45 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className={`font-semibold truncate ${isCurrent ? 'text-slate-100' : 'text-slate-400'}`}>
                    {p.name}
                  </span>
                  <span className="font-mono tabular-nums text-[10px] text-slate-400 shrink-0">
                    {p.duration}s
                  </span>
                </div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${fillPct}%`,
                      backgroundColor: isCurrent ? phasePalette.accentHex : 'rgba(148, 163, 184, 0.45)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Phase Coaching Cue */}
        <div className="mt-4 text-center max-w-lg px-2 space-y-1">
          <p className="text-sm sm:text-base font-medium text-slate-100">
            {!isActive && isInitialState
              ? 'Find a comfortable posture and press Start when ready.'
              : !isActive
              ? 'Breathwork paused. Rest gently and resume when ready.'
              : currentPhase.cue}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {patternDesc}
          </p>
        </div>

        {/* Aligned Primary Action Controls */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 w-full max-w-xl">
          <button
            type="button"
            onClick={onToggleActive}
            className={`sm:min-w-[190px] min-h-[42px] px-6 py-2.5 rounded-xl font-semibold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                : 'bg-sky-500 hover:bg-sky-400 border border-transparent text-slate-950 font-bold shadow-sky-500/20'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4 shrink-0" /> : <Play className="w-4 h-4 fill-current shrink-0" />}
            <span>
              {isInitialState
                ? 'Start Breathwork'
                : isActive
                ? 'Pause Breathwork'
                : 'Resume Breathwork'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleAudioCue}
            aria-pressed={audioCueEnabled}
            title="Play warm Sanctuary Singing Bowls on inhale, hold, and exhale transitions"
            className={`min-h-[42px] px-4 py-2.5 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              audioCueEnabled
                ? 'bg-amber-500/15 border-amber-400/45 text-amber-200 hover:bg-amber-500/25'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {audioCueEnabled ? <Volume2 className="w-4 h-4 shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
            <span>{audioCueEnabled ? 'Sanctuary Bowls: On' : 'Sanctuary Bowls: Off'}</span>
          </button>

          <div className="min-h-[42px] px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 inline-flex items-center justify-center gap-2 whitespace-nowrap">
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>
              Cycles: <strong className="text-sky-300 font-mono tabular-nums">{completedCycles}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
