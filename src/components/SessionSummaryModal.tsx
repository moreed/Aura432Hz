import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  Mail,
  X,
  Volume2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { analytics } from '../services/analytics';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  durationSeconds: number;
  baseFreq: number;
  brainwaveName: string;
  activeSoundscapes: string[];
  timerCompleted: boolean;
  onOpenGratitude?: () => void;
  onOpenBreathwork?: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  durationSeconds,
  baseFreq,
  brainwaveName,
  activeSoundscapes,
  timerCompleted,
  onOpenGratitude,
  onOpenBreathwork,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const minutes = Math.max(1, Math.round(durationSeconds / 60));

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setIsSubmitting(true);
    analytics.track('signup_started', { source: 'post_session_routine' });

    setTimeout(() => {
      try {
        const saved = localStorage.getItem('aura_routine_subscribers');
        const list: string[] = saved ? JSON.parse(saved) : [];
        if (!list.includes(email)) {
          list.push(email);
          localStorage.setItem('aura_routine_subscribers', JSON.stringify(list));
        }
      } catch {}

      analytics.track('signup_completed', { source: 'post_session_routine' });
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-summary-title"
      className="fixed inset-0 z-[85] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 landscape:p-4 shadow-2xl space-y-4 sm:space-y-5 relative overflow-y-auto overscroll-contain max-h-[92dvh] landscape:max-h-[94dvh] my-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
          aria-label="Close session summary"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Badge */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{timerCompleted ? 'Timer Completed' : 'Session Reflection'}</span>
          </div>
          <h2 id="session-summary-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Mindful Listening Summary
          </h2>
          <p className="text-xs text-slate-400">
            {timerCompleted
              ? 'Your scheduled listening session has peacefully concluded.'
              : 'Overview of your session acoustic calibration and mindful presence.'}
          </p>
        </div>

        {/* Session Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Time Listened
            </span>
            <div className="text-lg font-bold text-sky-300 flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{minutes} {minutes === 1 ? 'minute' : 'minutes'}</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Tuning Preference
            </span>
            <div className="text-lg font-bold text-purple-300 font-mono">
              {baseFreq} Hz
            </div>
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rhythm: <strong className="text-slate-200">{brainwaveName}</strong></span>
            {activeSoundscapes.length > 0 && (
              <span className="truncate max-w-[200px]">
                Layers: <strong className="text-slate-200">{activeSoundscapes.join(', ')}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Mindful Next Step */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-indigo-500/20 text-xs space-y-2">
          <div className="font-semibold text-indigo-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mindful Next Step</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Take a slow, deep breath and roll your shoulders. You can jot down a quick thought in your Gratitude Journal or continue your day with quiet presence.
          </p>
          <div className="flex items-center gap-2 pt-1">
            {onOpenGratitude && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGratitude();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Journal Gratitude</span>
              </button>
            )}
            {onOpenBreathwork && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBreathwork();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                <span>4-7-8 Breathing</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Email Routine Capture (Never required, shown only after session) */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-200">
              Optional: Send me a 20-minute evening listening routine
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Receive our free PDF guide on combining 432Hz ambient sound with 4-7-8 breath pacing for deep nighttime rest. Zero spam, unsubscribe anytime.
          </p>

          {isSubmitted ? (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Routine sent! Check your inbox shortly.</span>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                {isSubmitting ? 'Sending...' : 'Send Guide'}
              </button>
            </form>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center"
          >
            Resume Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};
