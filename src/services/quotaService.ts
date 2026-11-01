export const LIFETIME_MAX_TRACKS = 5;
export const LIFETIME_MAX_MINUTES = 50;
export const MAX_SINGLE_TRACK_MINUTES = 9.5; // Strictly less than 10 minutes maximum

export const GUEST_MAX_TRACKS = 2;
export const GUEST_MAX_MINUTES = 10;
export const GUEST_MAX_SINGLE_TRACK_MINUTES = 5;

export const ADMIN_MAX_SINGLE_TRACK_MINUTES = 30;

export interface WavDownloadReceipt {
  id: string;
  timestamp: string;
  durationMinutes: number;
  freqHz: number;
  brainwaveMode: string;
  presetName?: string;
  fileName: string;
}

export interface UserWavQuota {
  userId: string;
  lifetimeWavTracksDownloaded: number;
  lifetimeWavMinutesDownloaded: number;
  remainingMinutes: number;
  remainingTracks: number;
  lastDownloadedAt?: string;
  downloadHistory: WavDownloadReceipt[];
  isGuest?: boolean;
}

const QUOTA_CACHE_PREFIX = 'aura_wav_quota_';
const GUEST_QUOTA_STORAGE_KEY = 'aura_wav_quota_guest';

/**
 * Determine if a user object is a guest or not logged in.
 */
export function isGuestUser(user: { uid?: string; isGuest?: boolean; email?: string | null } | null | undefined): boolean {
  if (!user || typeof user !== 'object') return true;
  if (!user.uid || typeof user.uid !== 'string') return true;
  if (user.isGuest === true) return true;
  if (user.uid.startsWith('guest_') || user.uid === 'guest') return true;
  if (typeof user.email === 'string' && user.email.includes('@aura432.sanctuary')) return true;
  return false;
}

/**
 * Read cached quota synchronously from localStorage for instant render.
 * Supports visitor/guest quota (10 mins / 2 tracks) and member quota (50 mins / 5 tracks).
 */
export function getLocalUserWavQuota(userId?: string | null): UserWavQuota {
  const isGuest = !userId || typeof userId !== 'string' || userId === 'guest' || userId.startsWith('guest_');

  if (isGuest) {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(GUEST_QUOTA_STORAGE_KEY);
        if (raw && raw !== 'null' && raw !== 'undefined') {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const rawTracks = typeof parsed.lifetimeWavTracksDownloaded === 'number' && !isNaN(parsed.lifetimeWavTracksDownloaded)
              ? parsed.lifetimeWavTracksDownloaded
              : 0;
            const rawMins = typeof parsed.lifetimeWavMinutesDownloaded === 'number' && !isNaN(parsed.lifetimeWavMinutesDownloaded)
              ? parsed.lifetimeWavMinutesDownloaded
              : 0;
            const tracks = Math.min(GUEST_MAX_TRACKS, Math.max(0, rawTracks));
            const mins = Math.min(GUEST_MAX_MINUTES, Math.max(0, rawMins));
            return {
              userId: 'guest',
              lifetimeWavTracksDownloaded: tracks,
              lifetimeWavMinutesDownloaded: mins,
              remainingMinutes: Math.max(0, Number((GUEST_MAX_MINUTES - mins).toFixed(1))),
              remainingTracks: Math.max(0, GUEST_MAX_TRACKS - tracks),
              lastDownloadedAt: typeof parsed.lastDownloadedAt === 'string' ? parsed.lastDownloadedAt : undefined,
              downloadHistory: Array.isArray(parsed.downloadHistory) ? parsed.downloadHistory : [],
              isGuest: true,
            };
          }
        }
      }
    } catch (e) {
      console.debug('Failed to parse local guest quota:', e);
    }

    return {
      userId: 'guest',
      lifetimeWavTracksDownloaded: 0,
      lifetimeWavMinutesDownloaded: 0,
      remainingMinutes: GUEST_MAX_MINUTES,
      remainingTracks: GUEST_MAX_TRACKS,
      downloadHistory: [],
      isGuest: true,
    };
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(`${QUOTA_CACHE_PREFIX}${userId}`);
      if (raw && raw !== 'null' && raw !== 'undefined') {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const rawTracks = typeof parsed.lifetimeWavTracksDownloaded === 'number' && !isNaN(parsed.lifetimeWavTracksDownloaded)
            ? parsed.lifetimeWavTracksDownloaded
            : 0;
          const rawMins = typeof parsed.lifetimeWavMinutesDownloaded === 'number' && !isNaN(parsed.lifetimeWavMinutesDownloaded)
            ? parsed.lifetimeWavMinutesDownloaded
            : 0;
          const tracks = Math.min(LIFETIME_MAX_TRACKS, Math.max(0, rawTracks));
          const mins = Math.min(LIFETIME_MAX_MINUTES, Math.max(0, rawMins));
          return {
            userId: typeof userId === 'string' ? userId : 'guest',
            lifetimeWavTracksDownloaded: tracks,
            lifetimeWavMinutesDownloaded: mins,
            remainingMinutes: Math.max(0, Number((LIFETIME_MAX_MINUTES - mins).toFixed(1))),
            remainingTracks: Math.max(0, LIFETIME_MAX_TRACKS - tracks),
            lastDownloadedAt: typeof parsed.lastDownloadedAt === 'string' ? parsed.lastDownloadedAt : undefined,
            downloadHistory: Array.isArray(parsed.downloadHistory) ? parsed.downloadHistory : [],
            isGuest: false,
          };
        }
      }
    }
  } catch (e) {
    console.debug('Failed to parse local member quota cache:', e);
  }

  return {
    userId: typeof userId === 'string' ? userId : 'guest',
    lifetimeWavTracksDownloaded: 0,
    lifetimeWavMinutesDownloaded: 0,
    remainingMinutes: LIFETIME_MAX_MINUTES,
    remainingTracks: LIFETIME_MAX_TRACKS,
    downloadHistory: [],
    isGuest: false,
  };
}

