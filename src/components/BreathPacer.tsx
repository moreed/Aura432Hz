import React, { useState, useEffect, useRef } from 'react';
import {
  Wind,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  Shield,
  ChevronRight,
  Dices,
  Shuffle,
  Music,
  Headphones,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Waves,
  Radio,
  Activity,
  Zap,
  Sliders,
  Gauge,
  Info,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { Guided478Overlay } from './Guided478Overlay';
import { BUILT_IN_MIX_PRESETS, MixPreset } from '../services/storage';
import { BreathVisualizerCanvas, BreathAnimationStyle } from './BreathVisualizerCanvas';

export type BreathPattern = 'relax_478' | 'box_4444' | 'coherence_55' | 'refresh_426';

export interface BreathworkPresetRecommendation {
  presetId: string;
  rationale: string;
  pairFocus: string;
}

export const SUITABLE_PRESETS_BY_PATTERN: Record<BreathPattern, BreathworkPresetRecommendation[]> = {
  relax_478: [
    {
      presetId: 'midnight_slumber',
      pairFocus: 'Vagal Down-Regulation & Delta Sleep',
      rationale:
        'Slow Delta 3.5Hz entrainment synchronizes with the extended 8-second exhalation to trigger the autonomic vagal brake, reducing heart rate and melting bedtime anxiety.',
    },
    {
      presetId: 'delta_rain_sanctuary',
      pairFocus: 'Hypnagogic Drift & Rain Acoustics',
      rationale:
        'Continuous gentle canopy rain frequencies soothe cognitive chatter, allowing full mental release during the challenging 7-second breath retention phase.',
    },
    {
      presetId: 'sleep_174_somatic',
      pairFocus: '174Hz Somatic Diaphragm Release',
      rationale:
        '174Hz natural bio-harmonic foundation with rolling oceanic swells physically eases muscular tension around the ribcage and solar plexus.',
    },
    {
      presetId: 'starlight_lullaby',
      pairFocus: 'Acoustic Koshi Chimes & Harp Harmonics',
      rationale:
        'Delicate tuned bamboo chimes and harp harmonics offer an ethereal auditory anchor that facilitates deep parasympathetic surrender.',
    },
    {
      presetId: 'sleep_285_tissue',
      pairFocus: '285Hz Somatic Night Sanctuary',
      rationale:
        '285Hz harmonic soundscape with warm acoustic cello resonance promotes restorative tissue calm and evening parasympathetic restoration.',
    },
  ],
  box_4444: [
    {
      presetId: 'zen_sanctuary',
      pairFocus: 'Tactical Focus & Steady Equanimity',
      rationale:
        'Equalized 4-4-4-4 rhythm combines with resonant temple bells and stream acoustics to anchor calm, razor-sharp cognitive presence.',
    },
    {
      presetId: 'transcendental_theta',
      pairFocus: 'Theta 6.0Hz Cortisol Stabilization',
      rationale:
        'Low-frequency Theta wave entrainment counteracts sympathetic stress arousal and stabilizes autonomic pulse during equalized hold phases.',
    },
    {
      presetId: 'bamboo_grove',
      pairFocus: 'Kyoto Bamboo Grove Grounding',
      rationale:
        'Natural woodland breeze and stream murmurs eliminate sensory distraction, establishing an unwavering foundation for the empty-lung pause.',
    },
    {
      presetId: 'zen_741_clarity',
      pairFocus: '741Hz Intuitive Clarity & Insight',
      rationale:
        '741Hz harmonic clarity tone elevates problem-solving sharpness without triggering blood pressure spikes or muscular agitation.',
    },
    {
      presetId: 'biophilic_focus',
      pairFocus: 'Continuous Pebble Stream Flow',
      rationale:
        'Steady pebble stream flow creates an uninterrupted auditory texture that stabilizes attention throughout all four equal breath quadrants.',
    },
  ],
  coherence_55: [
    {
      presetId: 'healing_528_miracle',
      pairFocus: '528Hz Solfeggio & Cardiac Resonance',
      rationale:
        'Resonant 5.5-second breathing aligns precisely with the 0.1Hz human Heart Rate Variability (HRV) rhythm, amplified by 528Hz Solfeggio heart harmonics.',
    },
    {
      presetId: 'healing_639_connection',
      pairFocus: '639Hz Heart Harmony & Vagal Tone',
      rationale:
        '639Hz acoustic warmth activates the cardio-vagal reflex, deepening emotional coherence, compassion, and autonomic balance.',
    },
    {
      presetId: 'emerald_forest_bath',
      pairFocus: 'Biophilic Canopy & Respiration Sync',
      rationale:
        'Sunlit woodland birdsong and rustling leaves facilitate an effortless, organic rhythm that naturally mirrors unbroken sinusoidal breathing.',
    },
    {
      presetId: 'himalayan_monastery',
      pairFocus: 'Sacred Overtones & Cyclic Harmony',
      rationale:
        'Deep singing bowl resonance creates a cyclical acoustic envelope that effortlessly supports seamless inhalation-to-exhalation transitions.',
    },
    {
      presetId: 'celestial_strings',
      pairFocus: '432Hz Expansive String Resonance',
      rationale:
        'Pure acoustic string harmonics provide an expansive auditory sanctuary, opening chest expansion and elevating heart-rate coherence.',
    },
  ],
  refresh_426: [
    {
      presetId: 'morning_songbirds',
      pairFocus: 'Dawn Biophilia & Cognitive Awakening',
      rationale:
        'Morning bird calls and 432Hz ambient warmth gently stimulate the vagus nerve, lifting grogginess and infusing immediate morning clarity.',
    },
    {
      presetId: 'crystalline_creek',
      pairFocus: 'Alpine Brook & Cleansing Exhale',
      rationale:
        'Crisp mountain water soundscapes assist the prolonged 6-second detoxifying exhalation, refreshing somatic vitality and clearing mental fatigue.',
    },
    {
      presetId: 'biophilic_forest',
      pairFocus: 'Pine Canopy Oxygenation',
      rationale:
        'Fresh pine forest breeze inspires natural diaphragmatic expansion, re-oxygenating tired mental faculties and centering the body.',
    },
    {
      presetId: 'healing_432_harmonic',
      pairFocus: '432Hz Somatic Grounding & Warmth',
      rationale:
        'Smooth 432Hz acoustic chords ground nervous jitters while infusing somatic presence for an energized yet peaceful daily return.',
    },
  ],
};

interface PatternConfig {
  id: BreathPattern;
  name: string;
  tagline: string;
  desc: string;
  phases: { name: string; duration: number; cue: string; type: 'inhale' | 'hold' | 'exhale' }[];
}

export const BREATH_PATTERNS: PatternConfig[] = [
  {
    id: 'relax_478',
    name: '4-7-8 Relax & Sleep',
    tagline: 'Deep Relaxation & Bedtime Calm',
    desc: 'Dr. Andrew Weil’s classic rhythmic breathing technique to cultivate serene mindfulness and quiet evening stillness.',
    phases: [
      { name: 'Inhale', duration: 4, cue: 'Breathe in quietly through the nose', type: 'inhale' },
      { name: 'Hold', duration: 7, cue: 'Hold your breath with relaxed stillness', type: 'hold' },
      { name: 'Exhale', duration: 8, cue: 'Make a gentle whoosh sound as you release', type: 'exhale' },
    ],
  },
  {
    id: 'box_4444',
    name: 'Box Breathing 4-4-4-4',
    tagline: 'Equalized Calm & Laser Focus',
    desc: 'Used by meditators and elite operators to reset panic, stabilize cortisol, and achieve instant clarity.',
    phases: [
      { name: 'Inhale', duration: 4, cue: 'Fill lungs smoothly through the nose', type: 'inhale' },
      { name: 'Hold', duration: 4, cue: 'Retain the breath with soft shoulders', type: 'hold' },
      { name: 'Exhale', duration: 4, cue: 'Slowly empty your lungs completely', type: 'exhale' },
      { name: 'Hold Empty', duration: 4, cue: 'Rest in quiet empty awareness', type: 'hold' },
    ],
  },
  {
    id: 'coherence_55',
    name: 'Heart Coherence 5.5s',
    tagline: 'Harmonic HRV Synchronization',
    desc: 'Resonant frequency breathing at 5.5 breaths per minute, aligning heart rhythm, blood pressure, and brainwaves.',
    phases: [
      { name: 'Inhale', duration: 5.5, cue: 'Breathe into the center of your heart', type: 'inhale' },
      { name: 'Exhale', duration: 5.5, cue: 'Exhale slowly, feeling warmth and gratitude', type: 'exhale' },
    ],
  },
  {
    id: 'refresh_426',
    name: 'Awaken & Cleanse 4-2-6',
    tagline: 'Gentle Vagus Reset',
    desc: 'Extended exhale stimulates the vagus nerve while keeping you gently alert and grounded.',
    phases: [
      { name: 'Inhale', duration: 4, cue: 'Inhale freshness and clarity', type: 'inhale' },
      { name: 'Hold', duration: 2, cue: 'Brief gentle pause', type: 'hold' },
      { name: 'Exhale', duration: 6, cue: 'Release all tension down through your feet', type: 'exhale' },
    ],
  },
];

export interface BreathPacerProps {
  initialPattern?: BreathPattern;
  tuningHz?: number;
  onApplyPreset?: (preset: MixPreset) => void;
  activePresetId?: string | null;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export const BreathPacer: React.FC<BreathPacerProps> = ({
  initialPattern,
  tuningHz = 432,
  onApplyPreset,
  activePresetId,
  isPlaying = false,
  onTogglePlay,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(initialPattern || 'relax_478');

  // Track suitable preset index for every breathwork pattern so each pattern has a tailored preset
  const [recommendedPresetIndices, setRecommendedPresetIndices] = useState<Record<BreathPattern, number>>({
    relax_478: 0,
    box_4444: 0,
    coherence_55: 0,
    refresh_426: 0,
  });

  const [randomizeToast, setRandomizeToast] = useState<string | null>(null);
  const [autoRandomizeOnCycle, setAutoRandomizeOnCycle] = useState<boolean>(false);
  const [isShufflingPreset, setIsShufflingPreset] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Coherence Sync Mode State (coupled to 432Hz sine wave cycle intensity)
  const [isCoherenceSync, setIsCoherenceSync] = useState<boolean>(false);
  const [coherenceDepth, setCoherenceDepth] = useState<'subtle' | 'resonant' | 'deep'>('resonant');
  const [enableAmbientAura, setEnableAmbientAura] = useState<boolean>(true);
  const [showCoherenceGuide, setShowCoherenceGuide] = useState<boolean>(false);
  const [liveIntensityPct, setLiveIntensityPct] = useState<number>(50);
  const [coherenceScore, setCoherenceScore] = useState<number>(98.5);

  // Animation & DOM Refs for 60fps Zero-Overhead Transform & Oscilloscope
  const containerRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const coherenceCanvasRef = useRef<HTMLCanvasElement>(null);
  const orbRippleRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const sinePhaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const smoothedIntensityRef = useRef<number>(0.5);

  useEffect(() => {
    if (initialPattern) {
      setSelectedPattern(initialPattern);
      setPhaseIndex(0);
      setPhaseElapsed(0);
    }
  }, [initialPattern]);

  // Starts paused first so the user can prepare in stillness
  const [isActive, setIsActive] = useState<boolean>(false);
  const [audioCueEnabled, setAudioCueEnabled] = useState<boolean>(true);
  const [show478Overlay, setShow478Overlay] = useState<boolean>(false);
  const [animationStyle, setAnimationStyle] = useState<BreathAnimationStyle>(() => {
    try {
      const saved = localStorage.getItem('aura_breath_animation_style');
      if (saved === 'orb' || saved === 'lotus' || saved === 'wave') return saved;
    } catch {}
    return 'orb';
  });

  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [phaseElapsed, setPhaseElapsed] = useState<number>(0);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  const pattern = BREATH_PATTERNS.find((p) => p.id === selectedPattern) || BREATH_PATTERNS[0];
  const currentPhase = pattern.phases[phaseIndex];

  // Keep latest phase timing in refs so the 60fps rAF oscilloscope loop stays uninterrupted
  const phaseElapsedRef = useRef<number>(phaseElapsed);
  phaseElapsedRef.current = phaseElapsed;
  const currentPhaseRef = useRef(currentPhase);
  currentPhaseRef.current = currentPhase;

  const handleChangeAnimationStyle = (style: BreathAnimationStyle) => {
    setAnimationStyle(style);
    try {
      localStorage.setItem('aura_breath_animation_style', style);
    } catch {}
  };

  const handleToggleActive = () => {
    const nextActive = !isActive;
    setIsActive(nextActive);
    if (nextActive && audioCueEnabled) {
      audioEngine.playBreathCue(currentPhase.type);
    }
  };

  const handleToggleAudioCue = () => {
    const next = !audioCueEnabled;
    setAudioCueEnabled(next);
    if (next) {
      audioEngine.playBreathCue(currentPhase.type);
    }
  };

  // Get current suitable preset recommendation for selected breathwork
  const suitablePool = SUITABLE_PRESETS_BY_PATTERN[selectedPattern] || SUITABLE_PRESETS_BY_PATTERN.relax_478;
  const currentPresetIdx = (recommendedPresetIndices[selectedPattern] || 0) % suitablePool.length;
  const currentRecommendation = suitablePool[currentPresetIdx];
  const recommendedPresetObj = BUILT_IN_MIX_PRESETS.find((p) => p.id === currentRecommendation.presetId);

  // Randomize / change suitable preset randomly for a given breathwork pattern
  const handleRandomizePreset = (patternId: BreathPattern = selectedPattern, autoApply = false) => {
    const pool = SUITABLE_PRESETS_BY_PATTERN[patternId];
    if (!pool || pool.length <= 1) return;

    setIsShufflingPreset(true);
    setTimeout(() => setIsShufflingPreset(false), 600);

    setRecommendedPresetIndices((prev) => {
      const currentIdx = prev[patternId] ?? 0;
      let nextIdx = Math.floor(Math.random() * pool.length);
      // Guarantee picking a different random preset if more than 1 available
      if (nextIdx === currentIdx && pool.length > 1) {
        nextIdx = (currentIdx + 1) % pool.length;
      }

      const newRec = pool[nextIdx];
      const newPresetObj = BUILT_IN_MIX_PRESETS.find((p) => p.id === newRec.presetId);

      const patternName = BREATH_PATTERNS.find((p) => p.id === patternId)?.name || 'Breathwork';
      const presetLabel = newPresetObj?.name || newRec.presetId;

      setRandomizeToast(`🎲 Changed preset randomly for ${patternName}: "${presetLabel}"`);
      setTimeout(() => setRandomizeToast(null), 3500);

      if (autoApply && newPresetObj && onApplyPreset) {
        onApplyPreset(newPresetObj);
      }

      return {
        ...prev,
        [patternId]: nextIdx,
      };
    });
  };

  // High-precision breath pacing timer using performance.now delta
  useEffect(() => {
    if (!isActive) return;

    let lastTick = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const deltaSec = Math.min((now - lastTick) / 1000, 0.2);
      lastTick = now;

      setPhaseElapsed((prev) => {
        const next = prev + deltaSec;
        if (next >= currentPhase.duration) {
          // Advance to next phase
          const nextIndex = (phaseIndex + 1) % pattern.phases.length;
          setPhaseIndex(nextIndex);

          if (nextIndex === 0) {
            setCompletedCycles((c) => {
              const newCount = c + 1;
              if (autoRandomizeOnCycle) {
                handleRandomizePreset(selectedPattern, true);
              }
              return newCount;
            });
          }

          // Trigger Sanctuary Bowls transition tone
          if (audioCueEnabled) {
            const nextPhaseType = pattern.phases[nextIndex].type;
            audioEngine.playBreathCue(nextPhaseType);
          }

          return 0;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [isActive, phaseIndex, pattern, currentPhase, audioCueEnabled, autoRandomizeOnCycle, selectedPattern]);

  const handlePatternChange = (newPatternId: BreathPattern) => {
    setSelectedPattern(newPatternId);
    setPhaseIndex(0);
    setPhaseElapsed(0);
    setIsActive(false); // keep paused so user can ground themselves before starting
  };

  const handleReset = () => {
    setPhaseIndex(0);
    setPhaseElapsed(0);
    setCompletedCycles(0);
    setIsActive(false); // paused on reset
  };

  const handleApplyCurrentPreset = () => {
    if (recommendedPresetObj && onApplyPreset) {
      onApplyPreset(recommendedPresetObj);
      setRandomizeToast(`✓ Applied "${recommendedPresetObj.name}" for ${pattern.name}!`);
      setTimeout(() => setRandomizeToast(null), 3000);
    }
  };

  const handleToggleCoherenceSync = () => {
    const next = !isCoherenceSync;
    setIsCoherenceSync(next);
    if (next) {
      if (selectedPattern !== 'coherence_55') {
        setSelectedPattern('coherence_55');
        setPhaseIndex(0);
        setPhaseElapsed(0);
      }
      setRandomizeToast('⚡ 432Hz Coherence Sync Active: Screen UI expansion synchronized with 432Hz sine cycle');
      setTimeout(() => setRandomizeToast(null), 3500);
    } else {
      setRandomizeToast('Coherence Sync Disengaged: Standard visual pacing');
      setTimeout(() => setRandomizeToast(null), 2500);
    }
  };

  // Real-Time 432Hz Sine Wave Oscillation & Screen UI Expansion/Contraction Engine
  useEffect(() => {
    let active = true;
    const canvas = coherenceCanvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;
    const dpr = window.devicePixelRatio || 1;

    const freqData = new Uint8Array(256);
    const timeData = new Uint8Array(256);
    let lastScoreUpdate = performance.now();

    const loop = (timeNow: number) => {
      if (!active) return;

      const dt = Math.min((timeNow - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timeNow;

      const carrierFreq = tuningHz && Number.isFinite(tuningHz) && tuningHz > 0 ? tuningHz : 432;
      sinePhaseRef.current = (sinePhaseRef.current + 2 * Math.PI * carrierFreq * dt) % (2 * Math.PI);

      const analyser = audioEngine.getAnalyser();
      let rawMicro = 0;

      if (isPlaying && analyser) {
        try {
          analyser.getByteFrequencyData(freqData);
          analyser.getByteTimeDomainData(timeData);

          // Energy in bins 4-6 covering ~350-520Hz centered around 432Hz
          const bin4 = freqData[4] || 0;
          const bin5 = freqData[5] || 0;
          const bin6 = freqData[6] || 0;
          const carrierBinEnergy = (bin4 * 0.3 + bin5 * 0.5 + bin6 * 0.2) / 255;

          // Time domain RMS
          let sumSquares = 0;
          for (let i = 0; i < 64; i++) {
            const val = (timeData[i] - 128) / 128;
            sumSquares += val * val;
          }
          const rms = Math.sqrt(sumSquares / 64);
          rawMicro = Math.min(1, carrierBinEnergy * 0.6 + rms * 1.3);
        } catch {
          rawMicro = 0.5 + 0.38 * Math.sin(sinePhaseRef.current);
        }
      } else {
        // Pure mathematical 432Hz sine wave cycle intensity with sub-harmonic resonance
        const fundamental = Math.sin(sinePhaseRef.current);
        const subHarmonic = Math.sin(sinePhaseRef.current * 0.5);
        rawMicro = 0.5 + 0.35 * fundamental + 0.12 * subHarmonic;
      }

      // Smooth intensity with exponential filter for organic physical feel
      smoothedIntensityRef.current += (rawMicro - smoothedIntensityRef.current) * Math.min(1, dt * 14);
      const intensity = Math.max(0, Math.min(1, smoothedIntensityRef.current));

      // Calculate Macro Respiration factor E (0 to 1) from latest phase refs
      let macroE = 0.5;
      const activePhase = currentPhaseRef.current;
      if (isActive && activePhase) {
        const prog = Math.min(1, Math.max(0, phaseElapsedRef.current / activePhase.duration));
        if (activePhase.type === 'inhale') {
          // Smooth diaphragm expansion ease-in-out
          macroE = 0.5 - 0.5 * Math.cos(Math.PI * prog);
        } else if (activePhase.type === 'hold') {
          const isHoldEmpty = activePhase.name.toLowerCase().includes('empty');
          macroE = isHoldEmpty ? 0.05 : 0.95 + 0.05 * Math.sin(sinePhaseRef.current * 0.1);
        } else if (activePhase.type === 'exhale') {
          // Smooth diaphragm release ease-in-out
          macroE = 0.5 + 0.5 * Math.cos(Math.PI * prog);
        }
      } else {
        // Meditative resting breath oscillation when paused
        macroE = 0.5 + 0.2 * Math.sin((timeNow / 1000) * (2 * Math.PI / 5.5));
      }

      // Apply Screen UI Expansion and Contraction
      if (isCoherenceSync) {
        const depthConfig = {
          subtle: { macroAmp: 0.012, microAmp: 0.006, glowBase: 25, glowSpread: 30 },
          resonant: { macroAmp: 0.025, microAmp: 0.012, glowBase: 38, glowSpread: 50 },
          deep: { macroAmp: 0.040, microAmp: 0.018, glowBase: 52, glowSpread: 70 },
        }[coherenceDepth];

        const uiScale = 1.0 + (macroE - 0.5) * depthConfig.macroAmp + (intensity - 0.5) * depthConfig.microAmp;

        if (containerRef.current) {
          containerRef.current.style.transform = `scale(${uiScale.toFixed(4)}) translateZ(0)`;
          const glowPx = Math.round(depthConfig.glowBase + macroE * depthConfig.glowSpread + intensity * 20);
          const glowAlpha = (0.12 + macroE * 0.22 + intensity * 0.1).toFixed(3);
          containerRef.current.style.boxShadow = `0 0 ${glowPx}px rgba(56, 189, 248, ${glowAlpha}), 0 0 24px rgba(99, 102, 241, 0.16)`;
        }

        if (auraRef.current && enableAmbientAura) {
          const auraScale = 1.0 + macroE * 0.14 + intensity * 0.04;
          const auraOpacity = (0.35 + macroE * 0.45 + intensity * 0.15).toFixed(3);
          auraRef.current.style.transform = `scale(${auraScale.toFixed(3)}) translateZ(0)`;
          auraRef.current.style.opacity = auraOpacity;
        }

        if (orbRippleRef.current) {
          const orbMicroScale = 1.0 + (intensity - 0.5) * 0.08;
          orbRippleRef.current.style.transform = `scale(${orbMicroScale.toFixed(3)})`;
        }
      } else {
        if (containerRef.current) {
          containerRef.current.style.transform = 'none';
          containerRef.current.style.boxShadow = '';
        }
        if (auraRef.current) {
          auraRef.current.style.opacity = '0';
        }
      }

      // Draw 432Hz Sine Wave Oscilloscope
      if (isCoherenceSync && canvas && ctx) {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(10, Math.floor(rect.width));
        const h = Math.max(10, Math.floor(rect.height));

        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
          ctx.scale(dpr, dpr);
        }

        ctx.clearRect(0, 0, w, h);

        // Center harmonic datum
        const midY = h / 2;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 0.10Hz Mayer Wave Respiration Envelope Ribbon
        const envGrad = ctx.createLinearGradient(0, 0, w, 0);
        envGrad.addColorStop(0, 'rgba(56, 189, 248, 0.03)');
        envGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
        envGrad.addColorStop(1, 'rgba(56, 189, 248, 0.03)');

        const envAmp = (h * 0.38) * (0.28 + macroE * 0.72);
        ctx.beginPath();
        ctx.moveTo(0, midY);
        for (let x = 0; x <= w; x += 4) {
          const nx = x / w;
          const envY = midY - Math.sin(nx * Math.PI) * envAmp;
          ctx.lineTo(x, envY);
        }
        ctx.lineTo(w, midY);
        ctx.closePath();
        ctx.fillStyle = envGrad;
        ctx.fill();

        // 432Hz Sine Wave Trace
        const visibleCycles = 8;
        const phaseOffset = (timeNow / 1000) * 2.2;
        const sineWaveAmp = (h * 0.36) * (0.25 + macroE * 0.65 + intensity * 0.15);

        ctx.beginPath();
        ctx.lineWidth = 2.4;
        const strokeGrad = ctx.createLinearGradient(0, 0, w, 0);
        strokeGrad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
        strokeGrad.addColorStop(0.4, '#38bdf8');
        strokeGrad.addColorStop(0.7, '#facc15');
        strokeGrad.addColorStop(1, 'rgba(56, 189, 248, 0.5)');
        ctx.strokeStyle = strokeGrad;

        let crestX = w * 0.5;
        let crestY = midY;

        for (let x = 0; x <= w; x += 2) {
          const nx = x / w;
          const localSine = Math.sin((nx * visibleCycles * 2 * Math.PI) - phaseOffset);
          const envelope = Math.sin(nx * Math.PI);
          const y = midY - localSine * sineWaveAmp * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          if (Math.abs(x - w * 0.5) < 3) {
            crestX = x;
            crestY = y;
          }
        }
        ctx.stroke();

        // Luminous Coherence Node (Golden Spark atop wave crest)
        ctx.beginPath();
        ctx.arc(crestX, crestY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Throttled UI telemetry updates
      if (timeNow - lastScoreUpdate > 120) {
        lastScoreUpdate = timeNow;
        setLiveIntensityPct(Math.round(intensity * 100));
        const targetScore = 97.6 + macroE * 1.8 + (1 - Math.abs(intensity - 0.5)) * 0.5;
        setCoherenceScore(Math.round(targetScore * 10) / 10);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isCoherenceSync, coherenceDepth, enableAmbientAura, isPlaying, isActive, tuningHz]);

  const isCurrentPresetActive = activePresetId === currentRecommendation.presetId;
  const isInitialState = !isActive && completedCycles === 0 && phaseElapsed === 0;

  return (
    <div className="relative isolate w-full">
      {/* Viewport Ambient Radial Aura for Coherence Sync */}
      <div
        ref={auraRef}
        className="absolute -inset-4 sm:-inset-6 md:-inset-8 rounded-3xl bg-gradient-to-r from-cyan-500/15 via-sky-500/20 to-indigo-500/15 blur-2xl pointer-events-none transition-opacity duration-300 -z-10"
        style={{ opacity: 0 }}
      />

      <div
        ref={containerRef}
        className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-xl relative space-y-3.5 sm:space-y-4 transition-all duration-75 ease-out origin-center"
      >
        {/* Toast Notification for Random Preset Change */}
        {randomizeToast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 max-w-sm mx-auto sm:mx-0 z-50 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-900/95 border border-sky-400 text-sky-200 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <Dices className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
            <span className="truncate">{randomizeToast}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Wind className="w-4 h-4 text-sky-400" />
                <span>Harmonic Breath Pacer</span>
              </h3>
              <span className="text-[11px] text-sky-300/90 font-medium">
                Vagal Regulation
              </span>
              {isCoherenceSync && (
                <span className="text-[11px] text-cyan-300 font-semibold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400" />
                  <span>432Hz Sync Active</span>
                </span>
              )}
              {isZenMode && (
                <span className="text-[11px] text-emerald-300 font-semibold">
                  Zen View
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-light">
              Synchronize respiration with tailored sound presets &amp; Sanctuary singing bowls.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Coherence Sync 432Hz Mode Toggle */}
            <button
              type="button"
              onClick={handleToggleCoherenceSync}
              className={`text-xs inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl border font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isCoherenceSync
                  ? 'bg-gradient-to-r from-cyan-500/30 via-sky-500/25 to-indigo-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
              }`}
              title="Synchronize screen UI expansion & contraction with 432Hz sine wave cycle intensity"
              aria-pressed={isCoherenceSync}
            >
              <Waves className={`w-3.5 h-3.5 ${isCoherenceSync ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Coherence Sync</span>
            </button>

            {/* Guided 4-7-8 Trigger */}
            <button
              type="button"
              onClick={() => setShow478Overlay(true)}
              className="text-xs inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] border border-transparent bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-bold rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              title="Launch Guided 4-7-8 Breathing Session"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" />
              <span>Guided 4-7-8</span>
            </button>

            {/* Zen Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsZenMode(!isZenMode)}
              className={`text-xs inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isZenMode
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-800/90 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isZenMode ? 'Switch to Standard View' : 'Switch to Distraction-Free Zen View'}
            >
              {isZenMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              <span>{isZenMode ? 'Standard View' : 'Zen View'}</span>
            </button>

            {/* Randomize Preset */}
            <button
              type="button"
              onClick={() => handleRandomizePreset(selectedPattern, false)}
              className={`text-xs inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isShufflingPreset ? 'scale-105 ring-2 ring-sky-400' : ''
              }`}
              title="Randomly change suitable preset recommendation"
            >
              <Dices className={`w-3.5 h-3.5 ${isShufflingPreset ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Randomize Preset</span>
              <span className="sm:hidden">Shuffle</span>
            </button>

            {/* Sanctuary Bowls Cue Toggle */}
            <button
              type="button"
              onClick={handleToggleAudioCue}
              aria-pressed={audioCueEnabled}
              className={`text-xs inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl border transition-colors cursor-pointer whitespace-nowrap ${
                audioCueEnabled
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                  : 'bg-slate-800/90 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Sanctuary singing bowls on breath transitions"
            >
              {audioCueEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Bowls</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              title="Reset counter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

      {/* Pattern Selection Cards - Minimized Grid */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 ${isZenMode ? 'hidden sm:grid' : ''}`}>
        {BREATH_PATTERNS.map((p) => {
          const isSelected = selectedPattern === p.id;
          const pool = SUITABLE_PRESETS_BY_PATTERN[p.id];
          const recIdx = (recommendedPresetIndices[p.id] || 0) % pool.length;
          const rec = pool[recIdx];
          const presetObj = BUILT_IN_MIX_PRESETS.find((item) => item.id === rec.presetId);

          return (
            <div
              key={p.id}
              onClick={() => handlePatternChange(p.id)}
              className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between cursor-pointer group ${
                isSelected
                  ? 'bg-sky-500/15 border-sky-400 text-slate-100 shadow-sm ring-1 ring-sky-400/40'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span className="truncate">{p.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-sky-400/80 truncate mt-0.5">{p.tagline}</div>
                {p.id === 'coherence_55' && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.5 rounded-md font-semibold">
                    <Waves className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Coherence Sync Mode</span>
                  </span>
                )}
              </div>

              {/* Suitable Preset Recommended Box */}
              <div className="mt-2.5 px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-sky-400/90 leading-tight block">
                    Suitable Preset
                  </span>
                  <div className="text-slate-200 font-medium text-[11px] truncate flex items-center gap-1.5 mt-0.5">
                    <Music className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="truncate font-semibold">{presetObj?.name || rec.presetId}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRandomizePreset(p.id, isSelected);
                  }}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 border border-slate-750 transition-colors shrink-0 cursor-pointer"
                  title={`Shuffle suitable preset for ${p.name}`}
                  aria-label="Shuffle suitable preset"
                >
                  <Dices className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPACT RECOMMENDED PRESET BAR */}
      {!isZenMode && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900/90 to-indigo-950/60 border border-sky-400/35 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/35 text-sky-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Suitable Preset: <strong className="text-white font-extrabold">{recommendedPresetObj?.name || 'Harmonic Preset'}</strong></span>
              </span>
              <span className="text-xs text-amber-300 font-mono font-medium">
                {recommendedPresetObj?.baseFreq}Hz &bull; {currentRecommendation.pairFocus}
              </span>
              {isCurrentPresetActive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Active in Sanctuary</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              <strong className="text-sky-300 font-semibold">Acoustic Rationale:</strong> {currentRecommendation.rationale}
            </p>
          </div>

          {/* Action Buttons & Random Changer */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={handleApplyCurrentPreset}
              className={`flex-1 md:flex-initial px-3.5 py-1.5 min-h-[36px] rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap ${
                isCurrentPresetActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                  : 'bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 border-transparent text-slate-950'
              }`}
              title="Apply preset with smooth acoustic fade"
            >
              {isCurrentPresetActive ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Preset Loaded</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Apply Preset</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleRandomizePreset(selectedPattern, false)}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-sky-400 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isShufflingPreset ? 'scale-105 ring-2 ring-sky-400' : ''
              }`}
              title="Pick another suitable preset randomly"
            >
              <Shuffle className={`w-3.5 h-3.5 text-sky-400 ${isShufflingPreset ? 'animate-spin' : ''}`} />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      )}

      {/* 432Hz COHERENCE SYNC REAL-TIME OSCILLOSCOPE & TELEMETRY */}
      {isCoherenceSync && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-cyan-950/45 via-slate-900/95 to-indigo-950/45 border border-cyan-400/40 shadow-xl relative overflow-hidden animate-in fade-in duration-300 space-y-3">
          {/* Top row: Title, badges, depth controls, and guide toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-cyan-900/50 pb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Waves className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>432Hz Sine Wave Sync</span>
              </span>
              <span className="text-[11px] text-cyan-300 font-mono font-medium">
                0.100 Hz Mayer Rhythm &bull; {tuningHz}Hz Carrier
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>Coherence: {coherenceScore}%</span>
              </span>
            </div>

            {/* Depth selector & Aura toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-950/80 border border-cyan-900/60 rounded-xl p-0.5 text-[10px]">
                <span className="text-slate-400 px-1.5 text-[9px] uppercase font-bold tracking-wider">Depth:</span>
                {(['subtle', 'resonant', 'deep'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setCoherenceDepth(d)}
                    className={`px-2 py-0.5 rounded-lg capitalize transition-all cursor-pointer ${
                      coherenceDepth === d
                        ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-400/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setEnableAmbientAura(!enableAmbientAura)}
                className={`text-[10px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  enableAmbientAura
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Toggle Viewport Ambient Aura"
              >
                Aura Glow {enableAmbientAura ? 'ON' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={() => setShowCoherenceGuide(!showCoherenceGuide)}
                className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 transition-colors cursor-pointer"
                title="How 432Hz Coherence Sync Works"
                aria-label="How 432Hz Coherence Sync Works"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Educational Guide Drawer */}
          {showCoherenceGuide && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/35 text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-200">
              <p className="font-semibold text-cyan-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>How 432Hz Coherence Sync Works:</span>
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                The visual UI seamlessly expands on inhalation and gently contracts on exhalation, coupled directly to the 432Hz sine wave cycle intensity. When audio is active, instantaneous harmonic amplitude is extracted in real time from the audio engine’s 432Hz frequency analyser; when paused, it entrains with a continuous mathematical 432.00Hz sinusoidal carrier.
              </p>
            </div>
          )}

          {/* Living 432Hz Waveform Oscilloscope Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-cyan-500/35 bg-slate-950 shadow-inner">
            <canvas
              ref={coherenceCanvasRef}
              className="w-full h-20 sm:h-24 block"
            />
            {/* Overlay indicators */}
            <div className="absolute top-1.5 left-2.5 flex items-center gap-2 pointer-events-none">
              <span className="text-[10px] font-mono font-semibold text-cyan-300/90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                432.00Hz Real-Time Oscilloscope
              </span>
            </div>
            <div className="absolute bottom-1.5 right-2.5 flex items-center gap-2 pointer-events-none">
              <span className="text-[9px] font-mono text-cyan-300/80">
                Phase: {currentPhase.name} &bull; {currentPhase.duration}s
              </span>
            </div>
          </div>

          {/* Live Telemetry Bar & Audio Pairing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            {/* Live Intensity Gauge */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Gauge className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px] text-slate-400 shrink-0">Sine Intensity:</span>
              <div className="flex-1 bg-slate-950/80 rounded-full h-2 overflow-hidden border border-cyan-900/60 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-amber-300 transition-all duration-100"
                  style={{ width: `${liveIntensityPct}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-cyan-300 font-semibold shrink-0">
                {liveIntensityPct}%
              </span>
            </div>

            {/* Audio Engine Coupling Status / 1-Click Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              {isPlaying ? (
                <span className="text-[10px] px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Audio Engine Synced</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onTogglePlay) {
                      onTogglePlay();
                    } else if (onApplyPreset && recommendedPresetObj) {
                      onApplyPreset(recommendedPresetObj);
                    }
                  }}
                  className="text-[11px] px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Start 432Hz Soundscape to couple acoustic tones with breathwork"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Activate 432Hz Soundscape</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Restyled Sanctuary Breathwork Visualizer with 3 Inhale & Exhale Animation Modes */}
      <BreathVisualizerCanvas
        isActive={isActive}
        isInitialState={isInitialState}
        isZenMode={isZenMode}
        isCoherenceSync={isCoherenceSync}
        audioCueEnabled={audioCueEnabled}
        patternName={pattern.name}
        patternDesc={pattern.desc}
        phases={pattern.phases}
        phaseIndex={phaseIndex}
        phaseElapsed={phaseElapsed}
        completedCycles={completedCycles}
        animationStyle={animationStyle}
        onChangeAnimationStyle={handleChangeAnimationStyle}
        onToggleActive={handleToggleActive}
        onToggleAudioCue={handleToggleAudioCue}
        orbRippleRef={orbRippleRef}
      />

      {/* Interactive Guided 4-7-8 Breathing Session Overlay */}
      <Guided478Overlay
        isOpen={show478Overlay}
        onClose={() => setShow478Overlay(false)}
        onCompleteCycle={() => setCompletedCycles((c) => c + 1)}
      />
    </div>
  </div>
  );
};
