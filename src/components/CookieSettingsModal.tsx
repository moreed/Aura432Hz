import React, { useState, useEffect } from 'react';
import {
  Cookie,
  ShieldCheck,
  Lock,
  Sparkles,
  BarChart3,
  ExternalLink,
  Check,
  X,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { recordCookieActionTaken } from '../services/cookieConsent';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCookiePolicy?: () => void;
}

export const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenCookiePolicy,
}) => {
  const { preferences, savePreferences, acceptAll, declineNonEssential, consent } =
    useCookieConsent();

  const [functional, setFunctional] = useState(preferences.functional);
  const [analytics, setAnalytics] = useState(preferences.analytics);
  const [marketing, setMarketing] = useState(preferences.marketing);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleClose = () => {
    recordCookieActionTaken();
    onClose();
  };

  // Sync state whenever modal opens or preferences change
  useEffect(() => {
    if (isOpen) {
      setFunctional(preferences.functional);
      setAnalytics(preferences.analytics);
      setMarketing(preferences.marketing);
      setSavedNotification(false);
    }
  }, [isOpen, preferences]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    savePreferences({ functional, analytics, marketing });
    setSavedNotification(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleAcceptAllClick = () => {
    acceptAll();
    setSavedNotification(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDeclineAllClick = () => {
    declineNonEssential();
    setSavedNotification(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-settings-title"
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] landscape:max-h-[94dvh] text-slate-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 landscape:py-2.5 landscape:px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="cookie-settings-title"
                className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2"
              >
                Cookie &amp; Storage Preferences
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize your privacy choices for the Aura 432Hz sanctuary
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close cookie settings"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300">
          {savedNotification && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Your cookie &amp; storage preferences have been saved successfully.</span>
            </div>
          )}

          <p className="text-slate-400 leading-relaxed text-xs">
            We respect your digital sovereignty. Below you can inspect and configure exactly what
            browser cookies and LocalStorage data are utilized during your acoustic meditation
            sessions.
          </p>

          {/* Category 1: Strictly Necessary (Locked) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                <h3 className="font-semibold text-slate-200 text-sm">
                  1. Strictly Necessary &amp; Audio Engine (Essential)
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400 font-medium">
                Always Active
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Required for the sanctuary to function. Stores real-time Web Audio API parameters,
              master volume calibration, 432Hz/528Hz solfeggio frequency selection, volume
              normalization, and secure member authentication.
            </p>
            <div className="pt-1 text-[11px] text-slate-500 font-mono">
              Storage Keys: <span className="text-slate-400">aura_volume, aura_freq, aura_cookie_consent_v1</span>
            </div>
          </div>

          {/* Category 2: Functional & Personalization */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <h3 className="font-semibold text-slate-200 text-sm">
                  2. Functional &amp; Experience Personalization
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Remembers your custom soundscape layers, favorite presets, breathwork pacer rhythms,
              and interactive sound harp preferences between sessions.
            </p>
            <div className="pt-1 text-[11px] text-slate-500 font-mono">
              Status: <span className={functional ? 'text-indigo-400' : 'text-slate-500'}>{functional ? 'Enabled' : 'Disabled'}</span> &bull; Retention: Persistent
            </div>
          </div>

          {/* Category 3: Analytics & Performance */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 className="font-semibold text-slate-200 text-sm">
                  3. Analytics &amp; Audio Performance Telemetry
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Anonymous Web Audio latency diagnostics and stutter telemetry. Never collects
              biometrics, health records, IP logs, or personal identification. Helps us keep audio
              crystal clear across mobile browsers.
            </p>
            <div className="pt-1 text-[11px] text-slate-500 font-mono">
              Status: <span className={analytics ? 'text-emerald-400' : 'text-slate-500'}>{analytics ? 'Enabled' : 'Disabled'}</span> &bull; Retention: 90 Days
            </div>
          </div>

          {/* Category 4: Partner Attribution & Advertising */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <h3 className="font-semibold text-slate-200 text-sm">
                  4. Partner Referral Attribution &amp; Ads
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Allows external partner referral attribution when exploring curated sacred sound gear
              (singing bowls, meditation headphones) and non-intrusive AdSense banners that support
              the free sanctuary.
            </p>
            <div className="pt-1 text-[11px] text-slate-500 font-mono">
              Status: <span className={marketing ? 'text-amber-400' : 'text-slate-500'}>{marketing ? 'Enabled' : 'Disabled'}</span> &bull; Retention: 30 Days
            </div>
          </div>

          {/* Policy Link */}
          {onOpenCookiePolicy && (
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
              <span>Need detailed legal terms?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCookiePolicy();
                }}
                className="text-sky-400 hover:text-sky-300 underline underline-offset-4 flex items-center gap-1 cursor-pointer"
              >
                <span>Read Full Cookie Policy</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDeclineAllClick}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors border border-slate-700/80 cursor-pointer"
          >
            Decline Non-Essential
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAcceptAllClick}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors border border-slate-700 cursor-pointer"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
