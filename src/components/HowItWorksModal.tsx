import React from 'react';
import {
  X,
  Volume2,
  Sliders,
  Moon,
  ShieldCheck,
  Sparkles,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartListening: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onStartListening,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
      className="fixed inset-0 z-[85] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 landscape:p-4 shadow-2xl space-y-4 sm:space-y-5 relative overflow-y-auto overscroll-contain max-h-[92dvh] landscape:max-h-[94dvh] my-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 inline-flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sanctuary Listening Guide</span>
          </div>
          <h2 id="how-it-works-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How Aura 432Hz Works
          </h2>
          <p className="text-xs text-slate-400">
            A simple 3-step guide to focused, restful listening.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="font-semibold text-slate-200">Choose a Tuning Preference &amp; Rhythm</div>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Start with Verdi A=432Hz for balanced harmonic warmth, or explore Solfeggio tones like 528Hz. Select an alpha (10Hz) rhythm for relaxed focus, or delta (3.5Hz) for bedtime.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="font-semibold text-slate-200">Blend Nature Soundscapes</div>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Layer procedurally synthesized rainfall, ocean swells, forest birds, or Tibetan singing bowls in the Nature Mixer. Each soundscape runs 100% offline in your browser.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="font-semibold text-slate-200">Set a Timer &amp; Listen Comfortably</div>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Keep volume between 40% and 60% for optimal relaxation. Set a sleep timer with automatic smooth fade-out when heading to bed.
              </p>
            </div>
          </div>
        </div>

        {/* Wellness Disclaimer */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
          <strong>Wellness Notice:</strong> For relaxation and personal listening only; not medical advice or treatment.
        </div>

        {/* CTA */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartListening();
            }}
            className="flex-1 min-h-[42px] py-2.5 px-4 border border-transparent bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center justify-center cursor-pointer text-center"
          >
            Start listening now
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-300 text-xs font-semibold rounded-xl inline-flex items-center justify-center transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
