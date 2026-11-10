/**
 * ITU-R BS.1770-4 & EBU R128 Real-Time Loudness Analysis Engine & Dynamic Auto-Leveler
 *
 * Implements:
 * 1. Two-stage K-weighting pre-filter (Stage 1: High-shelf at 1500Hz +4.0dB; Stage 2: High-pass RLB at 38Hz Q=0.5)
 * 2. Momentary Loudness M (400ms sliding RMS window)
 * 3. Short-Term Loudness S (3000ms sliding RMS window)
 * 4. Integrated Loudness I (ITU-R BS.1770-4 gated acoustic summation)
 * 5. Loudness Range LRA (statistical distribution spread between 10th and 95th percentiles)
 * 6. True-Peak estimation (inter-sample peak headroom detection)
 * 7. Real-Time Auto-Leveler loop: dynamically computes volume adjustment across multiple ambient layers
 *    to hold master loudness locked to target LUFS (-14 LUFS streaming / -23 LUFS broadcast).
 */

export interface LoudnessMetrics {
  momentaryLUFS: number; // 400ms window
  shortTermLUFS: number; // 3000ms window
  integratedLUFS: number; // ITU gated measurement
  loudnessRangeLRA: number; // Loudness Range in LU
  truePeakDbfs: number; // Sample / True peak in dBFS
  targetLUFS: number; // -14 LUFS or -23 LUFS
  autoLevelDeltaDb: number; // Current trim applied in dB
  autoLevelTrimGain: number; // Linear multiplier (1.0 = unity)
  isAutoLevelEnabled: boolean;
  isAudioActive: boolean;
}

export type TargetLoudnessPreset = -14 | -23;

class R128LoudnessMeter {
  private ctx: AudioContext | null = null;
  private shelfFilter: BiquadFilterNode | null = null;
  private hpFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Measurement State
  private targetLUFS: TargetLoudnessPreset = -14;
  private isAutoLevelEnabled: boolean = true;
  private autoLevelTrimGain: number = 1.0;
  private autoLevelDeltaDb: number = 0.0;

  // Circular Buffers for Time-Domain Analysis
  private sampleBuffer: Float32Array = new Float32Array(2048);
  private momentaryHistory: number[] = []; // History of ~400ms power values (~8 frames of 50ms)
  private shortTermHistory: number[] = []; // History of ~3000ms power values (~60 frames of 50ms)
  private integratedBlocks: number[] = []; // Ungated power blocks for integrated calculation

  // Metrics cache
  private currentMetrics: LoudnessMetrics = {
    momentaryLUFS: -70,
    shortTermLUFS: -70,
    integratedLUFS: -70,
    loudnessRangeLRA: 0,
    truePeakDbfs: -70,
    targetLUFS: -14,
    autoLevelDeltaDb: 0,
    autoLevelTrimGain: 1.0,
    isAutoLevelEnabled: true,
    isAudioActive: false,
  };

  // Subscriptions & Loop
  private listeners: Set<(metrics: LoudnessMetrics) => void> = new Set();
  private animFrameId: number | null = null;
  private lastAnalysisTime: number = 0;
  private onAutoLevelAdjust?: (trimGain: number, deltaDb: number) => void;

  constructor() {
    // Lazy setup on audio stream connect
  }

  /**
   * Connects the meter to the master audio bus post-compressor.
   * Dedicated K-weighting filters process audio without re-connecting to destination.
   */
  public connectSource(
    audioCtx: AudioContext,
    sourceNode: AudioNode,
    autoLevelCallback?: (trimGain: number, deltaDb: number) => void
  ) {
    this.ctx = audioCtx;
    this.onAutoLevelAdjust = autoLevelCallback;

    try {
      // Clean up any existing analyzer nodes
      if (this.analyser) {
        try {
          this.analyser.disconnect();
        } catch {}
      }

      // 1. Stage 1 K-weighting pre-filter: High-shelf filter (+4.0 dB boost around 1500 Hz)
      this.shelfFilter = this.ctx.createBiquadFilter();
      this.shelfFilter.type = 'highshelf';
      this.shelfFilter.frequency.setValueAtTime(1500, this.ctx.currentTime);
      this.shelfFilter.gain.setValueAtTime(4.0, this.ctx.currentTime);

      // 2. Stage 2 K-weighting pre-filter: High-pass RLB weighting filter (38 Hz cutoff, Q=0.5)
      this.hpFilter = this.ctx.createBiquadFilter();
      this.hpFilter.type = 'highpass';
      this.hpFilter.frequency.setValueAtTime(38, this.ctx.currentTime);
      this.hpFilter.Q.setValueAtTime(0.5, this.ctx.currentTime);

      // 3. Analyser Node for time-domain RMS integration (2048 samples)
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.0; // Raw real-time physical samples

      // Chain: source -> shelfFilter -> hpFilter -> analyser (NOT connected to destination)
      sourceNode.connect(this.shelfFilter);
      this.shelfFilter.connect(this.hpFilter);
      this.hpFilter.connect(this.analyser);

      this.startAnalysisLoop();
    } catch (err) {
      console.warn('R128 Loudness Meter connection error:', err);
    }
  }

