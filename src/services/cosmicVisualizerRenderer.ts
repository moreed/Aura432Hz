import type { BreathPhaseType } from './breathSyncEngine';

export type CosmicCanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export interface CosmicPaletteConfig {
  /** Primary starlight & inhale highlight RGB tuple */
  primaryRgb: [number, number, number];
  /** Secondary cosmic lavender / exhale RGB tuple */
  secondaryRgb: [number, number, number];
  /** Warm sanctuary gold / hold highlight RGB tuple */
  goldRgb: [number, number, number];
  /** Deep nebula mist accent RGB tuple */
  nebulaRgb: [number, number, number];
}

export const DEFAULT_DARK_COSMIC_PALETTE: CosmicPaletteConfig = {
  primaryRgb: [72, 225, 208],     // Aurora Teal (#48E1D0)
  secondaryRgb: [169, 154, 251],  // Cosmic Lavender (#A99AFB)
  goldRgb: [251, 191, 36],        // Sanctuary Gold (#FBBF24)
  nebulaRgb: [56, 189, 248],      // Celestial Cyan (#38BDF8)
};

export const DEFAULT_LIGHT_COSMIC_PALETTE: CosmicPaletteConfig = {
  primaryRgb: [2, 132, 199],      // Deep Ocean Azure (#0284C7)
  secondaryRgb: [99, 102, 241],   // Royal Indigo (#6366F1)
  goldRgb: [217, 119, 6],         // Warm Amber (#D97706)
  nebulaRgb: [14, 165, 233],      // Sky Mist (#0EA5E9)
};

interface SeededStar {
  /** Normalized 0..1 base x */
  x: number;
  /** Normalized 0..1 base y */
  y: number;
  /** 0 = far, 1 = mid, 2 = near bokeh */
  depth: 0 | 1 | 2;
  /** Base radius in CSS px */
  size: number;
  /** Twinkle speed multiplier */
  twinkleSpeed: number;
  /** Twinkle phase offset */
  twinklePhase: number;
  /** Subtle horizontal drift velocity */
  driftX: number;
  /** Subtle vertical drift velocity */
  driftY: number;
  /** Star color tone index (0=starlight white, 1=teal, 2=lavender, 3=warm gold) */
  tint: 0 | 1 | 2 | 3;
  /** Whether this star renders a delicate 4-point diffraction sparkle at peak twinkle */
  sparkle: boolean;
}

interface Pt {
  x: number;
  y: number;
}

interface CubicSeg {
  p0: Pt;
  c1: Pt;
  c2: Pt;
  p3: Pt;
}

interface OutlineStar {
  x: number;
  y: number;
  nx: number;
  ny: number;
  size: number;
  phase: number;
  speed: number;
  isMajor: boolean;
  tint: 0 | 1 | 2 | 3;
}

interface InteriorStar {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  tint: 0 | 1 | 2 | 3;
}

// Deterministic PRNG so starfields stay consistent and crisp across frames & resizes
function createSeededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildParallaxStars(): SeededStar[] {
  const rng = createSeededRng(432108);
  const stars: SeededStar[] = [];

  // Layer 0: 96 distant pinprick stars
  for (let i = 0; i < 96; i++) {
    stars.push({
      x: rng(),
      y: rng(),
      depth: 0,
      size: 0.55 + rng() * 0.85,
      twinkleSpeed: 0.7 + rng() * 1.4,
      twinklePhase: rng() * Math.PI * 2,
      driftX: (rng() - 0.5) * 0.0007,
      driftY: -0.0004 - rng() * 0.0008,
      tint: (i % 4) as 0 | 1 | 2 | 3,
      sparkle: false,
    });
  }

  // Layer 1: 52 mid-plane constellation stars
  for (let i = 0; i < 52; i++) {
    stars.push({
      x: rng(),
      y: rng(),
      depth: 1,
      size: 1.05 + rng() * 1.35,
      twinkleSpeed: 1.1 + rng() * 1.8,
      twinklePhase: rng() * Math.PI * 2,
      driftX: (rng() - 0.5) * 0.0016,
      driftY: -0.001 - rng() * 0.0016,
      tint: (i % 4) as 0 | 1 | 2 | 3,
      sparkle: i % 3 === 0,
    });
  }

  // Layer 2: 20 near-plane luminous bokeh stardust motes
  for (let i = 0; i < 20; i++) {
    stars.push({
      x: rng(),
      y: rng(),
      depth: 2,
      size: 2.1 + rng() * 2.8,
      twinkleSpeed: 0.6 + rng() * 1.1,
      twinklePhase: rng() * Math.PI * 2,
      driftX: (rng() - 0.5) * 0.0032,
      driftY: -0.002 - rng() * 0.0026,
      tint: (i % 4) as 0 | 1 | 2 | 3,
      sparkle: i % 4 === 0,
    });
  }

  return stars;
}

const PARALLAX_STARS: SeededStar[] = buildParallaxStars();

// =========================================================================
// SERENE MEDITATING BUDDHA GEOMETRY (Normalized symmetrical Bézier silhouette)
// Coordinate frame: x in [-0.90, +0.90], y in [-0.94, +0.84], centered at (0, 0)
// =========================================================================

