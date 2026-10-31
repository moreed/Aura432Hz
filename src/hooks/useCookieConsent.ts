import { useState, useEffect, useCallback } from 'react';
import {
  getCookieConsent,
  saveCookieConsent,
  acceptAllCookies,
  declineNonEssentialCookies,
  resetCookieConsent,
  StoredCookieConsent,
  COOKIE_CONSENT_EVENT,
} from '../services/cookieConsent';

export function useCookieConsent() {
  const [consent, setConsent] = useState<StoredCookieConsent>(() => getCookieConsent());

  useEffect(() => {
    // Initial fetch in case of hydration
    setConsent(getCookieConsent());

    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<StoredCookieConsent>;
      if (customEvent.detail) {
        setConsent(customEvent.detail);
      } else {
        setConsent(getCookieConsent());
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  const handleAcceptAll = useCallback(() => {
    const updated = acceptAllCookies();
    setConsent(updated);
    return updated;
  }, []);

  const handleDeclineNonEssential = useCallback(() => {
    const updated = declineNonEssentialCookies();
    setConsent(updated);
    return updated;
  }, []);

  const handleSavePreferences = useCallback(
    (prefs: { functional: boolean; analytics: boolean; marketing: boolean }) => {
      const updated = saveCookieConsent(prefs, 'custom');
      setConsent(updated);
      return updated;
    },
    []
  );

  const handleReset = useCallback(() => {
    resetCookieConsent();
    setConsent(getCookieConsent());
  }, []);

  return {
    consent,
    hasDecided: consent.hasConsent,
    preferences: consent.preferences,
    acceptAll: handleAcceptAll,
    declineNonEssential: handleDeclineNonEssential,
    savePreferences: handleSavePreferences,
    resetConsent: handleReset,
  };
}
