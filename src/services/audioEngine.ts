/**
 * 432Hz Alpha Waves Ambient Sound Engine & Procedural Nature Sound Synthesizer
 * Built with Web Audio API for 100% offline, studio-quality, seamless playback.
 */

import { r128LoudnessMeter, LoudnessMetrics, TargetLoudnessPreset } from './r128LoudnessMeter';
export { r128LoudnessMeter, type LoudnessMetrics, type TargetLoudnessPreset };

export interface NatureSoundState {
  id: string;
  name: string;
  category: 'nature' | 'musical' | 'sacred';
  icon: string;
  volume: number; // 0 to 1
  enabled: boolean;
  color: string;
  description: string;
}

export type BrainwaveMode = 'alpha_healing' | 'alpha_flow' | 'theta_meditation' | 'delta_sleep' | 'pure_432';

export interface BrainwaveConfig {
  name: string;
  beatHz: number; // binaural beat frequency
  description: string;
  targetState: string;
}

export const BRAINWAVE_MODES: Record<BrainwaveMode, BrainwaveConfig> = {
  alpha_healing: {
    name: 'Deep Relaxation',
    beatHz: 10.0,
    description: '10Hz Alpha Waves • Calming acoustic rhythm for stress release and mindful rest',
    targetState: 'Deep Peace & Relaxation',
  },
  alpha_flow: {
    name: 'Calm Flow State',
    beatHz: 8.5,
    description: '8.5Hz Low-Alpha promotes relaxed focus, meditative presence & mental clarity',
    targetState: 'Relaxed Alertness',
  },
  theta_meditation: {
    name: 'Theta Sanctuary',
    beatHz: 6.0,
    description: '6Hz Theta frequency opens deep subconscious peace, intuition & spiritual quietude',
    targetState: 'Transcendental Stillness',
  },
  delta_sleep: {
    name: 'Restorative Sleep',
    beatHz: 3.5,
    description: '3.5Hz Delta Waves for peaceful bedtime drifting & deep overnight slumber',
    targetState: 'Profound Slumber',
  },
  pure_432: {
    name: 'Pure Tone Resonance',
    beatHz: 0.0,
    description: 'Harmonic natural tuning without binaural brainwave modulation',
    targetState: 'Harmonic Acoustic Balance',
  },
};

export interface RecommendedBreathConfig {
  patternId: 'relax_478' | 'box_4444' | 'coherence_55' | 'refresh_426';
  patternName: string;
  ratio: string;
  focus: string;
  instruction: string;
}

export interface SolfeggioItem {
  freq: number;
  label: string;
  name: string;
  description: string;
  recommendedBreath: RecommendedBreathConfig;
}

export const SOLFEGGIO_FREQUENCIES: SolfeggioItem[] = [
  {
    freq: 174,
    label: '174 Hz',
    name: 'Soothing Comfort & Grounding',
    description: 'Low harmonic warmth & deep somatic presence',
    recommendedBreath: {
      patternId: 'refresh_426',
      patternName: 'Awaken & Cleanse (4-2-6)',
      ratio: '4s Inhale • 2s Hold • 6s Exhale',
      focus: 'Somatic Release & Pelvic Floor Relaxation',
      instruction: 'Breathe low into the abdomen and let the extended 6s exhale drain tension down through your legs and feet.',
    },
  },
  {
    freq: 285,
    label: '285 Hz',
    name: 'Ambient Restoration & Rest',
    description: 'Tranquil harmonic tone for restful peacefulness',
    recommendedBreath: {
      patternId: 'relax_478',
      patternName: '4-7-8 Deep Rest & Sleep',
      ratio: '4s Inhale • 7s Retention • 8s Exhale',
      focus: 'Cellular Restoration & Parasympathetic Reset',
      instruction: 'Extended exhalation triggers the baroreceptor reflex, matching the calm 285Hz restorative field.',
    },
  },
  {
    freq: 396,
    label: '396 Hz',
    name: 'Root Grounding & Balance',
    description: 'Clearing mental noise, easing worry & nurturing presence',
    recommendedBreath: {
      patternId: 'box_4444',
      patternName: 'Box Breathing (4-4-4-4)',
      ratio: '4s In • 4s Hold • 4s Out • 4s Rest',
      focus: 'Root Stabilization & Fear Dissolution',
      instruction: 'Equal quadrants stabilize the autonomic nervous system, anchoring your awareness in the solid present moment.',
    },
  },
  {
    freq: 432,
    label: '432 Hz',
    name: 'Harmonic Nature Tuning',
    description: 'Natural mathematical tuning & serene autonomic calm',
    recommendedBreath: {
      patternId: 'coherence_55',
      patternName: 'Heart Coherence (5.5s)',
      ratio: '5.5s Inhale • 5.5s Exhale (0.1 Hz Resonant Rhythm)',
      focus: 'Cardiovascular & Pythagorean Harmonic Synchronization',
      instruction: 'Breathing at exactly 5.5 seconds aligns heart rate variability (HRV) with the 432Hz golden ratio harmonics.',
    },
  },
  {
    freq: 528,
    label: '528 Hz',
    name: '528Hz Harmonic Soundscape',
    description: 'Heart-centered tone for emotional balance & uplifting serenity',
    recommendedBreath: {
      patternId: 'coherence_55',
      patternName: 'Heart Coherence (5.5s)',
      ratio: '5.5s Inhale • 5.5s Exhale',
      focus: 'Heart-Brain Coherence & Emotional Elevation',
      instruction: 'Inhale warm green light into the chest center; exhale gratitude and expansion into the surrounding acoustic space.',
    },
  },
  {
    freq: 639,
    label: '639 Hz',
    name: 'Heart Harmony & Connection',
    description: 'Compassionate presence, empathy & interpersonal warmth',
    recommendedBreath: {
      patternId: 'coherence_55',
      patternName: 'Loving-Kindness Coherence (5.5s)',
      ratio: '5.5s Inhale • 5.5s Exhale',
      focus: 'Social Vagal Activation & Interpersonal Warmth',
      instruction: 'Sync each breath with unconditional presence, allowing the 639Hz frequency to soften muscular holding around the chest.',
    },
  },
  {
    freq: 741,
    label: '741 Hz',
    name: 'Mental Clarity & Insight',
    description: 'Mindful focus, creative problem-solving & clean soundscape',
    recommendedBreath: {
      patternId: 'box_4444',
      patternName: 'Box Breathing (4-4-4-4)',
      ratio: '4s In • 4s Hold • 4s Out • 4s Empty',
      focus: 'Mental Detoxification & Prefrontal Focus',
      instruction: 'Use the still breath-retention phases to observe thoughts without clinging, sharpening perceptual lucidity.',
    },
  },
  {
    freq: 852,
    label: '852 Hz',
    name: 'Spiritual Order & Awareness',
    description: 'Meditative stillness & elevated contemplative clarity',
    recommendedBreath: {
      patternId: 'relax_478',
      patternName: '4-7-8 Contemplative Stillness',
      ratio: '4s Inhale • 7s Stillness • 8s Release',
      focus: 'Third-Eye Quieting & Inner Observer Awakening',
      instruction: '7 seconds of gentle stillness allows sensory impressions to settle into pristine, undisturbed inner awareness.',
    },
  },
  {
    freq: 963,
    label: '963 Hz',
    name: 'Pure Resonance & Awakening',
    description: 'Ethereal high harmonics, spacious light & cosmic serenity',
    recommendedBreath: {
      patternId: 'refresh_426',
      patternName: 'Crown Light Breath (4-2-6)',
      ratio: '4s Inhale • 2s Hold • 6s Exhale',
      focus: 'Crown Resonance & Spacious Mind',
      instruction: 'Inhale upward through the crown of the head; exhale into spacious, limitless crystalline awareness.',
    },
  },
];