// Right-half outer contour from top of ushnisha (crown) down to bottom center of lotus seat
const BUDDHA_RIGHT_SEGMENTS: CubicSeg[] = [
  // 1. Crown Ushnisha (top bun)
  { p0: { x: 0.0, y: -0.93 }, c1: { x: 0.085, y: -0.93 }, c2: { x: 0.115, y: -0.845 }, p3: { x: 0.088, y: -0.78 } },
  // 2. Upper cranium to serene temple
  { p0: { x: 0.088, y: -0.78 }, c1: { x: 0.175, y: -0.76 }, c2: { x: 0.215, y: -0.66 }, p3: { x: 0.195, y: -0.54 } },
  // 3. Elongated graceful earlobe
  { p0: { x: 0.195, y: -0.54 }, c1: { x: 0.242, y: -0.515 }, c2: { x: 0.246, y: -0.405 }, p3: { x: 0.206, y: -0.365 } },
  // 4. Lower earlobe tucked into serene jawline & neck
  { p0: { x: 0.206, y: -0.365 }, c1: { x: 0.172, y: -0.355 }, c2: { x: 0.142, y: -0.39 }, p3: { x: 0.128, y: -0.405 } },
  // 5. Neck descent to collarbone
  { p0: { x: 0.128, y: -0.405 }, c1: { x: 0.105, y: -0.35 }, c2: { x: 0.098, y: -0.305 }, p3: { x: 0.112, y: -0.275 } },
  // 6. Softly sloping shoulder & deltoid
  { p0: { x: 0.112, y: -0.275 }, c1: { x: 0.275, y: -0.255 }, c2: { x: 0.435, y: -0.175 }, p3: { x: 0.488, y: -0.025 } },
  // 7. Relaxed upper arm & elbow descending toward lap
  { p0: { x: 0.488, y: -0.025 }, c1: { x: 0.538, y: 0.115 }, c2: { x: 0.525, y: 0.255 }, p3: { x: 0.455, y: 0.345 } },
  // 8. Sweep outward over crossed lotus knee (Padmasana)
  { p0: { x: 0.455, y: 0.345 }, c1: { x: 0.625, y: 0.38 }, c2: { x: 0.81, y: 0.485 }, p3: { x: 0.855, y: 0.615 } },
  // 9. Rounded outer lotus knee resting peacefully
  { p0: { x: 0.855, y: 0.615 }, c1: { x: 0.885, y: 0.715 }, c2: { x: 0.77, y: 0.79 }, p3: { x: 0.56, y: 0.805 } },
  // 10. Lower lotus base to center
  { p0: { x: 0.56, y: 0.805 }, c1: { x: 0.36, y: 0.82 }, c2: { x: 0.18, y: 0.825 }, p3: { x: 0.0, y: 0.825 } },
];

// Full closed contour segments (right side down + mirrored left side back up)
const BUDDHA_FULL_SEGMENTS: CubicSeg[] = [
  ...BUDDHA_RIGHT_SEGMENTS,
  ...BUDDHA_RIGHT_SEGMENTS.slice()
    .reverse()
    .map((seg) => ({
      p0: { x: -seg.p3.x, y: seg.p3.y },
      c1: { x: -seg.c2.x, y: seg.c2.y },
      c2: { x: -seg.c1.x, y: seg.c1.y },
      p3: { x: -seg.p0.x, y: seg.p0.y },
    })),
];

function evalCubic(seg: CubicSeg, t: number): Pt {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * seg.p0.x + 3 * mt2 * t * seg.c1.x + 3 * mt * t2 * seg.c2.x + t2 * t * seg.p3.x,
    y: mt2 * mt * seg.p0.y + 3 * mt2 * t * seg.c1.y + 3 * mt * t2 * seg.c2.y + t2 * t * seg.p3.y,
  };
}

function evalCubicNormal(seg: CubicSeg, t: number): Pt {
  const mt = 1 - t;
  const dx =
    3 * mt * mt * (seg.c1.x - seg.p0.x) +
    6 * mt * t * (seg.c2.x - seg.c1.x) +
    3 * t * t * (seg.p3.x - seg.c2.x);
  const dy =
    3 * mt * mt * (seg.c1.y - seg.p0.y) +
    6 * mt * t * (seg.c2.y - seg.c1.y) +
    3 * t * t * (seg.p3.y - seg.c2.y);
  const len = Math.hypot(dx, dy) || 1;
  // Outward normal for clockwise contour
  return { x: dy / len, y: -dx / len };
}

function buildBuddhaOutlineStars(): OutlineStar[] {
  const rng = createSeededRng(528432);
  const stars: OutlineStar[] = [];

  BUDDHA_FULL_SEGMENTS.forEach((seg, segIdx) => {
    const samples = segIdx % 10 === 7 || segIdx % 10 === 5 ? 7 : 5;
    for (let s = 0; s < samples; s++) {
      const t = (s + 0.35) / samples;
      const p = evalCubic(seg, t);
      const n = evalCubicNormal(seg, t);
      const isMajor = s === 0 || (segIdx % 2 === 0 && s === Math.floor(samples / 2));
      stars.push({
        x: p.x,
        y: p.y,
        nx: n.x,
        ny: n.y,
        size: isMajor ? 1.85 + rng() * 1.15 : 0.95 + rng() * 0.75,
        phase: rng() * Math.PI * 2,
        speed: 1.2 + rng() * 1.8,
        isMajor,
        tint: (stars.length % 4) as 0 | 1 | 2 | 3,
      });
    }
  });

  return stars;
}

function buildBuddhaInteriorStars(): InteriorStar[] {
  const rng = createSeededRng(963432);
  const stars: InteriorStar[] = [];
  for (let i = 0; i < 68; i++) {
    // Biased distribution inside the meditating figure bounding envelope (clipped cleanly when drawn)
    const y = -0.82 + rng() * 1.62;
    const halfWidth = y < -0.32 ? 0.2 : y < 0.35 ? 0.48 : 0.84;
    const x = (rng() * 2 - 1) * halfWidth;
    stars.push({
      x,
      y,
      size: 0.65 + rng() * 1.45,
      phase: rng() * Math.PI * 2,
      speed: 0.9 + rng() * 1.8,
      tint: (i % 4) as 0 | 1 | 2 | 3,
    });
  }
  return stars;
}

const BUDDHA_OUTLINE_STARS: OutlineStar[] = buildBuddhaOutlineStars();
const BUDDHA_INTERIOR_STARS: InteriorStar[] = buildBuddhaInteriorStars();

// Seven subtle harmonic chakra / starlight anchor nodes along the central sushumna axis
const BUDDHA_CHAKRA_NODES: Array<{ x: number; y: number; name: string; rgb: [number, number, number] }> = [
  { x: 0, y: -0.86, name: 'Crown', rgb: [226, 232, 255] },
  { x: 0, y: -0.60, name: 'Third Eye', rgb: [169, 154, 251] },
  { x: 0, y: -0.29, name: 'Throat', rgb: [56, 189, 248] },
  { x: 0, y: -0.02, name: 'Heart', rgb: [72, 225, 208] },
  { x: 0, y: 0.19, name: 'Solar', rgb: [251, 191, 36] },
  { x: 0, y: 0.37, name: 'Dhyana Mudra', rgb: [253, 224, 71] },
  { x: 0, y: 0.63, name: 'Root Lotus', rgb: [192, 132, 252] },
];

