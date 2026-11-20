import { audioEngine, type SanctuaryBowlTone } from './audioEngine';

export type BreathPatternId = 'relax_478' | 'box_4444' | 'coherence_55' | 'refresh_426';

export type BreathPhaseType = 'inhale' | 'hold' | 'exhale';

export interface BreathPhaseDefinition {
  name: string;
  duration: number;
  cue: string;
  type: BreathPhaseType;
}

export interface BreathPatternDefinition {
  id: BreathPatternId;
  name: string;
  shortLabel: string;
  tagline: string;
  desc: string;
  phases: BreathPhaseDefinition[];
}

export const BREATH_SYNC_PATTERNS: BreathPatternDefinition[] = [
  {
    id: 'relax_478',
    name: '4-7-8 Relax & Sleep',
    shortLabel: '4-7-8',
    tagline: 'Deep Relaxation & Bedtime Calm',
    desc: 'Dr. Andrew Weil’s classic rhythmic breathing technique to cultivate serene mindfulness and quiet evening stillness.',
    phases: [
      { name: 'Inhale', duration: 4, cue: 'Breathe in quietly through the nose', type: 'inhale' },
      { name: 'Hold', duration: 7, cue: 'Hold breath gently with soft shoulders', type: 'hold' },
      { name: 'Exhale', duration: 8, cue: 'Exhale smoothly with a soft whoosh sound', type: 'exhale' },
    ],
  },
  {
    id: 'box_4444',
    name: 'Box Breathing (4-4-4-4)',
    shortLabel: '4-4-4-4',
    tagline: 'Focus, Clarity & Mindful Balance',
    desc: 'Used by mindfulness practitioners to find grounded clarity, mental focus, and steady calm during busy days.',
    phases: [
      { name: 'Inhale', duration: 4, cue: 'Inhale slowly expanding the belly', type: 'inhale' },
      { name: 'Hold', duration: 4, cue: 'Pause in calm stillness', type: 'hold' },
      { name: 'Exhale', duration: 4, cue: 'Release air smoothly and completely', type: 'exhale' },
      { name: 'Hold (Empty)', duration: 4, cue: 'Rest peacefully before the next breath', type: 'hold' },
    ],
  },
  {
    id: 'coherence_55',
    name: '5.5s Coherence Breath',
    shortLabel: '5.5s',
    tagline: 'Peaceful Resonance & Presence',
    desc: 'Slow continuous breathing at ~5.5 breaths per minute to harmonize breath rhythm with 432Hz acoustic ambiance.',
    phases: [
      { name: 'Inhale', duration: 5.5, cue: 'Slow, gentle continuous inhalation', type: 'inhale' },
      { name: 'Exhale', duration: 5.5, cue: 'Soft, effortless unhurried exhalation', type: 'exhale' },
    ],
  },
  {
    id: 'refresh_426',
    name: '4-2-6 Refresh & Ground',
    shortLabel: '4-2-6',
    tagline: 'Gentle Everyday Relaxation',
    desc: 'A gentle extended-exhale rhythm ideal for unwinding afternoon tension or starting your meditation session.',
    phases: [
      { name: 'Inhale', duration: 4, cue: 'Breathe in fresh calm energy', type: 'inhale' },
      { name: 'Hold', duration: 2, cue: 'Soft momentary pause', type: 'hold' },
      { name: 'Exhale', duration: 6, cue: 'Lengthen the exhale, melt away tension', type: 'exhale' },
    ],
  },
];

export interface BreathSyncState {
  patternId: BreathPatternId;
  pattern: BreathPatternDefinition;
  isActive: boolean;
  phaseIndex: number;
  phaseElapsed: number;
  completedCycles: number;
  audioCueEnabled: boolean;
  sanctuaryBowlTone: SanctuaryBowlTone;
}

export interface BreathVisualSnapshot {
  /** True when guided Breathwork timer is actively running */
  isSynced: boolean;
  /** Smooth 0..1 cosine-eased diaphragmatic expansion (0 = empty, 1 = full) */
  breathEased: number;
  /** Current respiratory phase */
  phaseType: BreathPhaseType;
  /** Human-readable phase label */
  phaseLabel: string;
  /** Active pattern display name */
  patternName: string;
  /** Compact ratio label (e.g. "4-7-8" or "5.5s") */
  patternShort: string;
  /** Progress through current phase (0..1) */
  phaseProgress: number;
  /** Seconds remaining in current phase */
  secondsRemaining: number;
  /** Soft 0..1 suspension shimmer during Hold phases */
  holdStillness: number;
  /** True if currently in an empty-lung hold */
  isHoldEmpty: boolean;
}

type StateListener = (state: BreathSyncState) => void;
type CycleCompleteListener = (patternId: BreathPatternId, completedCycles: number) => void;

