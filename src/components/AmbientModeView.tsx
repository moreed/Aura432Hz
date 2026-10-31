import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  Moon,
  Timer,
  Volume2,
  VolumeX,
  Sliders,
  Palette,
  Eye,
  EyeOff,
  Layers,
  CloudRain,
  Flame,
  Droplets,
  Wind,
  Check,
  Headphones,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  audioEngine,
  NatureSoundState,
  BrainwaveMode,
  BRAINWAVE_MODES,
  SOLFEGGIO_FREQUENCIES,
} from '../services/audioEngine';

export type AmbientColorPalette = 'celestial' | 'gold' | 'emerald' | 'violet' | 'obsidian';

export type AmbientVisualizerType =
  | 'sacred_lotus'
  | 'dreamy_nebula'
  | 'mandala'
  | 'ripples'
  | 'aurora'
  | 'flower_of_life'
  | 'cosmic_galaxy'
  | 'cymatic_waves'
  | 'pranic_orb';

interface AmbientModeViewProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  baseFreq: number;
  onSelectBaseFreq: (freq: number) => void;
  brainwaveMode: BrainwaveMode;
  onSelectBrainwaveMode: (mode: BrainwaveMode) => void;
  natureSounds: NatureSoundState[];
  onToggleNatureSound: (id: string) => void;
  masterVolume: number;
  onChangeMasterVolume: (vol: number) => void;
  timerSecondsRemaining: number | null;
  onOpenTimerModal: () => void;
  isVolumeNormalized?: boolean;
  onToggleVolumeNormalized?: () => void;
}