// Constellation anchor points inside the Buddha for subtle sacred starlight filaments
const CONSTELLATION_ANCHORS: Pt[] = [
  { x: 0, y: -0.86 },      // 0 Crown
  { x: 0, y: -0.60 },      // 1 Third Eye
  { x: 0, y: -0.29 },      // 2 Throat
  { x: 0, y: -0.02 },      // 3 Heart
  { x: 0, y: 0.34 },       // 4 Mudra
  { x: 0, y: 0.63 },       // 5 Base center
  { x: -0.34, y: -0.15 },  // 6 Left shoulder
  { x: 0.34, y: -0.15 },   // 7 Right shoulder
  { x: -0.44, y: 0.25 },   // 8 Left elbow
  { x: 0.44, y: 0.25 },    // 9 Right elbow
  { x: -0.68, y: 0.64 },   // 10 Left knee
  { x: 0.68, y: 0.64 },    // 11 Right knee
];

const CONSTELLATION_EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [2, 6], [2, 7], [3, 6], [3, 7],
  [6, 8], [7, 9], [8, 4], [9, 4],
  [8, 10], [9, 11], [4, 10], [4, 11], [5, 10], [5, 11],
];

function lerpRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  const k = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}

function rgba(rgb: [number, number, number], alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

function getStarRgb(tint: 0 | 1 | 2 | 3, palette: CosmicPaletteConfig, isLight: boolean): [number, number, number] {
  if (tint === 0) return isLight ? [15, 23, 42] : [240, 249, 255];
  if (tint === 1) return palette.primaryRgb;
  if (tint === 2) return palette.secondaryRgb;
  return palette.goldRgb;
}

function drawFourPointStar(
  ctx: CosmicCanvasContext,
  x: number,
  y: number,
  armLen: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(0.7, armLen * 0.14);
  ctx.beginPath();
  ctx.moveTo(x - armLen, y);
  ctx.lineTo(x + armLen, y);
  ctx.moveTo(x, y - armLen);
  ctx.lineTo(x, y + armLen);
  ctx.stroke();

  // Delicate diagonal rays at 45% length
  const diag = armLen * 0.44;
  ctx.lineWidth = Math.max(0.5, armLen * 0.09);
  ctx.beginPath();
  ctx.moveTo(x - diag, y - diag);
  ctx.lineTo(x + diag, y + diag);
  ctx.moveTo(x + diag, y - diag);
  ctx.lineTo(x - diag, y + diag);
  ctx.stroke();
  ctx.restore();
}

function traceBuddhaOutlinePath(
  ctx: CosmicCanvasContext,
  cx: number,
  cy: number,
  scale: number
): void {
  const first = BUDDHA_FULL_SEGMENTS[0].p0;
  ctx.beginPath();
  ctx.moveTo(cx + first.x * scale, cy + first.y * scale);
  for (let i = 0; i < BUDDHA_FULL_SEGMENTS.length; i++) {
    const seg = BUDDHA_FULL_SEGMENTS[i];
    ctx.bezierCurveTo(
      cx + seg.c1.x * scale,
      cy + seg.c1.y * scale,
      cx + seg.c2.x * scale,
      cy + seg.c2.y * scale,
      cx + seg.p3.x * scale,
      cy + seg.p3.y * scale
    );
  }
  ctx.closePath();
}

export interface CosmicBackdropOptions {
  width: number;
  height: number;
  timeSec: number;
  breathEased: number;
  energy: number;
  bass: number;
  isLight: boolean;
  /** Overall atmospheric depth intensity (0.5..1.25) */
  intensity?: number;
  /** Optional subtle parallax offset (-1..1) */
  parallaxX?: number;
  parallaxY?: number;
  palette?: CosmicPaletteConfig;
  /** Whether to draw the deep cosmos base wash (true for full-replace scenes like Starry Buddha) */
  opaqueBase?: boolean;
}

/**
 * Renders the Deep Cosmic Parallax & Volumetric Nebula backdrop layer.
 * Composable beneath ALL visualizer modes to give genuine multi-plane depth.
 */
export function renderCosmicDepthBackdrop(
  ctx: CosmicCanvasContext,
  opts: CosmicBackdropOptions
): void {
  const {
    width,
    height,
    timeSec,
    breathEased,
    energy,
    bass,
    isLight,
    intensity = 1.0,
    parallaxX = 0,
    parallaxY = 0,
    opaqueBase = false,
  } = opts;

  const palette = opts.palette || (isLight ? DEFAULT_LIGHT_COSMIC_PALETTE : DEFAULT_DARK_COSMIC_PALETTE);
  const cx = width * 0.5;
  const cy = height * 0.5;
  const maxDim = Math.max(width, height);
  const minDim = Math.min(width, height);

  // 1. Optional deep cosmic midnight sky base gradient
  if (opaqueBase) {
    const skyGrad = ctx.createRadialGradient(
      cx,
      cy * 0.88,
      minDim * 0.05,
      cx,
      cy,
      maxDim * 0.85
    );
    if (isLight) {
      skyGrad.addColorStop(0, '#f0f9ff');
      skyGrad.addColorStop(0.5, '#f6f8f7');
      skyGrad.addColorStop(1, '#e8eef5');
    } else {
      skyGrad.addColorStop(0, '#0d1d34');
      skyGrad.addColorStop(0.45, '#071121');
      skyGrad.addColorStop(1, '#020612');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Three Slowly Orbiting Volumetric Nebula Clouds
  ctx.save();
  ctx.globalCompositeOperation = isLight ? 'multiply' : 'screen';

  const clouds: Array<{
    angle: number;
    orbitX: number;
    orbitY: number;
    radiusScale: number;
    rgb: [number, number, number];
    baseAlpha: number;
  }> = [
    {
      angle: timeSec * 0.08,
      orbitX: 0.24,
      orbitY: 0.16,
      radiusScale: 0.62 + breathEased * 0.08 + bass * 0.08,
      rgb: palette.primaryRgb,
      baseAlpha: isLight ? 0.075 : 0.145,
    },
    {
      angle: -timeSec * 0.065 + 2.1,
      orbitX: 0.28,
      orbitY: 0.20,
      radiusScale: 0.58 + (1 - breathEased) * 0.06 + energy * 0.07,
      rgb: palette.secondaryRgb,
      baseAlpha: isLight ? 0.07 : 0.155,
    },
    {
      angle: timeSec * 0.05 + 4.2,
      orbitX: 0.18,
      orbitY: 0.22,
      radiusScale: 0.46 + breathEased * 0.07,
      rgb: palette.nebulaRgb,
      baseAlpha: isLight ? 0.055 : 0.11,
    },
  ];

  for (let i = 0; i < clouds.length; i++) {
    const c = clouds[i];
    const cloudX = cx + Math.cos(c.angle) * width * c.orbitX + parallaxX * 16;
    const cloudY = cy + Math.sin(c.angle * 0.85) * height * c.orbitY + parallaxY * 12;
    const radius = maxDim * c.radiusScale;
    const alpha = c.baseAlpha * intensity * (0.85 + breathEased * 0.25 + bass * 0.25);

    const grad = ctx.createRadialGradient(cloudX, cloudY, radius * 0.05, cloudX, cloudY, radius);
    grad.addColorStop(0, rgba(c.rgb, alpha));
    grad.addColorStop(0.45, rgba(c.rgb, alpha * 0.42));
    grad.addColorStop(1, rgba(c.rgb, 0));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cloudX, cloudY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 3. Far & Mid Parallax Starfield (Depth Layers 0 and 1)
  const breathSpread = (breathEased - 0.5) * 0.024;
  ctx.save();
  for (let i = 0; i < PARALLAX_STARS.length; i++) {
    const star = PARALLAX_STARS[i];
    if (star.depth === 2) continue; // Near-plane stars rendered in foreground pass

    const depthFactor = star.depth === 0 ? 0.45 : 1.0;
    const rawX = (star.x + timeSec * star.driftX + parallaxX * 0.015 * depthFactor) % 1;
    const rawY = (star.y + timeSec * star.driftY + parallaxY * 0.015 * depthFactor) % 1;
    const normX = rawX < 0 ? rawX + 1 : rawX;
    const normY = rawY < 0 ? rawY + 1 : rawY;

    // Gentle radial breathing parallax away from center on inhale
    const dx = normX - 0.5;
    const dy = normY - 0.5;
    const sx = (0.5 + dx * (1 + breathSpread * depthFactor)) * width;
    const sy = (0.5 + dy * (1 + breathSpread * depthFactor)) * height;

    const twinkle = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(timeSec * star.twinkleSpeed + star.twinklePhase));
    const baseOpacity = star.depth === 0 ? 0.34 : 0.68;
    const alpha = Math.min(0.95, baseOpacity * twinkle * intensity * (isLight ? 0.52 : 1.0));
    const rgb = getStarRgb(star.tint, palette, isLight);
    const radius = star.size * (0.85 + energy * 0.25);

    ctx.fillStyle = rgba(rgb, alpha);
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();

    if (star.sparkle && twinkle > 0.78) {
      drawFourPointStar(ctx, sx, sy, radius * 3.1, rgba(rgb, alpha * 0.55));
    }
  }
  ctx.restore();
}

/**
 * Renders subtle near-plane bokeh stardust & outer depth vignette OVER primary visualizer geometry
 * to complete the 3-plane foreground / midground / background illusion.
 */
export function renderCosmicForegroundDepth(
  ctx: CosmicCanvasContext,
  opts: CosmicBackdropOptions
): void {
  const {
    width,
    height,
    timeSec,
    breathEased,
    energy,
    isLight,
    intensity = 1.0,
    parallaxX = 0,
    parallaxY = 0,
  } = opts;
  const palette = opts.palette || (isLight ? DEFAULT_LIGHT_COSMIC_PALETTE : DEFAULT_DARK_COSMIC_PALETTE);
  const cx = width * 0.5;
  const cy = height * 0.5;
  const maxDim = Math.max(width, height);
  const breathSpread = (breathEased - 0.5) * 0.045;

  // 1. Near-plane drifting bokeh stardust motes (Depth Layer 2)
  ctx.save();
  ctx.globalCompositeOperation = isLight ? 'source-over' : 'screen';
  for (let i = 0; i < PARALLAX_STARS.length; i++) {
    const star = PARALLAX_STARS[i];
    if (star.depth !== 2) continue;

    const rawX = (star.x + timeSec * star.driftX + parallaxX * 0.032) % 1;
    const rawY = (star.y + timeSec * star.driftY + parallaxY * 0.032) % 1;
    const normX = rawX < 0 ? rawX + 1 : rawX;
    const normY = rawY < 0 ? rawY + 1 : rawY;

    const dx = normX - 0.5;
    const dy = normY - 0.5;
    const sx = (0.5 + dx * (1 + breathSpread)) * width;
    const sy = (0.5 + dy * (1 + breathSpread)) * height;

    const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(timeSec * star.twinkleSpeed + star.twinklePhase));
    const r = star.size * (1.1 + breathEased * 0.3 + energy * 0.25);
    const alpha = Math.min(0.42, 0.28 * twinkle * intensity * (isLight ? 0.55 : 1.0));
    const rgb = getStarRgb(star.tint, palette, isLight);

    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.4);
    g.addColorStop(0, rgba(rgb, alpha));
    g.addColorStop(0.5, rgba(rgb, alpha * 0.32));
    g.addColorStop(1, rgba(rgb, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Subtle atmospheric edge vignette framing the central sacred geometry
  const vignette = ctx.createRadialGradient(cx, cy, maxDim * 0.26, cx, cy, maxDim * 0.74);
  if (isLight) {
    vignette.addColorStop(0, 'rgba(248, 250, 252, 0)');
    vignette.addColorStop(1, 'rgba(226, 232, 240, 0.28)');
  } else {
    vignette.addColorStop(0, 'rgba(2, 6, 23, 0)');
    vignette.addColorStop(1, 'rgba(2, 6, 23, 0.52)');
  }
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export interface StarryBuddhaRenderOptions {
  width: number;
  height: number;
  cx: number;
  cy: number;
  timeSec: number;
  /** Smooth 0..1 breath expansion synced with BreathSyncEngine */
  breathEased: number;
  /** Current breath phase ('inhale' | 'hold' | 'exhale') */
  phaseType: BreathPhaseType;
  /** 0..1 harmonic hold suspension shimmer */
  holdStillness: number;
  /** Live Web Audio energy bands (0..1) */
  energy: number;
  bass: number;
  mids: number;
  treble: number;
  isLight: boolean;
  /** Visual comfort intensity multiplier (0.65 for zen, 1.0 for harmony, 1.2 for glow) */
  intensity?: number;
  /** Optional custom scale multiplier (defaults to fitting container cleanly) */
  scaleFactor?: number;
  palette?: CosmicPaletteConfig;
  /** Whether to draw cosmic backdrop inside this call (set false if backdrop already drawn) */
  includeBackdrop?: boolean;
}

/**
 * Renders the signature Starry Buddha visualizer:
 * A luminous, starry-outlined meditating Buddha silhouette filled with cosmic starlight
 * and constellation filaments that breathes slowly and simultaneously with Breathwork.
 */
export function renderStarryBuddha(
  ctx: CosmicCanvasContext,
  opts: StarryBuddhaRenderOptions
): void {
  const {
    width,
    height,
    cx,
    cy,
    timeSec,
    breathEased,
    phaseType,
    holdStillness,
    energy,
    bass,
    mids,
    treble,
    isLight,
    intensity = 1.0,
    scaleFactor = 1.0,
    includeBackdrop = false,
  } = opts;

  const palette = opts.palette || (isLight ? DEFAULT_LIGHT_COSMIC_PALETTE : DEFAULT_DARK_COSMIC_PALETTE);

  if (includeBackdrop) {
    renderCosmicDepthBackdrop(ctx, {
      width,
      height,
      timeSec,
      breathEased,
      energy,
      bass,
      isLight,
      intensity,
      palette,
      opaqueBase: true,
    });
  }

  // Smooth phase-harmonized accent color:
  // Inhale -> Aurora Teal / Starlight, Hold -> Warm Sanctuary Gold blend, Exhale -> Cosmic Lavender blend
  const inhaleToExhaleBlend =
    phaseType === 'exhale' ? 0.58 : phaseType === 'inhale' ? 0.14 : 0.25;
  let activeRgb = lerpRgb(palette.primaryRgb, palette.secondaryRgb, inhaleToExhaleBlend);
  if (phaseType === 'hold' && holdStillness > 0.02) {
    activeRgb = lerpRgb(activeRgb, palette.goldRgb, 0.55 * holdStillness);
  }
  const starWhiteRgb: [number, number, number] = isLight ? [15, 23, 42] : [244, 250, 255];

  // Figure scale smoothly expands on Inhale and settles gently on Exhale
  const minDim = Math.min(width, height);
  const baseScale = minDim * 0.39 * scaleFactor;
  const breathScale = baseScale * (0.93 + breathEased * 0.125 + bass * 0.025);
  // Subtle buoyant upward float on inhale
  const figureCy = cy + minDim * 0.025 - (breathEased - 0.5) * minDim * 0.022;

  // -------------------------------------------------------------------------
  // 1. EXPANDING COSMIC BREATH AURA & CROWN MANDORLA HALO BEHIND BUDDHA
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.globalCompositeOperation = isLight ? 'source-over' : 'screen';

  // Wide breathing aura field
  const auraR = breathScale * (1.38 + breathEased * 0.34);
  const auraGrad = ctx.createRadialGradient(cx, figureCy - breathScale * 0.05, breathScale * 0.06, cx, figureCy, auraR);
  const auraAlpha = (isLight ? 0.2 : 0.34) * intensity * (0.65 + breathEased * 0.45 + holdStillness * 0.2);
  auraGrad.addColorStop(0, rgba(activeRgb, auraAlpha));
  auraGrad.addColorStop(0.42, rgba(palette.secondaryRgb, auraAlpha * 0.46));
  auraGrad.addColorStop(0.75, rgba(palette.goldRgb, auraAlpha * (0.14 + holdStillness * 0.22)));
  auraGrad.addColorStop(1, rgba(activeRgb, 0));
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(cx, figureCy, auraR, 0, Math.PI * 2);
  ctx.fill();

  // Serene Crown Halo behind the Buddha's head
  const headY = figureCy - breathScale * 0.62;
  const crownHaloR = breathScale * (0.36 + breathEased * 0.08 + holdStillness * 0.04);
  const crownGrad = ctx.createRadialGradient(cx, headY, crownHaloR * 0.12, cx, headY, crownHaloR * 1.45);
  crownGrad.addColorStop(0, rgba(palette.goldRgb, (isLight ? 0.18 : 0.32) * intensity * (0.7 + breathEased * 0.35)));
  crownGrad.addColorStop(0.55, rgba(activeRgb, (isLight ? 0.12 : 0.2) * intensity));
  crownGrad.addColorStop(1, rgba(activeRgb, 0));
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.arc(cx, headY, crownHaloR * 1.45, 0, Math.PI * 2);
  ctx.fill();

  // Concentric rotating celestial halo ring + delicate starlight degree ticks behind head
  ctx.save();
  ctx.translate(cx, headY);
  ctx.rotate(timeSec * 0.09);
  ctx.beginPath();
  ctx.arc(0, 0, crownHaloR, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(activeRgb, (isLight ? 0.28 : 0.34) * intensity * (0.65 + breathEased * 0.35));
  ctx.lineWidth = 1.1;
  ctx.setLineDash([2, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  const tickCount = 24;
  for (let i = 0; i < tickCount; i++) {
    const a = (i / tickCount) * Math.PI * 2;
    const major = i % 3 === 0;
    const r0 = crownHaloR * (major ? 0.92 : 0.96);
    const r1 = crownHaloR * (major ? 1.12 : 1.05);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.strokeStyle = rgba(major ? palette.goldRgb : activeRgb, (major ? 0.42 : 0.22) * intensity);
    ctx.lineWidth = major ? 1.15 : 0.7;
    ctx.stroke();
  }
  ctx.restore();

  // Outer expanding breath coherence rings
  for (let ring = 0; ring < 2; ring++) {
    const r = breathScale * (1.06 + ring * 0.22 + breathEased * (0.14 + ring * 0.08));
    ctx.beginPath();
    ctx.arc(cx, figureCy + breathScale * 0.04, r, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(ring === 0 ? activeRgb : palette.secondaryRgb, (0.14 + breathEased * 0.14 - ring * 0.05) * intensity);
    ctx.lineWidth = ring === 0 ? 1.1 : 0.8;
    ctx.stroke();
  }
  ctx.restore();

  // -------------------------------------------------------------------------
  // 2. TRANSLUCENT COSMIC INTERIOR MASK & SACRED CONSTELLATION WEB
  // -------------------------------------------------------------------------
  ctx.save();
  traceBuddhaOutlinePath(ctx, cx, figureCy, breathScale);

  // Deep translucent starry-cosmos interior fill
  const bodyGrad = ctx.createRadialGradient(
    cx,
    figureCy + breathScale * 0.04,
    breathScale * 0.04,
    cx,
    figureCy + breathScale * 0.1,
    breathScale * 1.05
  );
  if (isLight) {
    bodyGrad.addColorStop(0, rgba(activeRgb, 0.2 + breathEased * 0.1));
    bodyGrad.addColorStop(0.55, rgba(palette.secondaryRgb, 0.14));
    bodyGrad.addColorStop(1, 'rgba(15, 23, 42, 0.12)');
  } else {
    bodyGrad.addColorStop(0, rgba(activeRgb, 0.22 + breathEased * 0.14));
    bodyGrad.addColorStop(0.48, 'rgba(15, 29, 58, 0.62)');
    bodyGrad.addColorStop(1, 'rgba(4, 10, 24, 0.82)');
  }
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Clip interior starfield & constellation web cleanly inside the Buddha silhouette
  ctx.clip();

  // Subtle breathing inner prana glow centered on heart & mudra
  const innerCoreY = figureCy + breathScale * 0.14;
  const innerCoreR = breathScale * (0.42 + breathEased * 0.28);
  const innerCoreGrad = ctx.createRadialGradient(cx, innerCoreY, 2, cx, innerCoreY, innerCoreR);
  innerCoreGrad.addColorStop(0, rgba(palette.goldRgb, (0.18 + breathEased * 0.22 + holdStillness * 0.18) * intensity));
  innerCoreGrad.addColorStop(0.5, rgba(activeRgb, (0.14 + breathEased * 0.16) * intensity));
  innerCoreGrad.addColorStop(1, rgba(activeRgb, 0));
  ctx.fillStyle = innerCoreGrad;
  ctx.beginPath();
  ctx.arc(cx, innerCoreY, innerCoreR, 0, Math.PI * 2);
  ctx.fill();

  // Fine interior stars twinkling gently inside the Buddha's cosmic body
  for (let i = 0; i < BUDDHA_INTERIOR_STARS.length; i++) {
    const st = BUDDHA_INTERIOR_STARS[i];
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(timeSec * st.speed + st.phase));
    const sx = cx + st.x * breathScale;
    const sy = figureCy + st.y * breathScale;
    const rgb = getStarRgb(st.tint, palette, isLight);
    ctx.fillStyle = rgba(rgb, (0.28 + breathEased * 0.32 + treble * 0.2) * tw * intensity);
    ctx.beginPath();
    ctx.arc(sx, sy, st.size * (0.75 + breathEased * 0.25), 0, Math.PI * 2);
    ctx.fill();
  }

  // Delicate Constellation Filaments connecting major harmonic anchors inside the silhouette
  ctx.lineWidth = 0.85;
  ctx.strokeStyle = rgba(activeRgb, (0.16 + breathEased * 0.18 + holdStillness * 0.12) * intensity);
  ctx.beginPath();
  for (let i = 0; i < CONSTELLATION_EDGES.length; i++) {
    const [aIdx, bIdx] = CONSTELLATION_EDGES[i];
    const a = CONSTELLATION_ANCHORS[aIdx];
    const b = CONSTELLATION_ANCHORS[bIdx];
    ctx.moveTo(cx + a.x * breathScale, figureCy + a.y * breathScale);
    ctx.lineTo(cx + b.x * breathScale, figureCy + b.y * breathScale);
  }
  ctx.stroke();

  // Subtle serene inner drapery, folded arms, Dhyana mudra hands & crossed lotus arcs
  const innerLineAlpha = (0.24 + breathEased * 0.2) * intensity;
  ctx.strokeStyle = rgba(activeRgb, innerLineAlpha);
  ctx.lineWidth = 1.05;

  // Chin serenity arc
  ctx.beginPath();
  ctx.moveTo(cx - 0.125 * breathScale, figureCy - 0.405 * breathScale);
  ctx.quadraticCurveTo(cx, figureCy - 0.325 * breathScale, cx + 0.125 * breathScale, figureCy - 0.405 * breathScale);
  ctx.stroke();

  // Monastic sanghati robe curve across chest
  ctx.beginPath();
  ctx.moveTo(cx - 0.32 * breathScale, figureCy - 0.18 * breathScale);
  ctx.bezierCurveTo(
    cx - 0.12 * breathScale,
    figureCy - 0.02 * breathScale,
    cx + 0.12 * breathScale,
    figureCy + 0.08 * breathScale,
    cx + 0.29 * breathScale,
    figureCy + 0.21 * breathScale
  );
  ctx.stroke();

  // Inner forearms resting smoothly into Dhyana mudra lap
  ctx.beginPath();
  ctx.moveTo(cx - 0.28 * breathScale, figureCy - 0.02 * breathScale);
  ctx.quadraticCurveTo(cx - 0.32 * breathScale, figureCy + 0.18 * breathScale, cx - 0.15 * breathScale, figureCy + 0.31 * breathScale);
  ctx.moveTo(cx + 0.28 * breathScale, figureCy - 0.02 * breathScale);
  ctx.quadraticCurveTo(cx + 0.32 * breathScale, figureCy + 0.18 * breathScale, cx + 0.15 * breathScale, figureCy + 0.31 * breathScale);
  ctx.stroke();

  // Dhyana Mudra meditating hands crescent bowl
  ctx.beginPath();
  ctx.moveTo(cx - 0.16 * breathScale, figureCy + 0.33 * breathScale);
  ctx.quadraticCurveTo(cx, figureCy + 0.42 * breathScale, cx + 0.16 * breathScale, figureCy + 0.33 * breathScale);
  ctx.moveTo(cx - 0.09 * breathScale, figureCy + 0.31 * breathScale);
  ctx.quadraticCurveTo(cx, figureCy + 0.26 * breathScale, cx + 0.09 * breathScale, figureCy + 0.31 * breathScale);
  ctx.strokeStyle = rgba(palette.goldRgb, (0.38 + breathEased * 0.32) * intensity);
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // Crossed Lotus legs subtle overlapping fold lines
  ctx.beginPath();
  ctx.moveTo(cx - 0.56 * breathScale, figureCy + 0.52 * breathScale);
  ctx.quadraticCurveTo(cx - 0.16 * breathScale, figureCy + 0.62 * breathScale, cx + 0.24 * breathScale, figureCy + 0.78 * breathScale);
  ctx.moveTo(cx + 0.56 * breathScale, figureCy + 0.52 * breathScale);
  ctx.quadraticCurveTo(cx + 0.16 * breathScale, figureCy + 0.62 * breathScale, cx - 0.24 * breathScale, figureCy + 0.78 * breathScale);
  ctx.strokeStyle = rgba(activeRgb, innerLineAlpha * 0.9);
  ctx.lineWidth = 1.0;
  ctx.stroke();

  ctx.restore(); // End silhouette interior clip

  // -------------------------------------------------------------------------
  // 3. TRIPLE-PASS LUMINOUS STARLIGHT OUTLINE
  // -------------------------------------------------------------------------
  ctx.save();
  traceBuddhaOutlinePath(ctx, cx, figureCy, breathScale);

  // Pass A: Wide outer cosmic bloom stroke
  ctx.strokeStyle = rgba(activeRgb, (isLight ? 0.22 : 0.34) * intensity * (0.7 + breathEased * 0.35));
  ctx.lineWidth = Math.max(5.5, breathScale * 0.055);
  ctx.shadowBlur = isLight ? 14 : 26 + breathEased * 16;
  ctx.shadowColor = rgba(activeRgb, 0.85);
  ctx.stroke();

  // Pass B: Luminous mid chromatic gradient contour
  const contourGrad = ctx.createLinearGradient(
    cx,
    figureCy - breathScale * 0.95,
    cx,
    figureCy + breathScale * 0.85
  );
  contourGrad.addColorStop(0, rgba(palette.goldRgb, 0.92));
  contourGrad.addColorStop(0.38, rgba(activeRgb, 0.96));
  contourGrad.addColorStop(0.75, rgba(palette.secondaryRgb, 0.92));
  contourGrad.addColorStop(1, rgba(activeRgb, 0.88));
  ctx.strokeStyle = contourGrad;
  ctx.lineWidth = Math.max(2.0, breathScale * 0.017);
  ctx.shadowBlur = isLight ? 6 : 12 + breathEased * 8;
  ctx.shadowColor = rgba(activeRgb, 0.9);
  ctx.stroke();

  // Pass C: Crisp starlight core hairline
  ctx.strokeStyle = rgba(starWhiteRgb, (isLight ? 0.65 : 0.82) * (0.75 + breathEased * 0.25));
  ctx.lineWidth = Math.max(0.85, breathScale * 0.0065);
  ctx.shadowBlur = 0;
  ctx.stroke();
  ctx.restore();

  // -------------------------------------------------------------------------
  // 4. TWINKLING CONSTELLATION OUTLINE STARS & BREATHING STARDUST RADIANCE
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.globalCompositeOperation = isLight ? 'source-over' : 'screen';
  for (let i = 0; i < BUDDHA_OUTLINE_STARS.length; i++) {
    const st = BUDDHA_OUTLINE_STARS[i];
    const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(timeSec * st.speed + st.phase));
    const rgb = getStarRgb(st.tint, palette, isLight);

    // Subtle outward starlight lift during inhale
    const outwardDrift = breathEased * (st.isMajor ? 0.012 : 0.022) * breathScale;
    const sx = cx + st.x * breathScale + st.nx * outwardDrift;
    const sy = figureCy + st.y * breathScale + st.ny * outwardDrift;
    const starR = st.size * (0.85 + breathEased * 0.35 + treble * 0.25);
    const alpha = Math.min(1, (st.isMajor ? 0.88 : 0.62) * tw * intensity);

    // Soft star glow halo
    const haloR = starR * (st.isMajor ? 4.2 : 2.6);
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloR);
    g.addColorStop(0, rgba(starWhiteRgb, alpha));
    g.addColorStop(0.35, rgba(rgb, alpha * 0.6));
    g.addColorStop(1, rgba(rgb, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Crisp 4-point star flare on major contour anchor stars
    if (st.isMajor && tw > 0.52) {
      drawFourPointStar(ctx, sx, sy, starR * (2.6 + breathEased * 1.4), rgba(starWhiteRgb, alpha * 0.85));
    }
  }

  // -------------------------------------------------------------------------
  // 5. SEVEN HARMONIC CHAKRA STAR NODES ALONG THE CENTRAL AXIS
  // -------------------------------------------------------------------------
  for (let i = 0; i < BUDDHA_CHAKRA_NODES.length; i++) {
    const node = BUDDHA_CHAKRA_NODES[i];
    const wave = 0.5 + 0.5 * Math.sin(timeSec * 1.4 - i * 0.65);
    const isHeartOrMudra = i === 3 || i === 5;
    const nx = cx + node.x * breathScale;
    const ny = figureCy + node.y * breathScale;
    const nodeR = (isHeartOrMudra ? 4.4 : 2.8) * (0.8 + breathEased * 0.45 + mids * 0.22);
    const nodeAlpha = (0.45 + wave * 0.35 + breathEased * 0.2) * intensity;

    const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nodeR * 3.8);
    ng.addColorStop(0, rgba(starWhiteRgb, Math.min(1, nodeAlpha * 1.1)));
    ng.addColorStop(0.32, rgba(node.rgb, nodeAlpha * 0.72));
    ng.addColorStop(1, rgba(node.rgb, 0));
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(nx, ny, nodeR * 3.8, 0, Math.PI * 2);
    ctx.fill();

    if (isHeartOrMudra || i === 0 || i === 1) {
      drawFourPointStar(ctx, nx, ny, nodeR * (1.8 + breathEased * 0.9), rgba(starWhiteRgb, nodeAlpha * 0.8));
    }
  }

  // -------------------------------------------------------------------------
  // 6. FLOATING CELESTIAL LOTUS PEDESTAL ARC BELOW SEAT
  // -------------------------------------------------------------------------
  const pedestalY = figureCy + breathScale * 0.86;
  const pedestalW = breathScale * (0.78 + breathEased * 0.08);
  const pedGrad = ctx.createLinearGradient(cx - pedestalW, pedestalY, cx + pedestalW, pedestalY);
  pedGrad.addColorStop(0, rgba(activeRgb, 0));
  pedGrad.addColorStop(0.3, rgba(activeRgb, 0.45 * intensity));
  pedGrad.addColorStop(0.5, rgba(palette.goldRgb, (0.65 + breathEased * 0.25) * intensity));
  pedGrad.addColorStop(0.7, rgba(activeRgb, 0.45 * intensity));
  pedGrad.addColorStop(1, rgba(activeRgb, 0));

  ctx.beginPath();
  ctx.ellipse(cx, pedestalY, pedestalW, breathScale * 0.065, 0, 0, Math.PI * 2);
  ctx.strokeStyle = pedGrad;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // Subtle downward lotus petal arcs under pedestal
  for (let p = -2; p <= 2; p++) {
    const px = cx + p * breathScale * 0.23;
    const pw = breathScale * 0.14;
    const ph = breathScale * (0.09 - Math.abs(p) * 0.015);
    ctx.beginPath();
    ctx.moveTo(px - pw, pedestalY + breathScale * 0.02);
    ctx.quadraticCurveTo(px, pedestalY + ph + breathScale * 0.05, px + pw, pedestalY + breathScale * 0.02);
    ctx.strokeStyle = rgba(p === 0 ? palette.goldRgb : activeRgb, (0.34 - Math.abs(p) * 0.05) * intensity);
    ctx.lineWidth = 1.0;
    ctx.stroke();
  }

  ctx.restore();

  if (includeBackdrop) {
    renderCosmicForegroundDepth(ctx, {
      width,
      height,
      timeSec,
      breathEased,
      energy,
      bass,
      isLight,
      intensity,
      palette,
    });
  }
}

export interface BreathSyncHaloOptions {
  cx: number;
  cy: number;
  radius: number;
  timeSec: number;
  breathEased: number;
  phaseType: BreathPhaseType;
  holdStillness: number;
  isLight: boolean;
  intensity?: number;
  palette?: CosmicPaletteConfig;
}

/**
 * Renders a delicate, luminous breath-coherence halo and orbiting starlight nodes
 * for all visualizers whenever live Breathwork Sync is active.
 */
export function renderBreathSyncHalo(
  ctx: CosmicCanvasContext,
  opts: BreathSyncHaloOptions
): void {
  const {
    cx,
    cy,
    radius,
    timeSec,
    breathEased,
    phaseType,
    holdStillness,
    isLight,
    intensity = 1.0,
  } = opts;
  const palette = opts.palette || (isLight ? DEFAULT_LIGHT_COSMIC_PALETTE : DEFAULT_DARK_COSMIC_PALETTE);
  const activeRgb: [number, number, number] =
    phaseType === 'hold'
      ? palette.goldRgb
      : phaseType === 'exhale'
      ? palette.secondaryRgb
      : palette.primaryRgb;

  const haloR = radius * (0.74 + breathEased * 0.24);
  const innerR = haloR * 0.88;

  ctx.save();
  ctx.globalCompositeOperation = isLight ? 'source-over' : 'screen';

  // Soft expanding outer aura band
  const bandGrad = ctx.createRadialGradient(cx, cy, haloR * 0.82, cx, cy, haloR * 1.16);
  bandGrad.addColorStop(0, rgba(activeRgb, 0));
  bandGrad.addColorStop(0.55, rgba(activeRgb, (0.14 + breathEased * 0.1 + holdStillness * 0.08) * intensity));
  bandGrad.addColorStop(1, rgba(activeRgb, 0));
  ctx.fillStyle = bandGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, haloR * 1.16, 0, Math.PI * 2);
  ctx.fill();

  // Crisp luminous outer breath guide ring
  ctx.beginPath();
  ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(activeRgb, (0.34 + breathEased * 0.28 + holdStillness * 0.18) * intensity);
  ctx.lineWidth = 1.5 + breathEased * 0.8;
  ctx.stroke();

  // Delicate dashed harmonic inner coherence ring
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(timeSec * 0.09);
  ctx.setLineDash([4, 9]);
  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(palette.goldRgb, (0.16 + holdStillness * 0.28 + breathEased * 0.12) * intensity);
  ctx.lineWidth = 1.0;
  ctx.stroke();
  ctx.setLineDash([]);

  // 4 cardinal breath starlight beads riding the coherence ring
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + timeSec * 0.14;
    const bx = Math.cos(a) * haloR;
    const by = Math.sin(a) * haloR;
    const beadR = 2.0 + breathEased * 1.4 + holdStillness * 1.0;
    drawFourPointStar(
      ctx,
      bx,
      by,
      beadR * 2.4,
      rgba(isLight ? activeRgb : [255, 255, 255], (0.55 + breathEased * 0.35) * intensity)
    );
  }
  ctx.restore();

  ctx.restore();
}

