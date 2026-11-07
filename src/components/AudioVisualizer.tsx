import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Check,
  Moon,
  Sun,
  Eye,
  Heart,
  Sliders,
  Gauge,
  Play,
  Pause,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface AudioVisualizerProps {
  isPlaying: boolean;
  baseFreq: number;
  alphaBeatHz: number;
  brainwaveName?: string;
  isLight?: boolean;
  onOpenAmbientMode?: () => void;
  onTogglePlay?: () => void;
  isMusicalMode?: boolean;
}

export type VisualizerMode =
  | 'sacred_lotus'
  | 'dreamy_nebula'
  | 'celestial_sri_yantra'
  | 'mandala'
  | 'flower_of_life'
  | 'aurora'
  | 'cosmic_galaxy'
  | 'ripples'
  | 'pranic_orb';

export type VisualComfortPreset = 'zen' | 'harmony' | 'glow';
export type MotionFlowSpeed = 0.75 | 1.0 | 1.3;
export type AnyCanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export const VISUALIZER_MODES: { id: VisualizerMode; label: string; desc: string }[] = [
  { id: 'sacred_lotus', label: 'Sacred Lotus', desc: 'Bioluminescent 432Hz Emblem' },
  { id: 'dreamy_nebula', label: 'Dreamy Stardust', desc: 'Celestial Stardust Cloud' },
  { id: 'celestial_sri_yantra', label: 'Sri Yantra', desc: 'Sacred Golden Triangles' },
  { id: 'mandala', label: 'Mandala', desc: 'Harmonic Lotus Geometry' },
  { id: 'flower_of_life', label: 'Flower of Life', desc: 'Ancient Golden Matrix' },
  { id: 'aurora', label: 'Aurora', desc: 'Harmonic Light Ribbons' },
  { id: 'cosmic_galaxy', label: 'Galaxy', desc: 'Spiral Stardust Vortex' },
  { id: 'ripples', label: 'Ripples', desc: 'Cymatic Acoustic Waves' },
  { id: 'pranic_orb', label: 'Pranic Orb', desc: 'Biofield Pulse Sphere' },
];

export const COMFORT_PRESETS: { id: VisualComfortPreset; label: string; desc: string; icon: string }[] = [
  { id: 'zen', label: 'Deep Zen', desc: 'Velvet soft for sleep & rest', icon: '🌙' },
  { id: 'harmony', label: 'Harmonic Flow', desc: '5.5s breath coherence', icon: '✨' },
  { id: 'glow', label: 'Celestial Glow', desc: 'Luminous warm biofield', icon: '☀️' },
];

export const FLOW_SPEEDS: { id: MotionFlowSpeed; label: string; desc: string }[] = [
  { id: 0.75, label: 'Tranquil (0.75x)', desc: 'Ultra-slow meditative drift for sleep' },
  { id: 1.0, label: 'Harmonic (1.0x)', desc: 'Natural 5.5s breath coherence' },
  { id: 1.3, label: 'Resonant (1.3x)', desc: 'Fluid biophilic flow' },
];

interface TouchRipple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
}

