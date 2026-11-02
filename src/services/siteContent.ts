import { useState, useEffect } from 'react';
import { getActiveAdminSession, isAuthorizedAdminEmail, AUTHORIZED_ADMIN_EMAIL } from './adminAuth';

export interface CustomSocialLink {
  id: string;
  label: string;
  url: string;
  visible?: boolean;
}

export interface SocialLinksConfig {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  telegramUrl: string;
  socialHeadline: string;
  socialSubtext: string;
  customLinks?: CustomSocialLink[];
}

export interface SocialVisibilityConfig {
  facebook: boolean;
  instagram: boolean;
  tiktok: boolean;
  youtube: boolean;
  twitter: boolean;
  telegram: boolean;
}

export interface SiteFlagsConfig {
  announcementBar: boolean;
  dailyAffirmation: boolean;
  socialSection: boolean;
  offlineDownloadsEnabled: boolean;
  communityFeaturesEnabled: boolean;
}

export interface UnderConstructionConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  stayTunedMessage: string;
  quote: string;
  quoteAuthor: string;
  contactEmail: string;
  launchDate: string; // ISO 8601 string
  showCountdown: boolean;
  showVisualizer: boolean; // Purely silent 432Hz harmonic wave visualizer (zero audio/sound)
  showBreathingOrb: boolean; // Relaxing guided visual breathwork orb (zero audio/sound)
  showNewsletterSignup: boolean;
  showSocialBanner?: boolean; // Displays sacred social media icons banner in under construction mode
  socialHeadline?: string; // Optional custom headline for social banner during under construction
  backgroundVibe: 'deep_sanctuary' | 'celestial' | 'ambient_dawn';
}

export interface SiteContentConfig {
  // Social Media Links & Individual Platform Toggles
  social: SocialLinksConfig;
  socialVisibility: SocialVisibilityConfig;
  
  // Site-wide content and feature flags
  flags: SiteFlagsConfig;

  // Under Construction / Maintenance mode configuration
  underConstruction: UnderConstructionConfig;

  // Hero & Announcement (announcementEnabled kept in sync with flags.announcementBar)
  announcementEnabled: boolean;
  announcementBadge: string;
  announcementText: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;

  // Footer & Sanctuary Info
  brandName: string;
  footerTagline: string;
  dailyAffirmation: string;
  contactEmail: string;

  // Metadata
  updatedAt: string;
  lastUpdatedBy: string;
}

export const DEFAULT_UNDER_CONSTRUCTION: UnderConstructionConfig = {
  enabled: false,
  title: 'A Sanctuary for Deep Stillness is Awakening',
  subtitle: 'We are quietly crafting a realm of pure natural resonance and mindful peace. Stay close as our sanctuary doors prepare to open.',
  stayTunedMessage:
    'We are preparing a sacred realm of timeless stillness and mindful presence. Stay close as our doors prepare to open.',
  quote: 'Silence is the language of God, all else is poor translation.',
  quoteAuthor: 'Rumi',
  contactEmail: 'admin@aura432hz.com',
  // Default to 14 days from now
  launchDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  showCountdown: true,
  showVisualizer: true,
  showBreathingOrb: true,
  showNewsletterSignup: true,
  showSocialBanner: true,
  socialHeadline: 'Connect with our Sanctuary Community • Follow our Reopening Journey',
  backgroundVibe: 'deep_sanctuary',
};

export const DEFAULT_SOCIAL_VISIBILITY: SocialVisibilityConfig = {
  facebook: true,
  instagram: true,
  tiktok: true,
  youtube: true,
  twitter: true,
  telegram: false,
};

export const DEFAULT_SITE_FLAGS: SiteFlagsConfig = {
  announcementBar: true,
  dailyAffirmation: true,
  socialSection: true,
  offlineDownloadsEnabled: true,
  communityFeaturesEnabled: true,
};

