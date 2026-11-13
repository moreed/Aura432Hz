import React, { useState, useEffect } from 'react';
import { Wind, Sparkles } from 'lucide-react';

export type BreathingPattern = '4-7-8' | 'box' | 'coherent';

interface BreathingOrbProps {
  className?: string;
  initialPattern?: BreathingPattern;
}

interface PatternConfig {
  name: string;
  desc: string;
  phases: Array<{ name: string; duration: number; action: 'inhale' | 'hold' | 'exhale' | 'hold-empty'; instruction: string }>;
}

const PATTERNS: Record<BreathingPattern, PatternConfig> = {
  '4-7-8': {
    name: '4-7-8 Relaxing Breath',
    desc: 'Diaphragmatic calming cycle to ease anxiety & invoke tranquility',
    phases: [
      { name: 'Inhale', duration: 4, action: 'inhale', instruction: 'Breathe in quietly through your nose' },
      { name: 'Hold', duration: 7, action: 'hold', instruction: 'Hold gently in tranquil stillness' },
      { name: 'Exhale', duration: 8, action: 'exhale', instruction: 'Exhale smoothly and let go completely' },
    ],
  },
  box: {
    name: 'Box Breathing (4-4-4-4)',
    desc: 'Centering equal ratio for focus, emotional balance & clarity',
    phases: [
      { name: 'Inhale', duration: 4, action: 'inhale', instruction: 'Breathe in evenly' },
      { name: 'Hold', duration: 4, action: 'hold', instruction: 'Retain calmly with relaxed shoulders' },
      { name: 'Exhale', duration: 4, action: 'exhale', instruction: 'Release all breath slowly' },
      { name: 'Rest', duration: 4, action: 'hold-empty', instruction: 'Rest in pure peaceful void' },
    ],
  },
  coherent: {
    name: 'Coherent Resonance (5.5s)',
    desc: 'Heart-rate variability (HRV) resonance at 5.5 breaths per minute',
    phases: [
      { name: 'Inhale', duration: 5.5, action: 'inhale', instruction: 'Slow expansive breath in' },
      { name: 'Exhale', duration: 5.5, action: 'exhale', instruction: 'Gentle continuous exhale out' },
    ],
  },
};

/**
 * Pure Visual Guided Breathing Orb
 * STRICTLY ZERO AUDIO / ZERO SOUND / NO AUDIO CONTEXT
 * Provides soothing animated visual breath pacing with real-time countdown
 */
