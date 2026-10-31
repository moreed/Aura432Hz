import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import {
  hasCookieActionBeenTaken,
  recordCookieActionTaken,
  COOKIE_ACTION_EVENT,
  COOKIE_CONSENT_EVENT,
} from '../services/cookieConsent';

interface FloatingCookieButtonProps {
  onClick: () => void;
  isBottomPlayerVisible?: boolean;
}

export const FloatingCookieButton: React.FC<FloatingCookieButtonProps> = ({
  onClick,
  isBottomPlayerVisible = false,
}) => {
  const { hasDecided, consent } = useCookieConsent();
  const [hasActionTaken, setHasActionTaken] = useState<boolean>(() => {
    return hasCookieActionBeenTaken();
  });

  useEffect(() => {
    const handleAction = () => {
      setHasActionTaken(true);
    };

    window.addEventListener(COOKIE_ACTION_EVENT, handleAction);
    window.addEventListener(COOKIE_CONSENT_EVENT, handleAction);
    return () => {
      window.removeEventListener(COOKIE_ACTION_EVENT, handleAction);
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleAction);
    };
  }, []);

  // Make the cookies icon disappear completely after any action
  if (hasDecided || hasActionTaken) {
    return null;
  }

  const handleClick = () => {
    recordCookieActionTaken();
    setHasActionTaken(true);
    onClick();
  };

  // Position dynamically based on whether global bottom player is showing
  const bottomOffsetClass = isBottomPlayerVisible
    ? 'bottom-20 sm:bottom-24'
    : 'bottom-4 sm:bottom-6';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Manage Cookie & Storage Preferences"
      title="Manage Cookie & Storage Preferences"
      className={`fixed ${bottomOffsetClass} left-3 sm:left-6 z-40 group flex items-center gap-2 px-3 py-2 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 backdrop-blur-md shadow-lg shadow-black/60 text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400`}
    >
      <div className="relative">
        <Cookie className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
        {/* Subtle dot indicating status */}
        <span
          className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
            consent.decision === 'all'
              ? 'bg-emerald-400 ring-1 ring-emerald-950'
              : consent.decision === 'custom'
              ? 'bg-sky-400 ring-1 ring-sky-950'
              : 'bg-amber-400 ring-1 ring-amber-950'
          }`}
        />
      </div>
      <span className="text-xs font-medium tracking-tight pr-0.5">
        Cookies
      </span>
    </button>
  );
};
