import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Check,
  Heart,
  Maximize2,
  Minimize2,
  Moon,
  Vibrate,
  VibrateOff,
  Flame,
  Award,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface Guided478OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteCycle?: (cycles: number) => void;
}

type PhaseType = 'inhale' | 'hold' | 'exhale';

interface PhaseDetail {
  type: PhaseType;
  name: string;
  duration: number; // in seconds
  actionPrompt: string;
  subPrompt: string;
  colorName: string;
  gradient: string;
  ringColor: string;
  glowColor: string;
  auraBg: string;
}

const PHASES: PhaseDetail[] = [
  {
    type: 'inhale',
    name: 'Inhale',
    duration: 4,
    actionPrompt: 'Inhale deeply and quietly through your nose',
    subPrompt: 'Expand lower abdomen and lungs smoothly',
    colorName: 'text-sky-300',
    gradient: 'from-sky-500/35 via-cyan-500/25 to-indigo-500/25',
    ringColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    auraBg: 'rgba(14, 165, 233, 0.16)',
  },
  {
    type: 'hold',
    name: 'Hold',
    duration: 7,
    actionPrompt: 'Hold your breath in serene stillness',
    subPrompt: 'Relax shoulders, jaw, and neck while oxygen circulates',
    colorName: 'text-amber-300',
    gradient: 'from-amber-500/35 via-orange-500/25 to-yellow-500/25',
    ringColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.55)',
    auraBg: 'rgba(245, 158, 11, 0.18)',
  },
  {
    type: 'exhale',
    name: 'Exhale',
    duration: 8,
    actionPrompt: 'Exhale completely through mouth with a gentle whoosh',
    subPrompt: 'Release all tension, letting your body sink down',
    colorName: 'text-indigo-300',
    gradient: 'from-indigo-500/35 via-violet-500/25 to-purple-500/25',
    ringColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.45)',
    auraBg: 'rgba(99, 102, 241, 0.16)',
  },
];