export const BreathingOrb: React.FC<BreathingOrbProps> = ({
  className = '',
  initialPattern = '4-7-8',
}) => {
  const [patternKey, setPatternKey] = useState<BreathingPattern>(initialPattern);
  const pattern = PATTERNS[patternKey];

  const [currentPhaseIdx, setCurrentPhaseIdx] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(pattern.phases[0].duration);
  const [cycleCount, setCycleCount] = useState<number>(1);

  // Reset phase when pattern changes
  useEffect(() => {
    setCurrentPhaseIdx(0);
    setSecondsRemaining(pattern.phases[0].duration);
  }, [patternKey, pattern.phases]);

  // Timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 0.1) {
          // Transition to next phase
          setCurrentPhaseIdx((prevIdx) => {
            const nextIdx = (prevIdx + 1) % pattern.phases.length;
            if (nextIdx === 0) {
              setCycleCount((c) => c + 1);
            }
            return nextIdx;
          });
          const nextIdx = (currentPhaseIdx + 1) % pattern.phases.length;
          return pattern.phases[nextIdx].duration;
        }
        return Math.max(0, +(prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentPhaseIdx, pattern.phases]);

  const currentPhase = pattern.phases[currentPhaseIdx];
  const totalPhaseDuration = currentPhase.duration;
  const progressRatio = Math.max(0, Math.min(1, 1 - secondsRemaining / totalPhaseDuration));

  // Determine visual orb scale based on breathing action
  let targetScale = 1.0;
  if (currentPhase.action === 'inhale') {
    // Expands smoothly from 0.75 to 1.35
    targetScale = 0.75 + progressRatio * 0.6;
  } else if (currentPhase.action === 'hold') {
    // Stays fully expanded with gentle floating pulse
    targetScale = 1.35;
  } else if (currentPhase.action === 'exhale') {
    // Contracts smoothly from 1.35 down to 0.75
    targetScale = 1.35 - progressRatio * 0.6;
  } else {
    // hold-empty rest
    targetScale = 0.75;
  }

  // Phase color theme
  const getPhaseTheme = () => {
    switch (currentPhase.action) {
      case 'inhale':
        return {
          glow: 'from-amber-400/40 via-emerald-400/20 to-transparent',
          border: 'border-amber-400/60',
          text: 'text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'hold':
        return {
          glow: 'from-emerald-400/40 via-sky-400/20 to-transparent',
          border: 'border-emerald-400/60',
          text: 'text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'exhale':
        return {
          glow: 'from-sky-400/40 via-indigo-500/20 to-transparent',
          border: 'border-sky-400/60',
          text: 'text-sky-300',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      default:
        return {
          glow: 'from-indigo-400/30 via-slate-600/20 to-transparent',
          border: 'border-indigo-400/50',
          text: 'text-indigo-300',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        };
    }
  };

  const theme = getPhaseTheme();

  return (
    <div className={`p-6 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-2xl backdrop-blur-md flex flex-col items-center justify-between ${className}`}>
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Guided Breathwork</h4>
            <p className="text-[10px] text-slate-400">Pure Visual Relaxation · Cycle #{cycleCount}</p>
          </div>
        </div>

        {/* Pattern switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-xl text-[11px]">
          {(['4-7-8', 'box', 'coherent'] as BreathingPattern[]).map((pKey) => (
            <button
              key={pKey}
              type="button"
              onClick={() => setPatternKey(pKey)}
              className={`min-h-[26px] px-2 py-0.5 rounded-lg border transition-colors font-mono inline-flex items-center justify-center cursor-pointer ${
                patternKey === pKey
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {pKey === '4-7-8' ? '4-7-8' : pKey === 'box' ? 'Box' : 'HRV'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Breathing Orb Canvas / CSS Pulse */}
      <div className="relative w-56 h-56 flex items-center justify-center my-4">
        {/* Outer ambient glow rings */}
        <div
          className={`absolute rounded-full transition-all duration-300 ease-out bg-gradient-radial ${theme.glow}`}
          style={{
            width: `${170 * targetScale}px`,
            height: `${170 * targetScale}px`,
            filter: 'blur(16px)',
          }}
        />

        {/* Mid pulsing aura ring */}
        <div
          className={`absolute rounded-full border border-dashed transition-all duration-300 ease-out ${theme.border}`}
          style={{
            width: `${135 * targetScale}px`,
            height: `${135 * targetScale}px`,
            opacity: 0.8,
          }}
        />

        {/* Core Glowing Orb */}
        <div
          className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/80 border-2 border-amber-400/50 shadow-2xl flex flex-col items-center justify-center text-center transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${targetScale})`,
          }}
        >
          <span className={`text-base font-bold tracking-wider uppercase ${theme.text}`}>
            {currentPhase.name}
          </span>
          <span className="text-xl font-mono font-extrabold text-white">
            {Math.ceil(secondsRemaining)}s
          </span>
          <Sparkles className="w-3 h-3 text-amber-400/60 mt-0.5 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      {/* Bottom Phase Guidance */}
      <div className="text-center space-y-1.5 w-full mt-2">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${theme.badge}`}>
          {currentPhase.instruction}
        </div>
        <p className="text-[11px] text-slate-400 italic">
          {pattern.desc}
        </p>
      </div>
    </div>
  );
};