export const DEFAULT_SITE_CONTENT: SiteContentConfig = {
  social: {
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    youtubeUrl: 'https://www.youtube.com/@Aura432Hz-d1g',
    twitterUrl: 'https://x.com',
    telegramUrl: '',
    socialHeadline: 'Connect with the Global Sacred Community',
    socialSubtext: '',
    customLinks: [],
  },
  socialVisibility: DEFAULT_SOCIAL_VISIBILITY,
  flags: DEFAULT_SITE_FLAGS,
  underConstruction: DEFAULT_UNDER_CONSTRUCTION,
  announcementEnabled: true,
  announcementBadge: 'Live Frequency',
  announcementText: '✨ Experience Pure 432Hz Organic Solfeggio Resonance & Binaural Brainwave Entrainment',
  heroBadge: '432Hz Ambient Sound & Meditation Sanctuary',
  heroTitle: 'Sound • Relaxation • Meditation • Breathwork',
  heroSubtitle:
    'Immerse in pure 432Hz acoustic tuning, calming Solfeggio soundscapes, guided breathwork, and relaxing ambient nature audio.',
  brandName: 'Aura 432Hz Sanctuary',
  footerTagline: 'Ambient Sound, Meditation & Breathwork Sanctuary',
  dailyAffirmation:
    'In every 432Hz ambient soundscape lies an invitation to peaceful stillness, mindful presence, and harmonious calm.',
  contactEmail: 'moreed.raouf@gmail.com',
  updatedAt: new Date().toISOString(),
  lastUpdatedBy: 'moreed.raouf@gmail.com',
};

const SITE_CONTENT_STORAGE_KEY = 'aura432_site_content_v2';
const SITE_CONTENT_EVENT = 'aura_site_content_updated';

/**
 * Synchronous local retrieval for instant render without flicker.
 * Injected server state (persisted by admin in site_content.json) is authoritative over visitor cache.
 */
export function getLocalSiteContent(): SiteContentConfig {
  try {
    let localParsed: Partial<SiteContentConfig> | null = null;
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
      if (raw) {
        try {
          localParsed = JSON.parse(raw);
        } catch {}
      }
    }

    const injected = typeof window !== 'undefined' ? (window as any).__AURA_INITIAL_SITE_CONTENT__ : null;

    // Merge order: 1. Default fallback -> 2. LocalStorage cache -> 3. Injected server state (Admin authoritative)
    // Server-persisted admin settings ALWAYS take precedence over client-side visitor cache
    const merged: SiteContentConfig = {
      ...DEFAULT_SITE_CONTENT,
      ...(localParsed || {}),
      ...(injected || {}),
      social: {
        ...DEFAULT_SITE_CONTENT.social,
        ...(localParsed?.social || {}),
        ...(injected?.social || {}),
        customLinks: injected?.social?.customLinks ?? localParsed?.social?.customLinks ?? [],
      },
      socialVisibility: {
        ...DEFAULT_SOCIAL_VISIBILITY,
        ...(localParsed?.socialVisibility || {}),
        ...(injected?.socialVisibility || {}),
      },
      flags: {
        ...DEFAULT_SITE_FLAGS,
        ...(localParsed?.flags || {}),
        ...(injected?.flags || {}),
      },
      underConstruction: {
        ...DEFAULT_UNDER_CONSTRUCTION,
        ...(localParsed?.underConstruction || {}),
        ...(injected?.underConstruction || {}),
      },
    };

    return merged;
  } catch (e) {
    console.debug('Failed to read local site content cache', e);
  }
  return DEFAULT_SITE_CONTENT;
}

/**
 * Fetch latest site content from Server API and Firestore system_settings collection, with local fallback
 */
export async function fetchSiteContent(): Promise<SiteContentConfig> {
  const local = getLocalSiteContent();
  let serverContent: Partial<SiteContentConfig> | null = null;

  // 1. Fetch from server API (authoritative across all browsers & visitors)
  try {
    const res = await fetch('/api/site-content');
    if (res.ok) {
      const data: any = await res.json();
      if (data && data.content && typeof data.content === 'object') {
        serverContent = data.content;
      }
    }
  } catch (err) {
    console.debug('Server site content fetch notice:', err);
  }

  // 2. Fetch from Firestore system_settings ONLY if authorized admin session is active
  // Normal visitors receive lightweight server API / inlined content without downloading the Firestore SDK
  let firestoreContent: Partial<SiteContentConfig> | null = null;
  const activeSession = getActiveAdminSession();
  if (activeSession) {
    try {
      const { fetchFirestoreSiteContent } = await import('./adminFirestoreContent');
      firestoreContent = await fetchFirestoreSiteContent();
    } catch (e) {
      console.debug('Firestore site content fetch notice:', e);
    }
  }

  const remote = {
    ...(firestoreContent || {}),
    ...(serverContent || {}),
  };

  if (Object.keys(remote).length > 0) {
    const merged: SiteContentConfig = {
      ...DEFAULT_SITE_CONTENT,
      ...remote,
      social: {
        ...DEFAULT_SITE_CONTENT.social,
        ...(remote.social || {}),
        customLinks: remote.social?.customLinks ?? local.social?.customLinks ?? [],
      },
      socialVisibility: {
        ...DEFAULT_SOCIAL_VISIBILITY,
        ...(remote.socialVisibility || {}),
      },
      flags: {
        ...DEFAULT_SITE_FLAGS,
        ...(remote.flags || {}),
      },
      underConstruction: {
        ...DEFAULT_UNDER_CONSTRUCTION,
        ...(remote.underConstruction || {}),
      },
      updatedAt: remote.updatedAt || new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      (window as any).__AURA_INITIAL_SITE_CONTENT__ = merged;
    }
    // Cache authoritative server state locally
    try {
      localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(merged));
    } catch {}
    return merged;
  }

  return local;
}