const AudioVisualizerComponent: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  baseFreq,
  alphaBeatHz,
  brainwaveName,
  isLight,
  onOpenAmbientMode,
  onTogglePlay,
  isMusicalMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('sacred_lotus');
  const [comfortPreset, setComfortPreset] = useState<VisualComfortPreset>('harmony');
  const [flowSpeed, setFlowSpeed] = useState<MotionFlowSpeed>(1.0);
  const [showModePicker, setShowModePicker] = useState<boolean>(false);
  const [showComfortMenu, setShowComfortMenu] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const [padBloomState, setPadBloomState] = useState<{ isPeak: boolean; peakBloom: number }>({ isPeak: false, peakBloom: 0 });
  const lastBloomUpdateRef = useRef<number>(0);

  const effectiveIsLight = isLight ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('theme-light'));

  // Memoized current visualizer mode info (eliminates O(N) array search on every frame/render)
  const currentModeInfo = useMemo(() => {
    const curIdx = VISUALIZER_MODES.findIndex((m) => m.id === mode);
    const resolvedIdx = curIdx >= 0 ? curIdx : 0;
    const currentMode = VISUALIZER_MODES[resolvedIdx] || VISUALIZER_MODES[0];
    return {
      mode: currentMode,
      index: resolvedIdx,
      displayNumber: resolvedIdx + 1,
      totalCount: VISUALIZER_MODES.length,
      label: currentMode.label,
      desc: currentMode.desc,
    };
  }, [mode]);

  // Memoized comfort preset info
  const currentComfortPreset = useMemo(() => {
    return COMFORT_PRESETS.find((p) => p.id === comfortPreset) || COMFORT_PRESETS[1];
  }, [comfortPreset]);

  // Memoized flow speed info
  const currentFlowSpeed = useMemo(() => {
    return FLOW_SPEEDS.find((s) => s.id === flowSpeed) || FLOW_SPEEDS[1];
  }, [flowSpeed]);

  // Memoized frequency & alpha beat badge display text
  const freqBadgeInfo = useMemo(() => {
    return {
      baseText: `${baseFreq}Hz`,
      beatText: alphaBeatHz > 0 ? `${alphaBeatHz}Hz Alpha` : 'Pure 432',
    };
  }, [baseFreq, alphaBeatHz]);


  // Smooth temporal state refs (Exponential Moving Average with Asymmetric Attack / Decay)
  const smoothEnergyRef = useRef<number>(0.12);
  const smoothBassRef = useRef<number>(0.1);
  const smoothSubBassRef = useRef<number>(0.08);
  const smoothMidsRef = useRef<number>(0.08);
  const smoothTrebleRef = useRef<number>(0.05);
  const smoothPulseRef = useRef<number>(0);

  // Phase, Rotation & Timing refs
  const rotationRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const needsClearRef = useRef<boolean>(true);

  // Interactive touch ripples
  const ripplesRef = useRef<TouchRipple[]>([]);

  // Swipe State for Desktop Mouse Drag, Mobile Touch, and Tablet
  const [swipeFeedback, setSwipeFeedback] = useState<{ direction: 'left' | 'right'; name: string } | null>(null);
  const swipeFeedbackTimerRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastWheelTimeRef = useRef<number>(0);

  const renderFnRef = useRef<((time: number) => void) | null>(null);

  // Awaken RAF on playback, touch, ripple or parameter transitions
  const triggerRender = useCallback(() => {
    if (renderFnRef.current && !animFrameRef.current) {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(renderFnRef.current);
    }
  }, []);

  // When mode or comfort preset changes, trigger clean transition
  useEffect(() => {
    needsClearRef.current = true;
    triggerRender();
  }, [mode, comfortPreset, effectiveIsLight, isPlaying, flowSpeed, triggerRender]);

  // Spawn an acoustic feedback ripple on tap/click
  const spawnRipple = useCallback((x: number, y: number, maxR = 150) => {
    ripplesRef.current.push({
      x,
      y,
      r: 4,
      maxR,
      alpha: 0.9,
    });
    if (ripplesRef.current.length > 8) {
      ripplesRef.current.shift();
    }
    triggerRender();
  }, [triggerRender]);

  const switchToNextVisualizer = useCallback((direction: 'next' | 'prev' = 'next') => {
    setMode((current) => {
      const curIdx = VISUALIZER_MODES.findIndex((m) => m.id === current);
      const nextIdx =
        direction === 'next'
          ? (curIdx + 1) % VISUALIZER_MODES.length
          : (curIdx - 1 + VISUALIZER_MODES.length) % VISUALIZER_MODES.length;
      const nextMode = VISUALIZER_MODES[nextIdx];

      // Show sleek swipe feedback toast
      setSwipeFeedback({
        direction: direction === 'next' ? 'left' : 'right',
        name: nextMode.label,
      });
      if (swipeFeedbackTimerRef.current) {
        window.clearTimeout(swipeFeedbackTimerRef.current);
      }
      swipeFeedbackTimerRef.current = window.setTimeout(() => {
        setSwipeFeedback(null);
      }, 1000);

      return nextMode.id;
    });
    triggerRender();
  }, [triggerRender]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
    isDraggingRef.current = true;
    setDragOffset(0);
    triggerRender();
  }, [triggerRender]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      setDragOffset(Math.max(-36, Math.min(36, dx * 0.35)));
      triggerRender();
    }
  }, [triggerRender]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const start = pointerStartRef.current;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dt = performance.now() - start.time;

    pointerStartRef.current = null;
    isDraggingRef.current = false;
    setDragOffset(0);

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Swipe detection (Desktop drag, mobile touch, tablet touch)
    const isFlick = dt < 320 && absDx > 25 && absDx > absDy;
    const isDragSwipe = absDx >= 35 && absDx > absDy * 1.15;

    if (isFlick || isDragSwipe) {
      if (dx < 0) {
        switchToNextVisualizer('next');
      } else {
        switchToNextVisualizer('prev');
      }
      return;
    }

    // Tap detection: minimal movement -> spawn visual ripple
    if (absDx < 12 && absDy < 12) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        spawnRipple(x, y);
      }
    }
  }, [spawnRipple, switchToNextVisualizer]);

  const handlePointerCancel = useCallback(() => {
    pointerStartRef.current = null;
    isDraggingRef.current = false;
    setDragOffset(0);
  }, []);

  // Trackpad 2-finger horizontal swipe handling
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
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
  }, [switchToNextVisualizer]);

  // Synchronize dynamic visualizer parameters into a mutable ref to decouple the render loop from React state teardown
  const renderConfigRef = useRef({
    isPlaying,
    baseFreq,
    alphaBeatHz,
    mode,
    comfortPreset,
    flowSpeed,
    isLight: effectiveIsLight,
  });

  useEffect(() => {
    renderConfigRef.current = {
      isPlaying,
      baseFreq,
      alphaBeatHz,
      mode,
      comfortPreset,
      flowSpeed,
      isLight: effectiveIsLight,
    };
  }, [isPlaying, baseFreq, alphaBeatHz, mode, comfortPreset, flowSpeed, effectiveIsLight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High DPI Retina Support with safe clamped pixel scaling for mobile & iPhone
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cachedWidth = 400;
    let cachedHeight = 300;

    // Instantiate dedicated OffscreenCanvas for isolated, high-performance off-DOM rendering
    let offscreenCanvas: OffscreenCanvas | HTMLCanvasElement;
    let offscreenCtx: AnyCanvasContext | null = null;

    if (typeof OffscreenCanvas !== 'undefined') {
      offscreenCanvas = new OffscreenCanvas(cachedWidth * dpr, cachedHeight * dpr);
      offscreenCtx = offscreenCanvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
      }) as OffscreenCanvasRenderingContext2D | null;
    } else {
      offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = cachedWidth * dpr;
      offscreenCanvas.height = cachedHeight * dpr;
      offscreenCtx = offscreenCanvas.getContext('2d', {
        alpha: false,
      }) as CanvasRenderingContext2D | null;
    }

    if (!offscreenCtx) return;

    // Initialize display target on the DOM canvas (prefer zero-copy bitmaprenderer)
    let bitmapCtx: ImageBitmapRenderingContext | null = null;
    let display2dCtx: CanvasRenderingContext2D | null = null;

    try {
      bitmapCtx = canvas.getContext('bitmaprenderer', { alpha: false });
    } catch {
      bitmapCtx = null;
    }

    if (!bitmapCtx) {
      display2dCtx = canvas.getContext('2d', { alpha: false });
    }

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      cachedWidth = Math.max(10, Math.floor(rect.width || 400));
      cachedHeight = Math.max(10, Math.floor(rect.height || 300));

      canvas.width = cachedWidth * dpr;
      canvas.height = cachedHeight * dpr;

      offscreenCanvas.width = cachedWidth * dpr;
      offscreenCanvas.height = cachedHeight * dpr;

      if (offscreenCtx) {
        offscreenCtx.scale(dpr, dpr);
      }
      needsClearRef.current = true;
    };
    updateSize();

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animFrameRef.current) {
          lastTimeRef.current = performance.now();
          animFrameRef.current = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const dataArray = new Uint8Array(256);
    const waveArray = new Uint8Array(256);
    const smoothedFft = new Float32Array(64);

    const render = (timeNow: number) => {
      if (!isVisible || !offscreenCtx) {
        animFrameRef.current = null;
        return;
      }

      const cfg = renderConfigRef.current;

      // Conserve CPU & battery: when paused and no touch ripples active, throttle idle breathing to 20fps
      if (!cfg.isPlaying && ripplesRef.current.length === 0) {
        if (timeNow - (lastTimeRef.current || 0) < 45) {
          animFrameRef.current = requestAnimationFrame(render);
          return;
        }
      }

      const width = cachedWidth;
      const height = cachedHeight;
      const cx = width / 2;
      const cy = height / 2;

      // Delta time physics (frame-rate independent at 60Hz, 120Hz, 144Hz)
      const lastTime = lastTimeRef.current || timeNow;
      const dt = Math.min((timeNow - lastTime) / 16.67, 2.5) * cfg.flowSpeed;
      lastTimeRef.current = timeNow;

      // 1. Soft Optical Motion Persistence Wash directly on OffscreenCanvas
      const isLight = cfg.isLight;
      const washAlpha = cfg.comfortPreset === 'zen' ? 0.24 : cfg.comfortPreset === 'glow' ? 0.16 : 0.20;
      if (needsClearRef.current) {
        offscreenCtx.clearRect(0, 0, width, height);
        offscreenCtx.fillStyle = isLight ? '#f8fafc' : '#020617';
        offscreenCtx.fillRect(0, 0, width, height);
        needsClearRef.current = false;
      } else {
        offscreenCtx.fillStyle = isLight ? `rgba(248, 250, 252, ${washAlpha})` : `rgba(2, 6, 23, ${washAlpha})`;
        offscreenCtx.fillRect(0, 0, width, height);
      }

      offscreenCtx.lineCap = 'round';
      offscreenCtx.lineJoin = 'round';

      // 2. Multi-Band Audio Extraction with Neighbor Spatial Smoothing
      let rawTotalEnergy = 0;
      let rawSubBass = 0;
      let rawBass = 0;
      let rawMids = 0;
      let rawTreble = 0;

      const analyser = audioEngine.getAnalyser();

      if (cfg.isPlaying && analyser) {
        analyser.getByteFrequencyData(dataArray);
        analyser.getByteTimeDomainData(waveArray);

        // 3-tap Gaussian spatial filter across lower 64 bins to remove jagged noise
        for (let i = 0; i < 64; i++) {
          const prev = i > 0 ? dataArray[i - 1] : dataArray[i];
          const curr = dataArray[i];
          const next = i < 63 ? dataArray[i + 1] : dataArray[i];
          smoothedFft[i] = (prev * 0.25 + curr * 0.5 + next * 0.25) / 255;
        }

        // Sub bass (0 - 4 bins: ~0 - 150Hz)
        for (let i = 0; i < 4; i++) rawSubBass += smoothedFft[i];
        rawSubBass = rawSubBass / 4;

        // Bass & 432Hz Fundamental (4 - 12 bins: ~150 - 450Hz)
        for (let i = 4; i < 12; i++) rawBass += smoothedFft[i];
        rawBass = rawBass / 8;

        // Mids / Flute / Bowls (12 - 40 bins: ~450 - 1600Hz)
        for (let i = 12; i < 40; i++) rawMids += smoothedFft[i];
        rawMids = rawMids / 28;

        // Treble / Chimes / Water pings (40 - 64 bins)
        for (let i = 40; i < 64; i++) rawTreble += smoothedFft[i];
        rawTreble = rawTreble / 24;

        rawTotalEnergy = (rawSubBass * 0.38) + (rawBass * 0.34) + (rawMids * 0.18) + (rawTreble * 0.10);
      } else {
        // Serene resting state (gentle virtual idling breath)
        rawTotalEnergy = 0.10;
        rawSubBass = 0.07;
        rawBass = 0.09;
        rawMids = 0.06;
        rawTreble = 0.03;

        for (let i = 0; i < 64; i++) {
          smoothedFft[i] = 0.08 + Math.sin(i * 0.18 + timeNow * 0.001) * 0.03;
        }

        // Flat baseline in resting state (no artificial oscillating playback wave when paused)
        for (let i = 0; i < 256; i++) {
          waveArray[i] = 128;
        }
      }

      // 3. Asymmetric Dual-Pole Physics Smoothing
      const attackLerp = (cfg.comfortPreset === 'zen' ? 0.035 : cfg.comfortPreset === 'glow' ? 0.065 : 0.048) * dt;
      const decayLerp = (!cfg.isPlaying ? 0.28 : (cfg.comfortPreset === 'zen' ? 0.016 : cfg.comfortPreset === 'glow' ? 0.028 : 0.022)) * dt;

      const smoothStep = (curr: number, target: number) => {
        const factor = target > curr ? attackLerp : decayLerp;
        return curr + (target - curr) * factor;
      };

      smoothSubBassRef.current = smoothStep(smoothSubBassRef.current, rawSubBass);
      smoothBassRef.current = smoothStep(smoothBassRef.current, rawBass);
      smoothMidsRef.current = smoothStep(smoothMidsRef.current, rawMids);
      smoothTrebleRef.current = smoothStep(smoothTrebleRef.current, rawTreble);
      smoothEnergyRef.current = smoothStep(smoothEnergyRef.current, rawTotalEnergy);

      // 4. Biological Cardiovascular 5.5-Second Coherent Breathing Wave (0.1 Hz)
      const breathTime = timeNow * 0.00114 * cfg.flowSpeed;
      const breathWave = (Math.sin(breathTime) + 1) * 0.5; // 0 to 1

      // 5. Dynamic Pulse (Blended Audio + Meditative Breath)
      const targetPulse = (smoothSubBassRef.current * 0.42) + (smoothBassRef.current * 0.32) + (breathWave * 0.26);
      smoothPulseRef.current += (targetPulse - smoothPulseRef.current) * (0.04 * dt);
      const dynamicPulse = 0.94 + (smoothPulseRef.current * 0.32);

      // 6. Fluid Celestial Rotation (Velvety smooth, frame-time normalized)
      const rotSpeed = (cfg.comfortPreset === 'zen' ? 0.0009 : cfg.comfortPreset === 'glow' ? 0.0016 : 0.0012) * dt;
      rotationRef.current += rotSpeed;

      const beatSpeed = (cfg.alphaBeatHz > 0 ? (cfg.alphaBeatHz * 0.006) : 0.009) * dt;
      phaseRef.current += beatSpeed;

      const energy = smoothEnergyRef.current;
      const bass = smoothBassRef.current;
      const mids = smoothMidsRef.current;
      const treble = smoothTrebleRef.current;
      const pulse = smoothPulseRef.current;

      // 7. Soft Ambient Radial Biofield Glow (Rendered directly to OffscreenCanvas)
      const auraRadius = Math.min(cx, cy) * (cfg.comfortPreset === 'glow' ? 1.3 : 1.15);
      const bgAura = offscreenCtx.createRadialGradient(cx, cy, 8, cx, cy, auraRadius);
      const auraOpacity = cfg.comfortPreset === 'zen' ? 0.08 : cfg.comfortPreset === 'glow' ? 0.16 : 0.12;
      if (isLight) {
        bgAura.addColorStop(0, `rgba(2, 132, 199, ${auraOpacity * 1.4 + pulse * 0.06})`);
        bgAura.addColorStop(0.45, `rgba(99, 102, 241, ${auraOpacity * 0.8})`);
        bgAura.addColorStop(0.8, `rgba(217, 119, 6, ${auraOpacity * 0.35})`);
        bgAura.addColorStop(1, 'rgba(248, 250, 252, 0)');
      } else {
        bgAura.addColorStop(0, `rgba(14, 165, 233, ${auraOpacity + pulse * 0.05})`);
        bgAura.addColorStop(0.45, `rgba(99, 102, 241, ${auraOpacity * 0.6})`);
        bgAura.addColorStop(0.8, `rgba(217, 70, 239, ${auraOpacity * 0.25})`);
        bgAura.addColorStop(1, 'rgba(2, 6, 23, 0)');
      }
      offscreenCtx.fillStyle = bgAura;
      offscreenCtx.beginPath();
      offscreenCtx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
      offscreenCtx.fill();

      // 7.5 Subtle Glowing Visualizer Effect: Pulses in sync with Musical Mode ethereal pads (Soft Pastel Indigo)
      const padSwell = audioEngine.getMusicalPadSwell();
      if (padSwell.isActive && padSwell.envelope > 0.005) {
        renderComfortMusicalPadIndigoGlow(
          offscreenCtx,
          cx,
          cy,
          padSwell.envelope,
          padSwell.peakBloom,
          padSwell.frequencies,
          rotationRef.current,
          phaseRef.current,
          isLight
        );
      }

      // 8. Render Selected Visualizer Mode directly to OffscreenCanvas
      const curMode = cfg.mode;
      if (curMode === 'sacred_lotus') {
        renderComfortSacredLotus(offscreenCtx, cx, cy, energy, bass, mids, treble, pulse, dynamicPulse, phaseRef.current, breathWave, cfg.comfortPreset, cfg.baseFreq, isLight);
      } else if (curMode === 'dreamy_nebula') {
        renderComfortDreamyNebula(offscreenCtx, cx, cy, energy, bass, mids, treble, pulse, dynamicPulse, phaseRef.current, breathWave, cfg.comfortPreset, isLight);
      } else if (curMode === 'celestial_sri_yantra') {
        renderComfortCelestialSriYantra(offscreenCtx, cx, cy, energy, bass, mids, pulse, dynamicPulse, rotationRef.current, phaseRef.current, breathWave, cfg.comfortPreset, isLight);
      } else if (curMode === 'mandala') {
        renderComfortMandala(offscreenCtx, cx, cy, energy, bass, pulse, dynamicPulse, rotationRef.current, phaseRef.current, breathWave, cfg.comfortPreset, isLight);
      } else if (curMode === 'flower_of_life') {
        renderComfortFlowerOfLife(offscreenCtx, cx, cy, energy, pulse, dynamicPulse, rotationRef.current, phaseRef.current, breathWave, cfg.comfortPreset, isLight);
      } else if (curMode === 'aurora') {
        renderComfortPrismaticAurora(offscreenCtx, width, height, smoothedFft, energy, treble, pulse, dynamicPulse, phaseRef.current, breathWave, cfg.comfortPreset, isLight);
      } else if (curMode === 'cosmic_galaxy') {
        renderComfortGalaxy(offscreenCtx, cx, cy, energy, bass, pulse, dynamicPulse, rotationRef.current, phaseRef.current, cfg.comfortPreset, isLight);
      } else if (curMode === 'ripples') {
        renderComfortRipples(offscreenCtx, cx, cy, energy, bass, pulse, dynamicPulse, phaseRef.current, breathWave, cfg.comfortPreset, isLight);
      } else if (curMode === 'pranic_orb') {
        renderComfortPranicOrb(offscreenCtx, cx, cy, energy, bass, mids, treble, pulse, dynamicPulse, phaseRef.current, breathWave, cfg.comfortPreset, isLight);
      }

      // 9. Render Interactive Touch Ripples directly to OffscreenCanvas
      renderInteractiveRipples(offscreenCtx, dt);

      // 9.5 'ETHERIC BLOOM' Post-Processing Pass:
      // Scales the intensity of the indigo glow pulse specifically when Musical Mode ambient chord swells peak in volume
      if (padSwell.isActive && padSwell.peakBloom > 0.005) {
        applyEthericBloomPostProcess(
          offscreenCtx,
          cachedWidth,
          cachedHeight,
          cx,
          cy,
          padSwell.peakBloom,
          padSwell.frequencies,
          phaseRef.current,
          isLight
        );
      }

      // 9.6 Synchronize UI container bloom state throttled (60ms) for silky-smooth CSS sync
      if (timeNow - lastBloomUpdateRef.current > 60) {
        lastBloomUpdateRef.current = timeNow;
        const currentIsPeak = padSwell.isPeak;
        const currentPeakBloom = Math.round(padSwell.peakBloom * 100) / 100;
        setPadBloomState((prev) => {
          if (prev.isPeak !== currentIsPeak || Math.abs(prev.peakBloom - currentPeakBloom) > 0.03) {
            return { isPeak: currentIsPeak, peakBloom: currentPeakBloom };
          }
          return prev;
        });
      }

      // 10. Direct Hardware GPU transfer from OffscreenCanvas to display canvas
      if (bitmapCtx && 'transferToImageBitmap' in offscreenCanvas) {
        const imageBitmap = (offscreenCanvas as OffscreenCanvas).transferToImageBitmap();
        bitmapCtx.transferFromImageBitmap(imageBitmap);
      } else if (display2dCtx) {
        display2dCtx.drawImage(offscreenCanvas, 0, 0, cachedWidth, cachedHeight);
      }

      // 11. Smart Loop Lifecycle: Active during playback/ripples/musical pad swell, idles when paused to eliminate main-thread CPU waste
      if (cfg.isPlaying || ripplesRef.current.length > 0 || isDraggingRef.current || (padSwell.isActive && padSwell.envelope > 0.01)) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        animFrameRef.current = null;
      }
    };

    renderFnRef.current = render;

    // Render initial crisp resting frame on mount
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(render);

    // Mobile & Tablet Rotation: Listen to element resize, window resize, and orientation changes
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          updateSize();
        })
      : null;
    if (resizeObserver) {
      resizeObserver.observe(canvas);
    }

    const handleRotationOrResize = () => {
      updateSize();
      // Mobile Safari and Chrome layout completion delay on orientation change
      setTimeout(updateSize, 80);
      setTimeout(updateSize, 250);
    };

    window.addEventListener('resize', handleRotationOrResize);
    window.addEventListener('orientationchange', handleRotationOrResize);
    window.screen?.orientation?.addEventListener?.('change', handleRotationOrResize);

    return () => {
      observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleRotationOrResize);
      window.removeEventListener('orientationchange', handleRotationOrResize);
      window.screen?.orientation?.removeEventListener?.('change', handleRotationOrResize);
    };
  }, []);

  // Render acoustic touch ripples smoothly
  const renderInteractiveRipples = (ctx: AnyCanvasContext, dt: number) => {
    const ripples = ripplesRef.current;
    if (ripples.length === 0) return;

    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.r += 2.8 * dt;
      rip.alpha -= 0.016 * dt;

      if (rip.alpha <= 0 || rip.r >= rip.maxR) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, rip.alpha * 0.75)})`;
      ctx.lineWidth = 1.8 * (rip.alpha);
      ctx.stroke();

      // Delicate inner echo ring
      if (rip.r > 18) {
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(254, 240, 138, ${Math.max(0, rip.alpha * 0.5)})`;
        ctx.lineWidth = 1.2 * rip.alpha;
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  // =========================================================================
  // DREAMY: CELESTIAL STARDUST NEBULA & ETHEREAL BIOLUMINESCENT DREAM
  // =========================================================================
  const renderComfortDreamyNebula = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    midsEnergy: number,
    trebleEnergy: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    breathWave: number,
    comfort: VisualComfortPreset,
    isLight: boolean
  ) => {
    // 1. Dreamy Multi-Chromatic Soft Pulsing Core
    const coreRadius = Math.min(cx, cy) * 0.35 * (1 + dynamicPulse * 0.18 + breathWave * 0.1);
    const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2.4);

    if (isLight) {
      radGrad.addColorStop(0, 'rgba(147, 51, 234, 0.45)');
      radGrad.addColorStop(0.35, 'rgba(14, 165, 233, 0.28)');
      radGrad.addColorStop(0.7, 'rgba(244, 114, 182, 0.15)');
      radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    } else {
      radGrad.addColorStop(0, 'rgba(168, 85, 247, 0.65)');
      radGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.45)');
      radGrad.addColorStop(0.55, 'rgba(236, 72, 153, 0.25)');
      radGrad.addColorStop(0.85, 'rgba(129, 140, 248, 0.12)');
      radGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    }

    ctx.save();
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Swirling Dreamy Ethereal Petal Ribbons (12 drifting silk waves)
    const ribbonCount = 12;
    for (let i = 0; i < ribbonCount; i++) {
      const angleOffset = (i / ribbonCount) * Math.PI * 2 + phase * 0.15 * (i % 2 === 0 ? 1 : -1);
      const wavePhase = phase * 1.2 + i * 0.6;
      const rOuter = coreRadius * (1.2 + Math.sin(wavePhase) * 0.35 + bassEnergy * 0.4);
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

      const alpha = 0.22 + Math.sin(phase * 2 + i) * 0.12 + trebleEnergy * 0.2;
      const strokeColor = i % 3 === 0
        ? `rgba(56, 189, 248, ${alpha})`
        : i % 3 === 1
        ? `rgba(192, 132, 252, ${alpha})`
        : `rgba(251, 191, 36, ${alpha * 0.8})`;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2 + Math.sin(phase + i) * 1.5;
      ctx.stroke();
    }

    // 3. Drifting Celestial Dreamy Stardust Particles (64 motes)
    const starCount = 64;
    for (let s = 0; s < starCount; s++) {
      const starSeed = s * 97.13;
      const starAngle = starSeed + phase * (0.05 + (s % 5) * 0.02) * (s % 2 === 0 ? 1 : -1);
      const orbitDist = ((starSeed % 100) / 100) * coreRadius * 2.0 + coreRadius * 0.2;
      const sx = cx + Math.cos(starAngle) * orbitDist;
      const sy = cy + Math.sin(starAngle) * orbitDist;

      const starPulse = (Math.sin(phase * 3 + s * 1.7) + 1) * 0.5;
      const starR = 1 + starPulse * 2.2 + trebleEnergy * 2;
      const starAlpha = 0.35 + starPulse * 0.6 + midsEnergy * 0.25;

      const starGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, starR * 2.5);
      const isGold = s % 4 === 0;
      starGrad.addColorStop(0, isGold ? `rgba(254, 240, 138, ${starAlpha})` : `rgba(224, 242, 254, ${starAlpha})`);
      starGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, starR * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Center Glowing Sacred Crystal Heart
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 0.38);
    centerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    centerGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
    centerGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
    centerGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 0.38 * (1 + dynamicPulse * 0.2), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // =========================================================================
  // DREAMY: ETHEREAL DREAMSCAPE (Luminous Pastel Dream Clouds & Floating Starlight)
  // =========================================================================
  const renderComfortEtherealDreamscape = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    midsEnergy: number,
    trebleEnergy: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    breathWave: number,
    comfort: VisualComfortPreset,
    isLight: boolean
  ) => {
    ctx.save();
    const maxR = Math.min(cx, cy) * 0.9;
    const baseBreath = 1 + breathWave * 0.15 + dynamicPulse * 0.12;

    // 1. Multi-Chromatic Soft Dream Auric Clouds (4 drifting ethereal lobes)
    const lobes = [
      { angle: phase * 0.25, dist: maxR * 0.35, r: maxR * 0.55, c1: isLight ? 'rgba(168, 85, 247, 0.35)' : 'rgba(168, 85, 247, 0.45)', c2: 'rgba(168, 85, 247, 0)' },
      { angle: phase * -0.2 + 1.8, dist: maxR * 0.42, r: maxR * 0.6, c1: isLight ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.4)', c2: 'rgba(56, 189, 248, 0)' },
      { angle: phase * 0.15 + 3.4, dist: maxR * 0.3, r: maxR * 0.5, c1: isLight ? 'rgba(244, 114, 182, 0.3)' : 'rgba(244, 114, 182, 0.38)', c2: 'rgba(244, 114, 182, 0)' },
      { angle: phase * -0.18 + 5.1, dist: maxR * 0.38, r: maxR * 0.58, c1: isLight ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 191, 36, 0.32)', c2: 'rgba(251, 191, 36, 0)' },
    ];

    lobes.forEach((l) => {
      const lx = cx + Math.cos(l.angle) * l.dist;
      const ly = cy + Math.sin(l.angle) * l.dist;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, l.r * baseBreath);
      g.addColorStop(0, l.c1);
      g.addColorStop(1, l.c2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(lx, ly, l.r * baseBreath, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Concentric Ethereal Wave Rings with Harmonic Cymatic Ripple
    const ringCount = 7;
    for (let i = 0; i < ringCount; i++) {
      const ringProgress = ((phase * 0.4 + i / ringCount) % 1);
      const ringR = maxR * (0.15 + ringProgress * 0.75) * baseBreath;
      const alpha = (1 - ringProgress) * (0.35 + bassEnergy * 0.3);

      ctx.beginPath();
      const points = 64;
      for (let p = 0; p <= points; p++) {
        const theta = (p / points) * Math.PI * 2;
        const ripple = Math.sin(theta * 6 + phase * 2 + i) * (4 + trebleEnergy * 8);
        const r = ringR + ripple;
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const strokeCol = i % 2 === 0
        ? `rgba(192, 132, 252, ${alpha})`
        : `rgba(56, 189, 248, ${alpha})`;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 1.5 + (1 - ringProgress) * 2;
      ctx.stroke();
    }

    // 3. Floating Lucid Dream Star Dust (48 twinkling specks)
    const starCount = 48;
    for (let s = 0; s < starCount; s++) {
      const starPhase = phase * 0.6 + s * 1.618;
      const radius = (maxR * 0.2) + ((s * 37) % Math.floor(maxR * 0.68));
      const angle = (s * 2.399) + phase * (0.05 + (s % 5) * 0.02);
      const sx = cx + Math.cos(angle) * radius;
      const sy = cy + Math.sin(angle) * radius;
      const twinkle = Math.sin(starPhase) * 0.5 + 0.5;
      const sRadius = (1.5 + (s % 3) * 1.2) * (0.6 + twinkle * 0.6 + trebleEnergy * 0.4);

      const starGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sRadius * 2);
      starGrad.addColorStop(0, `rgba(255, 255, 255, ${0.4 + twinkle * 0.6})`);
      starGrad.addColorStop(0.5, s % 2 === 0 ? `rgba(244, 114, 182, ${0.3 + twinkle * 0.4})` : `rgba(56, 189, 248, ${0.3 + twinkle * 0.4})`);
      starGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, sRadius * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Center Glowing Opal Core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.28 * baseBreath);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    coreGrad.addColorStop(0.3, isLight ? 'rgba(168, 85, 247, 0.7)' : 'rgba(192, 132, 252, 0.8)');
    coreGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
    coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 0.28 * baseBreath, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // =========================================================================
  // DREAMY: CELESTIAL SRI YANTRA (Sacred Golden Triangles & Celestial Aura Matrix)
  // =========================================================================
  const renderComfortCelestialSriYantra = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    midsEnergy: number,
    pulse: number,
    dynamicPulse: number,
    rotation: number,
    phase: number,
    breathWave: number,
    comfort: VisualComfortPreset,
    isLight: boolean
  ) => {
    ctx.save();
    const maxR = Math.min(cx, cy) * 0.78 * (1 + breathWave * 0.1 + dynamicPulse * 0.08);

    // 1. Golden Aura Glow Backdrop
    const auraG = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.25);
    auraG.addColorStop(0, isLight ? 'rgba(251, 191, 36, 0.35)' : 'rgba(251, 191, 36, 0.45)');
    auraG.addColorStop(0.4, isLight ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.25)');
    auraG.addColorStop(0.8, 'rgba(234, 88, 12, 0.08)');
    auraG.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraG;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // 2. Outer Rotating Lotus Petals (16 Sacred Petals)
    const petals = 16;
    for (let p = 0; p < petals; p++) {
      const angle = (p / petals) * Math.PI * 2 + rotation * 0.3;
      const pr = maxR * (0.88 + Math.sin(phase * 1.5 + p) * 0.03);
      const px = cx + Math.cos(angle) * pr;
      const py = cy + Math.sin(angle) * pr;

      ctx.beginPath();
      ctx.arc(px, py, maxR * 0.14, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.25 + bassEnergy * 0.25})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 3. 9 Interlocking Sacred Triangles (4 Shiva Upward, 5 Shakti Downward)
    const triangles = [
      { up: true, scale: 0.82, yOff: -0.05 },
      { up: false, scale: 0.78, yOff: 0.06 },
      { up: true, scale: 0.68, yOff: -0.08 },
      { up: false, scale: 0.64, yOff: 0.07 },
      { up: true, scale: 0.54, yOff: -0.04 },
      { up: false, scale: 0.50, yOff: 0.05 },
      { up: true, scale: 0.40, yOff: -0.02 },
      { up: false, scale: 0.36, yOff: 0.04 },
      { up: false, scale: 0.26, yOff: 0.02 },
    ];

    triangles.forEach((tri, idx) => {
      const s = maxR * tri.scale * (1 + Math.sin(phase * 2 + idx) * 0.02);
      const dy = s * tri.yOff;
      const h = s * (Math.sqrt(3) / 2);

      let x1 = cx, y1 = cy + dy;
      let x2 = cx, y2 = cy + dy;
      let x3 = cx, y3 = cy + dy;

      if (tri.up) {
        x1 = cx;
        y1 = cy + dy - (2 / 3) * h;
        x2 = cx - s / 2;
        y2 = cy + dy + (1 / 3) * h;
        x3 = cx + s / 2;
        y3 = cy + dy + (1 / 3) * h;
      } else {
        x1 = cx;
        y1 = cy + dy + (2 / 3) * h;
        x2 = cx - s / 2;
        y2 = cy + dy - (1 / 3) * h;
        x3 = cx + s / 2;
        y3 = cy + dy - (1 / 3) * h;
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();

      const alpha = 0.35 + (idx % 2 === 0 ? 0.25 : 0.15) + midsEnergy * 0.3;
      ctx.strokeStyle = idx % 2 === 0
        ? `rgba(253, 224, 71, ${alpha})`
        : `rgba(251, 146, 60, ${alpha})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Vertex sparkle dots
      [ [x1, y1], [x2, y2], [x3, y3] ].forEach(([vx, vy]) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(vx, vy, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // 4. Central Sacred Bindu Point (Golden Sun of Consciousness)
    const binduR = 7 + dynamicPulse * 5 + bassEnergy * 6;
    const binduG = ctx.createRadialGradient(cx, cy, 0, cx, cy, binduR * 2.5);
    binduG.addColorStop(0, 'rgba(255, 255, 255, 1)');
    binduG.addColorStop(0.3, 'rgba(253, 224, 71, 0.9)');
    binduG.addColorStop(0.7, 'rgba(234, 88, 12, 0.5)');
    binduG.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = binduG;
    ctx.beginPath();
    ctx.arc(cx, cy, binduR * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // =========================================================================
  // DREAMY: PRISMATIC AURORA (Liquid Dream Ribbons & Crystalline Light Dispersion)
  // =========================================================================
  const renderComfortPrismaticAurora = (
    ctx: AnyCanvasContext,
    width: number,
    height: number,
    fft: Float32Array,
    energy: number,
    trebleEnergy: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    breathWave: number,
    comfort: VisualComfortPreset,
    isLight: boolean
  ) => {
    ctx.save();
    const cx = width / 2;
    const cy = height / 2;
    const ribbonCount = 5;

    // Spectral Palettes: Cyan, Emerald, Violet, Rose, Amber
    const hues = [
      { r: 56, g: 189, b: 248 },  // Sky
      { r: 52, g: 211, b: 153 },  // Emerald
      { r: 168, g: 85, b: 247 },  // Violet
      { r: 244, g: 114, b: 182 }, // Rose
      { r: 251, g: 191, b: 36 },  // Amber
    ];

    for (let r = 0; r < ribbonCount; r++) {
      const c = hues[r % hues.length];
      const yBase = cy + (r - (ribbonCount - 1) / 2) * (height * 0.12);
      const waveSpeed = phase * (0.8 + r * 0.25);
      const amplitude = (height * 0.15) * (0.7 + breathWave * 0.3 + energy * 0.4);

      ctx.beginPath();
      ctx.moveTo(0, height);

      const segments = 48;
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width;
        const norm = i / segments;
        const fftVal = fft[Math.min(fft.length - 1, Math.floor(norm * 32))] * 0.5;
        const y = yBase +
          Math.sin(norm * Math.PI * 3 + waveSpeed) * amplitude +
          Math.cos(norm * Math.PI * 5 - waveSpeed * 0.8) * (amplitude * 0.4) -
          fftVal * (height * 0.2);

        if (i === 0) ctx.lineTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const alpha = isLight ? 0.22 : 0.32;
      const grad = ctx.createLinearGradient(0, yBase - amplitude, 0, height);
      grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha + trebleEnergy * 0.15})`);
      grad.addColorStop(0.6, `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(2, 6, 23, 0)');

      ctx.fillStyle = grad;
      ctx.fill();

      // Top glowing ribbon edge
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha + 0.3})`;
      ctx.lineWidth = 2 + (r % 2 === 0 ? 1 : 0);
      ctx.stroke();
    }

    // Floating Starlight Shimmer
    const sparkCount = 36;
    for (let s = 0; s < sparkCount; s++) {
      const sx = ((s * 137.5 + phase * 40) % width);
      const sy = cy + Math.sin(phase + s * 1.2) * (height * 0.35);
      const sr = 1.5 + (s % 3);
      const sAlpha = 0.3 + Math.sin(phase * 3 + s) * 0.4;

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, sAlpha)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };
  const renderComfortSacredLotus = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    mids: number,
    treble: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    breathWave: number,
    preset: VisualComfortPreset,
    frequencyHz: number,
    isLightMode: boolean = false
  ) => {
    const medallionR = Math.min(cx, cy) * 0.84;
    const baseBreath = Math.sin(phase * 0.75) * 2.5;

    ctx.save();

    // 1. Base Disc: Deep Cosmic Obsidian (Dark Mode) or Luminous Alabaster / Pearl (Light Mode)
    const bgGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, medallionR * 1.05);
    if (isLightMode) {
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.5, '#f8fafc');
      bgGrad.addColorStop(0.85, '#f1f5f9');
      bgGrad.addColorStop(1, '#e2e8f0');
    } else {
      bgGrad.addColorStop(0, '#11172f');
      bgGrad.addColorStop(0.55, '#0a0d1b');
      bgGrad.addColorStop(1, '#05070e');
    }
    ctx.beginPath();
    ctx.arc(cx, cy, medallionR, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    if (isLightMode) {
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 2. Outer Luminous Neon Gradient Ring
    const tonePulse = Math.min(1.0, bassEnergy * 1.6 + energy * 0.85);
    const ringR = medallionR * (0.91 + tonePulse * 0.03);
    const ringGrad = ctx.createLinearGradient(
      cx - ringR * 0.85,
      cy - ringR * 0.85,
      cx + ringR * 0.85,
      cy + ringR * 0.85
    );
    if (isLightMode) {
      ringGrad.addColorStop(0, 'rgba(2, 132, 199, 0.95)');
      ringGrad.addColorStop(0.35, 'rgba(59, 130, 246, 0.9)');
      ringGrad.addColorStop(0.65, 'rgba(147, 51, 234, 0.95)');
      ringGrad.addColorStop(0.9, 'rgba(217, 119, 6, 0.95)');
      ringGrad.addColorStop(1, 'rgba(245, 158, 11, 0.95)');
    } else {
      ringGrad.addColorStop(0, 'rgba(34, 211, 238, 0.95)');
      ringGrad.addColorStop(0.35, 'rgba(96, 165, 250, 0.85)');
      ringGrad.addColorStop(0.65, 'rgba(192, 132, 252, 0.9)');
      ringGrad.addColorStop(0.9, 'rgba(251, 191, 36, 0.95)');
      ringGrad.addColorStop(1, 'rgba(254, 240, 138, 0.95)');
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 3.6 + tonePulse * 2.5;
    ctx.shadowBlur = 14 + tonePulse * 24;
    ctx.shadowColor = isLightMode ? 'rgba(2, 132, 199, 0.5)' : 'rgba(56, 189, 248, 0.85)';
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
    if (isLightMode) {
      innerGrad.addColorStop(0, 'rgba(2, 132, 199, 0.9)');
      innerGrad.addColorStop(0.5, 'rgba(124, 58, 237, 0.85)');
      innerGrad.addColorStop(1, 'rgba(217, 119, 6, 0.9)');
    } else {
      innerGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      innerGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.75)');
      innerGrad.addColorStop(1, 'rgba(253, 224, 71, 0.85)');
    }
    ctx.strokeStyle = innerGrad;
    ctx.lineWidth = 1.8 + tonePulse * 1.2;
    ctx.shadowBlur = 6 + tonePulse * 12;
    ctx.shadowColor = isLightMode ? 'rgba(124, 58, 237, 0.4)' : 'rgba(168, 85, 247, 0.6)';
    ctx.stroke();
    ctx.restore();

    // 4. Center Bioluminescent Haze Bloom (Expands dynamically with Tone & Bass)
    const bloomR = innerR * (0.62 + tonePulse * 0.45);
    const bloomGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, bloomR);
    if (isLightMode) {
      bloomGrad.addColorStop(0, `rgba(2, 132, 199, ${0.45 + tonePulse * 0.3})`);
      bloomGrad.addColorStop(0.45, `rgba(99, 102, 241, ${0.25 + tonePulse * 0.2})`);
      bloomGrad.addColorStop(0.8, `rgba(217, 119, 6, ${0.15 + tonePulse * 0.12})`);
      bloomGrad.addColorStop(1, 'rgba(248, 250, 252, 0)');
    } else {
      bloomGrad.addColorStop(0, `rgba(34, 211, 238, ${0.48 + tonePulse * 0.35})`);
      bloomGrad.addColorStop(0.45, `rgba(129, 140, 248, ${0.25 + tonePulse * 0.2})`);
      bloomGrad.addColorStop(0.8, `rgba(245, 158, 11, ${0.12 + tonePulse * 0.12})`);
      bloomGrad.addColorStop(1, 'rgba(10, 13, 27, 0)');
    }
    ctx.beginPath();
    ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
    ctx.fillStyle = bloomGrad;
    ctx.fill();

    // 5. THE SACRED CYMATIC WIREFRAME LOTUS FLOWER (Centered & Fills the Circle)
    // In logo coordinates, width is 104 (x: 48..152, half=52) and vertical center is 84 (y: 48..120).
    const pulseScale = 1.0 + (tonePulse * 0.18) + (Math.sin(phase * 1.8) * 0.035);
    const lotusScale = ((innerR * 0.95) / 52) * pulseScale;

    // Convert logo coordinates directly to centered canvas coordinates
    const toCanvas = (lx: number, ly: number): [number, number] => {
      const offsetX = (lx - 100) * lotusScale;
      const offsetY = (ly - 84) * lotusScale;
      return [cx + offsetX, cy + offsetY];
    };

    // --- BASE HEART SEPAL NODE (Center Bottom Anchor) ---
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
    ctx.fillStyle = `rgba(34, 211, 238, ${0.28 + pulse * 0.15})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.85 + pulse * 0.15})`;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Base sepal striations
    const [bs1x, bs1y] = toCanvas(97, 116);
    const [bs2x, bs2y] = toCanvas(103, 116);
    ctx.beginPath();
    ctx.moveTo(bs1x, bs1y);
    ctx.quadraticCurveTo(b6x, b6y + 2, b6x, b6y);
    ctx.moveTo(bs2x, bs2y);
    ctx.quadraticCurveTo(b6x, b6y + 2, b6x, b6y);
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.75 + pulse * 0.2})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

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
      // Petal outline & soft luminous fill
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
      ctx.lineWidth = 1.25 + pulse * 0.35;
      ctx.shadowBlur = 6 + pulse * 6;
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

    // --- TIER 4: LOWEST LATERAL WING PETALS ---
    // Left Lower Wing
    drawCymaticPetal(
      [[100, 113], [82, 114], [62, 108], [50, 99], [64, 96], [82, 103], [100, 113]],
      `rgba(34, 211, 238, ${0.14 + pulse * 0.08})`,
      '#22d3ee',
      `rgba(56, 189, 248, ${0.7 + pulse * 0.2})`,
      [
        [[100, 113], [77, 106], [54, 100]],
        [[100, 113], [81, 108], [60, 102]],
      ],
      0.1
    );

    // Right Lower Wing
    drawCymaticPetal(
      [[100, 113], [118, 114], [138, 108], [150, 99], [136, 96], [118, 103], [100, 113]],
      `rgba(252, 211, 77, ${0.14 + pulse * 0.08})`,
      '#fbbf24',
      `rgba(253, 224, 71, ${0.7 + pulse * 0.2})`,
      [
        [[100, 113], [123, 106], [146, 100]],
        [[100, 113], [119, 108], [140, 102]],
      ],
      0.2
    );

    // --- TIER 3: MID HORIZONTAL BLOOMING PETALS ---
    // Left Mid Petal
    drawCymaticPetal(
      [[100, 112], [78, 111], [58, 98], [48, 84], [64, 83], [83, 95], [100, 112]],
      `rgba(56, 189, 248, ${0.16 + pulse * 0.1})`,
      '#38bdf8',
      `rgba(34, 211, 238, ${0.75 + pulse * 0.2})`,
      [
        [[100, 112], [76, 98], [52, 86]],
        [[100, 112], [79, 101], [58, 90]],
        [[100, 112], [84, 105], [66, 94]],
      ],
      0.3
    );

    // Right Mid Petal
    drawCymaticPetal(
      [[100, 112], [122, 111], [142, 98], [152, 84], [136, 83], [117, 95], [100, 112]],
      `rgba(252, 211, 77, ${0.16 + pulse * 0.1})`,
      '#fde047',
      `rgba(254, 240, 138, ${0.75 + pulse * 0.2})`,
      [
        [[100, 112], [124, 98], [148, 86]],
        [[100, 112], [121, 101], [142, 90]],
        [[100, 112], [116, 105], [134, 94]],
      ],
      0.4
    );

    // --- TIER 2: BROAD MID-UPPER ARCHING PETALS ---
    // Left Upper Broad Petal
    drawCymaticPetal(
      [[100, 111], [76, 104], [58, 84], [62, 66], [76, 72], [90, 92], [100, 111]],
      `rgba(129, 140, 248, ${0.18 + pulse * 0.1})`,
      '#818cf8',
      `rgba(129, 140, 248, ${0.8 + pulse * 0.2})`,
      [
        [[100, 111], [79, 88], [65, 69]],
        [[100, 111], [83, 92], [70, 74]],
        [[100, 111], [88, 97], [78, 81]],
      ],
      0.5
    );

    // Right Upper Broad Petal
    drawCymaticPetal(
      [[100, 111], [124, 104], [142, 84], [138, 66], [124, 72], [110, 92], [100, 111]],
      `rgba(252, 211, 77, ${0.2 + pulse * 0.1})`,
      '#fde047',
      `rgba(254, 240, 138, ${0.8 + pulse * 0.2})`,
      [
        [[100, 111], [121, 88], [135, 69]],
        [[100, 111], [117, 92], [130, 74]],
        [[100, 111], [112, 97], [122, 81]],
      ],
      0.6
    );

    // --- TIER 1: INNER FLANKING ASCENDING PETALS ---
    // Left Inner Flanking Petal
    drawCymaticPetal(
      [[100, 110], [84, 96], [76, 74], [81, 54], [91, 63], [97, 86], [100, 110]],
      `rgba(56, 189, 248, ${0.24 + pulse * 0.12})`,
      '#38bdf8',
      `rgba(34, 211, 238, ${0.85 + pulse * 0.15})`,
      [
        [[100, 110], [88, 82], [82, 56]],
        [[100, 110], [91, 86], [86, 62]],
        [[100, 110], [95, 90], [91, 70]],
      ],
      0.7
    );

    // Right Inner Flanking Petal
    drawCymaticPetal(
      [[100, 110], [116, 96], [124, 74], [119, 54], [109, 63], [103, 86], [100, 110]],
      `rgba(252, 211, 77, ${0.24 + pulse * 0.12})`,
      '#fde047',
      `rgba(254, 240, 138, ${0.85 + pulse * 0.15})`,
      [
        [[100, 110], [112, 82], [118, 56]],
        [[100, 110], [109, 86], [114, 62]],
        [[100, 110], [105, 90], [109, 70]],
      ],
      0.8
    );

    // --- TIER 0: CENTRAL MAJESTIC CROWN PETAL (Tallest center) ---
    drawCymaticPetal(
      [[100, 109], [89, 88], [88, 66], [100, 48], [112, 66], [111, 88], [100, 109]],
      `rgba(34, 211, 238, ${0.28 + pulse * 0.14})`,
      '#22d3ee',
      '#fef08a',
      [
        [[100, 109], [100, 49]], // Central straight axis
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
    ctx.arc(apexX, apexY, 3.2 + tonePulse * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.shadowBlur = 12 + tonePulse * 16;
    ctx.shadowColor = '#fde047';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(apexX, apexY, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // 6. Floating Celestial Stardust Embers (Dancing with Treble & Tone Harmonics)
    const stardustCount = 16;
    for (let s = 0; s < stardustCount; s++) {
      const sAngle = (s * Math.PI * 2) / stardustCount + phase * 0.22;
      const sRadius = innerR * (0.84 + Math.sin(phase * 1.4 + s) * 0.12 + tonePulse * 0.08);
      const sx = cx + Math.cos(sAngle) * sRadius;
      const sy = cy + Math.sin(sAngle) * (sRadius * 0.82);
      const sAlpha = 0.2 + Math.sin(phase * 1.5 + s) * 0.2 + treble * 0.45 + tonePulse * 0.25;

      ctx.beginPath();
      ctx.arc(sx, sy, 1.4 + treble * 1.6 + tonePulse * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = s % 2 === 0
        ? `rgba(254, 240, 138, ${Math.max(0, Math.min(1, sAlpha))})`
        : `rgba(56, 189, 248, ${Math.max(0, Math.min(1, sAlpha))})`;
      ctx.fill();
    }

    ctx.restore();
  };

  // =========================================================================
  // 1. REFINED SACRED LOTUS MANDALA (Silky Petal Bloom & Radiant Bindu Core)
  // =========================================================================
  const renderComfortMandala = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    pulse: number,
    dynamicPulse: number,
    rotation: number,
    phase: number,
    breathWave: number,
    preset: VisualComfortPreset,
    isLightMode: boolean = false
  ) => {
    const maxRadius = Math.min(cx, cy) * 0.88;
    const baseBreath = Math.sin(phase * 0.7) * 3.5;

    ctx.save();

    // In light mode, draw soft pearl background disc for illuminated manuscript contrast
    if (isLightMode) {
      const bgGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, maxRadius * 0.95);
      bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      bgGrad.addColorStop(0.7, 'rgba(248, 250, 252, 0.85)');
      bgGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * 0.95, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // 12 Outer Sacred Lotus Petals with Silk Bézier Curvature
    const petals = 12;
    const r1 = (34 + baseBreath + bassEnergy * 22) * dynamicPulse;
    const r2 = (86 + baseBreath * 1.2 + energy * 32) * dynamicPulse;

    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      const x1 = Math.cos(angle) * r1;
      const y1 = Math.sin(angle) * r1;
      const midAngle = angle + Math.PI / petals;
      const x2 = Math.cos(midAngle) * r2;
      const y2 = Math.sin(midAngle) * r2;

      // Outer flowing petal contour
      ctx.beginPath();
      const alphaVal = isLightMode
        ? preset === 'zen' ? 0.65 + pulse * 0.2 : 0.82 + pulse * 0.18
        : preset === 'zen' ? 0.32 + pulse * 0.16 : 0.44 + pulse * 0.22;
      ctx.strokeStyle = isLightMode
        ? (i % 2 === 0
            ? `rgba(2, 132, 199, ${alphaVal})`
            : `rgba(109, 40, 217, ${alphaVal * 0.95})`)
        : (i % 2 === 0
            ? `rgba(56, 189, 248, ${alphaVal})`
            : `rgba(167, 139, 250, ${alphaVal * 0.9})`);
      ctx.lineWidth = (isLightMode ? 1.7 : 1.4) + pulse * 0.5;
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(x2 * 1.18, y2 * 1.18, 0, 0);
      ctx.stroke();

      // Interlocking harmonic circles
      ctx.beginPath();
      ctx.strokeStyle = isLightMode
        ? `rgba(79, 70, 229, ${0.35 + pulse * 0.18})`
        : `rgba(129, 140, 248, ${0.14 + pulse * 0.12})`;
      ctx.lineWidth = isLightMode ? 1.1 : 0.9;
      ctx.arc(x1, y1, r1 * 0.62, 0, Math.PI * 2);
      ctx.stroke();

      // Delicate blooming sub-petal tip
      ctx.beginPath();
      ctx.strokeStyle = isLightMode
        ? `rgba(217, 119, 6, ${0.55 + pulse * 0.2})`
        : `rgba(253, 224, 71, ${0.2 + pulse * 0.15})`;
      ctx.lineWidth = isLightMode ? 1.0 : 0.8;
      ctx.arc(x2 * 0.88, y2 * 0.88, 3.5 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Inner Counter-Rotating Sacred Hexagram / Lotus Core
    const innerPetals = 6;
    const innerR = (22 + baseBreath * 0.6 + bassEnergy * 14) * dynamicPulse;
    for (let j = 0; j < innerPetals; j++) {
      const iAngle = (j * Math.PI * 2) / innerPetals - rotation * 1.5;
      const ix = Math.cos(iAngle) * innerR;
      const iy = Math.sin(iAngle) * innerR;

      ctx.beginPath();
      ctx.strokeStyle = isLightMode
        ? `rgba(180, 83, 9, ${0.65 + pulse * 0.2})`
        : `rgba(253, 224, 71, ${0.36 + pulse * 0.2})`;
      ctx.lineWidth = isLightMode ? 1.3 : 1.1;
      ctx.arc(ix, iy, innerR * 0.55, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer Harmonic Golden Ratio Ring
    ctx.beginPath();
    ctx.strokeStyle = isLightMode
      ? `rgba(67, 56, 202, ${0.45 + pulse * 0.2})`
      : `rgba(224, 231, 255, ${0.24 + pulse * 0.18})`;
    ctx.lineWidth = isLightMode ? 1.4 : 1.1;
    ctx.arc(0, 0, maxRadius * (0.8 + pulse * 0.05), 0, Math.PI * 2);
    ctx.stroke();

    // Secondary sub-harmonic ring
    ctx.beginPath();
    ctx.strokeStyle = isLightMode
      ? `rgba(2, 132, 199, ${0.35 + pulse * 0.16})`
      : `rgba(129, 140, 248, ${0.16 + pulse * 0.12})`;
    ctx.lineWidth = isLightMode ? 1.1 : 0.8;
    ctx.arc(0, 0, maxRadius * (0.55 + pulse * 0.03), 0, Math.PI * 2);
    ctx.stroke();

    // Central Sacred Golden Bindu Heart (Soothing warm glow, zero harshness)
    const coreR = Math.max(7, (19 + baseBreath + pulse * 6) * (0.96 + breathWave * 0.08));
    ctx.beginPath();
    const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, coreR);
    if (isLightMode) {
      coreGrad.addColorStop(0, 'rgba(245, 158, 11, 0.95)');
      coreGrad.addColorStop(0.4, `rgba(217, 119, 6, ${0.7 + pulse * 0.2})`);
      coreGrad.addColorStop(0.85, `rgba(180, 83, 9, ${0.35 + pulse * 0.15})`);
      coreGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    } else {
      coreGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      coreGrad.addColorStop(0.35, `rgba(245, 158, 11, ${0.58 + pulse * 0.2})`);
      coreGrad.addColorStop(0.8, `rgba(217, 70, 239, ${0.25 + pulse * 0.15})`);
      coreGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    }
    ctx.fillStyle = coreGrad;
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // =========================================================================
  // 2. REFINED LIQUID WATER CYMATICS & SOFT RADIATING RIPPLES
  // =========================================================================
  const renderComfortRipples = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    breathWave: number,
    preset: VisualComfortPreset,
    isLightMode: boolean = false
  ) => {
    const maxR = Math.min(cx, cy) * 0.92;
    const rings = 8;

    for (let i = 0; i < rings; i++) {
      // Eased cubic progression for silky expansion without popping
      const rawPhase = (phase * 0.7 + (i / rings) * Math.PI * 2) % (Math.PI * 2);
      const normalizedPhase = rawPhase / (Math.PI * 2);
      const radius = Math.pow(normalizedPhase, 0.88) * maxR * dynamicPulse;
      // Smooth sinusoidal transparency falloff
      const alpha = Math.sin(normalizedPhase * Math.PI) * (isLightMode ? (0.42 + energy * 0.35 + pulse * 0.2) : (0.26 + energy * 0.28 + pulse * 0.18));

      if (radius > 4 && radius < maxR * 1.05) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        const color = isLightMode
          ? (i % 2 === 0
              ? `rgba(2, 132, 199, ${Math.max(0, alpha)})`
              : `rgba(99, 102, 241, ${Math.max(0, alpha * 0.95)})`)
          : (i % 2 === 0
              ? `rgba(56, 189, 248, ${Math.max(0, alpha)})`
              : `rgba(129, 140, 248, ${Math.max(0, alpha * 0.88)})`);
        ctx.strokeStyle = color;
        ctx.lineWidth = (isLightMode ? 1.6 : 1.3) + (1 - radius / maxR) * (1.6 + pulse * 0.8);
        ctx.stroke();

        // Subtle water caustic shimmer
        if (i % 3 === 0 && radius < maxR * 0.6) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius * 1.02, 0, Math.PI * 2);
          ctx.strokeStyle = isLightMode
            ? `rgba(217, 119, 6, ${Math.max(0, alpha * 0.5)})`
            : `rgba(254, 240, 138, ${Math.max(0, alpha * 0.35)})`;
          ctx.lineWidth = isLightMode ? 1.0 : 0.8;
          ctx.stroke();
        }
      }
    }

    // Center peaceful water droplet jewel with refraction highlight
    const seedR = Math.max(5, (10 + energy * 6 + pulse * 8 + breathWave * 2.5));
    ctx.beginPath();
    ctx.arc(cx, cy, seedR, 0, Math.PI * 2);
    ctx.fillStyle = isLightMode
      ? `rgba(2, 132, 199, ${0.9 + pulse * 0.1})`
      : `rgba(186, 230, 253, ${0.84 + pulse * 0.15})`;
    ctx.shadowColor = isLightMode ? '#0284c7' : '#38bdf8';
    ctx.shadowBlur = 8 + pulse * 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // =========================================================================
  // 3. REFINED NORTHERN HARMONIC AURORA (Multi-Harmonic Flowing Silk)
  // =========================================================================
  const renderComfortAurora = (
    ctx: AnyCanvasContext,
    width: number,
    height: number,
    smoothedFft: Float32Array,
    energy: number,
    pulse: number,
    phase: number,
    breathWave: number,
    preset: VisualComfortPreset,
    isLightMode: boolean = false
  ) => {
    const ribbons = 3;
    const points = 32;
    const step = width / (points - 1);
    const baseHeight = height * 0.58;

    for (let r = 0; r < ribbons; r++) {
      ctx.beginPath();
      const rPhase = phase * 0.75 + r * 1.35;
      const amp = (24 + r * 14 + energy * 28 + pulse * 16) * (0.96 + breathWave * 0.08);

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
        const y = baseHeight + wave - (freqVal * 22);

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
      if (isLightMode) {
        if (r === 0) {
          grad.addColorStop(0, `rgba(2, 132, 199, ${0.55 + pulse * 0.2})`);
          grad.addColorStop(0.65, 'rgba(14, 165, 233, 0.12)');
          grad.addColorStop(1, 'rgba(248, 250, 252, 0)');
        } else if (r === 1) {
          grad.addColorStop(0, `rgba(109, 40, 217, ${0.48 + pulse * 0.18})`);
          grad.addColorStop(0.65, 'rgba(129, 140, 248, 0.10)');
          grad.addColorStop(1, 'rgba(248, 250, 252, 0)');
        } else {
          grad.addColorStop(0, `rgba(190, 24, 93, ${0.42 + pulse * 0.16})`);
          grad.addColorStop(0.65, 'rgba(217, 70, 239, 0.08)');
          grad.addColorStop(1, 'rgba(248, 250, 252, 0)');
        }
      } else {
        if (r === 0) {
          grad.addColorStop(0, `rgba(56, 189, 248, ${0.42 + pulse * 0.18})`);
          grad.addColorStop(0.65, 'rgba(14, 165, 233, 0.07)');
          grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
        } else if (r === 1) {
          grad.addColorStop(0, `rgba(167, 139, 250, ${0.35 + pulse * 0.16})`);
          grad.addColorStop(0.65, 'rgba(129, 140, 248, 0.05)');
          grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
        } else {
          grad.addColorStop(0, `rgba(244, 114, 182, ${0.3 + pulse * 0.15})`);
          grad.addColorStop(0.65, 'rgba(217, 70, 239, 0.04)');
          grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
        }
      }

      ctx.fillStyle = grad;
      ctx.fill();
    }
  };

  // =========================================================================
  // 4. REFINED SACRED FLOWER OF LIFE (Glowing Nexus Points & Breathing Matrix)
  // =========================================================================
  const renderComfortFlowerOfLife = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    energy: number,
    pulse: number,
    dynamicPulse: number,
    rotation: number,
    phase: number,
    breathWave: number,
    preset: VisualComfortPreset,
    isLightMode: boolean = false
  ) => {
    const unitR = (33 + Math.sin(phase * 0.6) * 2.5 + energy * 10) * (0.97 + breathWave * 0.06);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation * 0.3);

    const centers: [number, number][] = [[0, 0]];

    // Inner 6 Petal Nodes
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      centers.push([Math.cos(a) * unitR, Math.sin(a) * unitR]);
    }

    // Outer 12 Harmonizing Nodes
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      centers.push([Math.cos(a) * (unitR * 2), Math.sin(a) * (unitR * 2)]);
      const aMid = a + Math.PI / 6;
      centers.push([Math.cos(aMid) * (unitR * Math.sqrt(3)), Math.sin(aMid) * (unitR * Math.sqrt(3))]);
    }

    centers.forEach(([x, y], idx) => {
      ctx.beginPath();
      ctx.arc(x, y, unitR, 0, Math.PI * 2);
      if (isLightMode) {
        ctx.strokeStyle = idx === 0
          ? `rgba(217, 119, 6, ${0.85 + pulse * 0.15})`
          : `rgba(2, 132, 199, ${0.55 + (idx % 2) * 0.15 + pulse * 0.16})`;
        ctx.lineWidth = idx === 0 ? 1.8 : 1.3;
      } else {
        ctx.strokeStyle = idx === 0
          ? `rgba(254, 240, 138, ${0.6 + pulse * 0.18})`
          : `rgba(56, 189, 248, ${0.28 + (idx % 2) * 0.12 + pulse * 0.16})`;
        ctx.lineWidth = idx === 0 ? 1.5 : 1.0;
      }
      ctx.stroke();

      // Glowing Golden Nexus Bindu at node centers
      ctx.beginPath();
      ctx.arc(x, y, idx === 0 ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isLightMode
        ? (idx === 0 ? '#b45309' : `rgba(2, 132, 199, ${0.85 + pulse * 0.15})`)
        : (idx === 0 ? '#fef08a' : `rgba(186, 230, 253, ${0.6 + pulse * 0.2})`);
      ctx.fill();
    });

    // Outer Ring
    ctx.beginPath();
    ctx.arc(0, 0, unitR * 3, 0, Math.PI * 2);
    ctx.strokeStyle = isLightMode
      ? `rgba(67, 56, 202, ${0.5 + pulse * 0.2})`
      : `rgba(129, 140, 248, ${0.3 + pulse * 0.16})`;
    ctx.lineWidth = isLightMode ? 1.6 : 1.3;
    ctx.stroke();

    ctx.restore();
  };

  // =========================================================================
  // 5. REFINED COSMIC GALAXY (Twinkling Stardust & Orbital Nebula Core)
  // =========================================================================
  const renderComfortGalaxy = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    pulse: number,
    dynamicPulse: number,
    rotation: number,
    phase: number,
    preset: VisualComfortPreset,
    isLightMode: boolean = false
  ) => {
    const maxR = Math.min(cx, cy) * 0.88;

    // Glowing diffuse galactic core
    const coreR = Math.max(8, (26 + bassEnergy * 16 + pulse * 12));
    const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreR);
    if (isLightMode) {
      coreGrad.addColorStop(0, 'rgba(2, 132, 199, 0.85)');
      coreGrad.addColorStop(0.35, `rgba(99, 102, 241, ${0.65 + pulse * 0.18})`);
      coreGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.25)');
      coreGrad.addColorStop(1, 'rgba(248, 250, 252, 0)');
    } else {
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreGrad.addColorStop(0.35, `rgba(56, 189, 248, ${0.58 + pulse * 0.18})`);
      coreGrad.addColorStop(0.7, 'rgba(129, 140, 248, 0.22)');
      coreGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    }
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);

    // 90 Orbiting Stardust Particles in 3 logarithmic spiral arms with organic twinkling
    const totalStars = 90;
    const arms = 3;

    for (let i = 0; i < totalStars; i++) {
      const armIdx = i % arms;
      const progress = i / totalStars;
      const dist = progress * maxR * dynamicPulse;

      const armAngle = (armIdx * Math.PI * 2) / arms;
      const spiralAngle = armAngle + progress * 3.7 + rotation * 1.3;

      const px = Math.cos(spiralAngle) * dist;
      const py = Math.sin(spiralAngle) * dist;

      // Twinkle formula prevents abrupt brightness jumps
      const twinkle = (0.75 + 0.25 * Math.sin(i * 4.3 + phase * 1.5));
      const starSize = (1 - progress * 0.3) * (1.4 + (i % 2) * 0.6 + energy * 1.2 + pulse * 1.2) * twinkle;
      const alpha = (1 - progress * 0.55) * (0.32 + energy * 0.28 + pulse * 0.2) * twinkle;

      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.6, starSize), 0, Math.PI * 2);
      if (isLightMode) {
        ctx.fillStyle = i % 2 === 0
          ? `rgba(2, 132, 199, ${Math.min(1, alpha * 1.4)})`
          : `rgba(109, 40, 217, ${Math.min(1, alpha * 1.4)})`;
      } else {
        ctx.fillStyle = i % 2 === 0
          ? `rgba(56, 189, 248, ${Math.min(1, alpha)})`
          : `rgba(216, 180, 254, ${Math.min(1, alpha)})`;
      }
      ctx.fill();
    }

    ctx.restore();
  };

  // =========================================================================
  // 6. REFINED CYMATIC LIQUID WAVES (Layered Harmonics & Smooth Satin Ribbons)
  // =========================================================================
  const renderComfortWaves = (
    ctx: AnyCanvasContext,
    width: number,
    height: number,
    smoothedFft: Float32Array,
    waveArray: Uint8Array,
    energy: number,
    pulse: number,
    phase: number,
    preset: VisualComfortPreset,
    isLightMode: boolean = false
  ) => {
    const centerY = height / 2;
    const waveCount = 3;

    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      const waveFreq = (w + 1) * 0.0055;
      const amp = 18 + w * 12 + energy * 24 + pulse * 14;
      const wPhase = phase * (0.75 + w * 0.18);

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

      if (isLightMode) {
        ctx.strokeStyle = w === 0
          ? `rgba(2, 132, 199, ${0.85 + pulse * 0.15})`
          : w === 1
          ? `rgba(109, 40, 217, ${0.78 + pulse * 0.15})`
          : `rgba(190, 24, 93, ${0.72 + pulse * 0.15})`;
        ctx.lineWidth = 1.9 + pulse * 0.6;
      } else {
        ctx.strokeStyle = w === 0
          ? `rgba(56, 189, 248, ${0.7 + pulse * 0.18})`
          : w === 1
          ? `rgba(167, 139, 250, ${0.6 + pulse * 0.18})`
          : `rgba(244, 114, 182, ${0.5 + pulse * 0.18})`;
        ctx.lineWidth = 1.6 + pulse * 0.6;
      }
      ctx.stroke();
    }
  };

  // =========================================================================
  // 7. REFINED PRANIC BIOFIELD ORB (Living Corona & Radiant Halo)
  // =========================================================================
  const renderComfortPranicOrb = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    energy: number,
    bassEnergy: number,
    mids: number,
    treble: number,
    pulse: number,
    dynamicPulse: number,
    phase: number,
    breathWave: number,
    preset: VisualComfortPreset,
    isLightMode: boolean = false
  ) => {
    const baseR = (48 + Math.sin(phase * 0.65) * 10 + bassEnergy * 16 + breathWave * 12) * dynamicPulse;

    // Glowing Ethereal Halo
    const haloGrad = ctx.createRadialGradient(cx, cy, baseR * 0.35, cx, cy, baseR * 1.8);
    if (isLightMode) {
      haloGrad.addColorStop(0, `rgba(2, 132, 199, ${0.45 + pulse * 0.18})`);
      haloGrad.addColorStop(0.5, `rgba(99, 102, 241, ${0.25 + energy * 0.15})`);
      haloGrad.addColorStop(1, 'transparent');
    } else {
      haloGrad.addColorStop(0, `rgba(56, 189, 248, ${0.36 + pulse * 0.16})`);
      haloGrad.addColorStop(0.5, `rgba(129, 140, 248, ${0.18 + energy * 0.12})`);
      haloGrad.addColorStop(1, 'transparent');
    }

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Biofield Corona Rays
    const rays = 20;
    for (let r = 0; r < rays; r++) {
      const angle = (r * Math.PI * 2) / rays + phase * 0.22;
      const rayLen = 8 + (r % 3) * 5 + treble * 10 + pulse * 8;
      const x1 = cx + Math.cos(angle) * (baseR * 0.98);
      const y1 = cy + Math.sin(angle) * (baseR * 0.98);
      const x2 = cx + Math.cos(angle) * (baseR * 0.98 + rayLen);
      const y2 = cy + Math.sin(angle) * (baseR * 0.98 + rayLen);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isLightMode
        ? `rgba(2, 132, 199, ${0.45 + pulse * 0.2})`
        : `rgba(186, 230, 253, ${0.3 + pulse * 0.18})`;
      ctx.lineWidth = isLightMode ? 1.4 : 1.1;
      ctx.stroke();
    }

    // Inner Living Biological Prana Core
    const orbGrad = ctx.createRadialGradient(
      cx - baseR * 0.22,
      cy - baseR * 0.22,
      2,
      cx,
      cy,
      baseR
    );
    if (isLightMode) {
      orbGrad.addColorStop(0, '#ffffff');
      orbGrad.addColorStop(0.3, `rgba(14, 165, 233, ${0.95 + pulse * 0.05})`);
      orbGrad.addColorStop(0.7, `rgba(79, 70, 229, ${0.85 + pulse * 0.1})`);
      orbGrad.addColorStop(1, 'rgba(67, 56, 202, 0.45)');
    } else {
      orbGrad.addColorStop(0, '#ffffff');
      orbGrad.addColorStop(0.3, `rgba(56, 189, 248, ${0.9 + pulse * 0.1})`);
      orbGrad.addColorStop(0.7, `rgba(129, 140, 248, ${0.75 + pulse * 0.15})`);
      orbGrad.addColorStop(1, 'rgba(15, 23, 42, 0.3)');
    }

    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.fill();
  };

  // =========================================================================
  // MUSICAL MODE: SUBTLE PASTEL INDIGO ETHEREAL HARMONIC PAD GLOW EFFECT
  // Pulses in exact sync with ambient ethereal pads & slow chord swells
  // =========================================================================
  const renderComfortMusicalPadIndigoGlow = (
    ctx: AnyCanvasContext,
    cx: number,
    cy: number,
    envelope: number,
    peakBloom: number,
    frequencies: number[],
    rotation: number,
    phase: number,
    isLightMode: boolean
  ) => {
    if (envelope <= 0.005) return;

    ctx.save();
    const maxR = Math.min(cx, cy);

    // 1. Soft Pastel Indigo Radial Breathing Aura (Scales dynamically with peak volume)
    const padAuraRadius = maxR * (0.86 + envelope * 0.26 + peakBloom * 0.22);
    const padAura = ctx.createRadialGradient(cx, cy, maxR * 0.06, cx, cy, padAuraRadius);

    const baseAlpha = isLightMode ? 0.16 : 0.22;
    const pulseAlpha = baseAlpha * envelope * (1 + peakBloom * 1.15);

    padAura.addColorStop(0, `rgba(224, 231, 255, ${pulseAlpha * 1.35})`);
    padAura.addColorStop(0.32, `rgba(199, 210, 254, ${pulseAlpha * 1.0})`);
    padAura.addColorStop(0.64, `rgba(165, 180, 252, ${pulseAlpha * 0.6})`);
    padAura.addColorStop(0.88, `rgba(129, 140, 248, ${pulseAlpha * 0.25})`);
    padAura.addColorStop(1, 'rgba(165, 180, 252, 0)');

    ctx.fillStyle = padAura;
    ctx.beginPath();
    ctx.arc(cx, cy, padAuraRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Harmonic Pad Resonance Waves (2 concentric delicate glowing rings pulsing with chord swell & peak bloom)
    const ringCount = 2;
    for (let r = 0; r < ringCount; r++) {
      const ringPhase = phase * 0.6 + r * (Math.PI / ringCount);
      const ringRadius = maxR * (0.44 + r * 0.23 + Math.sin(ringPhase) * 0.025 + envelope * 0.07 + peakBloom * 0.08);

      ctx.save();
      ctx.shadowColor = isLightMode ? 'rgba(99, 102, 241, 0.45)' : 'rgba(165, 180, 252, 0.6)';
      ctx.shadowBlur = 12 + envelope * 14 + peakBloom * 22;

      ctx.strokeStyle = isLightMode
        ? `rgba(129, 140, 248, ${0.16 + envelope * 0.26 + peakBloom * 0.3})`
        : `rgba(199, 210, 254, ${0.2 + envelope * 0.35 + peakBloom * 0.38})`;
      ctx.lineWidth = 1.2 + envelope * 0.7 + peakBloom * 1.4;

      ctx.beginPath();
      const steps = 72;
      for (let s = 0; s <= steps; s++) {
        const angle = (s / steps) * Math.PI * 2;
        // 4 lobes matching 4 polyphonic voices in sacred Solfeggio pad chord
        const ripple = Math.sin(angle * 4 + rotation * 1.5 + ringPhase) * (2.0 + envelope * 4.5 + peakBloom * 4.0);
        const curR = ringRadius + ripple;
        const px = cx + Math.cos(angle) * curR;
        const py = cy + Math.sin(angle) * curR;
        if (s === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Subtle Harmonic Chord Orbital Nodes (4 voices)
    const chordVoices = frequencies.length > 0 ? frequencies.slice(0, 4) : [1, 2, 3, 4];
    chordVoices.forEach((_, idx) => {
      const nodeAngle = rotation * 0.75 + (idx * (Math.PI / 2)) + Math.sin(phase * 0.4 + idx) * 0.12;
      const nodeDist = maxR * (0.62 + envelope * 0.1 + peakBloom * 0.08);
      const nx = cx + Math.cos(nodeAngle) * nodeDist;
      const ny = cy + Math.sin(nodeAngle) * nodeDist;

      ctx.save();
      ctx.shadowColor = 'rgba(199, 210, 254, 0.85)';
      ctx.shadowBlur = 8 + envelope * 12 + peakBloom * 16;

      const nodeRadius = 5 + envelope * 5 + peakBloom * 4;
      const nodeGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nodeRadius);
      nodeGrad.addColorStop(0, `rgba(255, 255, 255, ${0.35 + envelope * 0.5 + peakBloom * 0.3})`);
      nodeGrad.addColorStop(0.4, `rgba(199, 210, 254, ${0.25 + envelope * 0.4 + peakBloom * 0.25})`);
      nodeGrad.addColorStop(1, 'rgba(165, 180, 252, 0)');

      ctx.fillStyle = nodeGrad;
      ctx.beginPath();
      ctx.arc(nx, ny, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  };

  // =========================================================================
  // ETHERIC BLOOM: POST-PROCESSING SHADER EFFECT
  // Dynamically scales the intensity of the indigo glow pulse specifically
  // when Musical Mode ambient chord swells peak in volume
  // =========================================================================
  const applyEthericBloomPostProcess = (
    ctx: AnyCanvasContext,
    width: number,
    height: number,
    cx: number,
    cy: number,
    peakBloom: number,
    frequencies: number[],
    phase: number,
    isLightMode: boolean
  ) => {
    if (peakBloom <= 0.005) return;

    ctx.save();
    const maxR = Math.min(cx, cy);

    // 1. High-Luminance 'Etheric Bloom' Radial Light Flood
    const bloomRadius = maxR * (1.18 + peakBloom * 0.42);
    const bloomGrad = ctx.createRadialGradient(cx, cy, maxR * 0.04, cx, cy, bloomRadius);

    // Optical 'screen' blend mode for luminous additive bloom on dark canvas
    ctx.globalCompositeOperation = isLightMode ? 'source-over' : 'screen';

    const bloomAlpha = (isLightMode ? 0.32 : 0.54) * peakBloom;

    // Multi-stop soft pastel indigo etheric bloom
    bloomGrad.addColorStop(0, `rgba(238, 242, 255, ${bloomAlpha * 1.35})`); // Pure etheric pearl-white/indigo core
    bloomGrad.addColorStop(0.24, `rgba(199, 210, 254, ${bloomAlpha * 1.05})`); // Luminous soft pastel indigo
    bloomGrad.addColorStop(0.52, `rgba(165, 180, 252, ${bloomAlpha * 0.72})`); // Soft mid pastel indigo
    bloomGrad.addColorStop(0.78, `rgba(129, 140, 248, ${bloomAlpha * 0.35})`); // Lavender-indigo outer halo
    bloomGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');

    ctx.fillStyle = bloomGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, bloomRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Etheric Corona Harmonic Rays (8 ethereal light filaments blooming outward during swell peak)
    const rayCount = 8;
    const rayLen = maxR * (0.84 + peakBloom * 0.38);
    ctx.globalCompositeOperation = isLightMode ? 'source-over' : 'lighter';

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + phase * 0.22;
      const rayGrad = ctx.createLinearGradient(
        cx,
        cy,
        cx + Math.cos(angle) * rayLen,
        cy + Math.sin(angle) * rayLen
      );
      rayGrad.addColorStop(0, `rgba(224, 231, 255, ${0.45 * peakBloom})`);
      rayGrad.addColorStop(0.42, `rgba(165, 180, 252, ${0.28 * peakBloom})`);
      rayGrad.addColorStop(1, 'rgba(129, 140, 248, 0)');

      ctx.strokeStyle = rayGrad;
      ctx.lineWidth = 1.8 + peakBloom * 3.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(angle) * rayLen,
        cy + Math.sin(angle) * rayLen
      );
      ctx.stroke();
    }

    // 3. Resonant Aureole Aperture (Ethereal shimmering ring at the perimeter of the bloom)
    const ringR = maxR * (0.76 + peakBloom * 0.2);
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(199, 210, 254, ${0.48 * peakBloom})`;
    ctx.lineWidth = 1.5 + peakBloom * 2.5;
    ctx.shadowColor = 'rgba(165, 180, 252, 0.85)';
    ctx.shadowBlur = 22 + peakBloom * 30;
    ctx.stroke();

    // 4. Etheric Swell Starburst Aperture (Appears specifically during volume peak swells)
    if (peakBloom > 0.3) {
      const starR = maxR * (0.35 + peakBloom * 0.25);
      ctx.save();
      ctx.globalCompositeOperation = isLightMode ? 'source-over' : 'lighter';
      ctx.strokeStyle = `rgba(238, 242, 255, ${(peakBloom - 0.3) * 0.8})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + phase * 0.15;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * starR, cy + Math.sin(a) * starR);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  };

  const isMusicalModeActive = isMusicalMode ?? audioEngine.isMusicalModeActive();

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md mx-auto aspect-square rounded-3xl overflow-hidden border p-2 select-none group cursor-grab active:cursor-grabbing touch-pan-y transition-all duration-500 landscape:max-h-[58vh] landscape:max-w-[58vh] ${
        effectiveIsLight
          ? isPlaying
            ? isMusicalModeActive && padBloomState.peakBloom > 0.1
              ? 'bg-white border-indigo-450 ring-1 ring-indigo-300'
              : 'bg-white border-sky-400 shadow-[0_10px_35px_rgba(14,165,233,0.18)] ring-1 ring-sky-300'
            : 'bg-white border-slate-200/90 shadow-xl'
          : isPlaying
            ? isMusicalModeActive && padBloomState.peakBloom > 0.1
              ? 'bg-slate-950/80 border-indigo-400/70 ring-1 ring-indigo-400/40'
              : 'bg-slate-950/80 border-sky-500/50 shadow-[0_0_40px_rgba(56,189,248,0.22)] ring-1 ring-sky-400/30'
            : 'bg-slate-950/80 border-slate-800/80 shadow-2xl'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onWheel={handleWheel}
      style={{
        touchAction: 'pan-y',
        boxShadow:
          isPlaying && isMusicalModeActive && padBloomState.peakBloom > 0.04
            ? effectiveIsLight
              ? `0 10px 45px rgba(129, 140, 248, ${0.2 + padBloomState.peakBloom * 0.35}), 0 0 ${20 + padBloomState.peakBloom * 35}px rgba(165, 180, 252, ${0.2 + padBloomState.peakBloom * 0.35})`
              : `0 0 ${35 + padBloomState.peakBloom * 65}px rgba(165, 180, 252, ${0.28 + padBloomState.peakBloom * 0.45}), inset 0 0 ${40 + padBloomState.peakBloom * 35}px rgba(199, 210, 254, ${0.12 + padBloomState.peakBloom * 0.28})`
            : undefined,
      }}
    >
      {/* Subtle organic pulse animations when audio engine is active to make UI feel alive */}
      {isPlaying && (
        <>
          <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-t from-sky-500/10 via-transparent to-indigo-500/10 animate-pulse duration-[3000ms]" />
          <div className="absolute -inset-1 rounded-[2rem] pointer-events-none border border-sky-400/20 animate-ping opacity-25 duration-[4000ms]" />
          <div className="absolute inset-6 rounded-full pointer-events-none bg-radial from-sky-400/5 to-transparent animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
        </>
      )}

      {/* Subtle Pastel Indigo Ambient Glow pulsing in sync with Musical Mode ethereal pads & Etheric Bloom */}
      {isPlaying && isMusicalModeActive && (
        <>
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-300 bg-radial from-indigo-200/15 via-indigo-400/8 to-transparent"
            style={{
              opacity: 0.38 + padBloomState.peakBloom * 0.62,
              boxShadow: `inset 0 0 ${48 + padBloomState.peakBloom * 45}px rgba(165, 180, 252, ${0.18 + padBloomState.peakBloom * 0.35})`,
            }}
          />
          {padBloomState.peakBloom > 0.05 && (
            <div
              className="absolute -inset-1.5 rounded-[2.1rem] pointer-events-none border border-indigo-400/30 transition-all duration-300"
              style={{
                opacity: 0.25 + padBloomState.peakBloom * 0.65,
                transform: `scale(${1 + padBloomState.peakBloom * 0.03})`,
                boxShadow: `0 0 ${20 + padBloomState.peakBloom * 35}px rgba(165, 180, 252, ${0.25 + padBloomState.peakBloom * 0.45})`,
              }}
            />
          )}
        </>
      )}

      {/* 432Hz Soundstage Visualizer Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none transition-transform duration-150 ease-out"
        style={{
          transform: dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
        }}
      />

      {/* Floating Swipe Direction Feedback Indicator */}
      {swipeFeedback && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-2xl backdrop-blur-xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
          effectiveIsLight
            ? 'bg-white/95 border-sky-400 text-slate-900'
            : 'bg-slate-950/90 border-sky-400/50 text-white'
        }`}>
          <span className="text-xs text-sky-500 font-bold">
            {swipeFeedback.direction === 'left' ? '→' : '←'}
          </span>
          <span className={`text-xs font-semibold tracking-wide ${effectiveIsLight ? 'text-slate-900' : 'text-white'}`}>
            {swipeFeedback.name}
          </span>
        </div>
      )}

      {/* Left/Right Floating Quick Switch Chevrons (Touch & Click Access) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          switchToNextVisualizer('prev');
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border opacity-60 hover:opacity-100 transition-all flex items-center justify-center shadow-lg active:scale-95 cursor-pointer ${
          effectiveIsLight
            ? 'bg-white/80 hover:bg-white border-slate-300 text-slate-700 hover:text-sky-600'
            : 'bg-slate-950/70 hover:bg-slate-900 border-slate-700/60 text-slate-400 hover:text-sky-300'
        }`}
        title="Previous Visualizer (or swipe right)"
        aria-label="Previous Visualizer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          switchToNextVisualizer('next');
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border opacity-60 hover:opacity-100 transition-all flex items-center justify-center shadow-lg active:scale-95 cursor-pointer ${
          effectiveIsLight
            ? 'bg-white/80 hover:bg-white border-slate-300 text-slate-700 hover:text-sky-600'
            : 'bg-slate-950/70 hover:bg-slate-900 border-slate-700/60 text-slate-400 hover:text-sky-300'
        }`}
        title="Next Visualizer (or swipe left)"
        aria-label="Next Visualizer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Top Left: Frequency & Alpha Beat Badge */}
      <div className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-lg pointer-events-none ${
        effectiveIsLight
          ? 'bg-white/90 border-slate-200 text-slate-800'
          : 'bg-slate-950/85 border-slate-700/60 text-slate-200'
      }`}>
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
        <span className={`text-[11px] font-mono font-semibold ${effectiveIsLight ? 'text-sky-700' : 'text-sky-200'}`}>{freqBadgeInfo.baseText}</span>
        <span className={`text-[9px] font-medium ${effectiveIsLight ? 'text-slate-600' : 'text-slate-400'}`}>| {freqBadgeInfo.beatText}</span>
      </div>

      {/* Subtle Pastel Indigo Musical Mode Indicator with Etheric Bloom state */}
      {isPlaying && isMusicalModeActive && (
        <div className={`absolute top-9 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-md border shadow-lg pointer-events-none transition-all duration-300 ${
          padBloomState.isPeak
            ? 'bg-indigo-600/35 border-indigo-300/70 text-indigo-100 shadow-[0_0_16px_rgba(165,180,252,0.45)]'
            : effectiveIsLight
            ? 'bg-indigo-50/90 border-indigo-200 text-indigo-800'
            : 'bg-indigo-950/80 border-indigo-400/40 text-indigo-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-indigo-400 ${padBloomState.isPeak ? 'animate-ping' : 'animate-pulse'}`} />
          <span className="text-[10px] font-medium tracking-wide">
            {padBloomState.isPeak ? '✦ Etheric Bloom Peak' : '♫ Ethereal Pad Active'}
          </span>
        </div>
      )}

      {/* Top Right: Visualizer Animation Settings & Fullscreen Zen Mode (Standard UX Hierarchy) */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
        {/* Visualizer Comfort & Animation Settings */}
        <button
          type="button"
          onClick={() => setShowComfortMenu(!showComfortMenu)}
          className={`px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-full border backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5 text-[11px] cursor-pointer ${
            showComfortMenu
              ? 'bg-sky-500/20 text-sky-300 border-sky-400/60 ring-1 ring-sky-400/40'
              : effectiveIsLight
              ? 'bg-white/90 hover:bg-slate-100 text-slate-700 hover:text-sky-700 border-slate-200'
              : 'bg-slate-950/85 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border-slate-700/60'
          }`}
          title="Adjust Visualizer Comfort & Animation Speed"
          aria-label="Adjust Visualizer Comfort & Animation Speed"
        >
          <Sliders className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className={`hidden sm:inline text-[11px] font-medium ${effectiveIsLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {currentComfortPreset.label}
          </span>
        </button>

        {/* Ambient Zen Mode Trigger (Standard Far-Right Fullscreen Placement) */}
        {onOpenAmbientMode && (
          <button
            type="button"
            onClick={onOpenAmbientMode}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-full border backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5 text-[11px] cursor-pointer group ${
              effectiveIsLight
                ? 'bg-white/90 hover:bg-slate-100 text-slate-700 hover:text-amber-700 border-slate-200'
                : 'bg-slate-950/85 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border-slate-700/60'
            }`}
            title="Open Fullscreen Ambient Sanctuary"
            aria-label="Open Fullscreen Ambient Sanctuary"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className={`text-[11px] font-medium hidden sm:inline ${effectiveIsLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Zen
            </span>
          </button>
        )}
      </div>

      {/* Comfort & Animation Flow Controls Menu */}
      {showComfortMenu && (
        <div
          className={`absolute top-12 right-2.5 z-30 w-60 backdrop-blur-xl border rounded-2xl p-2.5 shadow-2xl animate-in fade-in zoom-in-95 text-left space-y-2.5 ${
            effectiveIsLight
              ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/50'
              : 'bg-slate-950/95 border-slate-800 text-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-sky-500" />
              <span>Animation Refinement</span>
            </span>
            <button
              onClick={() => setShowComfortMenu(false)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
              aria-label="Close animation refinement menu"
            >
              ✕
            </button>
          </div>

          {/* Visual Comfort Profile */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 px-1">Comfort Profile</div>
            <div className="space-y-1">
              {COMFORT_PRESETS.map((p) => {
                const isSelected = comfortPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setComfortPreset(p.id)}
                    className={`w-full p-2 rounded-xl text-left transition-all text-[11px] flex items-start gap-2 ${
                      isSelected
                        ? 'bg-sky-500/20 border border-sky-400/50 text-sky-800 dark:text-sky-200'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <span className="text-sm mt-0.5">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold flex items-center justify-between">
                        <span>{p.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-sky-500" />}
                      </div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flow Motion Speed */}
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 px-1 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-indigo-500" />
              <span>Flow Speed</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {FLOW_SPEEDS.map((s) => {
                const isSelected = flowSpeed === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setFlowSpeed(s.id)}
                    className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-700 dark:text-indigo-200 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    title={s.desc}
                  >
                    {s.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Visualizer Mode Switcher (Symmetrical, Accessible, Integrated Dots, Zero cut-off) */}
      <div className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center justify-between gap-1.5 backdrop-blur-xl px-2.5 py-1 rounded-2xl border shadow-2xl text-[11px] max-w-[94%] ${
        effectiveIsLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-950/90 border-slate-700/80 text-sky-200'
      }`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            switchToNextVisualizer('prev');
          }}
          className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Previous Sacred Visualizer"
          aria-label="Previous Sacred Visualizer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowModePicker(!showModePicker);
          }}
          className={`group flex flex-col items-center justify-center gap-1 px-3 py-1 min-h-[42px] rounded-xl transition-colors font-medium whitespace-nowrap cursor-pointer ${
            effectiveIsLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-slate-800/80 text-sky-200'
          }`}
          title="Tap to select sacred visualizer pattern (or swipe horizontally)"
          aria-label={`Select visualizer pattern, current is ${currentModeInfo.label}`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold leading-tight">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{currentModeInfo.label}</span>
            <span className={`text-[10px] font-mono ${effectiveIsLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ({currentModeInfo.displayNumber}/{currentModeInfo.totalCount})
            </span>
            <ChevronUp className="w-3 h-3 text-slate-400/80 group-hover:text-sky-400 transition-colors shrink-0" />
          </div>

          {/* Integrated Visualizer Mode Pagination Dots (Visual swipe indicator) */}
          <div
            aria-hidden="true"
            className="flex items-center gap-1 pointer-events-none select-none mt-0.5"
          >
            {VISUALIZER_MODES.map((m) => {
              const isActive = m.id === mode;
              return (
                <span
                  key={m.id}
                  className={`transition-all rounded-full ${
                    isActive
                      ? 'w-3 h-1 bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]'
                      : 'w-1 h-1 bg-slate-400/50 dark:bg-slate-600/70'
                  }`}
                />
              );
            })}
          </div>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            switchToNextVisualizer('next');
          }}
          className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-400 hover:text-sky-300 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          title="Next Sacred Visualizer"
          aria-label="Next Sacred Visualizer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Picker Popover Modal */}
      {showModePicker && (
        <div
          className={`absolute inset-0 backdrop-blur-xl rounded-3xl z-20 p-4 sm:p-5 flex flex-col justify-center items-center animate-in fade-in zoom-in-95 shadow-2xl ${
            effectiveIsLight ? 'bg-white/95 border border-slate-200 text-slate-800' : 'bg-slate-950/95 text-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between w-full px-2">
            <span className={`flex items-center gap-1.5 ${effectiveIsLight ? 'text-sky-700' : 'text-sky-300'}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sacred Geometries</span>
            </span>
            <button
              onClick={() => setShowModePicker(false)}
              className={`text-xs p-1 ${effectiveIsLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              aria-label="Close visualizer pattern selection"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full overflow-hidden px-1">
            {VISUALIZER_MODES.map((m) => {
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    setShowModePicker(false);
                  }}
                  className={`p-2 rounded-xl text-left border transition-all text-[11px] ${
                    isSelected
                      ? effectiveIsLight
                        ? 'bg-sky-100 border-sky-400 text-sky-800 font-semibold shadow-sm'
                        : 'bg-sky-500/25 border-sky-400 text-sky-200 font-semibold shadow-sm'
                      : effectiveIsLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate">{m.label}</span>
                    {isSelected && <Check className={`w-3 h-3 shrink-0 ${effectiveIsLight ? 'text-sky-600' : 'text-sky-400'}`} />}
                  </div>
                  <div className={`text-[9px] truncate ${effectiveIsLight ? 'text-slate-500' : 'text-slate-400'}`}>{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function areVisualizerPropsEqual(
  prevProps: AudioVisualizerProps,
  nextProps: AudioVisualizerProps
): boolean {
  return (
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.baseFreq === nextProps.baseFreq &&
    prevProps.alphaBeatHz === nextProps.alphaBeatHz &&
    prevProps.brainwaveName === nextProps.brainwaveName &&
    prevProps.isLight === nextProps.isLight
  );
}

export const AudioVisualizer = React.memo<AudioVisualizerProps>(
  AudioVisualizerComponent,
  areVisualizerPropsEqual
);