export const AmbientModeView: React.FC<AmbientModeViewProps> = ({
  isOpen,
  onClose,
  isPlaying,
  onTogglePlay,
  baseFreq,
  onSelectBaseFreq,
  brainwaveMode,
  onSelectBrainwaveMode,
  natureSounds,
  onToggleNatureSound,
  masterVolume,
  onChangeMasterVolume,
  timerSecondsRemaining,
  onOpenTimerModal,
  isVolumeNormalized = true,
  onToggleVolumeNormalized,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  const smoothEnergyRef = useRef<number>(0.12);
  const smoothBassRef = useRef<number>(0.1);
  const smoothPulseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const needsClearRef = useRef<boolean>(true);
  const ripplesRef = useRef<{ x: number; y: number; radius: number; alpha: number }[]>([]);

  // UI state
  const [visualizerType, setVisualizerType] = useState<AmbientVisualizerType>('sacred_lotus');
  const [colorPalette, setColorPalette] = useState<AmbientColorPalette>('celestial');
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState<boolean>(false);
  const [showPaletteMenu, setShowPaletteMenu] = useState<boolean>(false);
  const [showSoundMixer, setShowSoundMixer] = useState<boolean>(false);
  const hideTimerRef = useRef<number | null>(null);

  // Swipe State for Ambient Zen Mode (Desktop, Mobile, Tablet)
  const [swipeFeedback, setSwipeFeedback] = useState<{ direction: 'left' | 'right'; name: string } | null>(null);
  const swipeFeedbackTimerRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastWheelTimeRef = useRef<number>(0);

  const AMBIENT_VISUALIZER_MODES = useRef<{ id: AmbientVisualizerType; name: string }[]>([
    { id: 'sacred_lotus', name: 'Sacred Lotus' },
    { id: 'dreamy_nebula', name: 'Dreamy Stardust' },
    { id: 'mandala', name: 'Mandala' },
    { id: 'ripples', name: 'Ripples' },
    { id: 'aurora', name: 'Aurora' },
    { id: 'flower_of_life', name: 'Flower of Life' },
    { id: 'cosmic_galaxy', name: 'Galaxy' },
    { id: 'cymatic_waves', name: 'Harmonic Waves' },
    { id: 'pranic_orb', name: 'Pranic Orb' },
  ]).current;

  const switchToNextVisualizer = useCallback((direction: 'next' | 'prev' = 'next') => {
    setVisualizerType((current) => {
      const curIdx = AMBIENT_VISUALIZER_MODES.findIndex((m) => m.id === current);
      const nextIdx =
        direction === 'next'
          ? (curIdx + 1) % AMBIENT_VISUALIZER_MODES.length
          : (curIdx - 1 + AMBIENT_VISUALIZER_MODES.length) % AMBIENT_VISUALIZER_MODES.length;
      const nextMode = AMBIENT_VISUALIZER_MODES[nextIdx];

      setSwipeFeedback({
        direction: direction === 'next' ? 'left' : 'right',
        name: nextMode.name,
      });
      if (swipeFeedbackTimerRef.current) {
        window.clearTimeout(swipeFeedbackTimerRef.current);
      }
      swipeFeedbackTimerRef.current = window.setTimeout(() => {
        setSwipeFeedback(null);
      }, 1100);

      return nextMode.id;
    });
  }, [AMBIENT_VISUALIZER_MODES]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    resetHideTimer();
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
    isDraggingRef.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    resetHideTimer();
    if (!pointerStartRef.current) return;
    const start = pointerStartRef.current;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dt = performance.now() - start.time;

    pointerStartRef.current = null;
    isDraggingRef.current = false;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const isFlick = dt < 350 && absDx > 28 && absDx > absDy;
    const isDragSwipe = absDx >= 42 && absDx > absDy * 1.15;

    if (isFlick || isDragSwipe) {
      if (dx < 0) {
        switchToNextVisualizer('next');
      } else {
        switchToNextVisualizer('prev');
      }
      return;
    }

    // Tap/Click detection -> spawn peaceful acoustic ripple
    if (absDx < 14 && absDy < 14) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnRipple(x, y);
    }
  };

  const handlePointerCancel = () => {
    pointerStartRef.current = null;
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > 28 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.3) {
      const now = performance.now();
      if (now - lastWheelTimeRef.current > 380) {
        lastWheelTimeRef.current = now;
        if (e.deltaX > 0) {
          switchToNextVisualizer('next');
        } else {
          switchToNextVisualizer('prev');
        }
      }
    }
  };

  const currentBrainwave = BRAINWAVE_MODES[brainwaveMode];
  const currentSolfeggio = SOLFEGGIO_FREQUENCIES.find((s) => s.freq === baseFreq);
  const solfeggioShortName = currentSolfeggio
    ? (baseFreq === 432 ? 'Sanctuary' : currentSolfeggio.name.split('/')[0].split('&')[0].trim())
    : 'Harmonics';

  // Palette color definitions
  const palettes = {
    celestial: {
      name: 'Celestial Cyan',
      primary: '#38bdf8',
      secondary: '#818cf8',
      tertiary: '#c084fc',
      bgGlow: 'rgba(14, 165, 233, 0.15)',
      ring: 'border-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
    },
    gold: {
      name: 'Sacred Solar 432',
      primary: '#fbbf24',
      secondary: '#f59e0b',
      tertiary: '#fb923c',
      bgGlow: 'rgba(245, 158, 11, 0.16)',
      ring: 'border-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    },
    emerald: {
      name: 'Forest Zen',
      primary: '#34d399',
      secondary: '#10b981',
      tertiary: '#06b6d4',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      ring: 'border-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
    },
    violet: {
      name: 'Amethyst Crown',
      primary: '#c084fc',
      secondary: '#a855f7',
      tertiary: '#f472b6',
      bgGlow: 'rgba(168, 85, 247, 0.15)',
      ring: 'border-purple-400',
      badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
    },
    obsidian: {
      name: 'Midnight Moon',
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      tertiary: '#64748b',
      bgGlow: 'rgba(148, 163, 184, 0.1)',
      ring: 'border-slate-400',
      badgeBg: 'bg-slate-700/40 text-slate-200 border-slate-500/40',
    },
  };

  const currentTheme = palettes[colorPalette];

  // Auto-hide controls upon mouse/touch inactivity
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      setShowPaletteMenu(false);
      setShowSoundMixer(false);
    }, 4500);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      resetHideTimer();
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key.toLowerCase() === 'h') {
        setControlsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onTogglePlay, resetHideTimer]);

  // Track browser fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  // Interactive ripple spawn on canvas click
  const spawnRipple = (x: number, y: number) => {
    ripplesRef.current.push({
      x,
      y,
      radius: 5,
      alpha: 0.9,
    });
    // keep only newest 10 ripples
    if (ripplesRef.current.length > 10) {
      ripplesRef.current.shift();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    resetHideTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnRipple(x, y);
  };

  // High-Resolution Canvas Audio-Reactive Render Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();

    const dataArray = new Uint8Array(256);
    const waveArray = new Uint8Array(256);
    const smoothedFft = new Float32Array(64);

    const render = (timeNow: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cx = width / 2;
      const cy = height / 2;

      // Delta time physics (frame-rate independent at 60Hz, 120Hz, 144Hz)
      const lastTime = lastTimeRef.current || timeNow;
      const dt = Math.min((timeNow - lastTime) / 16.67, 2.5);
      lastTimeRef.current = timeNow;

      // 1. Silky Optical Persistence Wash (eliminates harsh flicker and stepping)
      if (needsClearRef.current) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);
        needsClearRef.current = false;
      } else {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.20)';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 2. Live Audio Spectrum Extraction with Spatial Smoothing
      let rawEnergy = 0;
      let rawBass = 0;
      const analyser = audioEngine.getAnalyser();

      if (isPlaying && analyser) {
        analyser.getByteFrequencyData(dataArray);
        analyser.getByteTimeDomainData(waveArray);

        // Gaussian 3-tap smoothing across bins
        for (let i = 0; i < 64; i++) {
          const prev = i > 0 ? dataArray[i - 1] : dataArray[i];
          const curr = dataArray[i];
          const next = i < 63 ? dataArray[i + 1] : dataArray[i];
          smoothedFft[i] = (prev * 0.25 + curr * 0.5 + next * 0.25) / 255;
        }

        let sum = 0;
        for (let i = 0; i < 64; i++) {
          sum += smoothedFft[i];
          if (i < 8) rawBass += smoothedFft[i];
        }
        rawEnergy = sum / 64;
        rawBass = rawBass / 8;
      } else {
        // Idle gentle breathing
        rawEnergy = 0.10;
        rawBass = 0.08;
        for (let i = 0; i < 64; i++) {
          smoothedFft[i] = 0.08 + Math.sin(i * 0.18 + timeNow * 0.001) * 0.03;
        }
      }

      // 3. Dual-Pole Asymmetric Smoothing (Fast gentle attack, very soft calming decay)
      const attackLerp = 0.045 * dt;
      const decayLerp = 0.020 * dt;
      const smoothStep = (curr: number, target: number) => {
        const factor = target > curr ? attackLerp : decayLerp;
        return curr + (target - curr) * factor;
      };

      smoothBassRef.current = smoothStep(smoothBassRef.current, rawBass);
      smoothEnergyRef.current = smoothStep(smoothEnergyRef.current, rawEnergy);

      // 4. Biological Cardiovascular 5.5-Second Coherent Breathing Wave
      const breathTime = timeNow * 0.00114;
      const breathWave = (Math.sin(breathTime) + 1) * 0.5; // 0 to 1

      // 5. Dynamic Pulse
      const targetPulse = (smoothBassRef.current * 0.42) + (breathWave * 0.32);
      smoothPulseRef.current += (targetPulse - smoothPulseRef.current) * (0.04 * dt);
      const dynamicPulse = 0.94 + (smoothPulseRef.current * 0.32);

      // 6. Smooth phase & celestial rotation
      const beatSpeed = (currentBrainwave.beatHz > 0 ? currentBrainwave.beatHz * 0.006 : 0.009) * dt;
      phaseRef.current += beatSpeed;
      rotationRef.current += 0.0011 * dt;

      const theme = palettes[colorPalette];
      const energy = smoothEnergyRef.current;
      const bassEnergy = smoothBassRef.current;
      const pulse = smoothPulseRef.current;

      // 7. Deep celestial ambient background radial glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(width, height) * 0.85);
      bgGrad.addColorStop(0, theme.bgGlow);
      bgGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.35)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 8. Render Selected Visualizer Mode
      switch (visualizerType) {
        case 'sacred_lotus':
          renderSacredLotus(ctx, cx, cy, energy, bassEnergy, pulse, dynamicPulse, phaseRef.current, breathWave, theme, baseFreq);
          break;
        case 'dreamy_nebula':
          renderDreamyNebula(ctx, cx, cy, energy, bassEnergy, pulse, dynamicPulse, phaseRef.current, breathWave, theme);
          break;
        case 'mandala':
          renderMandala(ctx, cx, cy, energy, bassEnergy, pulse, dynamicPulse, rotationRef.current, phaseRef.current, breathWave, theme);
          break;
        case 'ripples':
          renderRipples(ctx, cx, cy, energy, pulse, dynamicPulse, phaseRef.current, theme);
          break;
        case 'aurora':
          renderAurora(ctx, width, height, smoothedFft, energy, pulse, phaseRef.current, breathWave, theme);
          break;
        case 'flower_of_life':
          renderFlowerOfLife(ctx, cx, cy, energy, pulse, dynamicPulse, rotationRef.current, phaseRef.current, breathWave, theme);
          break;
        case 'cosmic_galaxy':
          renderCosmicGalaxy(ctx, cx, cy, energy, bassEnergy, pulse, dynamicPulse, rotationRef.current, phaseRef.current, theme);
          break;
        case 'cymatic_waves':
          renderCymaticWaves(ctx, width, height, smoothedFft, energy, pulse, phaseRef.current, theme);
          break;
        case 'pranic_orb':
          renderPranicOrb(ctx, cx, cy, energy, bassEnergy, pulse, dynamicPulse, phaseRef.current, breathWave, theme);
          break;
      }

      // Render Interactive Click Ripples
      renderInteractiveRipples(ctx, theme, dt);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    const resizeObserver = typeof ResizeObserver !== 'undefined' && canvas
      ? new ResizeObserver(() => {
          updateSize();
        })
      : null;
    if (resizeObserver && canvas) {
      resizeObserver.observe(canvas);
    }

    const handleRotationOrResize = () => {
      updateSize();
      setTimeout(updateSize, 80);
      setTimeout(updateSize, 250);
    };

    window.addEventListener('resize', handleRotationOrResize);
    window.addEventListener('orientationchange', handleRotationOrResize);
    window.screen?.orientation?.addEventListener?.('change', handleRotationOrResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleRotationOrResize);
      window.removeEventListener('orientationchange', handleRotationOrResize);
      window.screen?.orientation?.removeEventListener?.('change', handleRotationOrResize);
    };
  }, [isOpen, isPlaying, visualizerType, colorPalette, currentBrainwave]);

  // =========================================================================
  // DREAMY: CELESTIAL STARDUST NEBULA & ETHEREAL BIOLUMINESCENCE
  // =========================================================================
  const renderDreamyNebula = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    breathWave: number,
    theme: any
  ) => {
    const coreRadius = Math.min(cx, cy) * 0.36 * (1 + dynamicPulse * 0.2 + breathWave * 0.12);
    const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2.5);
    radGrad.addColorStop(0, 'rgba(168, 85, 247, 0.65)');
    radGrad.addColorStop(0.28, 'rgba(56, 189, 248, 0.45)');
    radGrad.addColorStop(0.58, 'rgba(236, 72, 153, 0.25)');
    radGrad.addColorStop(0.85, 'rgba(129, 140, 248, 0.12)');
    radGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');

    ctx.save();
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 12 Drifting Silk Ethereal Ribbon Waves
    const ribbonCount = 12;
    for (let i = 0; i < ribbonCount; i++) {
      const angleOffset = (i / ribbonCount) * Math.PI * 2 + phase * 0.14 * (i % 2 === 0 ? 1 : -1);
      const wavePhase = phase * 1.2 + i * 0.6;
      const rOuter = coreRadius * (1.25 + Math.sin(wavePhase) * 0.35 + bassEnergy * 0.45);
      const rInner = coreRadius * (0.35 + Math.cos(wavePhase * 0.8) * 0.15);

      ctx.beginPath();
      const cp1Angle = angleOffset + 0.4 + Math.sin(phase * 0.8 + i) * 0.2;
      const cp2Angle = angleOffset + 0.8 + Math.cos(phase * 0.6 + i) * 0.2;

      const x0 = cx + Math.cos(angleOffset) * rInner;
      const y0 = cy + Math.sin(angleOffset) * rInner;
      const x1 = cx + Math.cos(cp1Angle) * rOuter * 0.7;
      const y1 = cy + Math.sin(cp1Angle) * rOuter * 0.7;
      const x2 = cx + Math.cos(cp2Angle) * rOuter;
      const y2 = cy + Math.sin(cp2Angle) * rOuter;

      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(x1, y1, x2, y2, cx + Math.cos(angleOffset + Math.PI / ribbonCount) * rOuter * 0.9, cy + Math.sin(angleOffset + Math.PI / ribbonCount) * rOuter * 0.9);

      const alpha = 0.25 + Math.sin(phase * 2 + i) * 0.14;
      ctx.strokeStyle = i % 3 === 0
        ? `rgba(56, 189, 248, ${alpha})`
        : i % 3 === 1
        ? `rgba(192, 132, 252, ${alpha})`
        : `rgba(251, 191, 36, ${alpha * 0.85})`;
      ctx.lineWidth = 2.2 + Math.sin(phase + i) * 1.5;
      ctx.stroke();
    }

    // 64 Drifting Stardust Twinkles
    for (let s = 0; s < 64; s++) {
      const starSeed = s * 97.13;
      const starAngle = starSeed + phase * (0.05 + (s % 5) * 0.02) * (s % 2 === 0 ? 1 : -1);
      const orbitDist = ((starSeed % 100) / 100) * coreRadius * 2.0 + coreRadius * 0.2;
      const sx = cx + Math.cos(starAngle) * orbitDist;
      const sy = cy + Math.sin(starAngle) * orbitDist;

      const starPulse = (Math.sin(phase * 3 + s * 1.7) + 1) * 0.5;
      const starR = 1 + starPulse * 2.4;
      const starAlpha = 0.35 + starPulse * 0.65;

      const starGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, starR * 2.5);
      const isGold = s % 4 === 0;
      starGrad.addColorStop(0, isGold ? `rgba(254, 240, 138, ${starAlpha})` : `rgba(224, 242, 254, ${starAlpha})`);
      starGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, starR * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Sacred Core
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 0.4);
    centerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    centerGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
    centerGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
    centerGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 0.4 * (1 + dynamicPulse * 0.2), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // =========================================================================
  // 0. OFFICIAL: AURA 432Hz SACRED CYMATIC LOTUS (Iconic Bioluminescent Flower)
  // =========================================================================
  const renderSacredLotus = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    breathWave: number,
    theme: any,
    frequencyHz: number
  ) => {
    // Dynamic sizing based on viewport
    const medallionR = Math.min(cx, cy) * 0.72;
    ctx.save();

    // 1. Deep Cosmic Obsidian Base Disc
    const bgGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, medallionR * 1.05);
    bgGrad.addColorStop(0, '#11172f');
    bgGrad.addColorStop(0.55, '#0a0d1b');
    bgGrad.addColorStop(1, '#05070e');
    ctx.beginPath();
    ctx.arc(cx, cy, medallionR, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // 2. Outer Luminous Neon Gradient Ring (Cyan -> Lavender -> Warm Amber)
    const tonePulse = Math.min(1.0, bassEnergy * 1.6 + energy * 0.85);
    const ringR = medallionR * (0.91 + tonePulse * 0.03);
    const ringGrad = ctx.createLinearGradient(
      cx - ringR * 0.85,
      cy - ringR * 0.85,
      cx + ringR * 0.85,
      cy + ringR * 0.85
    );
    ringGrad.addColorStop(0, 'rgba(34, 211, 238, 0.95)');
    ringGrad.addColorStop(0.35, 'rgba(96, 165, 250, 0.85)');
    ringGrad.addColorStop(0.65, 'rgba(192, 132, 252, 0.9)');
    ringGrad.addColorStop(0.9, 'rgba(251, 191, 36, 0.95)');
    ringGrad.addColorStop(1, 'rgba(254, 240, 138, 0.95)');

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 4 + tonePulse * 2.6;
    ctx.shadowBlur = 18 + tonePulse * 24;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.85)';
    ctx.stroke();
    ctx.restore();

    // 3. Inner Glowing Concentric Ring
    const innerR = ringR * 0.875;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    const innerGrad = ctx.createLinearGradient(
      cx - innerR * 0.7,
      cy + innerR * 0.7,
      cx + innerR * 0.7,
      cy - innerR * 0.7
    );
    innerGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    innerGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.75)');
    innerGrad.addColorStop(1, 'rgba(253, 224, 71, 0.85)');
    ctx.strokeStyle = innerGrad;
    ctx.lineWidth = 2 + tonePulse * 1.3;
    ctx.shadowBlur = 8 + tonePulse * 14;
    ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
    ctx.stroke();
    ctx.restore();

    // 4. Center Bioluminescent Haze Bloom (Expands dynamically with Tone & Bass)
    const bloomR = innerR * (0.64 + tonePulse * 0.45);
    const bloomGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, bloomR);
    bloomGrad.addColorStop(0, `rgba(34, 211, 238, ${0.48 + tonePulse * 0.35})`);
    bloomGrad.addColorStop(0.45, `rgba(129, 140, 248, ${0.25 + tonePulse * 0.2})`);
    bloomGrad.addColorStop(0.8, `rgba(245, 158, 11, ${0.12 + tonePulse * 0.12})`);
    bloomGrad.addColorStop(1, 'rgba(10, 13, 27, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
    ctx.fillStyle = bloomGrad;
    ctx.fill();

    // 5. THE SACRED CYMATIC WIREFRAME LOTUS FLOWER (Centered & Fills the Circle)
    // In logo coordinates, width is 104 (x: 48..152, half=52) and vertical center is 84 (y: 48..120).
    const pulseScale = 1.0 + (tonePulse * 0.18) + (Math.sin(phase * 1.8) * 0.035);
    const lotusScale = ((innerR * 0.95) / 52) * pulseScale;

    const toCanvas = (lx: number, ly: number): [number, number] => {
      const offsetX = (lx - 100) * lotusScale;
      const offsetY = (ly - 84) * lotusScale;
      return [cx + offsetX, cy + offsetY];
    };

    // Helper to draw a cymatic wireframe petal with interior striated lines
    const drawCymaticPetal = (
      points: [number, number][],
      fillColor: string,
      strokeColor: string,
      veinColor: string,
      veins: [number, number][][],
      wavePhaseOffset: number
    ) => {
      ctx.save();
      ctx.beginPath();
      const [startPt, ...restPts] = points.map(([px, py]) => toCanvas(px, py));
      ctx.moveTo(startPt[0], startPt[1]);

      for (let i = 0; i < restPts.length; i += 3) {
        if (i + 2 < restPts.length) {
          ctx.bezierCurveTo(
            restPts[i][0],
            restPts[i][1],
            restPts[i + 1][0],
            restPts[i + 1][1],
            restPts[i + 2][0],
            restPts[i + 2][1]
          );
        } else {
          ctx.lineTo(restPts[i][0], restPts[i][1]);
        }
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.35 + pulse * 0.4;
      ctx.shadowBlur = 8 + pulse * 8;
      ctx.shadowColor = strokeColor;
      ctx.stroke();

      // Interior striated acoustic filament veins
      ctx.shadowBlur = 0;
      veins.forEach((vein, vIdx) => {
        const cVein = vein.map(([vx, vy]) => toCanvas(vx, vy));
        if (cVein.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(cVein[0][0], cVein[0][1]);

        // Audio acoustic wave undulation on vein directly pulsing with Tone & Harmonics
        const undulation = Math.sin(phase * 3.4 + wavePhaseOffset + vIdx * 0.75) * (1.8 + tonePulse * 5.0);

        if (cVein.length === 2) {
          const midX = (cVein[0][0] + cVein[1][0]) / 2 + undulation;
          const midY = (cVein[0][1] + cVein[1][1]) / 2;
          ctx.quadraticCurveTo(midX, midY, cVein[1][0], cVein[1][1]);
        } else if (cVein.length === 3) {
          ctx.bezierCurveTo(
            cVein[1][0] + undulation,
            cVein[1][1],
            cVein[2][0] + undulation,
            cVein[2][1],
            cVein[2][0],
            cVein[2][1]
          );
        }
        ctx.strokeStyle = veinColor;
        ctx.lineWidth = 0.85 + tonePulse * 0.55;
        ctx.stroke();
      });
      ctx.restore();
    };

    // --- BASE HEART SEPAL NODE ---
    ctx.save();
    ctx.beginPath();
    const [b1x, b1y] = toCanvas(100, 120);
    const [b2x, b2y] = toCanvas(93, 120);
    const [b3x, b3y] = toCanvas(89, 113);
    const [b4x, b4y] = toCanvas(93, 108);
    const [b5x, b5y] = toCanvas(96, 104);
    const [b6x, b6y] = toCanvas(100, 109);
    const [b7x, b7y] = toCanvas(104, 104);
    const [b8x, b8y] = toCanvas(107, 108);
    const [b9x, b9y] = toCanvas(111, 113);
    const [b10x, b10y] = toCanvas(107, 120);
    ctx.moveTo(b1x, b1y);
    ctx.bezierCurveTo(b2x, b2y, b3x, b3y, b4x, b4y);
    ctx.bezierCurveTo(b5x, b5y, b6x, b6y, b6x, b6y);
    ctx.bezierCurveTo(b6x, b6y, b7x, b7y, b8x, b8y);
    ctx.bezierCurveTo(b9x, b9y, b10x, b10y, b1x, b1y);
    ctx.fillStyle = `rgba(34, 211, 238, ${0.3 + pulse * 0.15})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.9 + pulse * 0.15})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    const [bs1x, bs1y] = toCanvas(97, 116);
    const [bs2x, bs2y] = toCanvas(103, 116);
    ctx.beginPath();
    ctx.moveTo(bs1x, bs1y);
    ctx.quadraticCurveTo(b6x, b6y + 2, b6x, b6y);
    ctx.moveTo(bs2x, bs2y);
    ctx.quadraticCurveTo(b6x, b6y + 2, b6x, b6y);
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.8 + pulse * 0.2})`;
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();

    // --- TIER 4: LOWEST LATERAL WING PETALS ---
    drawCymaticPetal(
      [[100, 113], [82, 114], [62, 108], [50, 99], [64, 96], [82, 103], [100, 113]],
      `rgba(34, 211, 238, ${0.15 + pulse * 0.08})`,
      '#22d3ee',
      `rgba(56, 189, 248, ${0.75 + pulse * 0.2})`,
      [[[100, 113], [77, 106], [54, 100]], [[100, 113], [81, 108], [60, 102]]],
      0.1
    );

    drawCymaticPetal(
      [[100, 113], [118, 114], [138, 108], [150, 99], [136, 96], [118, 103], [100, 113]],
      `rgba(252, 211, 77, ${0.15 + pulse * 0.08})`,
      '#fbbf24',
      `rgba(253, 224, 71, ${0.75 + pulse * 0.2})`,
      [[[100, 113], [123, 106], [146, 100]], [[100, 113], [119, 108], [140, 102]]],
      0.2
    );

    // --- TIER 3: MID HORIZONTAL BLOOMING PETALS ---
    drawCymaticPetal(
      [[100, 112], [78, 111], [58, 98], [48, 84], [64, 83], [83, 95], [100, 112]],
      `rgba(56, 189, 248, ${0.18 + pulse * 0.1})`,
      '#38bdf8',
      `rgba(34, 211, 238, ${0.8 + pulse * 0.2})`,
      [
        [[100, 112], [76, 98], [52, 86]],
        [[100, 112], [79, 101], [58, 90]],
        [[100, 112], [84, 105], [66, 94]],
      ],
      0.3
    );

    drawCymaticPetal(
      [[100, 112], [122, 111], [142, 98], [152, 84], [136, 83], [117, 95], [100, 112]],
      `rgba(252, 211, 77, ${0.18 + pulse * 0.1})`,
      '#fde047',
      `rgba(254, 240, 138, ${0.8 + pulse * 0.2})`,
      [
        [[100, 112], [124, 98], [148, 86]],
        [[100, 112], [121, 101], [142, 90]],
        [[100, 112], [116, 105], [134, 94]],
      ],
      0.4
    );

    // --- TIER 2: BROAD MID-UPPER ARCHING PETALS ---
    drawCymaticPetal(
      [[100, 111], [76, 104], [58, 84], [62, 66], [76, 72], [90, 92], [100, 111]],
      `rgba(129, 140, 248, ${0.2 + pulse * 0.1})`,
      '#818cf8',
      `rgba(129, 140, 248, ${0.85 + pulse * 0.15})`,
      [
        [[100, 111], [79, 88], [65, 69]],
        [[100, 111], [83, 92], [70, 74]],
        [[100, 111], [88, 97], [78, 81]],
      ],
      0.5
    );

    drawCymaticPetal(
      [[100, 111], [124, 104], [142, 84], [138, 66], [124, 72], [110, 92], [100, 111]],
      `rgba(252, 211, 77, ${0.22 + pulse * 0.1})`,
      '#fde047',
      `rgba(254, 240, 138, ${0.85 + pulse * 0.15})`,
      [
        [[100, 111], [121, 88], [135, 69]],
        [[100, 111], [117, 92], [130, 74]],
        [[100, 111], [112, 97], [122, 81]],
      ],
      0.6
    );

    // --- TIER 1: INNER FLANKING ASCENDING PETALS ---
    drawCymaticPetal(
      [[100, 110], [84, 96], [76, 74], [81, 54], [91, 63], [97, 86], [100, 110]],
      `rgba(56, 189, 248, ${0.26 + pulse * 0.12})`,
      '#38bdf8',
      `rgba(34, 211, 238, ${0.9 + pulse * 0.1})`,
      [
        [[100, 110], [88, 82], [82, 56]],
        [[100, 110], [91, 86], [86, 62]],
        [[100, 110], [95, 90], [91, 70]],
      ],
      0.7
    );

    drawCymaticPetal(
      [[100, 110], [116, 96], [124, 74], [119, 54], [109, 63], [103, 86], [100, 110]],
      `rgba(252, 211, 77, ${0.26 + pulse * 0.12})`,
      '#fde047',
      `rgba(254, 240, 138, ${0.9 + pulse * 0.1})`,
      [
        [[100, 110], [112, 82], [118, 56]],
        [[100, 110], [109, 86], [114, 62]],
        [[100, 110], [105, 90], [109, 70]],
      ],
      0.8
    );

    // --- TIER 0: CENTRAL MAJESTIC CROWN PETAL ---
    drawCymaticPetal(
      [[100, 109], [89, 88], [88, 66], [100, 48], [112, 66], [111, 88], [100, 109]],
      `rgba(34, 211, 238, ${0.3 + pulse * 0.15})`,
      '#22d3ee',
      '#fef08a',
      [
        [[100, 109], [100, 49]],
        [[100, 109], [95, 78], [100, 50]],
        [[100, 109], [105, 78], [100, 50]],
        [[100, 109], [92, 81], [99, 53]],
        [[100, 109], [108, 81], [101, 53]],
      ],
      0.9
    );

    // Crown Chakra Radiant Transcendence Jewel at Apex (Pulses dynamically with Tone)
    const [apexX, apexY] = toCanvas(100, 48);
    ctx.save();
    ctx.beginPath();
    ctx.arc(apexX, apexY, 3.4 + tonePulse * 2.4, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.shadowBlur = 14 + tonePulse * 18;
    ctx.shadowColor = '#fde047';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(apexX, apexY, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // 6. Floating Celestial Stardust Embers (Dancing with Treble & Tone Harmonics)
    const stardustCount = 18;
    for (let s = 0; s < stardustCount; s++) {
      const sAngle = (s * Math.PI * 2) / stardustCount + phase * 0.22;
      const sRadius = innerR * (0.85 + Math.sin(phase * 1.4 + s) * 0.12 + tonePulse * 0.08);
      const sx = cx + Math.cos(sAngle) * sRadius;
      const sy = cy + Math.sin(sAngle) * (sRadius * 0.82);
      const sAlpha = 0.2 + Math.sin(phase * 1.5 + s) * 0.2 + energy * 0.4 + tonePulse * 0.25;

      ctx.beginPath();
      ctx.arc(sx, sy, 1.4 + energy * 1.8 + tonePulse * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = s % 2 === 0
        ? `rgba(254, 240, 138, ${Math.max(0, Math.min(1, sAlpha))})`
        : `rgba(56, 189, 248, ${Math.max(0, Math.min(1, sAlpha))})`;
      ctx.fill();
    }

    ctx.restore();
  };

  // 1. Sacred Mandala
  const renderMandala = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    pulse: number,
    dynamicPulse: number,
    rotation: number,
    phase: number,
    breathWave: number,
    theme: any
  ) => {
    const maxR = Math.min(cx, cy) * 0.84;
    const baseBreath = Math.sin(phase * 0.7) * 4;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    const petals = 12; // 12 * 36 = 432
    const r1 = (42 + baseBreath + bassEnergy * 35) * dynamicPulse;
    const r2 = (130 + baseBreath * 1.2 + energy * 50) * dynamicPulse;

    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      const x1 = Math.cos(angle) * r1;
      const y1 = Math.sin(angle) * r1;
      const midAngle = angle + Math.PI / petals;
      const x2 = Math.cos(midAngle) * r2;
      const y2 = Math.sin(midAngle) * r2;

      ctx.beginPath();
      ctx.strokeStyle = i % 2 === 0 ? theme.primary : theme.tertiary;
      ctx.globalAlpha = 0.42 + pulse * 0.25;
      ctx.lineWidth = 1.6 + pulse * 0.6;
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(x2 * 1.2, y2 * 1.2, 0, 0);
      ctx.stroke();

      // Interlocking Sacred Circles
      ctx.beginPath();
      ctx.strokeStyle = theme.secondary;
      ctx.globalAlpha = 0.22 + pulse * 0.15;
      ctx.lineWidth = 1.0;
      ctx.arc(x1, y1, r1 * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer Concentric Rings
    ctx.beginPath();
    ctx.strokeStyle = theme.primary;
    ctx.globalAlpha = 0.26 + pulse * 0.18;
    ctx.lineWidth = 1.4;
    ctx.arc(0, 0, maxR * 0.88, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = theme.secondary;
    ctx.globalAlpha = 0.18 + pulse * 0.12;
    ctx.arc(0, 0, maxR * 0.58, 0, Math.PI * 2);
    ctx.stroke();

    // Central Warm Golden Bindu
    const coreR = Math.max(8, (24 + baseBreath + pulse * 8) * (0.95 + breathWave * 0.1));
    ctx.beginPath();
    const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, coreR);
    coreGrad.addColorStop(0, '#fef08a');
    coreGrad.addColorStop(0.4, theme.primary);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.globalAlpha = 0.85;
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1.0;
  };

  // 2. Cymatic Water Ripples
  const renderRipples = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    energy: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    theme: any
  ) => {
    const maxR = Math.min(cx, cy) * 0.88;
    const rings = 9;

    for (let i = 0; i < rings; i++) {
      const rawProgress = ((phase * 0.7 + i / rings) % 1);
      const radius = Math.pow(rawProgress, 0.88) * maxR * dynamicPulse;
      const alpha = Math.sin(rawProgress * Math.PI) * (0.35 + energy * 0.3 + pulse * 0.18);

      if (radius > 4 && radius < maxR * 1.05) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? theme.primary : theme.secondary;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.lineWidth = 1.4 + (1 - radius / maxR) * (2 + pulse * 1.2);
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 8;
        ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  };

  // 3. Flowing Boreal Aurora Spectrum (Silky Flowing Bezier Ribbons)
  const renderAurora = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    smoothedFft: Float32Array,
    energy: number,
    pulse: number,
    phase: number,
    breathWave: number,
    theme: any
  ) => {
    const ribbons = 3;
    const points = 32;
    const step = width / (points - 1);
    const baseHeight = height * 0.58;

    for (let r = 0; r < ribbons; r++) {
      ctx.beginPath();
      const rPhase = phase * 0.75 + r * 1.35;
      const amp = (32 + r * 18 + energy * 40 + pulse * 20) * (0.95 + breathWave * 0.1);

      ctx.moveTo(0, height);
      ctx.lineTo(0, baseHeight);

      let prevX = 0;
      let prevY = baseHeight;

      for (let i = 0; i < points; i++) {
        const x = i * step;
        const freqIdx = Math.min(63, Math.floor((i / points) * 32));
        const freqVal = smoothedFft[freqIdx] || 0.1;
        // Dual harmonic wave creates true organic silk drape
        const wave = Math.sin((i * 0.22) + rPhase) * amp + Math.sin((i * 0.44) - rPhase * 0.7) * (amp * 0.35);
        const y = baseHeight + wave - (freqVal * 24);

        if (i === 0) {
          ctx.lineTo(x, y);
          prevX = x;
          prevY = y;
        } else {
          const cpX = (prevX + x) / 2;
          const cpY = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
          prevX = x;
          prevY = y;
        }
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, baseHeight - amp * 1.3, 0, height);
      if (r === 0) {
        grad.addColorStop(0, theme.primary);
        grad.addColorStop(0.65, theme.secondary);
        grad.addColorStop(1, 'transparent');
      } else if (r === 1) {
        grad.addColorStop(0, theme.secondary);
        grad.addColorStop(0.65, theme.tertiary);
        grad.addColorStop(1, 'transparent');
      } else {
        grad.addColorStop(0, theme.tertiary);
        grad.addColorStop(0.65, theme.primary);
        grad.addColorStop(1, 'transparent');
      }

      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.36 + pulse * 0.18;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  };

  // 4. Sacred Flower of Life
  const renderFlowerOfLife = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    energy: number,
    pulse: number,
    dynamicPulse: number,
    rotation: number,
    phase: number,
    breathWave: number,
    theme: any
  ) => {
    const unitR = (50 + Math.sin(phase * 0.6) * 4 + energy * 18) * (0.97 + breathWave * 0.06);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation * 0.3);

    // Center sphere
    ctx.beginPath();
    ctx.arc(0, 0, unitR, 0, Math.PI * 2);
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.55 + pulse * 0.2;
    ctx.stroke();

    // 6 surrounding primary nodes
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const nx = Math.cos(angle) * unitR;
      const ny = Math.sin(angle) * unitR;

      ctx.beginPath();
      ctx.arc(nx, ny, unitR, 0, Math.PI * 2);
      ctx.strokeStyle = theme.secondary;
      ctx.globalAlpha = 0.45 + pulse * 0.18;
      ctx.stroke();

      // Glowing nexus bindu point
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = theme.primary;
      ctx.globalAlpha = 0.8;
      ctx.fill();

      // Outer tier of nodes
      for (let j = 0; j < 6; j++) {
        const a2 = (j * Math.PI) / 3;
        const ox = nx + Math.cos(a2) * unitR;
        const oy = ny + Math.sin(a2) * unitR;
        ctx.beginPath();
        ctx.arc(ox, oy, unitR, 0, Math.PI * 2);
        ctx.strokeStyle = theme.tertiary;
        ctx.globalAlpha = 0.26 + pulse * 0.12;
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1.0;
  };

  // 5. Cosmic Fibonacci Galaxy
  const renderCosmicGalaxy = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    pulse: number,
    dynamicPulse: number,
    rotation: number,
    phase: number,
    theme: any
  ) => {
    const maxR = Math.min(cx, cy) * 0.88;
    const totalStars = 140;
    const arms = 3;

    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < totalStars; i++) {
      const armIdx = i % arms;
      const progress = i / totalStars;
      const dist = progress * maxR * dynamicPulse;

      const armAngle = (armIdx * Math.PI * 2) / arms;
      const spiralAngle = armAngle + progress * 3.8 + rotation * 1.3;

      const px = Math.cos(spiralAngle) * dist;
      const py = Math.sin(spiralAngle) * dist;

      // Soft sinusoidal twinkling
      const twinkle = (0.75 + 0.25 * Math.sin(i * 4.3 + phase * 1.5));
      const starSize = (1 - progress * 0.3) * (1.6 + (i % 2) * 0.8 + energy * 1.4 + pulse * 1.2) * twinkle;
      const alpha = (1 - progress * 0.55) * (0.34 + energy * 0.25 + pulse * 0.2) * twinkle;

      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.6, starSize), 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? theme.primary : theme.secondary;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1.0;
  };

  // 6. Cymatic Harmonic Sine Oscilloscope Waves (Silky Bezier Ribbons)
  const renderCymaticWaves = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    smoothedFft: Float32Array,
    energy: number,
    pulse: number,
    phase: number,
    theme: any
  ) => {
    const centerY = height / 2;
    const waveCount = 3;

    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      const waveFreq = (w + 1) * 0.004;
      const amp = 30 + w * 18 + energy * 40 + pulse * 20;
      const wPhase = phase * (0.8 + w * 0.18);

      let prevX = 0;
      let prevY = centerY + Math.sin(wPhase) * amp;
      ctx.moveTo(prevX, prevY);

      for (let x = 8; x <= width; x += 8) {
        const audioIdx = Math.min(63, Math.floor((x / width) * 28));
        const audioVal = smoothedFft[audioIdx] || 0.1;
        const targetY = centerY + Math.sin(x * waveFreq + wPhase) * amp * (0.85 + audioVal * 0.35);
        const midX = (prevX + x) / 2;
        const midY = (prevY + targetY) / 2;
        ctx.quadraticCurveTo(prevX, prevY, midX, midY);
        prevX = x;
        prevY = targetY;
      }

      ctx.strokeStyle = w === 0 ? theme.primary : w === 1 ? theme.secondary : theme.tertiary;
      ctx.lineWidth = 2.0 + pulse * 0.8;
      ctx.globalAlpha = 0.55 + pulse * 0.2;
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  };

  // 7. Pranic Breathing Orb
  const renderPranicOrb = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    breathWave: number,
    theme: any
  ) => {
    const baseR = (100 + Math.sin(phase * 0.6) * 30 + bassEnergy * 40 + breathWave * 20) * dynamicPulse;

    // Outer luminous halo
    const haloGrad = ctx.createRadialGradient(cx, cy, baseR * 0.25, cx, cy, baseR * 2.0);
    haloGrad.addColorStop(0, theme.primary);
    haloGrad.addColorStop(0.45, theme.secondary);
    haloGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = haloGrad;
    ctx.globalAlpha = 0.35 + pulse * 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR * 2.0, 0, Math.PI * 2);
    ctx.fill();

    // Core pulsing orb
    const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, baseR);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, theme.primary);
    coreGrad.addColorStop(0.75, theme.secondary);
    coreGrad.addColorStop(1, 'rgba(15, 23, 42, 0.2)');

    ctx.fillStyle = coreGrad;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 14 + pulse * 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 1.0;
  };

  // Render Interactive Click Ripples
  const renderInteractiveRipples = (ctx: CanvasRenderingContext2D, theme: any, dt: number) => {
    const activeRipples = ripplesRef.current;
    for (let i = activeRipples.length - 1; i >= 0; i--) {
      const r = activeRipples[i];
      r.radius += 3.5 * dt;
      r.alpha -= 0.015 * dt;

      if (r.alpha <= 0) {
        activeRipples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = theme.primary;
      ctx.globalAlpha = r.alpha;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  };

  if (!isOpen) return null;

  return (
    <div
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden transition-all select-none ${
        !controlsVisible ? 'cursor-none' : ''
      }`}
    >
      {/* Interactive Background Canvas with Full Swipe Support (Desktop, Mobile, Tablet) */}
      <div
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0 touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleWheel}
        style={{ touchAction: 'pan-y' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block pointer-events-none"
        />
      </div>

      {/* Floating Swipe Direction Feedback Indicator */}
      {swipeFeedback && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-950/90 backdrop-blur-2xl border border-sky-400/50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <span className="text-sm text-sky-400 font-bold">
            {swipeFeedback.direction === 'left' ? '→' : '←'}
          </span>
          <span className="text-xs font-semibold text-white tracking-wider uppercase">
            {swipeFeedback.name}
          </span>
        </div>
      )}

      {/* Floating Left/Right Ambient Mode Navigation Chevrons */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          switchToNextVisualizer('prev');
        }}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-sky-300 backdrop-blur-xl shadow-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
          controlsVisible ? 'opacity-80 hover:opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        title="Previous Visualizer Pattern (Swipe Right)"
        aria-label="Previous Visualizer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          switchToNextVisualizer('next');
        }}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-sky-300 backdrop-blur-xl shadow-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
          controlsVisible ? 'opacity-80 hover:opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        title="Next Visualizer Pattern (Swipe Left)"
        aria-label="Next Visualizer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Floating Center Frequency Overlay Indicator */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center"
      >
        <span
          className="text-6xl md:text-8xl font-extralight tracking-widest drop-shadow-2xl transition-all"
          style={{ color: currentTheme.primary }}
        >
          {baseFreq}
          <span className="text-2xl md:text-3xl font-light ml-1 opacity-80">Hz</span>
        </span>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs md:text-sm uppercase tracking-widest text-slate-300 font-semibold drop-shadow-md">
            {solfeggioShortName}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs md:text-sm text-slate-400 font-medium drop-shadow-md">
            {currentBrainwave.name}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2 opacity-60">
          Swipe left/right to switch pattern • Tap for acoustic ripple
        </div>
      </div>

      {/* TOP FLOATING HUD BAR */}
      <div
        className={`relative z-20 w-full max-w-6xl mx-auto p-4 flex items-center justify-between gap-3 transition-all duration-500 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* App Title Badge */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 px-2.5 sm:px-3.5 py-1.5 rounded-2xl shadow-xl min-w-0">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-ping shrink-0" style={{ backgroundColor: currentTheme.primary }} />
          <span className="text-[11px] sm:text-xs font-semibold text-slate-200 truncate">
            <span className="hidden sm:inline">Aura 432Hz Ambient Sanctuary</span>
            <span className="sm:hidden">Aura 432Hz</span>
          </span>
          <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${currentTheme.badgeBg}`}>
            Zen
          </span>
        </div>

        {/* Top Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Palette Color Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPaletteMenu(!showPaletteMenu)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-xl border border-slate-800 text-slate-300 hover:text-white transition-colors shadow-lg flex items-center gap-1.5 text-xs"
              title="Change Ambient Color Atmosphere"
            >
              <Palette className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline text-xs">{currentTheme.name}</span>
            </button>

            {showPaletteMenu && (
              <div className="absolute right-0 mt-2 p-2 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl space-y-1 w-48 animate-in fade-in z-30">
                <div className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1">
                  Lighting Atmosphere
                </div>
                {(Object.keys(palettes) as AmbientColorPalette[]).map((key) => {
                  const p = palettes[key];
                  const isCur = colorPalette === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setColorPalette(key);
                        setShowPaletteMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                        isCur ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: p.primary }}
                        />
                        <span>{p.name}</span>
                      </div>
                      {isCur && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Volume Normalization Toggle */}
          <button
            onClick={onToggleVolumeNormalized ? onToggleVolumeNormalized : () => {}}
            className={`p-2 sm:p-2.5 rounded-xl backdrop-blur-xl border transition-colors shadow-lg flex items-center gap-1.5 text-xs ${
              isVolumeNormalized
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
            title={isVolumeNormalized ? 'EBU R128 Volume Normalization: Active (Equal Loudness)' : 'Volume Normalization: Off (Raw Dynamics)'}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">{isVolumeNormalized ? 'Auto-Level' : 'Raw'}</span>
          </button>

          {/* Sleep Timer */}
          <button
            onClick={onOpenTimerModal}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-xl border border-slate-800 text-slate-300 hover:text-indigo-400 transition-colors shadow-lg flex items-center gap-1.5 text-xs"
            title="Set Sleep Timer"
          >
            <Timer className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">
              {timerSecondsRemaining !== null
                ? `${Math.floor(timerSecondsRemaining / 60)}m left`
                : 'Timer'}
            </span>
          </button>

          {/* Browser Fullscreen Toggle */}
          <button
            onClick={toggleBrowserFullscreen}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-xl border border-slate-800 text-slate-300 hover:text-white transition-colors shadow-lg"
            title={isBrowserFullscreen ? 'Exit Screen Fullscreen' : 'Enter Fullscreen'}
          >
            {isBrowserFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Ambient Mode */}
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-rose-950/60 backdrop-blur-xl border border-slate-800 hover:border-rose-600/40 text-slate-300 hover:text-rose-300 transition-colors shadow-lg"
            title="Exit Ambient Mode (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM FLOATING CONTROL DOCK */}
      <div
        className={`relative z-20 w-full max-w-4xl mx-auto p-4 flex flex-col items-center gap-3 transition-all duration-500 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        {/* Visualizer Mode Switcher Pill (Fully responsive wrap on mobile/tablet) */}
        <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-800/80 p-1 rounded-2xl shadow-2xl flex flex-wrap items-center justify-center gap-1 max-w-full">
          {AMBIENT_VISUALIZER_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setVisualizerType(mode.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                visualizerType === mode.id
                  ? 'bg-gradient-to-r from-aurora-teal/25 to-cosmic-lavender/25 text-white border border-aurora-teal/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>

        {/* Primary Controls Island */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 px-3 sm:px-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 w-full">
          {/* Mobile Top Row / Desktop Left */}
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            {/* Big Play / Pause Primary Action */}
            <button
              onClick={onTogglePlay}
              className={`flex-1 sm:flex-none px-4 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30'
                  : 'bg-gradient-to-r from-aurora-teal via-teal-300 to-cosmic-lavender hover:opacity-95 text-midnight shadow-aurora-teal/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause {baseFreq}Hz</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-midnight" />
                  <span className="text-midnight">Begin {baseFreq}Hz</span>
                </>
              )}
            </button>
          </div>

          {/* Solfeggio Quick Frequency Selector Chips (Wrap cleanly) */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center pb-0.5">
            {SOLFEGGIO_FREQUENCIES.map((s) => {
              const isSelected = baseFreq === s.freq;
              return (
                <button
                  key={s.freq}
                  onClick={() => onSelectBaseFreq(s.freq)}
                  className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-cosmic-lavender/25 border border-cosmic-lavender/60 text-cosmic-lavender shadow-sm font-semibold'
                      : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                  title={`${s.name} • Recommended: ${s.recommendedBreath.patternName}`}
                >
                  {s.freq}Hz
                </button>
              );
            })}
          </div>

          {/* Recommended Breathwork Pill in Ambient Mode */}
          {currentSolfeggio?.recommendedBreath && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cosmic-lavender/15 border border-cosmic-lavender/30 text-cosmic-lavender text-[11px]">
              <span className="text-amber-400">💨</span>
              <span className="font-semibold">{currentSolfeggio.recommendedBreath.patternName}</span>
              <span className="text-slate-400 text-[10px]">({currentSolfeggio.recommendedBreath.ratio})</span>
            </div>
          )}

          {/* Master Volume Slider */}
          <div className="flex items-center gap-2 min-w-[120px] hidden md:flex">
            <Volume2 className="w-3.5 h-3.5 text-aurora-teal" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onChangeMasterVolume(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-aurora-teal"
              title="Master Volume"
            />
          </div>
        </div>

        {/* Ambient Sound Layers Quick Chips (Wrap cleanly) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full pb-1">
          <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Nature Sounds:</span>
          {natureSounds.slice(0, 6).map((sound) => (
            <button
              key={sound.id}
              onClick={() => onToggleNatureSound(sound.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                sound.enabled
                  ? 'bg-aurora-teal/20 border border-aurora-teal/50 text-aurora-teal shadow-sm'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sound.enabled ? 'bg-aurora-teal animate-pulse' : 'bg-slate-600'}`} />
              <span>{sound.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="text-[10px] text-slate-400 text-center">
          Space: Play/Pause • H: Toggle Controls • Esc: Exit Ambient Sanctuary
        </div>
      </div>
    </div>
  );
};