/**
 * Save updated site content to Server API, Firestore, and localStorage, notifying all active listeners.
 * STRICT SECURITY: Only the authenticated sanctuary administrator (moreed.raouf@gmail.com) can modify settings.
 */
export async function updateSiteContent(
  updates: Partial<SiteContentConfig>,
  adminEmail: string = AUTHORIZED_ADMIN_EMAIL
): Promise<SiteContentConfig> {
  const current = getLocalSiteContent();

  // Strict Admin Gate: Only authorized administrator can modify site settings, social links, or under construction status
  const activeSession = getActiveAdminSession();
  const isAuthorized =
    (activeSession && isAuthorizedAdminEmail(activeSession.email)) ||
    isAuthorizedAdminEmail(adminEmail);

  if (!isAuthorized) {
    console.warn(
      `[Aura Security] Blocked unauthorized attempt to change site settings. Only authenticated administrator (${AUTHORIZED_ADMIN_EMAIL}) can modify settings.`
    );
    return current;
  }

  const mergedFlags: SiteFlagsConfig = {
    ...current.flags,
    ...(updates.flags || {}),
    ...(typeof updates.announcementEnabled === 'boolean'
      ? { announcementBar: updates.announcementEnabled }
      : {}),
  };

  const merged: SiteContentConfig = {
    ...current,
    ...updates,
    social: {
      ...current.social,
      ...(updates.social || {}),
      customLinks: updates.social?.customLinks !== undefined
        ? updates.social.customLinks
        : (current.social?.customLinks || []),
    },
    socialVisibility: {
      ...current.socialVisibility,
      ...(updates.socialVisibility || {}),
    },
    flags: mergedFlags,
    underConstruction: {
      ...current.underConstruction,
      ...(updates.underConstruction || {}),
    },
    announcementEnabled: mergedFlags.announcementBar,
    updatedAt: new Date().toISOString(),
    lastUpdatedBy: activeSession?.email || adminEmail,
  };

  // Keep in-memory window snapshot strictly updated
  if (typeof window !== 'undefined') {
    (window as any).__AURA_INITIAL_SITE_CONTENT__ = merged;
  }

  // 1. Save to localStorage immediately
  try {
    localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save site content locally', e);
  }

  // 2. Dispatch event for instant UI reactive updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(SITE_CONTENT_EVENT, { detail: merged })
    );
  }

  // 3. Persist to Server API with Admin Authorization Header
  try {
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Admin-Email': activeSession?.email || adminEmail || AUTHORIZED_ADMIN_EMAIL,
    };
    if (activeSession?.token) {
      authHeaders['Authorization'] = `Bearer ${activeSession.token}`;
    }
    fetch('/api/site-content', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(merged),
    }).catch((err) => console.debug('Server API site content sync error:', err));
  } catch (err) {
    console.debug('Failed to post to server site content API:', err);
  }

  // 4. Persist to Firestore system_settings/site_content
  try {
    const { saveFirestoreSiteContent } = await import('./adminFirestoreContent');
    await saveFirestoreSiteContent(merged);
  } catch (e) {
    console.debug('Firestore remote sync notice:', e);
  }

  return merged;
}

/**
 * Bulk toggle all social media links visibility in a single action
 */
