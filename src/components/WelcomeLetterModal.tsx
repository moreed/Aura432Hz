import React from 'react';
import {
  X,
  Mail,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  Sliders,
  Download,
  Calendar,
} from 'lucide-react';
import { UserProfile } from '../services/firebase';

interface WelcomeLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onStartListening?: () => void;
}

export const WelcomeLetterModal: React.FC<WelcomeLetterModalProps> = ({
  isOpen,
  onClose,
  user,
  onStartListening,
}) => {
  if (!isOpen || !user) return null;

  const displayName = user.displayName || user.email.split('@')[0] || 'Mindful Traveler';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-letter-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fade-in"
    >
      <div className="relative w-full max-w-xl my-auto bg-slate-900 border border-slate-750 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left max-h-[92dvh] landscape:max-h-[94dvh]">
        {/* Header with warm banner */}
        <div className="p-4 sm:p-6 landscape:py-2.5 landscape:px-4 bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-sky-500/20 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30 font-mono">
                Member Welcome Email
              </span>
              <h2 id="welcome-letter-title" className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                Welcome to Aura 432Hz Sanctuary 🌿
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Welcome Letter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Letter Body */}
        <div className="p-4 sm:p-6 landscape:p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          <div className="text-sm font-semibold text-slate-200">
            Dear {displayName},
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your free sanctuary account is now active. We are delighted to welcome you into our global community of meditators, sound therapists, and wellness seekers.
          </p>

          {/* Member Benefits Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>What Your Free Membership Unlocks:</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100">Custom Soundscape Mixing:</strong>
                  <span className="text-slate-400 block text-[11px]">
                    Layer natural rainfall, singing bowls, brown noise &amp; crackling fireplace with real-time volume normalization.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100">Cross-Device Preset Sync:</strong>
                  <span className="text-slate-400 block text-[11px]">
                    Your personalized presets save seamlessly across your smartphone, tablet, and desktop.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100">Studio Offline WAV Exports:</strong>
                  <span className="text-slate-400 block text-[11px]">
                    Download uncompressed 16-bit 44.1kHz audio files for offline flights, retreats, and bedtime playback.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-100">Monthly Sanctuary Bulletin:</strong>
                  <span className="text-slate-400 block text-[11px]">
                    Curated updates on new soundscapes, research articles, and holistic wellness recommendations.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Guidance Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recommended Listening Practice:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Listen at low-to-moderate comfortable volume levels. 432Hz harmonic mathematics and Solfeggio tones do not require loud amplification to stimulate parasympathetic vagal down-regulation.
            </p>
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800">
            <span>Sent to: <strong className="text-slate-300">{user.email}</strong></span>
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <Calendar className="w-3 h-3 text-slate-500" />
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onStartListening) onStartListening();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            Start Listening Now
          </button>
        </div>
      </div>
    </div>
  );
};
