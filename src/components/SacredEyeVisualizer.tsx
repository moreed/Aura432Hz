import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import { breathSyncEngine } from '../services/breathSyncEngine';

export type SacredEyePalette = 'celestial' | 'gold' | 'emerald' | 'violet' | 'obsidian';

export interface SacredEyeVisualizerProps {
  isPlaying: boolean;
  isLight?: boolean;
  flowSpeed?: 0.75 | 1.0 | 1.3;
  comfortPreset?: 'zen' | 'harmony' | 'glow';
  palette?: SacredEyePalette;
  size?: 'card' | 'ambient';
  parallaxX?: number;
  parallaxY?: number;
}

/**
 * SacredEyeVisualizer
 * Pure CSS multi-layered 3D geometric rotation "All-Seeing Eye" depth illusion.
 * Synchronizes live with Breathwork phase (plus slow 5.5s fallback breath) and
 * subtle audio energy by updating CSS custom properties directly via DOM ref
 * for zero-re-render 60-120fps GPU-composited smoothness.
 */
export const SacredEyeVisualizer: React.FC<SacredEyeVisualizerProps> = ({
  isPlaying,
  isLight = false,
  flowSpeed = 1.0,
  comfortPreset = 'harmony',
  palette = 'celestial',
  size = 'card',
  parallaxX = 0,
  parallaxY = 0,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const configRef = useRef({ isPlaying, flowSpeed, parallaxX, parallaxY });

  useEffect(() => {
    configRef.current = { isPlaying, flowSpeed, parallaxX, parallaxY };
  }, [isPlaying, flowSpeed, parallaxX, parallaxY]);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    let rafId = 0;
    let smoothEnergy = 0.14;
    let smoothTiltX = 0;
    let smoothTiltY = 0;
    let pointerX = 0;
    let pointerY = 0;
    const freqBins = new Uint8Array(64);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = stageEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointerX = Math.max(-1, Math.min(1, nx));
      pointerY = Math.max(-1, Math.min(1, ny));
    };

    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    const tick = (now: number) => {
      const cfg = configRef.current;
      const breathVisual = breathSyncEngine.getVisualState(now, cfg.flowSpeed);

      let targetEnergy = 0.14;
      if (cfg.isPlaying) {
        const analyser = audioEngine.getAnalyser();
        if (analyser) {
          analyser.getByteFrequencyData(freqBins);
          let sum = 0;
          for (let i = 0; i < 24; i++) {
            sum += freqBins[i];
          }
          targetEnergy = Math.min(1, (sum / (24 * 255)) * 1.35);
        }
      }

      const targetX = (cfg.parallaxX || pointerX) * 11;
      const targetY = -(cfg.parallaxY || pointerY) * 9;

      smoothEnergy += (targetEnergy - smoothEnergy) * 0.08;
      smoothTiltX += (targetX - smoothTiltX) * 0.06;
      smoothTiltY += (targetY - smoothTiltY) * 0.06;

      const breathEased = breathVisual.breathEased;
      const holdStillness = breathVisual.holdStillness;
      const breathScale = breathVisual.isSynced
        ? 0.93 + breathEased * 0.14
        : 0.97 + breathEased * 0.06;

      stageEl.style.setProperty('--se-breath', breathEased.toFixed(4));
      stageEl.style.setProperty('--se-hold', holdStillness.toFixed(4));
      stageEl.style.setProperty('--se-energy', smoothEnergy.toFixed(4));
      stageEl.style.setProperty('--se-breath-scale', breathScale.toFixed(4));
      stageEl.style.setProperty('--se-tilt-x', `${smoothTiltX.toFixed(2)}deg`);
      stageEl.style.setProperty('--se-tilt-y', `${smoothTiltY.toFixed(2)}deg`);

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  const speedClass =
    flowSpeed <= 0.8
      ? 'sacred-eye-speed-slow'
      : flowSpeed >= 1.2
      ? 'sacred-eye-speed-fast'
      : 'sacred-eye-speed-normal';

  const comfortClass = `sacred-eye-comfort-${comfortPreset}`;
  const sizeClass = size === 'ambient' ? 'sacred-eye-ambient' : 'sacred-eye-card';
  const paletteClass = palette !== 'celestial' ? `sacred-eye-palette-${palette}` : '';
  const themeClass = isLight ? 'sacred-eye-light' : '';
  const playClass = isPlaying ? '' : 'sacred-eye-paused';

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className={`sacred-eye-stage ${sizeClass} ${speedClass} ${comfortClass} ${paletteClass} ${themeClass} ${playClass}`}
    >
      <div className="sacred-eye-scene">
        {/* Layer 1: Breath-reactive radiant corona & hold bloom */}
        <div className="sacred-eye-layer sacred-eye-aura" />

        {/* Layer 2: Counter-rotating celestial sunburst rays */}
        <div className="sacred-eye-layer sacred-eye-rays-outer" />
        <div className="sacred-eye-layer sacred-eye-rays-inner" />

        {/* Layer 3: Astrolabe precision degree dial & orbital rim */}
        <div className="sacred-eye-layer sacred-eye-astrolabe" />
        <div className="sacred-eye-layer sacred-eye-astrolabe-rim" />

        {/* Layer 4: Interlocking counter-rotating sacred triangles (Hexagram) */}
        <div className="sacred-eye-layer sacred-eye-tri-cw" />
        <div className="sacred-eye-layer sacred-eye-tri-ccw" />

        {/* Layer 5: Interlocking counter-rotating sacred octagram squares */}
        <div className="sacred-eye-layer sacred-eye-octa-a" />
        <div className="sacred-eye-layer sacred-eye-octa-b" />

        {/* Layer 6: Cardinal starlight axis beams */}
        <div className="sacred-eye-layer sacred-eye-axis-beam" />
        <div className="sacred-eye-layer sacred-eye-axis-beam-v" />

        {/* Layer 7: Vesica Piscis breathing almond eye aperture */}
        <div className="sacred-eye-layer sacred-eye-aperture-wrap">
          <div className="sacred-eye-almond-halo" />
          <div className="sacred-eye-almond-shell">
            <div className="sacred-eye-chamber">
              <div className="sacred-eye-sclera-sheen" />

              {/* Infinite receding 3D geometric vortex tunnel */}
              <div className="sacred-eye-tunnel-ring sacred-eye-tunnel-1" />
              <div className="sacred-eye-tunnel-ring sacred-eye-tunnel-2" />
              <div className="sacred-eye-tunnel-ring sacred-eye-tunnel-3" />
              <div className="sacred-eye-tunnel-ring sacred-eye-tunnel-4" />
              <div className="sacred-eye-tunnel-ring sacred-eye-tunnel-5" />

              {/* Counter-rotating peripheral-drift optical illusion iris rings */}
              <div className="sacred-eye-iris-ring sacred-eye-iris-1" />
              <div className="sacred-eye-iris-ring sacred-eye-iris-2" />
              <div className="sacred-eye-iris-ring sacred-eye-iris-3" />
              <div className="sacred-eye-iris-ring sacred-eye-iris-4" />

              {/* Dilating cosmic pupil with recursive inner sacred eye */}
              <div className="sacred-eye-layer sacred-eye-pupil">
                <div className="sacred-eye-layer sacred-eye-inner-diamond" />
                <div className="sacred-eye-inner-vesica" />
              </div>

              {/* Glassy corneal catchlights anchoring stereoscopic 3D depth */}
              <div className="sacred-eye-catchlight-primary" />
              <div className="sacred-eye-catchlight-secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SacredEyeVisualizer;