function readStoredBowlTone(): SanctuaryBowlTone {
  try {
    const saved = localStorage.getItem('aura_breath_bowl_tone');
    if (saved === 'warm_tibetan' || saved === 'deep_monastery' || saved === 'crystal_temple') {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'warm_tibetan';
}

function getPatternById(id: BreathPatternId): BreathPatternDefinition {
  return BREATH_SYNC_PATTERNS.find((p) => p.id === id) || BREATH_SYNC_PATTERNS[0];
}

/**
 * Shared Breath Sync Engine
 *
 * Keeps the active Breathwork session running cleanly across tabs (Sanctuary Player,
 * Breathwork tab, and Fullscreen Ambient Mode) and provides a zero-overhead 60fps
 * visual state reader so Starry Buddha and cosmic visualizers breathe in lockstep
 * with live Breathwork or smoothly fall back to a tranquil ~11-second rhythm.
 */
class BreathSyncEngine {
  private patternId: BreathPatternId = 'relax_478';
  private isActive = false;
  private phaseIndex = 0;
  private phaseElapsed = 0;
  private completedCycles = 0;
  private audioCueEnabled = true;
  private sanctuaryBowlTone: SanctuaryBowlTone = readStoredBowlTone();

  private timerId: number | null = null;
  private lastTickPerf = 0;
  private stateListeners = new Set<StateListener>();
  private cycleListeners = new Set<CycleCompleteListener>();

  public getState(): BreathSyncState {
    return {
      patternId: this.patternId,
      pattern: getPatternById(this.patternId),
      isActive: this.isActive,
      phaseIndex: this.phaseIndex,
      phaseElapsed: this.phaseElapsed,
      completedCycles: this.completedCycles,
      audioCueEnabled: this.audioCueEnabled,
      sanctuaryBowlTone: this.sanctuaryBowlTone,
    };
  }

  public subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public subscribeCycleComplete(listener: CycleCompleteListener): () => void {
    this.cycleListeners.add(listener);
    return () => {
      this.cycleListeners.delete(listener);
    };
  }

  private emit(): void {
    const snapshot = this.getState();
    this.stateListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch {
        // Isolate subscriber errors
      }
    });
  }

  private startLoop(): void {
    if (this.timerId !== null || typeof window === 'undefined') return;
    this.lastTickPerf = performance.now();
    this.timerId = window.setInterval(() => {
      if (!this.isActive) return;
      const now = performance.now();
      const deltaSec = Math.min(Math.max(0, (now - this.lastTickPerf) / 1000), 0.25);
      this.lastTickPerf = now;

      const pattern = getPatternById(this.patternId);
      const currentPhase = pattern.phases[this.phaseIndex] || pattern.phases[0];
      const nextElapsed = this.phaseElapsed + deltaSec;

      if (nextElapsed >= currentPhase.duration) {
        const nextIndex = (this.phaseIndex + 1) % pattern.phases.length;
        this.phaseIndex = nextIndex;
        this.phaseElapsed = 0;

        if (nextIndex === 0) {
          this.completedCycles += 1;
          this.cycleListeners.forEach((cb) => {
            try {
              cb(this.patternId, this.completedCycles);
            } catch {
              // Isolate listener errors
            }
          });
        }

        if (this.audioCueEnabled) {
          const nextPhaseType = pattern.phases[nextIndex].type;
          audioEngine.playBreathCue(nextPhaseType, this.sanctuaryBowlTone);
        }
      } else {
        this.phaseElapsed = nextElapsed;
      }

      this.emit();
    }, 30);
  }

  private stopLoop(): void {
    if (this.timerId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public setActive(active: boolean, playCueOnStart = true): void {
    if (this.isActive === active) return;
    this.isActive = active;
    if (active) {
      this.lastTickPerf = performance.now();
      this.startLoop();
      if (playCueOnStart && this.audioCueEnabled) {
        const pattern = getPatternById(this.patternId);
        const currentPhase = pattern.phases[this.phaseIndex] || pattern.phases[0];
        audioEngine.playBreathCue(currentPhase.type, this.sanctuaryBowlTone);
      }
    } else {
      this.stopLoop();
    }
    this.emit();
  }

  public toggleActive(): void {
    this.setActive(!this.isActive, true);
  }

  public setPattern(patternId: BreathPatternId, options?: { keepActive?: boolean }): void {
    const patternChanged = this.patternId !== patternId;
    this.patternId = patternId;
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    if (!options?.keepActive) {
      this.isActive = false;
      this.stopLoop();
    } else if (this.isActive) {
      this.lastTickPerf = performance.now();
    }
    if (patternChanged || this.phaseElapsed === 0) {
      this.emit();
    }
  }

  public reset(): void {
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    this.completedCycles = 0;
    this.isActive = false;
    this.stopLoop();
    this.emit();
  }

  public recordExternalCycle(): void {
    this.completedCycles += 1;
    this.emit();
  }

  public setAudioCueEnabled(enabled: boolean, previewOnEnable = false): void {
    this.audioCueEnabled = enabled;
    if (enabled && previewOnEnable) {
      const pattern = getPatternById(this.patternId);
      const currentPhase = pattern.phases[this.phaseIndex] || pattern.phases[0];
      audioEngine.playBreathCue(currentPhase.type, this.sanctuaryBowlTone);
    }
    this.emit();
  }

  public toggleAudioCue(): void {
    this.setAudioCueEnabled(!this.audioCueEnabled, true);
  }

  public setSanctuaryBowlTone(tone: SanctuaryBowlTone, preview = true): void {
    this.sanctuaryBowlTone = tone;
    try {
      localStorage.setItem('aura_breath_bowl_tone', tone);
    } catch {
      // Ignore storage access errors
    }
    if (!this.audioCueEnabled) {
      this.audioCueEnabled = true;
    }
    if (preview) {
      const pattern = getPatternById(this.patternId);
      const currentPhase = pattern.phases[this.phaseIndex] || pattern.phases[0];
      audioEngine.playBreathCue(currentPhase.type, tone);
    }
    this.emit();
  }

  public previewCurrentBowl(): void {
    const pattern = getPatternById(this.patternId);
    const currentPhase = pattern.phases[this.phaseIndex] || pattern.phases[0];
    audioEngine.playBreathCue(currentPhase.type, this.sanctuaryBowlTone);
  }

  /**
   * High-precision real-time breath state for 60fps canvas rendering.
   * When Breathwork is active, extrapolates sub-frame elapsed time smoothly between 30ms ticks.
   * When idle/paused, returns a serene slow fallback respiration wave (~11s full cycle / 5.5s inhale & 5.5s exhale).
   */
  public getVisualState(now = performance.now(), flowSpeed = 1.0): BreathVisualSnapshot {
    const pattern = getPatternById(this.patternId);

    if (this.isActive) {
      const currentPhase = pattern.phases[this.phaseIndex] || pattern.phases[0];
      const subFrameDelta = Math.min(Math.max(0, (now - this.lastTickPerf) / 1000), 0.12);
      const liveElapsed = Math.min(currentPhase.duration, this.phaseElapsed + subFrameDelta);
      const progress = Math.min(1, Math.max(0, liveElapsed / Math.max(0.1, currentPhase.duration)));
      const secondsRemaining = Math.max(0, currentPhase.duration - liveElapsed);
      const isHoldEmpty =
        currentPhase.type === 'hold' && currentPhase.name.toLowerCase().includes('empty');

      let breathEased = 0.5;
      let holdStillness = 0;

      if (currentPhase.type === 'inhale') {
        breathEased = 0.5 - 0.5 * Math.cos(Math.PI * progress);
      } else if (currentPhase.type === 'hold') {
        breathEased = isHoldEmpty ? 0.05 : 1.0;
        holdStillness = 0.55 + 0.45 * Math.sin(progress * Math.PI);
      } else {
        breathEased = 0.5 + 0.5 * Math.cos(Math.PI * progress);
      }

      return {
        isSynced: true,
        breathEased,
        phaseType: currentPhase.type,
        phaseLabel: currentPhase.name,
        patternName: pattern.name,
        patternShort: pattern.shortLabel,
        phaseProgress: progress,
        secondsRemaining,
        holdStillness,
        isHoldEmpty,
      };
    }

    // Tranquil slow fallback breath: 11.0-second coherence cycle (5.5s inhale + 5.5s exhale)
    const cycleSec = 11.0 / Math.max(0.5, Math.min(1.5, flowSpeed));
    const halfSec = cycleSec * 0.5;
    const cyclePos = ((now / 1000) % cycleSec + cycleSec) % cycleSec;
    const isInhale = cyclePos < halfSec;
    const phaseProgress = isInhale ? cyclePos / halfSec : (cyclePos - halfSec) / halfSec;
    const breathEased = isInhale
      ? 0.5 - 0.5 * Math.cos(Math.PI * phaseProgress)
      : 0.5 + 0.5 * Math.cos(Math.PI * phaseProgress);

    return {
      isSynced: false,
      breathEased,
      phaseType: isInhale ? 'inhale' : 'exhale',
      phaseLabel: isInhale ? 'Inhale' : 'Exhale',
      patternName: '5.5s Slow Breath',
      patternShort: '5.5s',
      phaseProgress,
      secondsRemaining: Math.max(0, halfSec - (isInhale ? cyclePos : cyclePos - halfSec)),
      holdStillness: 0,
      isHoldEmpty: false,
    };
  }
}

export const breathSyncEngine = new BreathSyncEngine();
