/**
 * Aura 432Hz Sanctuary — Comprehensive Cookie & Storage Consent Service
 * 
 * Compliant with:
 * - GDPR / ePrivacy Directive (EU/UK)
 * - CCPA / CPRA (California)
 * - Google Publisher / AdSense Policies
 * 
 * Controls essential Web Audio storage, functional customizations,
 * privacy-first telemetry, and partner referral tracking.
 */

import { analytics } from './analytics';

export interface CookieConsentPreferences {
  /** Real-time Web Audio API context, volume, tuning Hz, essential tokens (Always True) */
  essential: true;
  /** Custom presets, breath pacer rhythm, instrument harp memory, UI preferences */
  functional: boolean;
  /** Anonymous audio engine buffer diagnostics and usage telemetry */
  analytics: boolean;
  /** Partner gear referral attribution (Amazon Associates) & advertising */
  marketing: boolean;
}

export type ConsentDecision = 'all' | 'essential_only' | 'custom';

export interface StoredCookieConsent {
  hasConsent: boolean;
  timestamp: string;
  version: string;
  decision: ConsentDecision;
  preferences: CookieConsentPreferences;
}

const STORAGE_KEY = 'aura_cookie_consent_v1';
const CONSENT_VERSION = '1.0.0';
export const COOKIE_CONSENT_EVENT = 'aura-cookie-consent-updated';
export const COOKIE_ACTION_TAKEN_KEY = 'aura_cookie_action_taken';
export const COOKIE_ACTION_EVENT = 'aura-cookie-action-taken';

/**
 * Records that the user took an action regarding cookies (accept, decline, save, or dismiss).
 */
export function recordCookieActionTaken(): void {
  try {
    localStorage.setItem(COOKIE_ACTION_TAKEN_KEY, 'true');
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COOKIE_ACTION_EVENT));
  }
}

/**
 * Returns whether any cookie action was ever taken.
 */
export function hasCookieActionBeenTaken(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem(COOKIE_ACTION_TAKEN_KEY) === 'true' ||
    Boolean(localStorage.getItem(STORAGE_KEY))
  );
}

const DEFAULT_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  functional: true,
  analytics: false,
  marketing: false,
};

/**
 * Reads the current cookie consent from localStorage.
 */
export function getCookieConsent(): StoredCookieConsent {
  if (typeof window === 'undefined') {
    return {
      hasConsent: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
      decision: 'essential_only',
      preferences: { ...DEFAULT_PREFERENCES },
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        hasConsent: false,
        timestamp: '',
        version: CONSENT_VERSION,
        decision: 'essential_only',
        preferences: { ...DEFAULT_PREFERENCES },
      };
    }

    const parsed = JSON.parse(raw) as StoredCookieConsent;
    if (parsed && typeof parsed.hasConsent === 'boolean' && parsed.preferences) {
      // Ensure essential is permanently true
      parsed.preferences.essential = true;
      return parsed;
    }
  } catch (err) {
    console.warn('[CookieConsent] Failed to parse stored preferences:', err);
  }

  return {
    hasConsent: false,
    timestamp: '',
    version: CONSENT_VERSION,
    decision: 'essential_only',
    preferences: { ...DEFAULT_PREFERENCES },
  };
}

/**
 * Returns whether the user has already answered the cookie banner.
 */
export function hasUserDecidedConsent(): boolean {
  return getCookieConsent().hasConsent;
}

/**
 * Checks if a specific category of cookies/storage is allowed.
 */
export function isCategoryAllowed(category: keyof CookieConsentPreferences): boolean {
  if (category === 'essential') return true;
  const consent = getCookieConsent();
  return Boolean(consent.hasConsent && consent.preferences[category]);
}

/**
 * Broadcasts the updated consent state to active listeners and updates runtime services.
 */
function applyAndNotifyConsent(consent: StoredCookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch (err) {
    console.warn('[CookieConsent] Unable to persist to localStorage:', err);
  }

  // Update analytics service enablement
  if (consent.preferences.analytics) {
    (analytics as any).isEnabled = true;
  } else {
    (analytics as any).isEnabled = false;
  }

  // Emit event for React components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent })
    );
  }

  // Also flag that an explicit cookie action was taken
  recordCookieActionTaken();
}

/**
 * Saves explicit user preferences with category breakdown.
 */
export function saveCookieConsent(
  preferences: Omit<CookieConsentPreferences, 'essential'>,
  decision: ConsentDecision = 'custom'
): StoredCookieConsent {
  const fullConsent: StoredCookieConsent = {
    hasConsent: true,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
    decision,
    preferences: {
      essential: true,
      functional: Boolean(preferences.functional),
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
    },
  };

  applyAndNotifyConsent(fullConsent);
  return fullConsent;
}

/**
 * Quick 1-click Accept All action.
 */
export function acceptAllCookies(): StoredCookieConsent {
  const consent: StoredCookieConsent = {
    hasConsent: true,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
    decision: 'all',
    preferences: {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    },
  };

  applyAndNotifyConsent(consent);
  return consent;
}

/**
 * Quick 1-click Decline Non-Essential action (keeps only essential).
 */
export function declineNonEssentialCookies(): StoredCookieConsent {
  const consent: StoredCookieConsent = {
    hasConsent: true,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
    decision: 'essential_only',
    preferences: {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    },
  };

  applyAndNotifyConsent(consent);
  return consent;
}

/**
 * Resets cookie consent (for re-testing or user revocation).
 */
export function resetCookieConsent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}

  const resetState: StoredCookieConsent = {
    hasConsent: false,
    timestamp: '',
    version: CONSENT_VERSION,
    decision: 'essential_only',
    preferences: { ...DEFAULT_PREFERENCES },
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_EVENT, { detail: resetState })
    );
  }
}