export const DEFAULT_NATURE_SOUNDS: NatureSoundState[] = [
  // Realistic Nature
  { id: 'rain', name: 'Rain & Drops', category: 'nature', icon: 'CloudRain', volume: 0.5, enabled: true, color: 'text-sky-400', description: 'Gentle rainfall with droplet pings on foliage' },
  { id: 'ocean', name: 'Ocean Swells', category: 'nature', icon: 'Waves', volume: 0.45, enabled: false, color: 'text-cyan-400', description: 'Rolling coastal waves with seafoam hiss and undertow' },
  { id: 'birds', name: 'Forest Birds', category: 'nature', icon: 'Bird', volume: 0.35, enabled: false, color: 'text-emerald-400', description: 'Authentic procedurally chirping morning songbirds' },
  { id: 'wind', name: 'Forest Breeze', category: 'nature', icon: 'Wind', volume: 0.35, enabled: false, color: 'text-teal-400', description: 'Soft organic canopy gusts with foliage motion' },
  { id: 'thunder', name: 'Distant Thunder', category: 'nature', icon: 'CloudLightning', volume: 0.3, enabled: false, color: 'text-purple-400', description: 'Low rolling ambient thunder with rumbling tail' },
  { id: 'stream', name: 'Mountain Stream', category: 'nature', icon: 'Droplets', volume: 0.4, enabled: false, color: 'text-blue-400', description: 'Liquid pebble stream with resonant water bubbles' },
  { id: 'fire', name: 'Campfire Crackle', category: 'nature', icon: 'Flame', volume: 0.35, enabled: false, color: 'text-amber-400', description: 'Warm embers with dynamic cedar wood spark pops' },
  { id: 'crickets', name: 'Night Meadow', category: 'nature', icon: 'Moon', volume: 0.3, enabled: false, color: 'text-indigo-400', description: 'Evening crickets and rhythmic meadow cicadas' },
  { id: 'brown_noise', name: 'Velvet Brown Noise', category: 'nature', icon: 'Activity', volume: 0.25, enabled: false, color: 'text-slate-400', description: 'Deep low-pass velvet noise for sleep & focus' },

  // Musical & Acoustic Tools in 432Hz
  { id: 'bowls', name: 'Tibetan Bowls', category: 'musical', icon: 'Bell', volume: 0.45, enabled: true, color: 'text-yellow-400', description: 'Dual harmonic singing bowl drone tuned to 432Hz' },
  { id: 'koshi', name: 'Koshi Wind Chimes', category: 'musical', icon: 'Disc', volume: 0.4, enabled: false, color: 'text-amber-300', description: 'Acoustic bamboo chime arpeggios in 432Hz tuning' },
  { id: 'flute', name: 'Zen Flute', category: 'musical', icon: 'Music', volume: 0.35, enabled: false, color: 'text-emerald-300', description: 'Slow breathy bansuri flute tones drifting in 432Hz' },
  { id: 'cello', name: 'Cello String Drone', category: 'musical', icon: 'Layers', volume: 0.35, enabled: false, color: 'text-rose-400', description: 'Warm bowing cello sub-harmonics (108Hz / 216Hz)' },
  { id: 'harp', name: 'Celestial Harp', category: 'musical', icon: 'Sparkles', volume: 0.35, enabled: false, color: 'text-indigo-300', description: 'Shimmering 432Hz pentatonic harp string plucks' },
  { id: 'tanpura', name: 'Sacred Tanpura', category: 'sacred', icon: 'Radio', volume: 0.4, enabled: false, color: 'text-orange-400', description: 'Rich Indian meditative drone overtone wash in 432Hz' },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // 432Hz Tone Nodes
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private harmonicOsc: OscillatorNode | null = null;
  private isochronicLfo: OscillatorNode | null = null;
  private isochronicGain: GainNode | null = null;
  private toneGain: GainNode | null = null;
  private subGain: GainNode | null = null;
  private harmonicGain: GainNode | null = null;
  private toneFilter: BiquadFilterNode | null = null;
  private subFilter: BiquadFilterNode | null = null;

  // Clinical & Acoustical Safety Range: 40 Hz to 1200 Hz (Audible, Safe Human Acoustic Range)
  public static readonly SAFE_MIN_HZ = 40;
  public static readonly SAFE_MAX_HZ = 1200;

  // Studio-Grade Dynamic Normalization & Peak Limiter
  private compressor: DynamicsCompressorNode | null = null;
  private normGain: GainNode | null = null;
  private isVolumeNormalized = true; // Enabled by default for balanced multi-layer playback
  private autoLevelTrim = 1.0;
  private autoLevelDeltaDb = 0.0;

  // Nature Sounds Map & Timeout Tracker
  private natureNodes: Map<string, { gain: GainNode; cleanup: () => void }> = new Map();
  private natureTimeouts: Map<string, number> = new Map();
  private stagedNatureLevels: Record<string, number> = {};

  // State
  private isPlaying = false;
  private baseFreq = 432;
  private brainwaveMode: BrainwaveMode = 'alpha_healing';
  private masterVol = 0.6; // 60% WHO-aligned safe listening volume level default
  private pulseDepth = 0.6; // 0 to 1
  private subDroneVol = 0.4; // 0 to 1
  private headphoneBinaural = true;

  // Fade out for sleep timer
  private fadeInterval: number | null = null;

  // 3-Minute Fade Out on Pause State & Listeners
  private isFadingOut = false;
  private fadeRemainingSeconds = 0;
  private fadeDurationSeconds = 180;
  private fadeTimerInterval: number | null = null;
  private fadeListeners: Set<(status: { isFadingOut: boolean; remainingSeconds: number; durationSeconds: number }) => void> = new Set();
  private playingListeners: Set<(isPlaying: boolean) => void> = new Set();

  // Musical accompaniment state
  private chordInterval: number | null = null;
  private currentChordNodes: { oscs: OscillatorNode[]; gain: GainNode }[] = [];
  private chordsGain: GainNode | null = null;
  private chordsVolume = 0.55;
  private isChordsPlaying = false;
  private isMusicalModeEnabled = false;
  private currentChordProgression = 'solfeggio_adaptive';
  private lastChordTime = 0;
  private activeChordFrequencies: number[] = [];

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with autoplay policy
  }

  private async initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(Math.max(0.001, this.masterVol), this.ctx.currentTime);

      // Volume Normalization Stage (equal-loudness power-summation factor)
      this.normGain = this.ctx.createGain();
      this.normGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // Studio-Grade Dynamics Compressor & Peak Limiter
      this.compressor = this.ctx.createDynamicsCompressor();
      this.applyCompressorSettings();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.85;

      // Master bus chain: masterGain -> normGain -> compressor -> analyser -> destination
      this.masterGain.connect(this.normGain);
      this.normGain.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Connect ITU-R BS.1770-4 & EBU R128 loudness analysis and auto-leveler post-compressor
      r128LoudnessMeter.connectSource(this.ctx, this.compressor, (trimGain, deltaDb) => {
        this.setLoudnessAutoLevelTrim(trimGain, deltaDb);
      });
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume notice:', err);
      }
    }
  }

  private applyCompressorSettings() {
    if (!this.compressor || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.isVolumeNormalized) {
      // Gentle transparent broadcast leveling with ceiling safeguard
      this.compressor.threshold.setTargetAtTime(-14, now, 0.05);
      this.compressor.knee.setTargetAtTime(12, now, 0.05);
      this.compressor.ratio.setTargetAtTime(4.0, now, 0.05);
      this.compressor.attack.setTargetAtTime(0.003, now, 0.05);
      this.compressor.release.setTargetAtTime(0.20, now, 0.05);
    } else {
      // Studio Brickwall Peak Limiter: Zero clipping, ultra-fast 1ms transient catching, clean 0.8dB true-peak ceiling
      this.compressor.threshold.setTargetAtTime(-0.8, now, 0.05);
      this.compressor.knee.setTargetAtTime(0.0, now, 0.05);
      this.compressor.ratio.setTargetAtTime(20.0, now, 0.05);
      this.compressor.attack.setTargetAtTime(0.001, now, 0.05);
      this.compressor.release.setTargetAtTime(0.08, now, 0.05);
    }
  }

  private calculateBaseNormFactor(): number {
    const activeNature = this.natureNodes.size;
    const activeTone = this.isPlaying ? 1 : 0;
    const activeChords = this.isChordsPlaying ? 1 : 0;
    const totalActive = Math.max(1, activeTone + activeNature + activeChords);
    return 1 / Math.sqrt(1 + (totalActive - 1) * 0.65);
  }

  public setLoudnessAutoLevelTrim(trimMultiplier: number, deltaDb: number) {
    this.autoLevelTrim = Math.max(0.25, Math.min(2.0, trimMultiplier));
    this.autoLevelDeltaDb = deltaDb;
    if (this.ctx && this.normGain && this.isVolumeNormalized && r128LoudnessMeter.getAutoLevelEnabled()) {
      const now = this.ctx.currentTime;
      const baseFactor = this.calculateBaseNormFactor();
      const effectiveGain = Math.max(0.1, Math.min(1.5, baseFactor * this.autoLevelTrim));
      this.normGain.gain.setTargetAtTime(effectiveGain, now, 0.25);
    }
  }

  public recalculateNormalization() {
    if (!this.ctx || !this.normGain) return;
    const now = this.ctx.currentTime;

    const activeNature = this.natureNodes.size;
    const activeTone = this.isPlaying ? 1 : 0;
    const activeChords = this.isChordsPlaying ? 1 : 0;
    const totalActive = Math.max(1, activeTone + activeNature + activeChords);

    if (!this.isVolumeNormalized) {
      // Dynamic Headroom Scaling: Even with manual normalization off, automatically scale summing bus
      // so multi-track combinations (e.g. 432Hz tone + 3 nature sounds + chords) maintain pristine headroom without clipping
      const headroomGain = totalActive > 1 ? 1 / Math.sqrt(1 + (totalActive - 1) * 0.45) : 1.0;
      this.normGain.gain.setTargetAtTime(headroomGain, now, 0.08);
      this.applyCompressorSettings();
      return;
    }

    // Equal-loudness power-summation factor combined with real-time EBU R128 auto-leveling
    const baseFactor = 1 / Math.sqrt(1 + (totalActive - 1) * 0.65);
    const effectiveGain = r128LoudnessMeter.getAutoLevelEnabled()
      ? Math.max(0.1, Math.min(1.5, baseFactor * this.autoLevelTrim))
      : baseFactor;
    this.normGain.gain.setTargetAtTime(effectiveGain, now, 0.08);
    this.applyCompressorSettings();
  }

  public setVolumeNormalization(enabled: boolean) {
    this.isVolumeNormalized = enabled;
    this.recalculateNormalization();
  }

  public getVolumeNormalization(): boolean {
    return this.isVolumeNormalized;
  }

  public getCompressionReduction(): number {
    return this.compressor ? this.compressor.reduction : 0;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getBaseFrequency(): number {
    return this.baseFreq;
  }

  public getMasterVolume(): number {
    return this.masterVol;
  }

  public pause(): void {
    this.instantStop();
  }

  public async resume(): Promise<void> {
    return this.start();
  }

  public static readonly SAFE_VOLUME_LIMIT = 0.85; // Absolute acoustic trauma prevention limiter
  public static readonly RECOMMENDED_SAFE_VOLUME = 0.60; // 60% WHO recommended safe listening volume

  public getSafetyStatus() {
    return {
      currentBaseFreqHz: this.baseFreq,
      safeMinHz: AudioEngine.SAFE_MIN_HZ,
      safeMaxHz: AudioEngine.SAFE_MAX_HZ,
      isWithinSafeAudibleRange: this.baseFreq >= AudioEngine.SAFE_MIN_HZ && this.baseFreq <= AudioEngine.SAFE_MAX_HZ,
      acousticWaveformType: 'Pure Sine (Double Precision 64-bit Floating Point)',
      rfEmissionMHz: 0.0, // Strictly mechanical sound airwaves; zero electromagnetic radio MHz
      isVolumeNormalized: this.isVolumeNormalized,
      isPeakLimiterActive: Boolean(this.compressor),
      antiClickSmoothingMs: 80,
      brainwaveBeatHz: BRAINWAVE_MODES[this.brainwaveMode]?.beatHz ?? 10.0,
      ultrasonicCeilingCutoffHz: 2400,
      volumeSafetyLimit: AudioEngine.SAFE_VOLUME_LIMIT,
      isWithinSafetyVolumeLimit: this.masterVol <= 0.75,
    };
  }

  public async start(fadeDurationSeconds: number = 2.0, mainHzDelaySeconds: number = 0) {
    this.isPlaying = true;
    this.notifyPlayingListeners();
    try {
      await this.initContext();
      if (!this.ctx || !this.masterGain) return;

      this.stopToneNodes();

      const now = this.ctx.currentTime;
      const fadeSec = Math.max(0.4, Math.min(5.0, fadeDurationSeconds));
      const targetVol = Math.max(0.01, this.masterVol);

      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || 0.001, now);
      this.masterGain.gain.linearRampToValueAtTime(targetVol, now + fadeSec);

      // Start main 432Hz/binaural wave stream immediately without silence gap
      this.startToneNodes(fadeSec, mainHzDelaySeconds);

      // Start active atmosphere sounds immediately so nature bed establishes first
      if (this.stagedNatureLevels && Object.keys(this.stagedNatureLevels).length > 0 && this.natureNodes.size === 0) {
        Object.entries(this.stagedNatureLevels).forEach(([id, vol]) => {
          if (vol > 0) {
            this.createNatureGenerator(id, vol, fadeSec);
          }
        });
      }

      // Resume Musical Mode ambient chords if enabled
      if (this.isMusicalModeEnabled) {
        this.startAmbientChords();
      }
    } catch (err) {
      console.error('AudioEngine start error:', err);
      this.isPlaying = true;
    }
  }

  public getIsFadingOut(): boolean {
    return this.isFadingOut;
  }

  public getFadeRemainingSeconds(): number {
    return this.fadeRemainingSeconds;
  }

  public subscribeFadeStatus(
    cb: (status: { isFadingOut: boolean; remainingSeconds: number; durationSeconds: number }) => void
  ): () => void {
    this.fadeListeners.add(cb);
    cb({
      isFadingOut: this.isFadingOut,
      remainingSeconds: this.fadeRemainingSeconds,
      durationSeconds: this.fadeDurationSeconds,
    });
    return () => {
      this.fadeListeners.delete(cb);
    };
  }

  private notifyFadeListeners() {
    const status = {
      isFadingOut: this.isFadingOut,
      remainingSeconds: this.fadeRemainingSeconds,
      durationSeconds: this.fadeDurationSeconds,
    };
    this.fadeListeners.forEach((cb) => {
      try {
        cb(status);
      } catch {}
    });
  }

  public subscribePlayingStatus(cb: (isPlaying: boolean) => void): () => void {
    this.playingListeners.add(cb);
    try {
      cb(this.isPlaying);
    } catch {}
    return () => {
      this.playingListeners.delete(cb);
    };
  }

  private notifyPlayingListeners() {
    const playing = this.isPlaying;
    this.playingListeners.forEach((cb) => {
      try {
        cb(playing);
      } catch {}
    });
  }

  /**
   * 5-Second Sacred Fade Out on Pause / Streaming End
   * Drifts smoothly into silence without abrupt acoustic shock.
   */
  public pauseWithFadeOut(durationSeconds: number = 5.0, onComplete: () => void = () => {}) {
    if (!this.isPlaying || !this.ctx || !this.masterGain) {
      this.stop();
      onComplete();
      return;
    }

    this.isFadingOut = true;
    this.fadeDurationSeconds = Math.max(5, durationSeconds);
    this.fadeRemainingSeconds = this.fadeDurationSeconds;
    this.notifyFadeListeners();

    if (this.fadeTimerInterval) {
      clearInterval(this.fadeTimerInterval);
      this.fadeTimerInterval = null;
    }

    const startVol = this.masterVol;
    const now = this.ctx.currentTime;

    // Smooth exponential ramp down to silence over durationSeconds
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.001, this.masterGain.gain.value), now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.00001, now + this.fadeDurationSeconds);

    this.fadeTimerInterval = window.setInterval(() => {
      this.fadeRemainingSeconds = Math.max(0, this.fadeRemainingSeconds - 1);
      this.notifyFadeListeners();

      if (this.fadeRemainingSeconds <= 0) {
        if (this.fadeTimerInterval) {
          clearInterval(this.fadeTimerInterval);
          this.fadeTimerInterval = null;
        }
        this.isFadingOut = false;
        this.stop();
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
          this.masterGain.gain.setValueAtTime(startVol, this.ctx.currentTime);
        }
        this.notifyFadeListeners();
        onComplete();
      }
    }, 1000);
  }

  /**
   * Resume playback and cancel active fade out
   */
  public cancelFadeOutAndResume() {
    if (this.fadeTimerInterval) {
      clearInterval(this.fadeTimerInterval);
      this.fadeTimerInterval = null;
    }
    this.isFadingOut = false;
    this.fadeRemainingSeconds = 0;
    this.notifyFadeListeners();

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.masterVol, now, 0.4);
    }
  }

  /**
   * Stop immediately without waiting for 3-minute fadeout
   */
  public instantStop() {
    this.isPlaying = false;
    this.notifyPlayingListeners();
    if (this.fadeTimerInterval) {
      clearInterval(this.fadeTimerInterval);
      this.fadeTimerInterval = null;
    }
    this.isFadingOut = false;
    this.fadeRemainingSeconds = 0;
    this.notifyFadeListeners();

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const releaseTime = 0.035; // 35ms imperceptible click-free ramp to absolute silence
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
      this.masterGain.gain.linearRampToValueAtTime(0.00001, now + releaseTime);
      setTimeout(() => {
        this.stop();
        if (this.masterGain && this.ctx) {
          const resetNow = this.ctx.currentTime;
          this.masterGain.gain.cancelScheduledValues(resetNow);
          this.masterGain.gain.setValueAtTime(0.00001, resetNow);
        }
      }, Math.round((releaseTime + 0.01) * 1000));
    } else {
      this.stop();
    }
  }

  public stop() {
    if (this.fadeTimerInterval) {
      clearInterval(this.fadeTimerInterval);
      this.fadeTimerInterval = null;
    }
    this.isFadingOut = false;
    this.fadeRemainingSeconds = 0;
    this.notifyFadeListeners();

    this.isPlaying = false;
    this.notifyPlayingListeners();
    this.stopToneNodes();
    this.stopAllNatureSounds();
    this.stopAmbientChords();

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.instantStop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  /**
   * Refactored transition logic using zero-crossing envelope detection.
   * Calculates current wave cycle period T = 1 / f and aligns a micro ducking envelope
   * to an exact wave cycle zero crossing, preventing any click or pop artifact during frequency switching.
   */
  public transitionFrequencyWithZeroCrossing(newFreq: number, newMode?: BrainwaveMode) {
    const safeFreq = Math.min(
      AudioEngine.SAFE_MAX_HZ,
      Math.max(AudioEngine.SAFE_MIN_HZ, Number.isFinite(newFreq) ? Math.round(newFreq) : 432)
    );
    if (newMode) {
      this.brainwaveMode = newMode;
    }
    this.baseFreq = safeFreq;

    if (!this.isPlaying || !this.ctx) return;

    if (!this.oscLeft || !this.toneGain) {
      this.startToneNodes(0.4, 0);
      return;
    }

    const now = this.ctx.currentTime;
    const currentBase = this.oscLeft.frequency.value || safeFreq;
    const currentPeriod = 1 / Math.max(40, currentBase);

    // Align ducking window to an exact multiple of the wave period near 10-12ms
    const cycles = Math.max(1, Math.round(0.010 / currentPeriod));
    const duckDuration = cycles * currentPeriod;
    const zcTime = now + duckDuration;

    // Micro zero-crossing duck to 0 amplitude
    this.toneGain.gain.cancelScheduledValues(now);
    this.toneGain.gain.setValueAtTime(Math.max(0.0001, this.toneGain.gain.value), now);
    this.toneGain.gain.linearRampToValueAtTime(0.00001, zcTime);

    // Schedule frequency and filter updates at the exact zero-crossing timestamp
    const config = BRAINWAVE_MODES[this.brainwaveMode];
    const beatHz = config.beatHz;
    const leftFreq = safeFreq;
    const rightFreq = this.headphoneBinaural && beatHz > 0 ? safeFreq + beatHz : safeFreq;

    this.oscLeft.frequency.setValueAtTime(leftFreq, zcTime);
    this.oscRight.frequency.setValueAtTime(rightFreq, zcTime);

    if (this.subOsc) {
      this.subOsc.frequency.setValueAtTime(safeFreq / 4, zcTime);
    }
    if (this.subFilter) {
      this.subFilter.frequency.setValueAtTime(Math.min(350, Math.max(120, (safeFreq / 4) * 1.6)), zcTime);
    }
    if (this.harmonicOsc) {
      this.harmonicOsc.frequency.setValueAtTime(safeFreq * 2, zcTime);
    }
    if (this.toneFilter) {
      const safeCutoff = Math.min(2400, Math.max(1200, safeFreq * 2.2));
      this.toneFilter.frequency.setValueAtTime(safeCutoff, zcTime);
    }
    if (this.isochronicLfo) {
      const lfoFreq = beatHz > 0 ? beatHz : 0.01;
      this.isochronicLfo.frequency.setValueAtTime(lfoFreq, zcTime);
    }

    // Micro crossfade ramp back to standard tone operating volume (12ms)
    const targetToneVol = 0.36;
    this.toneGain.gain.setValueAtTime(0.00001, zcTime);
    this.toneGain.gain.linearRampToValueAtTime(targetToneVol, zcTime + 0.012);

    if (this.isMusicalModeEnabled && this.isChordsPlaying) {
      this.reharmonizeChords();
    }
  }

  public setBaseFrequency(freq: number) {
    // Clinical & Acoustical Safety Boundary Check:
    // Only pure audible mechanical acoustic sound frequencies between 40Hz and 1200Hz are allowed.
    // Harmful ultrasonic frequencies, high-frequency electromagnetic RF (MHz/GHz), and negative values are strictly prevented.
    const safeFreq = Math.min(
      AudioEngine.SAFE_MAX_HZ,
      Math.max(AudioEngine.SAFE_MIN_HZ, Number.isFinite(freq) ? Math.round(freq) : 432)
    );
    if (this.isPlaying && this.ctx && this.oscLeft && this.toneGain) {
      this.transitionFrequencyWithZeroCrossing(safeFreq);
    } else {
      this.baseFreq = safeFreq;
    }
  }

  public setBrainwaveMode(mode: BrainwaveMode) {
    if (this.isPlaying && this.ctx && this.oscLeft && this.toneGain) {
      this.transitionFrequencyWithZeroCrossing(this.baseFreq, mode);
    } else {
      this.brainwaveMode = mode;
    }
  }

  public setStagedNatureLevels(levels: Record<string, number>) {
    this.stagedNatureLevels = { ...levels };
    if (this.isPlaying && this.ctx) {
      this.smartFadePreset(this.baseFreq, this.brainwaveMode, levels, 2.0);
    }
  }

  public getStagedNatureLevels(): Record<string, number> {
    return { ...this.stagedNatureLevels };
  }

  /**
   * Smart Presets Fading:
   * Smooth acoustic crossfade between presets over fadeDurationSec (e.g. 2.0s - 3.5s).
   * - Portamento glides carrier frequencies smoothly without clicks or pops
   * - Dynamically adjusts sub-drone, overtone shimmer, analog lowpass cutoff, and isochronic brainwave LFO
   * - Cross-fades outgoing nature sound layers to silence over fadeDurationSec
   * - Fades in incoming nature sound layers smoothly over fadeDurationSec with zero race conditions
   * - Automatically ensures audio context is running and active
   */
  public async smartFadePreset(
    targetFreq: number,
    targetMode: BrainwaveMode,
    targetNatureLevels: Record<string, number>,
    fadeDurationSec: number = 2.5
  ) {
    const safeFreq = Math.min(
      AudioEngine.SAFE_MAX_HZ,
      Math.max(AudioEngine.SAFE_MIN_HZ, Number.isFinite(targetFreq) ? Math.round(targetFreq) : 432)
    );
    this.baseFreq = safeFreq;
    this.brainwaveMode = targetMode;
    this.stagedNatureLevels = { ...targetNatureLevels };

    await this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.notifyPlayingListeners();
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume notice:', err);
      }
    }

    const now = this.ctx.currentTime;
    const fade = Math.max(1.2, Math.min(5.0, fadeDurationSec));

    // Ensure master volume is at intended level
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value || 0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(Math.max(0.01, this.masterVol), now + 0.3);

    // If tone nodes have not been initialized yet, start them smoothly
    if (!this.oscLeft || !this.toneGain) {
      this.startToneNodes(fade * 0.5, 0);
    } else {
      // Smooth frequency portamento transition
      const config = BRAINWAVE_MODES[this.brainwaveMode];
      const beatHz = config?.beatHz ?? 0;
      const leftFreq = this.baseFreq;
      const rightFreq = this.headphoneBinaural && beatHz > 0 ? this.baseFreq + beatHz : this.baseFreq;
      const timeConst = Math.max(0.08, fade * 0.25);

      if (this.oscLeft) this.oscLeft.frequency.setTargetAtTime(leftFreq, now, timeConst);
      if (this.oscRight) this.oscRight.frequency.setTargetAtTime(rightFreq, now, timeConst);
      if (this.subOsc) this.subOsc.frequency.setTargetAtTime(this.baseFreq / 4, now, timeConst);
      if (this.harmonicOsc) this.harmonicOsc.frequency.setTargetAtTime(this.baseFreq * 2, now, timeConst);
      if (this.subFilter) {
        this.subFilter.frequency.setTargetAtTime(Math.min(350, Math.max(120, (this.baseFreq / 4) * 1.6)), now, timeConst);
      }
      if (this.toneFilter) {
        this.toneFilter.frequency.setTargetAtTime(Math.min(2400, Math.max(1200, this.baseFreq * 2.2)), now, timeConst);
      }
      if (this.isochronicLfo) {
        const lfoFreq = beatHz > 0 ? beatHz : 0.01;
        this.isochronicLfo.frequency.setTargetAtTime(lfoFreq, now, timeConst);
      }
      if (this.isochronicGain) {
        const targetGain = beatHz > 0 ? 1.0 - (this.pulseDepth * 0.4) : 1.0;
        this.isochronicGain.gain.setTargetAtTime(targetGain, now, timeConst);
      }
    }

    // Crossfade nature sound layers with zero race conditions
    const allIds = new Set<string>([
      ...DEFAULT_NATURE_SOUNDS.map((s) => s.id),
      ...Object.keys(targetNatureLevels),
      ...Array.from(this.natureNodes.keys()),
    ]);

    allIds.forEach((id) => {
      const targetVol = targetNatureLevels[id] ?? 0;
      const existing = this.natureNodes.get(id);

      // Cancel any prior scheduled deletion timer for this sound layer
      const existingTimer = this.natureTimeouts.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
        this.natureTimeouts.delete(id);
      }

      if (targetVol > 0) {
        if (existing) {
          try {
            if (typeof (existing.gain.gain as any).cancelAndHoldAtTime === 'function') {
              (existing.gain.gain as any).cancelAndHoldAtTime(now);
            } else {
              existing.gain.gain.cancelScheduledValues(now);
              existing.gain.gain.setValueAtTime(existing.gain.gain.value || 0.0001, now);
            }
          } catch {
            existing.gain.gain.cancelScheduledValues(now);
          }
          existing.gain.gain.linearRampToValueAtTime(targetVol * 0.6, now + fade);
        } else {
          this.createNatureGenerator(id, targetVol, fade);
        }
      } else {
        if (existing) {
          try {
            if (typeof (existing.gain.gain as any).cancelAndHoldAtTime === 'function') {
              (existing.gain.gain as any).cancelAndHoldAtTime(now);
            } else {
              existing.gain.gain.cancelScheduledValues(now);
              existing.gain.gain.setValueAtTime(existing.gain.gain.value || 0.0001, now);
            }
          } catch {
            existing.gain.gain.cancelScheduledValues(now);
          }
          existing.gain.gain.linearRampToValueAtTime(0.0001, now + fade);

          const timeoutId = window.setTimeout(() => {
            this.natureTimeouts.delete(id);
            if ((this.stagedNatureLevels[id] ?? 0) <= 0) {
              const nodeToClean = this.natureNodes.get(id);
              if (nodeToClean) {
                nodeToClean.cleanup();
                this.natureNodes.delete(id);
                this.recalculateNormalization();
              }
            }
          }, (fade + 0.1) * 1000);
          this.natureTimeouts.set(id, timeoutId);
        }
      }
    });

    this.recalculateNormalization();

    if (this.isMusicalModeEnabled && this.isChordsPlaying) {
      this.reharmonizeChords();
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVol = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVol, this.ctx.currentTime, 0.05);
    }
  }

  public setPulseDepth(depth: number) {
    this.pulseDepth = Math.max(0, Math.min(1, depth));
    if (this.isochronicGain && this.ctx) {
      // Isochronic modulation depth
      const beatHz = BRAINWAVE_MODES[this.brainwaveMode].beatHz;
      if (beatHz === 0) {
        this.isochronicGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.05);
      } else {
        this.isochronicGain.gain.setTargetAtTime(1.0 - (this.pulseDepth * 0.4), this.ctx.currentTime, 0.05);
      }
    }
  }

  public setSubDrone(vol: number) {
    this.subDroneVol = Math.max(0, Math.min(1, vol));
    if (this.subGain && this.ctx) {
      this.subGain.gain.setTargetAtTime(this.subDroneVol * 0.35, this.ctx.currentTime, 0.05);
    }
  }

  public setHeadphoneBinaural(enabled: boolean) {
    this.headphoneBinaural = enabled;
    if (this.isPlaying) {
      this.updateFrequencies();
    }
  }

  private updateFrequencies() {
    if (!this.ctx || !this.oscLeft || !this.oscRight || !this.subOsc || !this.harmonicOsc) return;

    const config = BRAINWAVE_MODES[this.brainwaveMode];
    const beatHz = config.beatHz;
    const now = this.ctx.currentTime;

    const leftFreq = this.baseFreq;
    const rightFreq = this.headphoneBinaural && beatHz > 0 ? this.baseFreq + beatHz : this.baseFreq;

    this.oscLeft.frequency.setTargetAtTime(leftFreq, now, 0.1);
    this.oscRight.frequency.setTargetAtTime(rightFreq, now, 0.1);

    // Sub-harmonic drone (1/4th of fundamental, e.g. 108Hz for 432Hz)
    this.subOsc.frequency.setTargetAtTime(this.baseFreq / 4, now, 0.1);
    if (this.subFilter) {
      this.subFilter.frequency.setTargetAtTime(Math.min(350, Math.max(120, (this.baseFreq / 4) * 1.6)), now, 0.1);
    }

    // Upper harmonic shimmer (2x fundamental, e.g. 864Hz for 432Hz)
    this.harmonicOsc.frequency.setTargetAtTime(this.baseFreq * 2, now, 0.1);

    // Dynamic Low-Pass Guard: smoothly opens for higher frequencies like 963Hz, but strictly cuts off ultrasound
    if (this.toneFilter) {
      const safeCutoff = Math.min(2400, Math.max(1200, this.baseFreq * 2.2));
      this.toneFilter.frequency.setTargetAtTime(safeCutoff, now, 0.1);
    }

    // Update Isochronic LFO for room speakers
    if (this.isochronicLfo) {
      const lfoFreq = beatHz > 0 ? beatHz : 0.01;
      this.isochronicLfo.frequency.setTargetAtTime(lfoFreq, now, 0.1);
    }
  }

  private startToneNodes(fadeDurationSeconds: number = 2.0, delaySeconds: number = 0) {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const config = BRAINWAVE_MODES[this.brainwaveMode];
    const beatHz = config.beatHz;
    const fadeSec = Math.max(0.4, Math.min(5.0, fadeDurationSeconds));

    // Create Main 432Hz Tone Bus with smooth immediate acoustic bloom (zero dead silence)
    this.toneGain = this.ctx.createGain();
    this.toneGain.gain.cancelScheduledValues(now);
    this.toneGain.gain.setValueAtTime(0.0001, now);

    if (delaySeconds > 0) {
      this.toneGain.gain.setValueAtTime(0.0001, now + delaySeconds);
      this.toneGain.gain.exponentialRampToValueAtTime(0.36, now + delaySeconds + fadeSec);
    } else {
      this.toneGain.gain.exponentialRampToValueAtTime(0.36, now + fadeSec);
    }

    // Binaural Stereo Panning using ChannelMerger (2 inputs: Left: 0, Right: 1)
    const merger = this.ctx.createChannelMerger(2);

    // Left Ear Oscillator (432 Hz)
    this.oscLeft = this.ctx.createOscillator();
    this.oscLeft.type = 'sine';
    this.oscLeft.frequency.setValueAtTime(this.baseFreq, now);

    const leftGain = this.ctx.createGain();
    leftGain.gain.value = 0.5 * Math.SQRT1_2 * 1.35;
    this.oscLeft.connect(leftGain);
    leftGain.connect(merger, 0, 0); // Left channel

    // Right Ear Oscillator (432 Hz + beatHz)
    this.oscRight = this.ctx.createOscillator();
    this.oscRight.type = 'sine';
    const rightFreq = this.headphoneBinaural && beatHz > 0 ? this.baseFreq + beatHz : this.baseFreq;
    this.oscRight.frequency.setValueAtTime(rightFreq, now);

    const rightGain = this.ctx.createGain();
    rightGain.gain.value = 0.5 * Math.SQRT1_2 * 1.35;
    this.oscRight.connect(rightGain);
    rightGain.connect(merger, 0, 1); // Right channel

    // Sub-harmonic warm bass (108 Hz)
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'triangle';
    this.subOsc.frequency.setValueAtTime(this.baseFreq / 4, now);

    this.subGain = this.ctx.createGain();
    this.subGain.gain.value = this.subDroneVol * 0.28;

    this.subFilter = this.ctx.createBiquadFilter();
    this.subFilter.type = 'lowpass';
    this.subFilter.frequency.value = Math.min(350, Math.max(120, (this.baseFreq / 4) * 1.6));

    this.subOsc.connect(this.subFilter);
    this.subFilter.connect(this.subGain);

    // Upper celestial harmonic (864 Hz)
    this.harmonicOsc = this.ctx.createOscillator();
    this.harmonicOsc.type = 'sine';
    this.harmonicOsc.frequency.setValueAtTime(this.baseFreq * 2, now);

    this.harmonicGain = this.ctx.createGain();
    this.harmonicGain.gain.value = 0.06;

    this.harmonicOsc.connect(this.harmonicGain);

    // Warm Analog Saturation/Filter & Ultrasonic Safety Ceiling with explicit 2-channel preservation
    this.toneFilter = this.ctx.createBiquadFilter();
    this.toneFilter.channelCount = 2;
    this.toneFilter.channelCountMode = 'explicit';
    this.toneFilter.type = 'lowpass';
    this.toneFilter.frequency.value = Math.min(2400, Math.max(1200, this.baseFreq * 2.2));
    this.toneFilter.Q.value = 0.707; // Butterworth gentle resonance, zero phase distortion

    // Isochronic Modulator LFO with explicit 2-channel preservation
    this.isochronicLfo = this.ctx.createOscillator();
    this.isochronicLfo.type = 'sine';
    this.isochronicLfo.frequency.setValueAtTime(beatHz > 0 ? beatHz : 0.01, now);

    this.isochronicGain = this.ctx.createGain();
    this.isochronicGain.channelCount = 2;
    this.isochronicGain.channelCountMode = 'explicit';
    this.isochronicGain.gain.value = beatHz > 0 ? 1.0 - (this.pulseDepth * 0.4) : 1.0;

    this.toneGain.channelCount = 2;
    this.toneGain.channelCountMode = 'explicit';

    // Connect everything into toneGain
    merger.connect(this.toneFilter);
    this.subGain.connect(this.toneFilter);
    this.harmonicGain.connect(this.toneFilter);

    this.toneFilter.connect(this.isochronicGain);
    this.isochronicGain.connect(this.toneGain);
    this.toneGain.connect(this.masterGain);

    // Start oscillators
    this.oscLeft.start(now);
    this.oscRight.start(now);
    this.subOsc.start(now);
    this.harmonicOsc.start(now);
    this.isochronicLfo.start(now);

    this.recalculateNormalization();
  }

  private stopToneNodes() {
    const oldOscLeft = this.oscLeft;
    const oldOscRight = this.oscRight;
    const oldSubOsc = this.subOsc;
    const oldHarmonicOsc = this.harmonicOsc;
    const oldIsochronicLfo = this.isochronicLfo;
    const oldToneGain = this.toneGain;

    this.oscLeft = null;
    this.oscRight = null;
    this.subOsc = null;
    this.harmonicOsc = null;
    this.isochronicLfo = null;
    this.toneGain = null;

    if (!oldToneGain || !this.ctx) {
      oldOscLeft?.stop();
      oldOscRight?.stop();
      oldSubOsc?.stop();
      oldHarmonicOsc?.stop();
      oldIsochronicLfo?.stop();
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const releaseTime = 0.035; // 35ms sample-accurate linear crossfade to silence
      oldToneGain.gain.cancelScheduledValues(now);
      oldToneGain.gain.setValueAtTime(Math.max(0.00001, oldToneGain.gain.value), now);
      oldToneGain.gain.linearRampToValueAtTime(0.00001, now + releaseTime);

      const stopTime = now + releaseTime + 0.005; // Stop on hardware clock after reaching true zero-crossing silence
      oldOscLeft?.stop(stopTime);
      oldOscRight?.stop(stopTime);
      oldSubOsc?.stop(stopTime);
      oldHarmonicOsc?.stop(stopTime);
      oldIsochronicLfo?.stop(stopTime);

      setTimeout(() => {
        try {
          oldOscLeft?.disconnect();
          oldOscRight?.disconnect();
          oldSubOsc?.disconnect();
          oldHarmonicOsc?.disconnect();
          oldIsochronicLfo?.disconnect();
          oldToneGain?.disconnect();
        } catch {
          // ignore cleanup errors
        }
      }, Math.round((releaseTime + 0.02) * 1000));
    } catch {
      try {
        oldOscLeft?.stop();
        oldOscRight?.stop();
        oldSubOsc?.stop();
        oldHarmonicOsc?.stop();
        oldIsochronicLfo?.stop();
      } catch {}
    }
  }

  // Tibetan Bell Strike (Physical Synthesis)
  public strikeTibetanBowl() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const fundamental = this.baseFreq;

    // Frequencies of singing bowl partials: 1.0, 2.76, 5.4, 8.93
    const partials = [
      { ratio: 1.0, gain: 0.6, decay: 6.0 },
      { ratio: 2.76, gain: 0.3, decay: 4.5 },
      { ratio: 5.4, gain: 0.15, decay: 2.5 },
      { ratio: 8.93, gain: 0.08, decay: 1.5 },
    ];

    const bowlMaster = this.ctx.createGain();
    bowlMaster.gain.setValueAtTime(0.8, now);
    bowlMaster.connect(this.masterGain);

    partials.forEach(({ ratio, gain, decay }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, now);

      // Subtle pitch bend at strike
      osc.frequency.exponentialRampToValueAtTime(fundamental * ratio * 0.998, now + decay);

      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(gain, now + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(oscGain);
      oscGain.connect(bowlMaster);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  }

  // Soft Breath Guidance Chime for Inhale/Exhale transitions
  public playBreathCue(phase: 'inhale' | 'exhale' | 'hold') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const base = this.baseFreq;
    const freq = phase === 'inhale' ? base * 1.5 : phase === 'exhale' ? base : base * 1.25;

    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.linearRampToValueAtTime(0.2, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    chimeGain.connect(this.masterGain);

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.01, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(chimeGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
  }

  // 432Hz Tuned Crystal Kalimba / Sound Harp Note
  public playKalimbaNote(freq: number, pan: number = 0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Stereo Panning
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);

    const noteMaster = this.ctx.createGain();
    noteMaster.gain.setValueAtTime(0.0001, now);
    noteMaster.gain.linearRampToValueAtTime(0.45, now + 0.008);
    noteMaster.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    if (panner) {
      noteMaster.connect(panner);
      panner.connect(this.masterGain);
    } else {
      noteMaster.connect(this.masterGain);
    }

    // Fundamental Body (Sine)
    const oscBody = this.ctx.createOscillator();
    oscBody.type = 'sine';
    oscBody.frequency.setValueAtTime(freq, now);
    oscBody.connect(noteMaster);

    // Metallic Tine Strike (Triangle partial)
    const oscTine = this.ctx.createOscillator();
    oscTine.type = 'triangle';
    oscTine.frequency.setValueAtTime(freq * 2.756, now);

    const tineGain = this.ctx.createGain();
    tineGain.gain.setValueAtTime(0.3, now);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    oscTine.connect(tineGain);
    tineGain.connect(noteMaster);

    // Crystalline Shimmer (Sine partial)
    const oscShimmer = this.ctx.createOscillator();
    oscShimmer.type = 'sine';
    oscShimmer.frequency.setValueAtTime(freq * 5.404, now);

    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.12, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    oscShimmer.connect(shimmerGain);
    shimmerGain.connect(noteMaster);

    oscBody.start(now);
    oscTine.start(now);
    oscShimmer.start(now);

    oscBody.stop(now + 3.4);
    oscTine.stop(now + 3.4);
    oscShimmer.stop(now + 3.4);
  }

  /**
   * Enhanced Koshi Elemental Bamboo Chimes
   * Multi-reed bamboo wind chime cascade with stereo spread & delicate silver harmonics
   */
  public playKoshiElementalChimes() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // French Koshi Aria / Ignis pentatonic scale in 432Hz tuning
    const notes = [
      { freq: 432.0, pan: -0.5, delay: 0 },
      { freq: 513.7, pan: 0.35, delay: 0.18 },
      { freq: 576.7, pan: -0.2, delay: 0.42 },
      { freq: 647.2, pan: 0.6, delay: 0.70 },
      { freq: 864.0, pan: 0.0, delay: 0.98 },
      { freq: 1027.4, pan: -0.4, delay: 1.25 },
    ];

    notes.forEach(({ freq, pan, delay }) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + delay;
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) panner.pan.setValueAtTime(pan, t);

      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0.0001, t);
      chimeGain.gain.linearRampToValueAtTime(0.35, t + 0.006);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);

      if (panner) {
        chimeGain.connect(panner);
        panner.connect(this.masterGain);
      } else {
        chimeGain.connect(this.masterGain);
      }

      // Fundamental crystal tone
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);
      osc1.connect(chimeGain);
      osc1.start(t);
      osc1.stop(t + 4.3);

      // Bamboo overtone shimmer
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.76, t);
      const overtoneGain = this.ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.12, t);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      osc2.connect(overtoneGain);
      overtoneGain.connect(chimeGain);
      osc2.start(t);
      osc2.stop(t + 1.3);
    });
  }

  /**
   * Pure Quartz Crystal Singing Bowl (432Hz Heart / Crown Resonance)
   * Continuous crystal singing rim friction swell with binaural alpha wave bloom
   */
  public playCrystalSingingBowl(freq: number = 432) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const bowlMaster = this.ctx.createGain();
    bowlMaster.gain.setValueAtTime(0.0001, now);
    // Smooth singing bowl friction rim swell
    bowlMaster.gain.linearRampToValueAtTime(0.55, now + 1.4);
    bowlMaster.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);
    bowlMaster.connect(this.masterGain);

    // Left and Right binaural micro-detuned oscillators for natural crystalline shimmer
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    const oscOvertone = this.ctx.createOscillator();

    oscL.type = 'sine';
    oscR.type = 'sine';
    oscOvertone.type = 'sine';

    oscL.frequency.setValueAtTime(freq, now);
    oscR.frequency.setValueAtTime(freq + 0.432, now); // 0.432Hz beating frequency
    oscOvertone.frequency.setValueAtTime(freq * 2.005, now);

    const panL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const panR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (panL) panL.pan.setValueAtTime(-0.6, now);
    if (panR) panR.pan.setValueAtTime(0.6, now);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.18, now);

    if (panL) {
      oscL.connect(panL);
      panL.connect(bowlMaster);
    } else {
      oscL.connect(bowlMaster);
    }

    if (panR) {
      oscR.connect(panR);
      panR.connect(bowlMaster);
    } else {
      oscR.connect(bowlMaster);
    }

    oscOvertone.connect(overtoneGain);
    overtoneGain.connect(bowlMaster);

    oscL.start(now);
    oscR.start(now);
    oscOvertone.start(now);

    oscL.stop(now + 7.8);
    oscR.stop(now + 7.8);
    oscOvertone.stop(now + 7.8);
  }

  /**
   * Sacred Ritual Bundle & Smudge Acoustic Experience
   * Herbal sage crackle ambience + grounding Tibetan altar bell + 432Hz crystal resonance
   */
  public playSacredBundleExperience() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 1. Strike grounding ceremonial singing bowl
    this.strikeTibetanBowl();

    // 2. Add herbal smudging fire crackle effect
    const bufferSize = this.ctx.sampleRate * 3.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Gentle intermittent organic ember crackle
      const isCrackle = Math.random() < 0.003;
      output[i] = isCrackle ? (Math.random() * 2 - 1) * 0.4 : (Math.random() * 2 - 1) * 0.02;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.2, now);

    const crackleGain = this.ctx.createGain();
    crackleGain.gain.setValueAtTime(0.0001, now);
    crackleGain.gain.linearRampToValueAtTime(0.28, now + 0.3);
    crackleGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

    whiteNoise.connect(filter);
    filter.connect(crackleGain);
    crackleGain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 4.0);

    // 3. Shimmering high altar tingsha bells after 0.8s
    setTimeout(() => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(2160, t); // 432Hz * 5

      bellGain.gain.setValueAtTime(0.0001, t);
      bellGain.gain.linearRampToValueAtTime(0.25, t + 0.005);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);

      bellOsc.connect(bellGain);
      bellGain.connect(this.masterGain);

      bellOsc.start(t);
      bellOsc.stop(t + 4.6);
    }, 800);
  }

  /**
   * 432Hz Pure Tuning Fork Sound Sample
   * Laboratory weighted acoustic tuning fork strike with pristine sinusoidal sustain
   */
  public playTuningFork432() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const forkMaster = this.ctx.createGain();
    forkMaster.gain.setValueAtTime(0.0001, now);
    forkMaster.gain.linearRampToValueAtTime(0.6, now + 0.012);
    forkMaster.gain.exponentialRampToValueAtTime(0.0001, now + 6.8);
    forkMaster.connect(this.masterGain);

    // Pure 432.0 Hz Sine
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(432.0, now);
    osc.connect(forkMaster);

    // High metallic initial click (damping in 30ms)
    const clickOsc = this.ctx.createOscillator();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(432 * 6.2, now);
    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    clickOsc.connect(clickGain);
    clickGain.connect(forkMaster);

    osc.start(now);
    clickOsc.start(now);
    osc.stop(now + 7.0);
    clickOsc.stop(now + 0.1);
  }

  /**
   * Audiophile Stereo Soundstage & Separation Test
   */
  public playSoundstageSeparationTest() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const stages = [
      { freq: 216, pan: -0.9, delay: 0 },
      { freq: 324, pan: -0.4, delay: 0.35 },
      { freq: 432, pan: 0.0, delay: 0.70 },
      { freq: 540, pan: 0.4, delay: 1.05 },
      { freq: 864, pan: 0.9, delay: 1.40 },
    ];

    stages.forEach(({ freq, pan, delay }) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + delay;
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) panner.pan.setValueAtTime(pan, t);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

      if (panner) {
        g.connect(panner);
        panner.connect(this.masterGain);
      } else {
        g.connect(this.masterGain);
      }

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.connect(g);
      osc.start(t);
      osc.stop(t + 2.6);
    });
  }

  // =========================================================================
  // ADAPTIVE MUSICAL MODE & SOLFEGGIO HARMONIC AMBIENT PADS
  // =========================================================================

  public setChordsVolume(vol: number) {
    this.chordsVolume = Math.max(0, Math.min(1, vol));
    if (this.chordsGain && this.ctx) {
      this.chordsGain.gain.setTargetAtTime(this.chordsVolume * 0.85, this.ctx.currentTime, 0.1);
    }
  }

  public getIsChordsPlaying(): boolean {
    return this.isChordsPlaying;
  }

  public isMusicalModeActive(): boolean {
    return this.isMusicalModeEnabled && this.isChordsPlaying;
  }

  public isMusicalModeConfigured(): boolean {
    return this.isMusicalModeEnabled;
  }

  public getMusicalModeVolume(): number {
    return this.chordsVolume;
  }

  public setMusicalMode(enabled: boolean, volume?: number) {
    this.isMusicalModeEnabled = enabled;
    if (volume !== undefined) {
      this.setChordsVolume(volume);
    }
    if (enabled) {
      if (!this.isChordsPlaying) {
        this.startAmbientChords();
      }
    } else {
      if (this.isChordsPlaying) {
        this.stopAmbientChords();
      }
    }
  }

  public setMusicalModeVolume(vol: number) {
    this.setChordsVolume(vol);
  }

  /**
   * Derives a rich, 4-chord ethereal Solfeggio harmonic progression
   * attuned to any arbitrary carrier frequency f0 (e.g. 174, 285, 396, 417, 432, 528, 639, 741, 852, 963Hz).
   * Automatically normalizes the fundamental root into an acoustically comfortable pad register (120Hz - 260Hz).
   */
  public getSolfeggioHarmonicChords(freq: number): number[][] {
    let root = Number.isFinite(freq) && freq > 0 ? freq : 432;
    while (root > 260) root /= 2;
    while (root < 120) root *= 2;

    // Pure consonant harmonic interval ratios
    // Chord 1: Tonic Celestial Sus2/9th (Root, 9th, 5th, Octave)
    const chord1 = [
      Math.round(root * 100) / 100,
      Math.round(root * (9 / 8) * 100) / 100,
      Math.round(root * 1.5 * 100) / 100,
      Math.round(root * 2.0 * 100) / 100,
    ];

    // Chord 2: Subdominant Healing 4th/6th (4th, 5th, 6th, Octave+4th)
    const chord2 = [
      Math.round(root * (4 / 3) * 100) / 100,
      Math.round(root * 1.5 * 100) / 100,
      Math.round(root * (5 / 3) * 100) / 100,
      Math.round(root * (8 / 3) * 100) / 100,
    ];

    // Chord 3: Deep Resonant Minor 7th / Heart (Root, Minor 3rd, 5th, Minor 7th)
    const chord3 = [
      Math.round(root * 100) / 100,
      Math.round(root * 1.2 * 100) / 100,
      Math.round(root * 1.5 * 100) / 100,
      Math.round(root * 1.8 * 100) / 100,
    ];

    // Chord 4: Grounding Sacred Release (Sub-5th, Root, Major 3rd, 5th)
    const chord4 = [
      Math.round(root * 0.75 * 100) / 100,
      Math.round(root * 100) / 100,
      Math.round(root * 1.25 * 100) / 100,
      Math.round(root * 1.5 * 100) / 100,
    ];

    return [chord1, chord2, chord3, chord4];
  }

  public getSolfeggioKeyName(freq: number): string {
    const rounded = Math.round(freq);
    if (rounded === 432) return '432Hz Cosmic A';
    if (rounded === 528) return '528Hz Transformation C';
    if (rounded === 639) return '639Hz Heart Connection Eb';
    if (rounded === 396) return '396Hz Root Liberation G';
    if (rounded === 417) return '417Hz Sacral Clearing G#';
    if (rounded === 741) return '741Hz Intuitive Expression F#';
    if (rounded === 852) return '852Hz Third Eye Awakening Ab';
    if (rounded === 963) return '963Hz Crown Oneness B';
    if (rounded === 174) return '174Hz Physical Foundation F';
    if (rounded === 285) return '285Hz Cellular Regeneration D';
    return `${rounded}Hz Harmonic Resonance`;
  }

  /**
   * Re-synchronizes ambient chords to the active Solfeggio frequency
   * with a seamless cross-fade without audible pops or sudden cuts.
   */
  public reharmonizeChords() {
    if (!this.ctx || !this.isChordsPlaying) return;
    if (this.chordInterval) {
      clearInterval(this.chordInterval);
      this.chordInterval = null;
    }

    const chordList = this.getSolfeggioHarmonicChords(this.baseFreq);
    let step = 0;

    const playNext = () => {
      if (!this.isChordsPlaying || !this.ctx || !this.chordsGain) return;
      const notes = chordList[step % chordList.length];
      this.triggerAmbientChord(notes);
      step++;
    };

    playNext();
    this.chordInterval = window.setInterval(playNext, 7000);
  }

  public setChordProgression(progressionId: string) {
    this.currentChordProgression = progressionId;
    if (this.isChordsPlaying) {
      this.stopAmbientChords();
      this.startAmbientChords(progressionId);
    }
  }

  public toggleAmbientChords(): boolean {
    if (this.isChordsPlaying) {
      this.setMusicalMode(false);
      return false;
    } else {
      this.setMusicalMode(true);
      return true;
    }
  }

  public async startAmbientChords(progressionId: string = 'solfeggio_adaptive') {
    await this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume notice:', err);
      }
    }
    if (this.isChordsPlaying && this.chordInterval) {
      clearInterval(this.chordInterval);
      this.chordInterval = null;
    }

    this.currentChordProgression = progressionId;
    this.isChordsPlaying = true;
    this.isMusicalModeEnabled = true;

    const now = this.ctx.currentTime;
    if (!this.chordsGain) {
      this.chordsGain = this.ctx.createGain();
      this.chordsGain.connect(this.masterGain);
    }
    this.chordsGain.gain.cancelScheduledValues(now);
    this.chordsGain.gain.setValueAtTime(0.0001, now);
    this.chordsGain.gain.linearRampToValueAtTime(this.chordsVolume * 0.95, now + 1.2);

    // Derive harmonic chords dynamically attuned to this.baseFreq
    const chordList = this.getSolfeggioHarmonicChords(this.baseFreq);
    let step = 0;

    const playNext = () => {
      if (!this.isChordsPlaying || !this.ctx || !this.chordsGain) return;
      const notes = chordList[step % chordList.length];
      this.triggerAmbientChord(notes);
      step++;
    };

    playNext();
    this.chordInterval = window.setInterval(playNext, 7000); // Crossfade new chord every 7.0s
  }

  private triggerAmbientChord(frequencies: number[]) {
    if (!this.ctx || !this.chordsGain) return;

    this.lastChordTime = performance.now();
    this.activeChordFrequencies = [...frequencies];

    const now = this.ctx.currentTime;
    const duration = 9.5; // Overlaps with next chord for smooth musical pad transition

    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.0001, now);
    padGain.gain.linearRampToValueAtTime(0.68, now + 2.6); // Lush, warm, clearly audible swelling attack
    padGain.gain.setValueAtTime(0.68, now + 2.6); // Sustain anchor
    padGain.gain.linearRampToValueAtTime(0.58, now + 6.2); // Warm gentle sustained presence
    padGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Warm Resonant Lowpass Filter with shimmering swell at peak volume
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);
    filter.frequency.linearRampToValueAtTime(2200, now + 2.6); // Shimmering open swell at volume peak
    filter.frequency.linearRampToValueAtTime(1200, now + 6.2);
    filter.frequency.linearRampToValueAtTime(850, now + duration);
    filter.Q.setValueAtTime(1.1, now);

    padGain.connect(filter);
    filter.connect(this.chordsGain);

    const oscs: OscillatorNode[] = [];

    frequencies.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      // Alternate sine and warm triangle for lush harmonic overtone body
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now);

      // Gentle pitch micro-chorus for expansive stereo-like depth
      const detune = (idx - 1.5) * 2.8;
      osc.detune.setValueAtTime(detune, now);

      // Expansive Stereo Panning
      if (this.ctx.createStereoPanner) {
        try {
          const panner = this.ctx.createStereoPanner();
          const pan = (idx - 1.5) * 0.45; // Stereo spread between -0.67 and +0.67
          panner.pan.setValueAtTime(pan, now);
          osc.connect(panner);
          panner.connect(padGain);
        } catch {
          osc.connect(padGain);
        }
      } else {
        osc.connect(padGain);
      }

      osc.start(now);
      osc.stop(now + duration + 0.1);
      oscs.push(osc);
    });

    this.currentChordNodes.push({ oscs, gain: padGain });

    // Cleanup finished chord nodes
    setTimeout(() => {
      const idx = this.currentChordNodes.findIndex((n) => n.gain === padGain);
      if (idx !== -1) {
        this.currentChordNodes.splice(idx, 1);
      }
    }, (duration + 0.5) * 1000);
  }

  public stopAmbientChords() {
    this.isChordsPlaying = false;
    this.lastChordTime = 0;
    this.activeChordFrequencies = [];

    if (this.chordInterval) {
      clearInterval(this.chordInterval);
      this.chordInterval = null;
    }

    if (this.ctx && this.chordsGain) {
      const now = this.ctx.currentTime;
      const releaseTime = 0.035; // 35ms smooth linear ramp down to silence
      this.chordsGain.gain.cancelScheduledValues(now);
      this.chordsGain.gain.setValueAtTime(Math.max(0.0001, this.chordsGain.gain.value), now);
      this.chordsGain.gain.linearRampToValueAtTime(0.00001, now + releaseTime);

      const stopTime = now + releaseTime + 0.005;
      this.currentChordNodes.forEach(({ oscs }) => {
        try {
          oscs.forEach((o) => o.stop(stopTime));
        } catch {}
      });
    }

    setTimeout(() => {
      this.currentChordNodes.forEach(({ gain }) => {
        try {
          gain.disconnect();
        } catch (e) {}
      });
      this.currentChordNodes = [];
    }, 55);
  }

  /**
   * Returns ambient ethereal pad status and real-time swelling envelope (0.0 to 1.0)
   * synchronized with chord attack, sustain, and cross-fading decay for visualizer effects.
   * Also computes peakBloom specifically when the ambient chord swell peaks in volume.
   */
  public getMusicalPadSwell(): {
    isActive: boolean;
    envelope: number; // 0 to 1
    peakBloom: number; // 0 to 1, scales specifically when ambient chord swells peak in volume
    frequencies: number[];
    keyName: string;
    volume: number;
    isPeak: boolean;
  } {
    if (!this.isMusicalModeEnabled || !this.isChordsPlaying || !this.lastChordTime) {
      return {
        isActive: false,
        envelope: 0,
        peakBloom: 0,
        frequencies: [],
        keyName: this.getSolfeggioKeyName(this.baseFreq),
        volume: this.chordsVolume,
        isPeak: false,
      };
    }

    const elapsed = (performance.now() - this.lastChordTime) / 1000;
    let env = 0;
    // 2.6s swelling attack, sustain plateau until 6.2s, smooth cross-fade until 9.5s
    if (elapsed < 2.6) {
      const t = elapsed / 2.6;
      env = 0.5 * (1 - Math.cos(t * Math.PI));
    } else if (elapsed < 6.2) {
      const sustainT = (elapsed - 2.6) / 3.6;
      env = 1.0 - (sustainT * 0.12) + (Math.sin(elapsed * 1.5) * 0.05);
    } else if (elapsed < 9.5) {
      const decayT = (elapsed - 6.2) / 3.3;
      env = Math.max(0, 0.88 * (1 - decayT));
    } else {
      env = 0;
    }

    env = Math.max(0, Math.min(1, env));

    // Calculate Etheric Bloom factor: specifically peaks when swell hits maximum volume (2.0s - 4.5s)
    let peakBloom = 0;
    if (elapsed >= 1.4 && elapsed <= 4.8) {
      // Gaussian curve centered around 2.6s where chord swell hits peak gain
      const peakCenter = 2.6;
      const dist = Math.abs(elapsed - peakCenter);
      peakBloom = Math.max(0, Math.exp(-(dist * dist) / 1.25));
    }

    return {
      isActive: true,
      envelope: env,
      peakBloom: Math.max(0, Math.min(1, peakBloom)),
      frequencies: this.activeChordFrequencies,
      keyName: this.getSolfeggioKeyName(this.baseFreq),
      volume: this.chordsVolume,
      isPeak: peakBloom > 0.35,
    };
  }

  // PROCEDURAL NATURE SOUND SYNTHESIS
  public updateNatureSound(id: string, enabled: boolean, volume: number, fadeDurationSeconds: number = 3.5) {
    this.stagedNatureLevels[id] = enabled ? volume : 0;
    if (!this.ctx || !this.masterGain) {
      this.initContext();
      return;
    }

    const existing = this.natureNodes.get(id);
    const now = this.ctx.currentTime;
    const fadeSec = Math.max(1.0, Math.min(5.0, fadeDurationSeconds));

    // Cancel pending timeout for this sound
    const existingTimer = this.natureTimeouts.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.natureTimeouts.delete(id);
    }

    if (enabled) {
      if (existing) {
        // Smoothly ramp to target volume over fadeSec seconds
        existing.gain.gain.cancelScheduledValues(now);
        existing.gain.gain.setValueAtTime(existing.gain.gain.value, now);
        existing.gain.gain.linearRampToValueAtTime(volume * 0.6, now + fadeSec);
      } else {
        // Create procedural generator with smooth fade-in
        this.createNatureGenerator(id, volume, fadeSec);
      }
      this.recalculateNormalization();
    } else {
      if (existing) {
        existing.gain.gain.cancelScheduledValues(now);
        existing.gain.gain.setValueAtTime(existing.gain.gain.value, now);
        existing.gain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
        const tid = window.setTimeout(() => {
          this.natureTimeouts.delete(id);
          if ((this.stagedNatureLevels[id] ?? 0) <= 0) {
            existing.cleanup();
            this.natureNodes.delete(id);
            this.recalculateNormalization();
          }
        }, 1300);
        this.natureTimeouts.set(id, tid);
      }
    }
  }

  private stopAllNatureSounds() {
    this.natureTimeouts.forEach((tid) => clearTimeout(tid));
    this.natureTimeouts.clear();
    if (this.ctx && this.natureNodes.size > 0) {
      const now = this.ctx.currentTime;
      const releaseTime = 0.045;
      const nodesToClean = Array.from(this.natureNodes.values());
      this.natureNodes.clear();
      nodesToClean.forEach((node) => {
        try {
          node.gain.gain.cancelScheduledValues(now);
          node.gain.gain.setValueAtTime(Math.max(0.0001, node.gain.gain.value), now);
          node.gain.gain.linearRampToValueAtTime(0.00001, now + releaseTime);
          setTimeout(() => {
            try {
              node.cleanup();
            } catch {}
          }, Math.round((releaseTime + 0.02) * 1000));
        } catch {
          node.cleanup();
        }
      });
    } else {
      this.natureNodes.forEach((node) => node.cleanup());
      this.natureNodes.clear();
    }
    this.recalculateNormalization();
  }

  private createNatureGenerator(id: string, volume: number, fadeDurationSeconds: number = 3.5) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const fadeSec = Math.max(0.4, Math.min(5.0, fadeDurationSeconds));

    const soundGain = this.ctx.createGain();
    soundGain.gain.setValueAtTime(0.0001, now);
    soundGain.gain.linearRampToValueAtTime(volume * 0.6, now + fadeSec);
    soundGain.connect(this.masterGain);

    let cleanup = () => {
      try {
        soundGain.disconnect();
      } catch (e) {}
    };

    switch (id) {
      case 'rain': {
        // Hyper-Realistic Rain: Multi-layered pink noise bed + organic rain drops
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.createPinkNoiseBuffer(bufferSize);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const rainFilter = this.ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.value = 1800;

        const rainHighPass = this.ctx.createBiquadFilter();
        rainHighPass.type = 'highpass';
        rainHighPass.frequency.value = 320;

        noiseSource.connect(rainFilter);
        rainFilter.connect(rainHighPass);
        rainHighPass.connect(soundGain);
        noiseSource.start(now);

        // Randomized raindrop clicks on foliage
        let rainDropTimer: number | null = null;
        const triggerDrop = () => {
          if (!this.ctx) return;
          const dropOsc = this.ctx.createOscillator();
          const dropGain = this.ctx.createGain();
          const dropFreq = 2200 + Math.random() * 2800;
          dropOsc.type = 'sine';
          dropOsc.frequency.setValueAtTime(dropFreq, this.ctx.currentTime);
          dropOsc.frequency.exponentialRampToValueAtTime(dropFreq * 0.4, this.ctx.currentTime + 0.035);

          dropGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
          dropGain.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.08, this.ctx.currentTime + 0.003);
          dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);

          dropOsc.connect(dropGain);
          dropGain.connect(soundGain);

          dropOsc.start(this.ctx.currentTime);
          dropOsc.stop(this.ctx.currentTime + 0.04);
        };

        rainDropTimer = window.setInterval(() => {
          if (Math.random() > 0.3) triggerDrop();
          if (Math.random() > 0.6) setTimeout(triggerDrop, 40);
        }, 110);

        cleanup = () => {
          try {
            if (rainDropTimer) clearInterval(rainDropTimer);
            noiseSource.stop();
            noiseSource.disconnect();
            soundGain.disconnect();
          } catch (e) {}
        };
        break;
      }

      case 'ocean': {
        // Ocean Swells with Seafoam Sizzle & Undertow
        const bufferSize = this.ctx.sampleRate * 4;
        const noiseBuffer = this.createBrownNoiseBuffer(bufferSize);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 280;
        filter.Q.value = 2.2;

        // Seafoam sizzle on crests
        const foamBuffer = this.createPinkNoiseBuffer(bufferSize);
        const foamSource = this.ctx.createBufferSource();
        foamSource.buffer = foamBuffer;
        foamSource.loop = true;

        const foamFilter = this.ctx.createBiquadFilter();
        foamFilter.type = 'bandpass';
        foamFilter.frequency.value = 3200;
        foamFilter.Q.value = 1.4;

        const foamGain = this.ctx.createGain();
        foamGain.gain.value = 0.08;

        // Slow wave swell LFO (11s tidal cycle)
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.09;

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 420;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSource.connect(filter);
        filter.connect(soundGain);

        foamSource.connect(foamFilter);
        foamFilter.connect(foamGain);
        foamGain.connect(soundGain);

        noiseSource.start(now);
        foamSource.start(now);
        lfo.start(now);

        cleanup = () => {
          try {
            noiseSource.stop();
            foamSource.stop();
            lfo.stop();
            noiseSource.disconnect();
            foamSource.disconnect();
            soundGain.disconnect();
          } catch (e) {}
        };
        break;
      }

      case 'birds': {
        // Procedurally Synthesized Forest Songbirds
        let birdTimer: number | null = null;

        const chirpPhrase = () => {
          if (!this.ctx) return;
          const baseChirp = 2800 + Math.random() * 1400;
          const notes = 3 + Math.floor(Math.random() * 4);
          let delay = 0;

          for (let i = 0; i < notes; i++) {
            setTimeout(() => {
              if (!this.ctx) return;
              const osc = this.ctx.createOscillator();
              const bGain = this.ctx.createGain();
              const t = this.ctx.currentTime;
              const targetF = baseChirp + (Math.random() - 0.5) * 800;

              osc.type = 'sine';
              osc.frequency.setValueAtTime(targetF, t);
              osc.frequency.exponentialRampToValueAtTime(targetF * (Math.random() > 0.5 ? 1.3 : 0.8), t + 0.08);

              bGain.gain.setValueAtTime(0.0001, t);
              bGain.gain.linearRampToValueAtTime(0.09, t + 0.015);
              bGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

              osc.connect(bGain);
              bGain.connect(soundGain);

              osc.start(t);
              osc.stop(t + 0.09);
            }, delay);
            delay += 90 + Math.random() * 60;
          }
        };

        birdTimer = window.setInterval(() => {
          if (Math.random() > 0.45) chirpPhrase();
        }, 2400);

        // Immediate first chirp
        setTimeout(chirpPhrase, 400);

        cleanup = () => {
          if (birdTimer) clearInterval(birdTimer);
          soundGain.disconnect();
        };
        break;
      }

      case 'wind': {
        // Forest Wind: Dual sweeping bandpass filters + organic canopy flutter
        const bufferSize = this.ctx.sampleRate * 3;
        const noiseBuffer = this.createPinkNoiseBuffer(bufferSize);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 420;
        filter.Q.value = 1.9;

        const filter2 = this.ctx.createBiquadFilter();
        filter2.type = 'lowpass';
        filter2.frequency.value = 900;

        const windLfo = this.ctx.createOscillator();
        windLfo.type = 'sine';
        windLfo.frequency.value = 0.12;

        const windLfoGain = this.ctx.createGain();
        windLfoGain.gain.value = 260;

        windLfo.connect(windLfoGain);
        windLfoGain.connect(filter.frequency);

        noiseSource.connect(filter);
        filter.connect(filter2);
        filter2.connect(soundGain);

        noiseSource.start(now);
        windLfo.start(now);

        cleanup = () => {
          try {
            noiseSource.stop();
            windLfo.stop();
            noiseSource.disconnect();
            soundGain.disconnect();
          } catch (e) {}
        };
        break;
      }

      case 'thunder': {
        // Distant Rolling Thunder
        let thunderTimer: number | null = null;

        const rollThunder = () => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime;
          const dur = 4.5 + Math.random() * 2.0;

          const nBuffer = this.createBrownNoiseBuffer(this.ctx.sampleRate * 4);
          const nSource = this.ctx.createBufferSource();
          nSource.buffer = nBuffer;

          const tFilter = this.ctx.createBiquadFilter();
          tFilter.type = 'lowpass';
          tFilter.frequency.setValueAtTime(80, t);
          tFilter.frequency.linearRampToValueAtTime(140, t + 1.2);
          tFilter.frequency.exponentialRampToValueAtTime(45, t + dur);

          const tGain = this.ctx.createGain();
          tGain.gain.setValueAtTime(0.0001, t);
          tGain.gain.linearRampToValueAtTime(0.25, t + 0.8);
          tGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          nSource.connect(tFilter);
          tFilter.connect(tGain);
          tGain.connect(soundGain);

          nSource.start(t);
          nSource.stop(t + dur + 0.1);
        };

        thunderTimer = window.setInterval(() => {
          if (Math.random() > 0.5) rollThunder();
        }, 8000);

        setTimeout(rollThunder, 1000);

        cleanup = () => {
          if (thunderTimer) clearInterval(thunderTimer);
          soundGain.disconnect();
        };
        break;
      }

      case 'stream': {
        // Mountain Stream: Multi-formant liquid bubbling
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.createPinkNoiseBuffer(bufferSize);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter1 = this.ctx.createBiquadFilter();
        filter1.type = 'bandpass';
        filter1.frequency.value = 680;
        filter1.Q.value = 4.2;

        const filter2 = this.ctx.createBiquadFilter();
        filter2.type = 'bandpass';
        filter2.frequency.value = 1480;
        filter2.Q.value = 5.2;

        const flutterLfo = this.ctx.createOscillator();
        flutterLfo.type = 'sine';
        flutterLfo.frequency.value = 3.8;

        const flutterGain = this.ctx.createGain();
        flutterGain.gain.value = 140;
        flutterLfo.connect(flutterGain);
        flutterGain.connect(filter1.frequency);

        noiseSource.connect(filter1);
        noiseSource.connect(filter2);
        filter1.connect(soundGain);
        filter2.connect(soundGain);

        noiseSource.start(now);
        flutterLfo.start(now);

        cleanup = () => {
          try {
            noiseSource.stop();
            flutterLfo.stop();
            noiseSource.disconnect();
            soundGain.disconnect();
          } catch (e) {}
        };
        break;
      }

      case 'crickets': {
        // Night Meadow Crickets
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 4600;

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 5150;

        const cricketGain = this.ctx.createGain();
        cricketGain.gain.value = 0.08;

        const pulseLfo = this.ctx.createOscillator();
        pulseLfo.type = 'triangle';
        pulseLfo.frequency.value = 15;

        const cadenceLfo = this.ctx.createOscillator();
        cadenceLfo.type = 'sine';
        cadenceLfo.frequency.value = 0.75;

        osc1.connect(cricketGain);
        osc2.connect(cricketGain);
        cricketGain.connect(soundGain);

        osc1.start(now);
        osc2.start(now);
        pulseLfo.start(now);
        cadenceLfo.start(now);

        cleanup = () => {
          try {
            osc1.stop();
            osc2.stop();
            pulseLfo.stop();
            cadenceLfo.stop();
            soundGain.disconnect();
          } catch (e) {}
        };
        break;
      }

      case 'fire': {
        // Campfire: Low warm rumble + dynamic cedar wood pops
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.createBrownNoiseBuffer(bufferSize);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const rumbleFilter = this.ctx.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.value = 170;

        noiseSource.connect(rumbleFilter);
        rumbleFilter.connect(soundGain);
        noiseSource.start(now);

        // Crackle impulse spikes
        let crackleTimer: number | null = null;
        const triggerPop = () => {
          if (!this.ctx) return;
          const popBuffer = this.ctx.createBuffer(1, 400, this.ctx.sampleRate);
          const data = popBuffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 50);
          }
          const popSource = this.ctx.createBufferSource();
          popSource.buffer = popBuffer;

          const pFilter = this.ctx.createBiquadFilter();
          pFilter.type = 'bandpass';
          pFilter.frequency.value = 1800 + Math.random() * 1500;

          const pGain = this.ctx.createGain();
          pGain.gain.value = 0.12 + Math.random() * 0.12;

          popSource.connect(pFilter);
          pFilter.connect(pGain);
          pGain.connect(soundGain);

          popSource.start();
        };

        crackleTimer = window.setInterval(() => {
          if (Math.random() > 0.4) triggerPop();
          if (Math.random() > 0.7) setTimeout(triggerPop, 35);
        }, 120);

        cleanup = () => {
          try {
            if (crackleTimer) clearInterval(crackleTimer);
            noiseSource.stop();
            soundGain.disconnect();
          } catch (e) {}
        };
        break;
      }

      case 'bowls': {
        // Singing Bowls Continuous Drone
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 432;

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 864;

        const chorusLfo = this.ctx.createOscillator();
        chorusLfo.type = 'sine';
        chorusLfo.frequency.value = 0.22;

        const chorusGain = this.ctx.createGain();
        chorusGain.gain.value = 2.0;
        chorusLfo.connect(chorusGain);
        chorusGain.connect(osc.frequency);

        const bowlGain = this.ctx.createGain();
        bowlGain.gain.value = 0.16;

        osc.connect(bowlGain);
        osc2.connect(bowlGain);
        bowlGain.connect(soundGain);

        osc.start(now);
        osc2.start(now);
        chorusLfo.start(now);

        cleanup = () => {
          try {
            osc.stop();
            osc2.stop();
            chorusLfo.stop();
            soundGain.disconnect();
          } catch (e) {}
        };
        break;
      }

      case 'koshi': {
        // Koshi Bamboo Wind Chimes in 432Hz Pentatonic
        let koshiTimer: number | null = null;
        const koshiPitches = [432, 513.7, 576.7, 647.3, 769.8, 864];

        const ringChime = () => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime;
          const f = koshiPitches[Math.floor(Math.random() * koshiPitches.length)];

          const cOsc = this.ctx.createOscillator();
          const cOsc2 = this.ctx.createOscillator();
          const cGain = this.ctx.createGain();

          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(f, t);
          cOsc2.type = 'triangle';
          cOsc2.frequency.setValueAtTime(f * 2.76, t);

          cGain.gain.setValueAtTime(0.0001, t);
          cGain.gain.linearRampToValueAtTime(0.12, t + 0.01);
          cGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);

          cOsc.connect(cGain);
          cOsc2.connect(cGain);
          cGain.connect(soundGain);

          cOsc.start(t);
          cOsc2.start(t);
          cOsc.stop(t + 4.0);
          cOsc2.stop(t + 4.0);
        };

        koshiTimer = window.setInterval(() => {
          if (Math.random() > 0.35) ringChime();
        }, 1800);

        setTimeout(ringChime, 300);

        cleanup = () => {
          if (koshiTimer) clearInterval(koshiTimer);
          soundGain.disconnect();
        };
        break;
      }

      case 'flute': {
        // Native Zen Bansuri Flute in 432Hz
        let fluteTimer: number | null = null;
        const fluteNotes = [432, 484.9, 513.7, 576.7, 647.3];

        const playFlutePhrase = () => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime;
          const f = fluteNotes[Math.floor(Math.random() * fluteNotes.length)];
          const dur = 3.2 + Math.random() * 1.5;

          const fOsc = this.ctx.createOscillator();
          fOsc.type = 'sine';
          fOsc.frequency.setValueAtTime(f, t);

          // Soft breath vibrato
          const vLfo = this.ctx.createOscillator();
          vLfo.type = 'sine';
          vLfo.frequency.value = 4.8;
          const vGain = this.ctx.createGain();
          vGain.gain.value = 3.5;
          vLfo.connect(vGain);
          vGain.connect(fOsc.frequency);

          const fGain = this.ctx.createGain();
          fGain.gain.setValueAtTime(0.0001, t);
          fGain.gain.linearRampToValueAtTime(0.14, t + 0.8);
          fGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          fOsc.connect(fGain);
          fGain.connect(soundGain);

          fOsc.start(t);
          vLfo.start(t);
          fOsc.stop(t + dur + 0.1);
          vLfo.stop(t + dur + 0.1);
        };

        fluteTimer = window.setInterval(() => {
          if (Math.random() > 0.4) playFlutePhrase();
        }, 4500);

        setTimeout(playFlutePhrase, 500);

        cleanup = () => {
          if (fluteTimer) clearInterval(fluteTimer);
          soundGain.disconnect();
        };
        break;
      }

      case 'cello': {
        // Deep Bowing Cello Drone (108Hz / 216Hz)
        const c1 = this.ctx.createOscillator();
        c1.type = 'sawtooth';
        c1.frequency.value = 108; // 1/4th of 432Hz

        const c2 = this.ctx.createOscillator();
        c2.type = 'triangle';
        c2.frequency.value = 216; // 1/2 of 432Hz

        const cFilter = this.ctx.createBiquadFilter();
        cFilter.type = 'lowpass';
        cFilter.frequency.value = 340;
        cFilter.Q.value = 1.8;

        const cGain = this.ctx.createGain();
        cGain.gain.value = 0.14;

        c1.connect(cFilter);
        c2.connect(cFilter);
        cFilter.connect(cGain);
        cGain.connect(soundGain);

        c1.start(now);
        c2.start(now);

        cleanup = () => {
          try {
            c1.stop();
            c2.stop();
            soundGain.disconnect();
          } catch (e) {}
        };
        break;
      }

      case 'harp': {
        // Celestial Harp Plucks
        let harpTimer: number | null = null;
        const harpScale = [256.9, 288.3, 323.6, 384.9, 432, 513.7, 576.7];

        const pluckHarp = () => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime;
          const f = harpScale[Math.floor(Math.random() * harpScale.length)];

          const hOsc = this.ctx.createOscillator();
          hOsc.type = 'triangle';
          hOsc.frequency.setValueAtTime(f, t);

          const hGain = this.ctx.createGain();
          hGain.gain.setValueAtTime(0.0001, t);
          hGain.gain.linearRampToValueAtTime(0.12, t + 0.008);
          hGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);

          hOsc.connect(hGain);
          hGain.connect(soundGain);

          hOsc.start(t);
          hOsc.stop(t + 3.0);
        };

        harpTimer = window.setInterval(() => {
          if (Math.random() > 0.4) pluckHarp();
        }, 1600);

        setTimeout(pluckHarp, 400);

        cleanup = () => {
          if (harpTimer) clearInterval(harpTimer);
          soundGain.disconnect();
        };
        break;
      }

      case 'tanpura': {
        // Sacred Indian Tanpura Drone in 432Hz (Pa, Sa, Sa, Sa)
        const strings = [324, 432, 432.5, 216];
        const oscs: OscillatorNode[] = [];
        const tGain = this.ctx.createGain();
        tGain.gain.value = 0.12;

        const tFilter = this.ctx.createBiquadFilter();
        tFilter.type = 'lowpass';
        tFilter.frequency.value = 1100;

        strings.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          osc.type = i === 3 ? 'sawtooth' : 'triangle';
          osc.frequency.value = freq;
          osc.connect(tFilter);
          osc.start(now);
          oscs.push(osc);
        });

        tFilter.connect(tGain);
        tGain.connect(soundGain);

        cleanup = () => {
          oscs.forEach((o) => {
            try {
              o.stop();
            } catch (e) {}
          });
          soundGain.disconnect();
        };
        break;
      }

      case 'brown_noise': {
        // Velvet Brown Noise for deep sleep
        const bufferSize = this.ctx.sampleRate * 3;
        const noiseBuffer = this.createBrownNoiseBuffer(bufferSize);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 380;

        noiseSource.connect(filter);
        filter.connect(soundGain);
        noiseSource.start(now);

        cleanup = () => {
          try {
            noiseSource.stop();
            noiseSource.disconnect();
            soundGain.disconnect();
          } catch (e) {}
        };
        break;
      }
    }

    this.natureNodes.set(id, { gain: soundGain, cleanup });
  }

  // Noise Buffer Helpers
  private createPinkNoiseBuffer(bufferSize: number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext required');
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createBrownNoiseBuffer(bufferSize: number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext required');
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    return buffer;
  }

  // SLEEP TIMER FADE-OUT LOGIC (Default 5 seconds acoustic fade-out)
  public startFadeOut(durationSeconds: number = 5, onComplete: () => void = () => {}) {
    if (!this.ctx || !this.masterGain) {
      onComplete();
      return;
    }

    const startVol = this.masterVol;
    const startTime = Date.now();
    const durationMs = durationSeconds * 1000;

    if (this.fadeInterval) clearInterval(this.fadeInterval);

    this.fadeInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth cosine fade
      const currentVol = startVol * Math.cos((progress * Math.PI) / 2);
      this.setMasterVolume(currentVol);

      if (progress >= 1) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        this.stop();
        this.setMasterVolume(startVol); // reset for next session
        onComplete();
      }
    }, 100);
  }

  public cancelFadeOut() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    this.setMasterVolume(this.masterVol);
  }

  // OFFLINE AUDIO EXPORT (Dual-Format: Studio WAV 16-bit 44.1kHz or Compact MP3)
  public async renderOfflineAudio(
    durationSeconds: number,
    activeNatureSounds: { id: string; volume: number }[],
    onProgress?: (progress: number) => void,
    options?: {
      format?: 'wav' | 'mp3';
      baseFreq?: number;
      brainwaveMode?: BrainwaveMode;
      masterVol?: number;
    }
  ): Promise<{ blob: Blob; format: 'wav' | 'mp3'; mimeType: string; extension: string }> {
    const sampleRate = 44100;
    const safeDuration = Math.max(0.1, Number.isFinite(durationSeconds) ? durationSeconds : 60);
    const totalFrames = Math.max(1, Math.round(sampleRate * safeDuration));
    const format = options?.format || 'wav';

    const OfflineCtx = (typeof window !== 'undefined' &&
      (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)) as typeof OfflineAudioContext;
    if (!OfflineCtx) {
      throw new Error('OfflineAudioContext is not supported in this browser environment.');
    }
    const offlineCtx = new OfflineCtx(2, totalFrames, sampleRate);

    const master = offlineCtx.createGain();
    const exportVol = options?.masterVol ?? (this.masterVol > 0 ? this.masterVol : 0.6);
    master.gain.value = Math.max(0.1, Math.min(1.0, exportVol));

    // Studio-Grade Dynamics Compressor & Ceiling Peak Limiter in Offline Render
    // Prevents constructive multi-layer wave summation from ever hard-clipping or producing destructive distortion
    const limiter = offlineCtx.createDynamicsCompressor();
    limiter.threshold.value = -1.5;
    limiter.knee.value = 6.0;
    limiter.ratio.value = 16.0;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.15;

    master.connect(limiter);
    limiter.connect(offlineCtx.destination);

    // Tone Synth in Offline context (2 inputs: Left: 0, Right: 1)
    const merger = offlineCtx.createChannelMerger(2);
    const targetMode = options?.brainwaveMode || this.brainwaveMode || 'alpha_healing';
    const modeConfig = BRAINWAVE_MODES[targetMode] || BRAINWAVE_MODES.alpha_healing;
    const beatHz = modeConfig?.beatHz ?? 10.0;
    const targetFreq = options?.baseFreq ?? this.baseFreq ?? 432;

    // Left Osc
    const oscL = offlineCtx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.value = targetFreq;
    const gainL = offlineCtx.createGain();
    gainL.gain.value = 0.5 * Math.SQRT1_2 * 1.35;
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    // Right Osc
    const oscR = offlineCtx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.value = this.headphoneBinaural && beatHz > 0 ? targetFreq + beatHz : targetFreq;
    const gainR = offlineCtx.createGain();
    gainR.gain.value = 0.5 * Math.SQRT1_2 * 1.35;
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    // Sub bass
    const sub = offlineCtx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.value = targetFreq / 4;
    const subGain = offlineCtx.createGain();
    subGain.gain.value = (this.subDroneVol || 0.4) * 0.28;
    sub.connect(subGain);

    // Harmonics
    const harm = offlineCtx.createOscillator();
    harm.type = 'sine';
    harm.frequency.value = targetFreq * 2;
    const harmGain = offlineCtx.createGain();
    harmGain.gain.value = 0.06;
    harm.connect(harmGain);

    const filter = offlineCtx.createBiquadFilter();
    filter.channelCount = 2;
    filter.channelCountMode = 'explicit';
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(2400, Math.max(1200, targetFreq * 2.2));
    filter.Q.value = 0.707;

    merger.connect(filter);
    subGain.connect(filter);
    harmGain.connect(filter);
    filter.connect(master);

    oscL.start(0);
    oscR.start(0);
    sub.start(0);
    harm.start(0);

    // Simulate active nature sounds with balanced gain into offline master
    if (Array.isArray(activeNatureSounds)) {
      activeNatureSounds.forEach(({ id, volume }) => {
        if (!volume || volume <= 0) return;
        const soundGain = offlineCtx.createGain();
        soundGain.gain.value = volume * 0.42;
        soundGain.connect(master);

        // Seamless looped Pink/Brown noise generator for offline
        const noiseBuffer = offlineCtx.createBuffer(1, sampleRate * 5, sampleRate);
        const data = noiseBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < data.length; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 2.0;
        }

        // Apply smooth cosine window to loop boundaries to eliminate DC clicks
        const fadeLen = Math.min(512, Math.floor(data.length / 2));
        for (let i = 0; i < fadeLen; i++) {
          const windowFactor = 0.5 * (1 - Math.cos((Math.PI * i) / fadeLen));
          data[i] *= windowFactor;
          data[data.length - 1 - i] *= windowFactor;
        }

        const noise = offlineCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const f = offlineCtx.createBiquadFilter();
        f.type = id === 'rain' ? 'lowpass' : 'bandpass';
        f.frequency.value = id === 'rain' ? 1400 : 500;
        f.Q.value = 1.0;
        noise.connect(f);
        f.connect(soundGain);
        noise.start(0);
      });
    }

    if (onProgress) onProgress(20);

    // Cross-browser OfflineAudioContext rendering (handles both Promise & event callback)
    let renderedBuffer: AudioBuffer;
    const renderPromise = offlineCtx.startRendering();
    if (renderPromise && typeof renderPromise.then === 'function') {
      renderedBuffer = await renderPromise;
    } else {
      renderedBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
        offlineCtx.oncomplete = (e: OfflineAudioCompletionEvent) => resolve(e.renderedBuffer);
        (offlineCtx as any).onerror = (e: any) => reject(new Error('Offline audio render failed: ' + (e?.message || 'unknown error')));
      });
    }

    if (onProgress) onProgress(75);

    let blob: Blob;
    let mimeType = 'audio/wav';
    let extension = 'wav';

    if (format === 'mp3') {
      try {
        blob = await this.audioBufferToMp3(renderedBuffer, onProgress);
        mimeType = 'audio/mp3';
        extension = 'mp3';
      } catch (mp3Err) {
        console.warn('MP3 encoding fallback to WAV:', mp3Err);
        blob = await this.audioBufferToWav(renderedBuffer, onProgress);
        mimeType = 'audio/wav';
        extension = 'wav';
      }
    } else {
      blob = await this.audioBufferToWav(renderedBuffer, onProgress);
    }

    return { blob, format: extension as 'wav' | 'mp3', mimeType, extension };
  }

  // Backwards-compatible convenience wrapper
  public async renderOfflineWav(
    durationSeconds: number,
    activeNatureSounds: { id: string; volume: number }[],
    onProgress?: (progress: number) => void,
    options?: {
      baseFreq?: number;
      brainwaveMode?: BrainwaveMode;
      masterVol?: number;
    }
  ): Promise<Blob> {
    const res = await this.renderOfflineAudio(durationSeconds, activeNatureSounds, onProgress, {
      ...options,
      format: 'wav',
    });
    return res.blob;
  }

  private async audioBufferToMp3(
    buffer: AudioBuffer,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const lameModule = await import('@breezystack/lamejs');
    const Mp3Encoder = lameModule.Mp3Encoder || (lameModule as any).default?.Mp3Encoder || (lameModule as any).default;
    const sampleRate = buffer.sampleRate;
    const channels = buffer.numberOfChannels;
    const mp3encoder = new Mp3Encoder(channels === 1 ? 1 : 2, sampleRate, 128);
    const mp3Chunks: Uint8Array[] = [];

    const leftFloat = buffer.getChannelData(0);
    const rightFloat = channels > 1 ? buffer.getChannelData(1) : leftFloat;
    const totalSamples = buffer.length;

    const leftInt16 = new Int16Array(totalSamples);
    const rightInt16 = new Int16Array(totalSamples);

    for (let i = 0; i < totalSamples; i++) {
      const l = Math.max(-1, Math.min(1, leftFloat[i]));
      leftInt16[i] = l < 0 ? (l * 32768) | 0 : (l * 32767) | 0;

      const r = Math.max(-1, Math.min(1, rightFloat[i]));
      rightInt16[i] = r < 0 ? (r * 32768) | 0 : (r * 32767) | 0;
    }

    const blockSize = 1152 * 4;
    let offset = 0;
    let lastYield = typeof performance !== 'undefined' ? performance.now() : Date.now();

    while (offset < totalSamples) {
      const end = Math.min(totalSamples, offset + blockSize);
      const chunkL = leftInt16.subarray(offset, end);
      const chunkR = channels > 1 ? rightInt16.subarray(offset, end) : undefined;

      const mp3buf = channels === 1 ? mp3encoder.encodeBuffer(chunkL) : mp3encoder.encodeBuffer(chunkL, chunkR);
      if (mp3buf && mp3buf.length > 0) {
        mp3Chunks.push(mp3buf);
      }
      offset = end;

      if (onProgress && totalSamples > 0) {
        const pct = 75 + Math.round((offset / totalSamples) * 24);
        onProgress(Math.min(99, pct));
      }

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (offset < totalSamples && now - lastYield > 25) {
        await new Promise((resolve) => {
          if (typeof MessageChannel !== 'undefined') {
            const mc = new MessageChannel();
            mc.port1.onmessage = () => resolve(undefined);
            mc.port2.postMessage(null);
          } else {
            setTimeout(resolve, 0);
          }
        });
        lastYield = typeof performance !== 'undefined' ? performance.now() : Date.now();
      }
    }

    const flushBuf = mp3encoder.flush();
    if (flushBuf && flushBuf.length > 0) {
      mp3Chunks.push(flushBuf);
    }

    if (onProgress) onProgress(100);
    return new Blob(mp3Chunks as unknown as BlobPart[], { type: 'audio/mp3' });
  }

  private async audioBufferToWav(
    buffer: AudioBuffer,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const outBuffer = new ArrayBuffer(length);
    const view = new DataView(outBuffer);
    const channels: Float32Array[] = [];
    const sampleRate = buffer.sampleRate;
    let pos = 0;

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // FMT sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // 16 for PCM
    setUint16(1); // PCM format
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // 16-bit

    // data sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    const totalSamples = buffer.length;
    const CHUNK_SIZE = 131072; // Optimized chunk size
    let offset = 0;
    let lastYield = typeof performance !== 'undefined' ? performance.now() : Date.now();

    while (offset < totalSamples) {
      const end = Math.min(totalSamples, offset + CHUNK_SIZE);
      for (let s = offset; s < end; s++) {
        for (let i = 0; i < numOfChan; i++) {
          const raw = channels[i][s];
          // Pure 16-bit PCM quantization with clean soft-limiting to prevent clipping
          const clamped = raw < -1 ? -1 : raw > 1 ? 1 : raw;
          const sample = clamped < 0 ? (clamped * 32768) | 0 : (clamped * 32767) | 0;
          view.setInt16(pos, sample, true);
          pos += 2;
        }
      }
      offset = end;

      if (onProgress && totalSamples > 0) {
        const pct = 75 + Math.round((offset / totalSamples) * 24);
        onProgress(Math.min(99, pct));
      }

      // Yield smoothly to event loop every 25ms to keep UI 60fps responsive without timer throttling
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (offset < totalSamples && now - lastYield > 25) {
        await new Promise((resolve) => {
          if (typeof MessageChannel !== 'undefined') {
            const mc = new MessageChannel();
            mc.port1.onmessage = () => resolve(undefined);
            mc.port2.postMessage(null);
          } else {
            setTimeout(resolve, 0);
          }
        });
        lastYield = typeof performance !== 'undefined' ? performance.now() : Date.now();
      }
    }

    if (onProgress) onProgress(100);
    return new Blob([outBuffer], { type: 'audio/wav' });
  }
}

// Global Singleton Instance
export const audioEngine = new AudioEngine();
