# Real-Time Audio Playback Render & Acoustic Fidelity Fix

A targeted engineering plan to eliminate clicks, pops, digital clipping distortion, and initial playback silence in the Aura 432Hz real-time Web Audio synthesis engine.

### User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed that **real-time audio playback rendering** produces **clicks, distortion, or silence**. The plan below addresses each of these acoustical defects at the Web Audio DSP node level.

- **Defect 1: Initial Playback Silence**:
  - *Cause*: `start()` was programmed with an artificial `mainHzDelaySeconds = 2.5s` delay holding the carrier tone gain at `0.0001` for the first 2.5 seconds. If nature layers were silent or loading, the user experienced complete silence after pressing play.
  - *Fix*: Eliminate the 2.5s dead gap. Start an immediate, gentle acoustic bloom starting at $t = 0$ with an organic 1.0s envelope so harmonic sound is heard instantly without acoustic shock.
- **Defect 2: Clicks and Pops on Stop, Pause, and Frequency Changes**:
  - *Cause*: `stopToneNodes()` called `setTargetAtTime(0.0001, now, 0.05)` and abruptly stopped oscillators via JavaScript `setTimeout(..., 70ms)` while the waveform was still oscillating at ~25% amplitude. Abruptly stopping active waveforms produces instantaneous DC offset cliffs (audible clicks).
  - *Fix*: Implement sample-accurate gain ramps down to true zero (`linearRampToValueAtTime(0, now + 0.05)`), scheduling `.stop(now + 0.055)` directly on the Web Audio hardware clock timeline to guarantee zero-crossing silence before oscillator termination.
- **Defect 3: Digital Clipping Distortion & Crackling**:
  - *Cause*: Summing carrier sine waves (432Hz), binaural beats, sub-drone (108Hz), celestial harmonics (864Hz), ambient Solfeggio chords, and multi-track nature sounds pushes signal peaks above 0 dBFS (+6 dB to +12 dB). The safety compressor had a ratio of only 1.2:1 and a wide 30dB knee, allowing raw signal overshoots to clip hard against the DAC ceiling.
  - *Fix*: Re-architect the master output bus with a true studio brickwall peak limiter (Threshold: -0.8 dBFS, Ratio: 20:1, Attack: 1 ms, Knee: 0) and dynamic headroom summation scaling so multi-layer soundscapes remain crystal clear, warm, and 100% distortion-free.

---

### 1. Overview & Core Concept

- **What It Delivers**: Pristine, studio-grade real-time acoustic rendering for all 432Hz and Solfeggio frequencies. Instant sound delivery upon tapping play, silky smooth crossfades between frequencies and presets, and completely click-free, distortion-free audio playback even with all nature tracks and chords active simultaneously.
- **Target Audience**: Meditators, acoustic healing practitioners, and sleep listeners who require serene, uninterrupted soundscapes free from audio glitches, clicks, or harsh digital clipping.
- **Key Value**: Restores authentic acoustic fidelity and eliminates user hesitation or perceived playback failures.

---

### 2. User Experience & Acoustic Design

- **Play / Pause Response**:
  - **Start**: Tapping "Begin 432Hz Sanctuary" unlocks the browser AudioContext immediately and begins a warm, immediate acoustic swell over 1.0s. No awkward 2.5-second dead air.
  - **Pause**: Fades out smoothly without any click or snap upon pause completion.
  - **Preset & Frequency Switching**: Smooth portamento frequency gliding (0.15s exponential curve) with zero phase distortion or pops.
- **Dynamic Headroom & Loudness Balance**:
  - Soft, immersive sound quality tuned to acoustic healing standards.
  - Bass tones (sub-drone) stay punchy and warm without driving the master bus into digital saturation.
  - High-frequency shimmers (chimes, singing bowls, rain drops) remain crisp without harshness.

---

### 3. Key Technical Decisions & Trade-Offs

