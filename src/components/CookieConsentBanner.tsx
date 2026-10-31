import React, { useState } from 'react';
import {
  Cookie,
  Shield,
  Sliders,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { recordCookieActionTaken } from '../services/cookieConsent';

interface CookieConsentBannerProps {
  onOpenSettings: () => void;
  onOpenCookiePolicy?: () => void;
  isBottomPlayerVisible?: boolean;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenSettings,
  onOpenCookiePolicy,
  isBottomPlayerVisible = false,
}) => {
  const { hasDecided, acceptAll, declineNonEssential } = useCookieConsent();
  const [isDismissedTemporarily, setIsDismissedTemporarily] = useState(false);

  // If already consented and not temporarily reopened, don't show the large banner
  if (hasDecided || isDismissedTemporarily) {
    return null;
  }

  const handleDismiss = () => {
    recordCookieActionTaken();
    setIsDismissedTemporarily(true);
  };

  const handleAccept = () => {
    recordCookieActionTaken();
    acceptAll();
  };

  const handleDecline = () => {
    recordCookieActionTaken();
    declineNonEssential();
  };

  const handleSettings = () => {
    recordCookieActionTaken();
    onOpenSettings();
  };

  const bottomOffsetClass = isBottomPlayerVisible
    ? 'bottom-20 sm:bottom-24'
    : 'bottom-4 sm:bottom-6';

  return (
    <div
      className={`fixed ${bottomOffsetClass} left-3 right-3 sm:left-auto sm:right-6 sm:max-w-xl lg:max-w-2xl z-50 transition-all duration-300 animate-in slide-in-from-bottom-6 fade-in`}
      role="region"
      aria-label="Cookie consent banner"
    >
      <div className="relative bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 p-4 sm:p-5 text-slate-200 ring-1 ring-slate-800">
        {/* Subtle glowing ambient gradient edge */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-100 tracking-tight">
                  Cookie &amp; Storage Preferences
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950/70 border border-sky-800/40 text-sky-400">
                  Privacy First
                </span>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss banner"
                className="text-slate-400 hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss for now"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              We use essential cookies and browser storage to power real-time Web Audio synthesis,
              calibrate acoustic frequencies (432Hz/528Hz), and remember your volume preferences.
              Optional cookies support anonymous performance telemetry and affiliate gear links.
            </p>

            {/* Links line */}
            {onOpenCookiePolicy && (
              <div className="pt-0.5 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={onOpenCookiePolicy}
                  className="text-sky-400 hover:text-sky-300 underline underline-offset-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Learn more in our Cookie Policy</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {/* Accept All */}
              <button
                type="button"
                onClick={handleAccept}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All</span>
              </button>

              {/* Decline Non-Essential */}
              <button
                type="button"
                onClick={handleDecline}
                className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm transition-colors border border-slate-700/80 cursor-pointer"
              >
                Decline Non-Essential
              </button>

              {/* Cookie Settings */}
              <button
                type="button"
                onClick={handleSettings}
                className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs sm:text-sm transition-colors border border-slate-800 cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Cookie Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