export async function bulkToggleAllSocialVisibility(
  visible: boolean,
  adminEmail: string = 'moreed.raouf@gmail.com'
): Promise<SiteContentConfig> {
  const newVisibility: SocialVisibilityConfig = {
    facebook: visible,
    instagram: visible,
    tiktok: visible,
    youtube: visible,
    twitter: visible,
    telegram: visible,
  };
  return updateSiteContent({ socialVisibility: newVisibility }, adminEmail);
}

/**
 * Bulk reset all site-wide content flags and social visibility to sanctuary defaults in a single action
 */
export async function bulkResetSiteFlags(
  adminEmail: string = 'moreed.raouf@gmail.com'
): Promise<SiteContentConfig> {
  return updateSiteContent(
    {
      flags: DEFAULT_SITE_FLAGS,
      socialVisibility: DEFAULT_SOCIAL_VISIBILITY,
      announcementEnabled: DEFAULT_SITE_FLAGS.announcementBar,
    },
    adminEmail
  );
}

/**
 * Bulk update content flags in a single action
 */
export async function bulkUpdateContentFlags(
  flagUpdates: Partial<SiteFlagsConfig>,
  adminEmail: string = 'moreed.raouf@gmail.com'
): Promise<SiteContentConfig> {
  return updateSiteContent({ flags: { ...getLocalSiteContent().flags, ...flagUpdates } }, adminEmail);
}

/**
 * Reset site content back to sanctuary defaults
 */
export async function resetSiteContent(adminEmail: string): Promise<SiteContentConfig> {
  return updateSiteContent(DEFAULT_SITE_CONTENT, adminEmail);
}

/**
 * React Hook for consuming live SiteContent anywhere in the application
 */
export function useSiteContent() {
  const [content, setContent] = useState<SiteContentConfig>(() => getLocalSiteContent());

  useEffect(() => {
    // Initial fetch from Firestore
    fetchSiteContent().then((latest) => {
      setContent(latest);
    });

    // Event listener for in-app updates
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteContentConfig>;
      if (customEvent.detail) {
        setContent(customEvent.detail);
      }
    };

    window.addEventListener(SITE_CONTENT_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(SITE_CONTENT_EVENT, handleUpdate);
    };
  }, []);

  return content;
}

/**
 * 1-Click quick toggle for Under Construction mode
 */
export async function toggleUnderConstruction(
  enabled: boolean,
  adminEmail: string = 'moreed.raouf@gmail.com'
): Promise<SiteContentConfig> {
  const current = getLocalSiteContent();
  return updateSiteContent(
    {
      underConstruction: {
        ...current.underConstruction,
        enabled,
      },
    },
    adminEmail
  );
}

export interface ConstructionSubscriber {
  id?: string;
  email: string;
  timestamp: string;
  userAgent?: string;
}

const LOCAL_WAITLIST_KEY = 'aura432_construction_subscribers_local';

/**
 * Subscribe a visitor's email for sanctuary reopening launch notification
 */
export async function subscribeToConstructionWaitlist(email: string): Promise<{ success: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const subscriber: ConstructionSubscriber = {
    email: trimmed,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  // 1. Save locally
  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_KEY);
    const list: ConstructionSubscriber[] = raw ? JSON.parse(raw) : [];
    if (!list.some((s) => s.email === trimmed)) {
      list.push(subscriber);
      localStorage.setItem(LOCAL_WAITLIST_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.debug('Local subscriber save error:', e);
  }

  // 2. Persist to Firestore construction_subscribers collection
  try {
    const { saveConstructionSubscriberToFirestore } = await import('./adminFirestoreContent');
    await saveConstructionSubscriberToFirestore(subscriber);
  } catch (e) {
    console.debug('Firestore subscriber save error (local saved):', e);
  }

  return { success: true, message: "You're on the sanctuary launch waitlist! We will notify you the moment we reopen." };
}

/**
 * Fetch construction subscribers for admin review
 */
export async function fetchConstructionSubscribers(): Promise<ConstructionSubscriber[]> {
  try {
    const { fetchConstructionSubscribersFromFirestore } = await import('./adminFirestoreContent');
    const subscribers = await fetchConstructionSubscribersFromFirestore();
    if (subscribers && subscribers.length > 0) {
      return subscribers;
    }
  } catch (e) {
    console.debug('Firestore subscribers query fallback to local:', e);
  }

  try {
    const raw = localStorage.getItem(LOCAL_WAITLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