export const Guided478Overlay: React.FC<Guided478OverlayProps> = ({
  isOpen,
  onClose,
  onCompleteCycle,
}) => {
  // Session execution state
  const [isActive, setIsActive] = useState<boolean>(false);
  const [targetCycles, setTargetCycles] = useState<number>(4); // default: 4 cycles
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [elapsedInPhase, setElapsedInPhase] = useState<number>(0);
  const [totalSecondsBreathed, setTotalSecondsBreathed] = useState<number>(0);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);

  // Cue toggles
  const [audioCueEnabled, setAudioCueEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [visualPulse, setVisualPulse] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Check hardware vibration support
  const hasHardwareVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const currentPhase = PHASES[phaseIndex];
  const phaseProgress = Math.min(1, elapsedInPhase / currentPhase.duration);
  const secondsRemaining = Math.max(0, currentPhase.duration - elapsedInPhase);

  // Trigger haptic vibration with visual feedback fallback
  const triggerHaptic = useCallback(
    (pattern: number | number[]) => {
      if (!hapticEnabled) return;

      // Trigger visual pulse ring (works on all desktop & mobile browsers)
      setVisualPulse(true);
      setTimeout(() => setVisualPulse(false), 220);

      // Trigger Web Vibration API on supported mobile/tablet devices
      if (hasHardwareVibration) {
        try {
          navigator.vibrate(pattern);
        } catch {
          // ignore vibration errors
        }
      }
    },
    [hapticEnabled, hasHardwareVibration]
  );

  // Phase transition handler
  const advanceToNextPhase = useCallback(() => {
    const nextIdx = (phaseIndex + 1) % PHASES.length;
    const nextPhase = PHASES[nextIdx];

    // Audio Cue
    if (audioCueEnabled) {
      audioEngine.playBreathCue(nextPhase.type);
    }

    // Haptic Cue for phase entry
    if (nextPhase.type === 'inhale') {
      triggerHaptic([60, 40, 70]);
    } else if (nextPhase.type === 'hold') {
      triggerHaptic([90]);
    } else if (nextPhase.type === 'exhale') {
      triggerHaptic([130, 50, 60]);
    }

    // If wrapping back to Inhale, one full 4-7-8 cycle is complete
    if (nextIdx === 0) {
      setCurrentCycle((prevCycle) => {
        const completedCount = prevCycle;
        if (onCompleteCycle) onCompleteCycle(completedCount);

        // Check if session reached target cycle count
        if (targetCycles > 0 && completedCount >= targetCycles) {
          setIsActive(false);
          setIsSessionComplete(true);
          // Play celebration Tibetan Bowl strike
          audioEngine.strikeTibetanBowl();
          triggerHaptic([120, 80, 140, 80, 220]);
          return completedCount;
        }
        // Advance to next cycle
        return prevCycle + 1;
      });
    }

    setPhaseIndex(nextIdx);
    setElapsedInPhase(0);
  }, [phaseIndex, audioCueEnabled, targetCycles, onCompleteCycle, triggerHaptic]);

  // Main high-precision animation and timing loop
  const lastTickRef = useRef<number>(performance.now());
  useEffect(() => {
    if (!isOpen || !isActive || isSessionComplete) return;

    lastTickRef.current = performance.now();
    const intervalMs = 30; // 33 FPS timer for buttery smooth SVG ring and orb expansion

    const timer = setInterval(() => {
      const now = performance.now();
      const deltaSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setTotalSecondsBreathed((t) => t + deltaSec);

      setElapsedInPhase((prev) => {
        const next = prev + deltaSec;

        // Sub-haptic pulses during the 7-second hold at seconds 3 and 5 to guide eyes-closed meditators
        if (currentPhase.type === 'hold') {
          if (prev < 3.0 && next >= 3.0) {
            triggerHaptic([35]);
          } else if (prev < 5.0 && next >= 5.0) {
            triggerHaptic([35]);
          } else if (prev < 6.2 && next >= 6.2) {
            triggerHaptic([45]); // gentle warning that exhale is 0.8s away
          }
        }

        if (next >= currentPhase.duration) {
          advanceToNextPhase();
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isActive, isSessionComplete, currentPhase, advanceToNextPhase, triggerHaptic]);

  // Keyboard shortcut listener (Space to play/pause, Esc to exit)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isSessionComplete) {
          handleRestartSession();
        } else {
          setIsActive((prev) => !prev);
        }
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSessionComplete, onClose]);

  // Fullscreen toggle handler
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // ignore fullscreen permissions errors
    }
  };

  const handleRestartSession = () => {
    setPhaseIndex(0);
    setElapsedInPhase(0);
    setCurrentCycle(1);
    setIsSessionComplete(false);
    setIsActive(true);
    triggerHaptic([60, 40, 70]);
    if (audioCueEnabled) {
      audioEngine.playBreathCue('inhale');
    }
  };

  const handleStartSession = () => {
    setIsActive(true);
    triggerHaptic([60, 40, 70]);
    if (audioCueEnabled) {
      audioEngine.playBreathCue('inhale');
    }
  };

  if (!isOpen) return null;

  // Calculate dynamic scale of central orb:
  // Inhale: 0.82 -> 1.34
  // Hold: 1.34 with subtle gentle breath harmonic wave
  // Exhale: 1.34 -> 0.82
  let orbScale = 1.0;
  if (!isActive && elapsedInPhase === 0) {
    orbScale = 0.94;
  } else if (currentPhase.type === 'inhale') {
    orbScale = 0.82 + phaseProgress * 0.52;
  } else if (currentPhase.type === 'hold') {
    const microPulse = Math.sin(elapsedInPhase * 2.2) * 0.02;
    orbScale = 1.34 + microPulse;
  } else if (currentPhase.type === 'exhale') {
    orbScale = 1.34 - phaseProgress * 0.52;
  }

  // Circular progress ring calculation
  const ringRadius = 124;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference - phaseProgress * circumference;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guided 4-7-8 Breathing Session"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 backdrop-blur-2xl text-slate-100 select-none overflow-hidden animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Background Biofield Resonant Aura Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${currentPhase.auraBg} 0%, rgba(2, 6, 23, 0.95) 75%)`,
        }}
      />

      {/* Floating Calming Background Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* TOP STATUS & NAVIGATION BAR */}
      <header className="relative z-20 w-full max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        {/* Left: Session Title Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300 shadow-md">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-wide">
                4-7-8 Relax & Sleep Protocol
              </h2>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30 font-medium">
                Mindful Stillness
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Dr. Andrew Weil 4-7-8 Rhythmic Breathing Method
            </p>
          </div>
        </div>

        {/* Right: Quick Settings & Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Target Cycles Selector Pill */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-[11px]">
            <span className="text-slate-400 px-1 text-[10px] uppercase font-semibold">Cycles:</span>
            {[4, 8, 0].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setTargetCycles(c)}
                className={`min-w-[26px] h-[26px] px-1.5 rounded-lg border font-medium inline-flex items-center justify-center transition-all cursor-pointer ${
                  targetCycles === c
                    ? 'bg-sky-500/30 text-sky-200 border-sky-400/50'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
                title={c === 0 ? 'Continuous Endless Cycles' : `${c} Guided Cycles`}
              >
                {c === 0 ? '∞' : c}
              </button>
            ))}
          </div>

          {/* Sanctuary Bowls Audio Cue Toggle */}
          <button
            type="button"
            onClick={() => setAudioCueEnabled(!audioCueEnabled)}
            className={`w-9 h-9 rounded-xl border inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              audioCueEnabled
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={audioCueEnabled ? 'Sanctuary Bowls Sound: Active' : 'Sanctuary Bowls Sound: Muted'}
            aria-label="Toggle sanctuary bowls sound"
          >
            {audioCueEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Haptic Cue Toggle */}
          <button
            type="button"
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`w-9 h-9 rounded-xl border inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              hapticEnabled
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={
              hapticEnabled
                ? hasHardwareVibration
                  ? 'Haptic Cues: Vibration Active'
                  : 'Haptic Cues: Tactile Visual Pulse Active'
                : 'Haptic Cues: Off'
            }
            aria-label="Toggle haptic vibration cue"
          >
            {hapticEnabled ? <Vibrate className="w-4 h-4" /> : <VibrateOff className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Overlay Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Exit Session (Esc)"
            aria-label="Close guided session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CENTER IMMERSIVE BREATHING SANCTUARY */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-2">
        {/* Cycle Progress Tracker Badge */}
        <div className="mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-xl">
          <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">
            {targetCycles > 0 ? (
              <>
                Cycle <strong className="text-white font-mono">{currentCycle}</strong> of{' '}
                <strong className="text-sky-300 font-mono">{targetCycles}</strong>
              </>
            ) : (
              <>
                Continuous Flow • Cycle <strong className="text-sky-300 font-mono">{currentCycle}</strong>
              </>
            )}
          </span>
        </div>

        {/* Central Breathing Orb & SVG Ring Container */}
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
          {/* Subtle Outer Tactile/Haptic Visual Pulse Ring */}
          {visualPulse && (
            <div
              className="absolute inset-0 rounded-full border-2 animate-ping pointer-events-none opacity-80"
              style={{ borderColor: currentPhase.ringColor }}
            />
          )}

          {/* SVG Progress Perimeter Arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            {/* Background Track */}
            <circle
              cx="50%"
              cy="50%"
              r={ringRadius}
              fill="none"
              stroke="rgba(30, 41, 59, 0.6)"
              strokeWidth="4"
            />
            {/* Active Flowing Progress Arc */}
            <circle
              cx="50%"
              cy="50%"
              r={ringRadius}
              fill="none"
              stroke={currentPhase.ringColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 60ms linear, stroke 400ms ease',
                filter: `drop-shadow(0 0 10px ${currentPhase.glowColor})`,
              }}
            />
          </svg>

          {/* Interactive Breathing Core Button */}
          <button
            type="button"
            onClick={() => {
              if (isSessionComplete) {
                handleRestartSession();
              } else if (!isActive) {
                handleStartSession();
              } else {
                setIsActive(false);
                triggerHaptic([40]);
              }
            }}
            className={`relative rounded-full flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ease-out backdrop-blur-xl border cursor-pointer group shadow-2xl focus:outline-none ${
              currentPhase.gradient
            }`}
            style={{
              width: '210px',
              height: '210px',
              transform: `scale(${orbScale})`,
              borderColor: currentPhase.ringColor,
              boxShadow: `0 0 45px ${currentPhase.glowColor}`,
            }}
            title={
              !isActive
                ? 'Click or press Space to Start'
                : 'Click or press Space to Pause'
            }
            aria-label={
              !isActive
                ? 'Start 4-7-8 breathing session'
                : 'Pause 4-7-8 breathing session'
            }
          >
            {/* Phase Badge */}
            <span className="text-xs uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5">
              {!isActive && elapsedInPhase === 0 ? (
                <span className="text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Ready
                </span>
              ) : !isActive ? (
                <span className="text-amber-300 flex items-center gap-1">
                  <Pause className="w-3 h-3" /> Paused
                </span>
              ) : (
                <span className={currentPhase.colorName}>{currentPhase.name}</span>
              )}
            </span>

            {/* Huge Seconds Remaining Digits */}
            <span className="text-5xl sm:text-6xl font-extralight text-white font-mono tracking-tight my-1 drop-shadow-lg">
              {secondsRemaining.toFixed(1)}
              <span className="text-base font-light opacity-60 ml-0.5">s</span>
            </span>

            {/* Tap Action Helper */}
            <span className="text-[10px] text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">
              {!isActive && elapsedInPhase === 0
                ? 'Tap to Begin'
                : !isActive
                ? 'Tap to Resume'
                : `${currentPhase.duration}s target`}
            </span>
          </button>
        </div>

        {/* Phase Coaching Action Prompt */}
        <div className="mt-8 text-center max-w-lg px-4">
          <p
            className={`text-base sm:text-lg font-medium tracking-wide transition-colors duration-300 ${currentPhase.colorName}`}
          >
            {!isActive && elapsedInPhase === 0
              ? 'Find a quiet posture, softly rest your tongue on the roof of your mouth, and tap Begin.'
              : !isActive
              ? 'Session paused. Rest in gentle breath and tap Resume when ready.'
              : currentPhase.actionPrompt}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-light">
            {!isActive ? 'Spacebar to toggle • Esc to close' : currentPhase.subPrompt}
          </p>
        </div>

        {/* 4-7-8 Step Visual Pills (Shows current active step) */}
        <div className="mt-6 flex items-center gap-2">
          {PHASES.map((p, idx) => {
            const isCur = idx === phaseIndex;
            return (
              <div
                key={p.type}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                  isCur
                    ? 'bg-slate-800 text-white border border-sky-400/60 shadow-md font-semibold'
                    : 'bg-slate-900/60 text-slate-500 border border-slate-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isCur ? p.ringColor : '#475569' }}
                />
                <span>{p.name} ({p.duration}s)</span>
              </div>
            );
          })}
        </div>
      </main>

      {/* BOTTOM CONTROLS & VAGAL RECOVERY METRICS DOCK */}
      <footer className="relative z-20 w-full max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        {/* Left: Vagus Nerve Recovery Metric */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>
              Time: <strong className="text-slate-200 font-mono">{Math.floor(totalSecondsBreathed / 60)}m {Math.floor(totalSecondsBreathed % 60)}s</strong>
            </span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Vagus Stimulation:</span>
            <span className="text-emerald-300 font-medium">Parasympathetic Active</span>
          </div>
        </div>

        {/* Right: Primary Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              setPhaseIndex(0);
              setElapsedInPhase(0);
              setCurrentCycle(1);
              setIsActive(false);
              triggerHaptic([40]);
            }}
            className="min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Reset to beginning of session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isSessionComplete) {
                handleRestartSession();
              } else if (!isActive) {
                handleStartSession();
              } else {
                setIsActive(false);
                triggerHaptic([40]);
              }
            }}
            className={`flex-1 sm:flex-initial min-h-[38px] px-6 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all shadow-lg active:scale-95 cursor-pointer ${
              isActive
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                : 'bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 border-transparent text-slate-950 font-bold shadow-sky-500/25 ring-2 ring-sky-400/40 animate-pulse'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>
              {!isActive && elapsedInPhase === 0
                ? 'Begin Guided Session'
                : !isActive
                ? 'Resume Breathing'
                : 'Pause'}
            </span>
          </button>
        </div>
      </footer>

      {/* SESSION COMPLETE CELEBRATION MODAL OVERLAY */}
      {isSessionComplete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <div className="max-w-md w-full bg-slate-900/95 border border-sky-400/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-300 shadow-xl shadow-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                4-7-8 Session Complete
              </h3>
              <p className="text-xs text-sky-300 mt-1">
                Deep Meditative Stillness Achieved
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 my-4">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Completed</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">{targetCycles} Cycles</div>
                <div className="text-[9px] text-slate-500">Full 4-7-8 Protocol</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Mindful Rhythm</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">Calmed</div>
                <div className="text-[9px] text-slate-500">Relaxed Presence</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Your body and mind have settled into a tranquil state of calm presence. The gentle rhythm of extended exhalations promotes serene stillness, preparing you for restful sleep or peaceful meditation.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleRestartSession}
                className="w-full sm:w-1/2 min-h-[38px] py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repeat Session</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 min-h-[38px] py-2 px-4 rounded-xl border border-transparent bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 text-xs font-bold inline-flex items-center justify-center whitespace-nowrap transition-all shadow-md shadow-sky-500/25 cursor-pointer"
              >
                <span>Return to Sanctuary</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