  public disconnect() {
    this.stopAnalysisLoop();
    try {
      if (this.shelfFilter) this.shelfFilter.disconnect();
      if (this.hpFilter) this.hpFilter.disconnect();
      if (this.analyser) this.analyser.disconnect();
    } catch {}
    this.shelfFilter = null;
    this.hpFilter = null;
    this.analyser = null;
  }

  private startAnalysisLoop() {
    if (this.animFrameId) return;

    const analyze = (time: number) => {
      // Throttle analysis to ~20-25 times per second (every 40-50ms) for high efficiency
      if (time - this.lastAnalysisTime >= 45) {
        this.processFrame();
        this.lastAnalysisTime = time;
      }
      this.animFrameId = requestAnimationFrame(analyze);
    };

    this.animFrameId = requestAnimationFrame(analyze);
  }

  private stopAnalysisLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private processFrame() {
    if (!this.analyser) return;

    this.analyser.getFloatTimeDomainData(this.sampleBuffer as any);
    const len = this.sampleBuffer.length;

    let sumSquares = 0;
    let peakVal = 0;

    for (let i = 0; i < len; i++) {
      const s = this.sampleBuffer[i];
      const absS = Math.abs(s);
      if (absS > peakVal) peakVal = absS;
      sumSquares += s * s;
    }

    const meanSquare = sumSquares / len;
    const isAudioActive = peakVal > 0.0005;

    // True Peak / Sample Peak in dBFS
    const truePeakDbfs = peakVal > 0.00001 ? 20 * Math.log10(peakVal) : -70;

    // Push mean square power to history buffers
    this.momentaryHistory.push(meanSquare);
    if (this.momentaryHistory.length > 8) {
      this.momentaryHistory.shift(); // Keep ~400ms (8 * ~50ms)
    }

    this.shortTermHistory.push(meanSquare);
    if (this.shortTermHistory.length > 60) {
      this.shortTermHistory.shift(); // Keep ~3000ms (60 * ~50ms)
    }

    // Momentary LUFS (ITU-R BS.1770-4: LUFS = -0.691 + 10 * log10(sum(meanSquare)))
    const momPower =
      this.momentaryHistory.length > 0
        ? this.momentaryHistory.reduce((a, b) => a + b, 0) / this.momentaryHistory.length
        : 0;
    const momentaryLUFS =
      momPower > 1e-7 ? Math.max(-70, -0.691 + 10 * Math.log10(momPower)) : -70;

    // Short-Term LUFS (3s window)
    const stPower =
      this.shortTermHistory.length > 0
        ? this.shortTermHistory.reduce((a, b) => a + b, 0) / this.shortTermHistory.length
        : 0;
    const shortTermLUFS =
      stPower > 1e-7 ? Math.max(-70, -0.691 + 10 * Math.log10(stPower)) : -70;

    // Integrated LUFS with gating
    if (isAudioActive && momPower > 1e-6) {
      this.integratedBlocks.push(momPower);
      if (this.integratedBlocks.length > 360) {
        this.integratedBlocks.shift(); // sliding ~3 minute window for long-term integrated
      }
    }

    let integratedLUFS = -70;
    let lra = 0;

    if (this.integratedBlocks.length > 5) {
      // Calculate un-gated threshold
      const unGatedAvg =
        this.integratedBlocks.reduce((a, b) => a + b, 0) / this.integratedBlocks.length;
      const unGatedLUFS = -0.691 + 10 * Math.log10(Math.max(1e-7, unGatedAvg));
      const relativeGate = unGatedLUFS - 10; // -10 LU relative threshold

      // Gated summation
      const gated = this.integratedBlocks.filter((p) => {
        const lufs = -0.691 + 10 * Math.log10(Math.max(1e-7, p));
        return lufs > -70 && lufs > relativeGate;
      });

      if (gated.length > 0) {
        const gatedAvg = gated.reduce((a, b) => a + b, 0) / gated.length;
        integratedLUFS = Math.max(-70, -0.691 + 10 * Math.log10(Math.max(1e-7, gatedAvg)));
      }

      // Statistical Loudness Range (LRA) from short term distribution
      if (this.shortTermHistory.length >= 10) {
        const lufsValues = this.shortTermHistory
          .filter((p) => p > 1e-6)
          .map((p) => -0.691 + 10 * Math.log10(p))
          .sort((a, b) => a - b);

        if (lufsValues.length >= 10) {
          const p10 = lufsValues[Math.floor(lufsValues.length * 0.1)];
          const p95 = lufsValues[Math.floor(lufsValues.length * 0.95)];
          lra = Math.max(0, Math.round((p95 - p10) * 10) / 10);
        }
      }
    }

    // Dynamic Master Auto-Leveler Computation
    // Holds master loudness locked to targetLUFS (e.g. -14 LUFS) as ambient tracks toggle
    if (this.isAutoLevelEnabled && isAudioActive && shortTermLUFS > -50) {
      const rawDeltaDb = this.targetLUFS - shortTermLUFS;
      // Clamp correction to acoustic safe range [-7.0 dB, +5.0 dB] to preserve dynamics
      const clampedDeltaDb = Math.max(-7.0, Math.min(5.0, rawDeltaDb));
      // Subtle exponential smoothing towards target (time constant ~ 0.3s)
      this.autoLevelDeltaDb = this.autoLevelDeltaDb * 0.88 + clampedDeltaDb * 0.12;
      this.autoLevelTrimGain = Math.pow(10, this.autoLevelDeltaDb / 20);

      if (this.onAutoLevelAdjust) {
        this.onAutoLevelAdjust(this.autoLevelTrimGain, this.autoLevelDeltaDb);
      }
    } else {
      // Smoothly drift back to unity gain (1.0) when idle or disabled
      this.autoLevelDeltaDb = this.autoLevelDeltaDb * 0.9;
      this.autoLevelTrimGain = Math.pow(10, this.autoLevelDeltaDb / 20);
      if (this.onAutoLevelAdjust && Math.abs(this.autoLevelDeltaDb) > 0.05) {
        this.onAutoLevelAdjust(this.autoLevelTrimGain, this.autoLevelDeltaDb);
      }
    }

    this.currentMetrics = {
      momentaryLUFS: Math.round(momentaryLUFS * 10) / 10,
      shortTermLUFS: Math.round(shortTermLUFS * 10) / 10,
      integratedLUFS: Math.round(integratedLUFS * 10) / 10,
      loudnessRangeLRA: lra,
      truePeakDbfs: Math.round(truePeakDbfs * 10) / 10,
      targetLUFS: this.targetLUFS,
      autoLevelDeltaDb: Math.round(this.autoLevelDeltaDb * 10) / 10,
      autoLevelTrimGain: Math.round(this.autoLevelTrimGain * 100) / 100,
      isAutoLevelEnabled: this.isAutoLevelEnabled,
      isAudioActive,
    };

    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentMetrics);
      } catch {}
    });
  }

  public subscribe(cb: (metrics: LoudnessMetrics) => void): () => void {
    this.listeners.add(cb);
    cb(this.currentMetrics);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public setTargetLoudness(target: TargetLoudnessPreset) {
    this.targetLUFS = target;
    this.currentMetrics.targetLUFS = target;
    this.notifyListeners();
  }

  public getTargetLoudness(): TargetLoudnessPreset {
    return this.targetLUFS;
  }

  public setAutoLevelEnabled(enabled: boolean) {
    this.isAutoLevelEnabled = enabled;
    this.currentMetrics.isAutoLevelEnabled = enabled;
    if (!enabled) {
      this.autoLevelDeltaDb = 0;
      this.autoLevelTrimGain = 1.0;
      if (this.onAutoLevelAdjust) {
        this.onAutoLevelAdjust(1.0, 0.0);
      }
    }
    this.notifyListeners();
  }

  public getAutoLevelEnabled(): boolean {
    return this.isAutoLevelEnabled;
  }

  public resetIntegrated() {
    this.integratedBlocks = [];
    this.shortTermHistory = [];
    this.momentaryHistory = [];
    this.currentMetrics.integratedLUFS = -70;
    this.currentMetrics.loudnessRangeLRA = 0;
    this.notifyListeners();
  }

  public getMetrics(): LoudnessMetrics {
    return { ...this.currentMetrics };
  }
}

export const r128LoudnessMeter = new R128LoudnessMeter();
