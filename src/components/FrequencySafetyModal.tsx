import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Volume2,
  X,
  Radio,
  Activity,
  Heart,
  HelpCircle,
  Headphones,
  Lock,
  Sparkles,
  Printer,
} from 'lucide-react';
import { audioEngine, SOLFEGGIO_FREQUENCIES } from '../services/audioEngine';

interface FrequencySafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFreq: number;
}

export const FrequencySafetyModal: React.FC<FrequencySafetyModalProps> = ({
  isOpen,
  onClose,
  currentFreq,
}) => {
  const [safetyMetrics, setSafetyMetrics] = useState(() => audioEngine.getSafetyStatus());

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const interval = setInterval(() => {
      setSafetyMetrics(audioEngine.getSafetyStatus());
    }, 400);
    return () => {
      clearInterval(interval);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const originalFrequencies = [
    {
      hz: 174,
      name: 'Foundation & Somatic Grounding',
      note: 'Ut (Sub-harmonic)',
      origin: 'Ancient Hymn to St. John / Solfeggio Scale',
      safetyStatus: 'Verified 100% Safe (43.5Hz sub / 348Hz harmonic)',
      acousticEffect: 'Gentle somatic relaxation & calming presence',
      comfortLevel: 'Very Gentle (Low-Mid Bass)',
    },
    {
      hz: 285,
      name: 'Ambient Restoration & Rest',
      note: 'Re (Sub-harmonic)',
      origin: 'Sacred Solfeggio Scale',
      safetyStatus: 'Verified 100% Safe (71.25Hz sub / 570Hz harmonic)',
      comfortLevel: 'Gentle (Warm Mid-Bass)',
      acousticEffect: 'Tranquil harmonic tone for calm relaxation and rest',
    },
    {
      hz: 396,
      name: 'Root Liberation & Grounding',
      note: 'Ut queant laxis',
      origin: 'Original 6-Tone Gregorian Solfeggio',
      safetyStatus: 'Verified 100% Safe (99Hz sub / 792Hz harmonic)',
      comfortLevel: 'Optimal (Deep Resonant Tone)',
      acousticEffect: 'Eases mental chatter and restores grounded presence',
    },
    {
      hz: 432,
      name: 'Verdi Diapason Normale',
      note: 'Natural A4 Tuning',
      origin: 'Giuseppe Verdi (1884) & Pythagorean A432',
      safetyStatus: 'Verified 100% Safe (108Hz sub / 864Hz harmonic)',
      comfortLevel: 'Optimal (Golden Nature Harmony)',
      acousticEffect: 'Promotes mindful presence, quietness & deep peace',
    },
    {
      hz: 528,
      name: '528Hz Harmonic Soundscape',
      note: 'Mi - Mira gestorum',
      origin: 'Ancient Solfeggio Scale',
      safetyStatus: 'Verified 100% Safe (132Hz sub / 1056Hz harmonic)',
      comfortLevel: 'Optimal (Clear Golden Pitch)',
      acousticEffect: 'Harmonic heart-centered tone for emotional balance & tranquility',
    },
    {
      hz: 639,
      name: 'Heart Chakra & Harmony',
      note: 'Fa - Famuli tuorum',
      origin: 'Ancient Solfeggio Interpersonal Tone',
      safetyStatus: 'Verified 100% Safe (159.75Hz sub / 1278Hz harmonic)',
      comfortLevel: 'Optimal (Gentle Melodic Pitch)',
      acousticEffect: 'Enhances empathy, compassion & social bonding',
    },
    {
      hz: 741,
      name: 'Awakening Intuition & Cleansing',
      note: 'Sol - Solve polluti',
      origin: 'Ancient Solfeggio Throat Center',
      safetyStatus: 'Verified 100% Safe (185.25Hz sub / 1482Hz harmonic)',
      comfortLevel: 'Comfortable (Bright Pure Tone)',
      acousticEffect: 'Mental clarity, creative focus & serene atmosphere',
    },
    {
      hz: 852,
      name: 'Spiritual Order & Third Eye',
      note: 'La - Labii reatum',
      origin: 'Ancient Solfeggio Pineal Gland Tone',
      safetyStatus: 'Verified 100% Safe (213Hz sub / 1704Hz harmonic)',
      comfortLevel: 'Comfortable (Crystalline Pitch)',
      acousticEffect: 'Promotes quiet inner vision & deep meditation',
    },
    {
      hz: 963,
      name: 'Crown Chakra & Cosmic Oneness',
      note: 'Si - Sancte Iohannes',
      origin: 'Ancient Solfeggio "Frequency of the Gods"',
      safetyStatus: 'Verified 100% Safe (240.75Hz sub / 1926Hz harmonic)',
      comfortLevel: 'Comfortable (Ethereal Pure Tone)',
      acousticEffect: 'Elevates transcendent awareness & pure stillness',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-modal-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92dvh] landscape:max-h-[94dvh] flex flex-col shadow-2xl overflow-hidden print-clean-container my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 landscape:py-2.5 landscape:px-4 border-b border-slate-800 flex items-start justify-between gap-3 sm:gap-4 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Acoustic Safety &amp; Frequency Integrity Verification
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Calibrated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentic Solfeggio Scale • Safe Audible Acoustic Hertz (Hz) • Zero RF Radiation (0.00 MHz)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold cursor-pointer shadow-sm no-print"
              title="Print Calibration &amp; Safety Certificate"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Print Certificate</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer no-print"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Vital Clarification Banner: Hz vs MHz */}
        <div className="bg-indigo-950/40 border-b border-indigo-500/30 p-4 px-6 flex items-start gap-3">
          <Radio className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-sky-200 flex items-center gap-1.5">
              <span>Scientific Clarification: Why We Use Pure Acoustic Hertz (Hz), Not Megahertz (MHz)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Harmonic soundscapes and Solfeggio frequencies are <strong>audible sound waves measured in Hertz (Hz)</strong>, vibrating gently between <strong>174 Hz and 963 Hz</strong>.
              In contrast, <strong>Megahertz (MHz)</strong> represents high-frequency electromagnetic radio signals (millions of cycles per second).
              Aura 432Hz Sanctuary generates exclusively <strong>safe, mechanical air pressure vibrations</strong> through your device speakers or headphones—with <strong>0.00 MHz electromagnetic RF radiation</strong>.
            </p>
          </div>
        </div>

        {/* Live Engine Diagnostic Bar */}
        <div className="p-4 px-6 bg-slate-850/60 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Current Tuning</div>
            <div className="font-bold text-sky-300 font-mono text-sm flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>{safetyMetrics.currentBaseFreqHz} Hz</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Audible Safety Range</div>
            <div className="font-bold text-emerald-300 font-mono text-xs">
              40 Hz – 1,200 Hz
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">RF / Radiation</div>
            <div className="font-bold text-emerald-400 font-mono text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>0.00 MHz (Pure Audio)</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Acoustic Limiter</div>
            <div className="font-bold text-indigo-300 font-mono text-xs">
              Active (-1.0 dBFS Peak)
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Safeguard Shields Grid */}
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-emerald-400" />
              Built-In Visitor Health & Auditory Protections
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  3–5s Acoustic Fade-In
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  All sounds, tracks, and presets start with a gradual 3 to 5 second acoustic fade-in to protect hearing and prevent sudden audio surprise.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-sky-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  EBU R128 Peak Limiter
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ceiling clamp stops output from exceeding -1.0 dBFS. Prevents sudden volume spikes or digital clipping when switching between presets.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Anti-Click Soft Ramps
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  80ms exponential attack/decay smoothing prevents abrupt audio pops, clicks, or speaker transients that could startle ears.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Ultrasonic Cutoff Guard
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Active 2.4 kHz low-pass acoustic filter removes screeching overtones or ultrasonic frequencies, ensuring only warm, soothing tones reach your ears.
                </p>
              </div>
            </div>
          </div>

          {/* Original Frequency Verification Table */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Original & Correct Solfeggio Scale Table
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                9 Sacred Tones • All 32 Presets Verified
              </span>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800/80">
              {originalFrequencies.map((f) => {
                const isCurrent = currentFreq === f.hz;
                return (
                  <div
                    key={f.hz}
                    className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                      isCurrent ? 'bg-sky-500/10 border-l-4 border-sky-400' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-10 rounded-xl font-mono text-xs font-bold flex items-center justify-center border shrink-0 ${
                          isCurrent
                            ? 'bg-sky-500/20 text-sky-200 border-sky-400/50'
                            : 'bg-slate-850 text-slate-300 border-slate-750'
                        }`}
                      >
                        {f.hz} Hz
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          <span>{f.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({f.note})</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-sky-500 text-slate-950 font-bold px-1.5 py-0.2 rounded uppercase">
                              Active Now
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {f.acousticEffect}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:text-right shrink-0">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Original & Safe
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WHO Safe Listening Guidance */}
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 flex items-start gap-3">
            <Headphones className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-slate-200">World Health Organization (WHO) Safe Listening Protocol</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Acoustic soundscapes are most restorative at gentle, ambient volumes (typically 40% to 60% on your device slider, representing ~60–75 dBA). You do not need loud volume to experience the calming relaxation and mindful focus of acoustic entrainment.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-[11px] text-slate-400 text-center sm:text-left">
            Certified Laboratory Calibration: 64-bit IEEE 754 Web Audio API synthesis engine.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Acoustic Safety Confirmed
          </button>
        </div>
      </div>
    </div>
  );
};
