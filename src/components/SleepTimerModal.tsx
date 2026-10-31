import React, { useState, useEffect } from 'react';
import { Clock, Timer, Volume2, Check, X, Bell } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSecondsRemaining: number | null;
  onStartTimer: (minutes: number, fadeOutMinutes: number) => void;
  onCancelTimer: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  activeSecondsRemaining,
  onStartTimer,
  onCancelTimer,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [fadeOutMinutes, setFadeOutMinutes] = useState<number>(3);
  const [customInput, setCustomInput] = useState<string>('20');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Lock background scroll when timer modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickMinutes = [15, 30, 45, 60, 90, 120];

  const handleStart = () => {
    const minutes = isCustom ? Math.max(1, parseInt(customInput, 10) || 15) : selectedMinutes;
    const fade = Math.min(minutes, fadeOutMinutes);
    onStartTimer(minutes, fade);
    onClose();
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 landscape:p-4 shadow-2xl max-h-[92dvh] landscape:max-h-[94dvh] overflow-y-auto overscroll-contain my-auto text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Sleep Timer</h2>
            <p className="text-xs text-slate-400">Drift peacefully to sleep with automated audio fade-out</p>
          </div>
        </div>

        {activeSecondsRemaining !== null && activeSecondsRemaining > 0 ? (
          <div className="mb-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center">
            <div className="text-xs text-indigo-300 uppercase tracking-widest font-semibold mb-1">
              Active Sleep Timer
            </div>
            <div className="text-4xl font-light text-slate-100 font-mono tracking-tight my-2">
              {formatTime(activeSecondsRemaining)}
            </div>
            <p className="text-xs text-indigo-300/80 mb-4">
              Gentle fade-out will begin when the countdown nears completion.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  onCancelTimer();
                }}
                className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/40 transition-colors"
              >
                Cancel Timer
              </button>
              <button
                onClick={() => {
                  onStartTimer(Math.floor(activeSecondsRemaining / 60) + 15, fadeOutMinutes);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                +15 Minutes
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Timer Selection */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2.5">
                Session Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {quickMinutes.map((m) => {
                  const selected = !isCustom && selectedMinutes === m;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMinutes(m);
                        setIsCustom(false);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        selected
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      {m} Min
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                    isCustom
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-medium'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Custom Min:
                </button>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={customInput}
                  onFocus={() => setIsCustom(true)}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    setIsCustom(true);
                  }}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            {/* Gentle Fade-Out Setting */}
            <div className="mb-6 p-3.5 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  Gentle Fade-Out Window
                </span>
                <span className="text-xs text-indigo-300 font-semibold">{fadeOutMinutes} min</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Volume softly diminishes over the final minutes so you never wake from sudden silence.
              </p>
              <div className="flex items-center gap-2">
                {[1, 3, 5].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFadeOutMinutes(f)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      fadeOutMinutes === f
                        ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f} Min Fade
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleStart}
                className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Clock className="w-4 h-4" /> Start Sleep Timer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