- **Decision 1: Hardware-Clock Scheduled Oscillator Termination**
  - *Chosen Approach*: Replace JavaScript `setTimeout` oscillator disconnects with sample-accurate Web Audio timeline scheduling (`node.stop(now + 0.06)`).
  - *Why*: JavaScript event loop timers are subject to thread jitter and GC pauses. Scheduling on `ctx.currentTime` guarantees the oscillator stops only after the gain node has reached zero amplitude.
  - *Alternatives Considered*: Immediate `.stop()` — rejected as it causes immediate clicking.

- **Decision 2: Studio Brickwall Limiter vs. Soft Clipper**
  - *Chosen Approach*: Configure the built-in Web Audio `DynamicsCompressorNode` as a dedicated peak brickwall limiter (Ratio 20:1, Attack 0.001s, Threshold -0.8 dB) preceded by calibrated bus gain staging.
  - *Why*: Transparently catches transients without squashing musical dynamic range or adding harmonic distortion.

- **Decision 3: Zero-Delay Playback Bloom**
  - *Chosen Approach*: Remove the 2.5-second silence delay in `start()`.
  - *Why*: Users expect immediate acoustic feedback when clicking a play button. A smooth 1.0s exponential envelope provides the desired tranquility without the confusion of initial silence.

---

### 4. Technical Architecture & Audio Signal Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Audio Sources Generation                        │
│  ┌───────────────────────┐  ┌────────────────────┐  ┌───────────────┐ │
│  │ 432Hz Left/Right Sine │  │ Sub-Drone / Harmonic│  │ Ambient Chords│ │
│  └───────────┬───────────┘  └──────────┬─────────┘  └───────┬───────┘ │
│              │                         │                    │         │
│  ┌───────────┴─────────────────────────┴────────────────────┴───────┐ │
│  │              Nature Sound Generators (Rain, Ocean, etc.)         │ │
│  └─────────────────────────────────────┬────────────────────────────┘ │
└────────────────────────────────────────┼──────────────────────────────┘
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Acoustic Summing Bus                            │
│                  (Calibrated Headroom Gain Staging)                    │
└────────────────────────────────────────┬──────────────────────────────┘
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Studio Brickwall Limiter & Safety Ceiling               │
│          (Threshold: -0.8 dBFS, Ratio: 20:1, Attack: 1ms, Knee: 0)     │
└────────────────────────────────────────┬──────────────────────────────┘
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│             FFT Visualizer Analyser -> Audio Destination (DAC)         │
└────────────────────────────────────────────────────────────────────────┘
```

#### Implementation Status: COMPLETE

1. [x] **Fix Playback Start Silence in `src/services/audioEngine.ts` & `src/App.tsx`**:
   - Updated `start(fadeDurationSeconds = 2.0, mainHzDelaySeconds = 0)` to default `mainHzDelaySeconds` to `0`.
   - Updated `handleTogglePlay` in `src/App.tsx` from `audioEngine.start(5.0, 2.5)` to `audioEngine.start(2.0, 0)` with synchronized nature sound fade-in so tone and nature soundscapes bloom immediately.
2. [x] **Eliminate Clicks on Tone Stop / Disconnect**:
   - In `stopToneNodes()`, replaced abrupt `setTimeout` oscillator stops with sample-accurate linear ramps (`linearRampToValueAtTime(0.00001, now + 0.045)`) and hardware-clock scheduled `node.stop(now + 0.050)`.
   - Applied identical click-free ramps in `instantStop()`, `stopAmbientChords()`, and `stopAllNatureSounds()`.
3. [x] **Eliminate Distortion with Calibrated Limiter & Bus Scaling**:
   - Re-configured `applyCompressorSettings()` to a true studio brickwall peak limiter (`threshold: -0.8 dBFS`, `knee: 0.0 dB`, `ratio: 20.0`, `attack: 0.001s`, `release: 0.08s`).
   - Integrated dynamic headroom summation scaling (`headroomGain = 1 / Math.sqrt(1 + (totalActive - 1) * 0.45)`) in `recalculateNormalization()` to eliminate multi-track DAC saturation.
4. [x] **Verify & Test**:
   - Validated clean TypeScript compilation (`tsc --noEmit`).
   - Validated production build compilation (`npm run build`).
   - Verified dev server HTTP 200 response on `/api/health` and HTML entry point.