/**
 * Save quota to local storage and dispatch notification for reactive components.
 */
function cacheUserWavQuota(quota: UserWavQuota): void {
  try {
    if (!quota || typeof quota !== 'object') return;
    const isGuest = quota.isGuest || !quota.userId || typeof quota.userId !== 'string' || quota.userId === 'guest' || quota.userId.startsWith('guest_');
    const storageKey = isGuest
      ? GUEST_QUOTA_STORAGE_KEY
      : `${QUOTA_CACHE_PREFIX}${quota.userId}`;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(quota));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aura-wav-quota-changed', { detail: quota }));
    }
  } catch (e) {
    console.debug('Failed to cache user quota:', e);
  }
}

/**
 * Fetch authoritative user quota from Firestore, falling back to local cache.
 */
export async function fetchUserWavQuota(userId?: string | null): Promise<UserWavQuota> {
  const local = getLocalUserWavQuota(userId);
  if (!userId || userId === 'guest' || userId.startsWith('guest_')) return local;

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const tracks = Math.min(
        LIFETIME_MAX_TRACKS,
        Math.max(0, typeof data.lifetimeWavTracksDownloaded === 'number' ? data.lifetimeWavTracksDownloaded : local.lifetimeWavTracksDownloaded)
      );
      const mins = Math.min(
        LIFETIME_MAX_MINUTES,
        Math.max(0, typeof data.lifetimeWavMinutesDownloaded === 'number' ? data.lifetimeWavMinutesDownloaded : local.lifetimeWavMinutesDownloaded)
      );
      const history = Array.isArray(data.downloadHistory) ? data.downloadHistory : local.downloadHistory;

      const synced: UserWavQuota = {
        userId,
        lifetimeWavTracksDownloaded: tracks,
        lifetimeWavMinutesDownloaded: mins,
        remainingMinutes: Math.max(0, Number((LIFETIME_MAX_MINUTES - mins).toFixed(1))),
        remainingTracks: Math.max(0, LIFETIME_MAX_TRACKS - tracks),
        lastDownloadedAt: data.lastWavDownloadAt || local.lastDownloadedAt,
        downloadHistory: history,
        isGuest: false,
      };

      cacheUserWavQuota(synced);
      return synced;
    }
  } catch (err) {
    console.debug('Firestore quota fetch notice, using local quota cache:', err);
  }

  return local;
}

/**
 * Record a completed WAV download and deduct duration from lifetime pool.
 * Supports Admin (unlimited bypass), Registered Members (50m pool), and Guests (10m pool).
 */
export async function recordWavDownload(
  userId: string | null | undefined,
  durationMinutes: number,
  metadata: {
    freqHz: number;
    brainwaveMode: string;
    presetName?: string;
    fileName: string;
  },
  isAdmin = false
): Promise<UserWavQuota> {
  // Sanctuary administrators have unlimited exports and do not consume member quotas
  if (isAdmin) {
    return {
      userId: userId || 'admin',
      lifetimeWavTracksDownloaded: 0,
      lifetimeWavMinutesDownloaded: 0,
      remainingMinutes: 9999,
      remainingTracks: 999,
      downloadHistory: [],
      isGuest: false,
    };
  }

  const isGuest = !userId || userId === 'guest' || userId.startsWith('guest_');
  const maxPoolTracks = isGuest ? GUEST_MAX_TRACKS : LIFETIME_MAX_TRACKS;
  const maxPoolMinutes = isGuest ? GUEST_MAX_MINUTES : LIFETIME_MAX_MINUTES;

  const current = getLocalUserWavQuota(userId);
  const now = new Date().toISOString();
  const receipt: WavDownloadReceipt = {
    id: `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: now,
    durationMinutes: Number(durationMinutes.toFixed(1)),
    freqHz: metadata.freqHz ?? 432,
    brainwaveMode: metadata.brainwaveMode ?? 'Alpha Healing',
    presetName: metadata.presetName || 'Custom Sanctuary Mix',
    fileName: metadata.fileName || 'Aura432Hz-Session.wav',
  };

  const newTracks = Math.min(maxPoolTracks, current.lifetimeWavTracksDownloaded + 1);
  const newMinutes = Math.min(maxPoolMinutes, Number((current.lifetimeWavMinutesDownloaded + durationMinutes).toFixed(1)));
  const updatedHistory = [receipt, ...current.downloadHistory].slice(0, 15);

  const updatedQuota: UserWavQuota = {
    userId: isGuest ? 'guest' : (userId as string),
    lifetimeWavTracksDownloaded: newTracks,
    lifetimeWavMinutesDownloaded: newMinutes,
    remainingMinutes: Math.max(0, Number((maxPoolMinutes - newMinutes).toFixed(1))),
    remainingTracks: Math.max(0, maxPoolTracks - newTracks),
    lastDownloadedAt: now,
    downloadHistory: updatedHistory,
    isGuest,
  };

  // Immediate local cache update
  cacheUserWavQuota(updatedQuota);

  // Background Firestore synchronization ONLY for signed-in registered members
  if (!isGuest && userId) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          lifetimeWavTracksDownloaded: newTracks,
          lifetimeWavMinutesDownloaded: newMinutes,
          lastWavDownloadAt: now,
          downloadHistory: updatedHistory,
        },
        { merge: true }
      );
    } catch (err) {
      console.debug('Failed to sync quota to Firestore:', err);
    }
  }

  return updatedQuota;
}

