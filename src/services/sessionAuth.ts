import {
  getActiveGuestUser,
  clearActiveGuestUser,
  onGuestAuthStateChanged,
  saveActiveGuestUser,
} from './guestAuth';
import {
  getActiveAdminSession,
  onAdminSessionChange,
  AUTHORIZED_ADMIN_EMAIL,
} from './adminAuth';

export type UserRole = 'admin' | 'team' | 'user';

export type UserPermission =
  | 'manage_content'
  | 'manage_soundscapes'
  | 'export_audio'
  | 'manage_newsletter'
  | 'moderate_community'
  | 'view_analytics'
  | 'manage_users';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  permissions?: UserPermission[];
  status: 'active' | 'suspended';
  totalVisits: number;
  totalDurationSeconds: number;
  createdAt: string;
  lastLoginAt: string;
  isGuest?: boolean;
  lifetimeWavTracksDownloaded?: number;
  lifetimeWavMinutesDownloaded?: number;
}

export interface VisitLogEntry {
  userId?: string;
  userName?: string;
  userEmail?: string;
  role?: string;
  action: string;
  feature?: string;
  frequencyHz?: number;
  brainwaveMode?: string;
  durationSeconds?: number;
  timestamp?: string;
  userAgent?: string;
}

export { getActiveGuestUser, clearActiveGuestUser, onGuestAuthStateChanged, saveActiveGuestUser };

const createAdminProfile = (email?: string): UserProfile => ({
  uid: 'admin_sanctuary_master',
  email: email || AUTHORIZED_ADMIN_EMAIL,
  displayName: 'Sanctuary Lead',
  photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin-sanctuary',
  role: 'admin',
  status: 'active',
  totalVisits: 1,
  totalDurationSeconds: 0,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
});

/**
 * Non-blocking deferred auth subscription.
 * Delivers immediate admin / guest state from localStorage on first paint with zero network cost.
 * Initializes Firebase Auth in background/idle time without delaying LCP or blocking main thread.
 */
export function subscribeToSanctuaryAuth(
  onUserChange: (user: UserProfile | null) => void
): () => void {
  let unsubFirebase: (() => void) | null = null;
  let isCancelled = false;

  // 1. Immediately reflect cached admin or guest session
  const initialAdmin = getActiveAdminSession();
  if (initialAdmin) {
    onUserChange(createAdminProfile(initialAdmin.email));
  } else {
    const initialGuest = getActiveGuestUser();
    if (initialGuest) {
      onUserChange(initialGuest as unknown as UserProfile);
    }
  }

  // 2. Listen to admin 2FA session changes
  const unsubAdmin = onAdminSessionChange((session) => {
    if (isCancelled) return;
    if (session) {
      onUserChange(createAdminProfile(session.email));
    } else {
      const guest = getActiveGuestUser();
      onUserChange(guest as unknown as UserProfile | null);
    }
  });

  // 3. Listen to guest auth events (instant local storage events)
  const unsubGuest = onGuestAuthStateChanged((guest) => {
    if (!isCancelled && guest && !getActiveAdminSession()) {
      onUserChange(guest as unknown as UserProfile);
    }
  });

  // 4. Deferred Firebase initialization: only rehydrate if returning user has stored credentials
  let hasTriggered = false;

  const triggerFirebaseInit = async () => {
    if (hasTriggered || isCancelled) return;
    hasTriggered = true;

    try {
      const { initFirebaseSession } = await import('./firebaseAuthService');
      const unsub = await initFirebaseSession(
        onUserChange,
        clearActiveGuestUser,
        createAdminProfile,
        getActiveAdminSession,
        getActiveGuestUser
      );
      if (unsub && !isCancelled) {
        unsubFirebase = unsub;
      }
    } catch (err) {
      console.warn('Deferred auth initialization notice:', err);
    }
  };

  // Only auto-initialize Firebase if returning user has saved Firebase auth credentials in localStorage
  if (typeof window !== 'undefined') {
    let hasStoredSession = false;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('firebase:authUser:')) {
          hasStoredSession = true;
          break;
        }
      }
    } catch {}

    if (hasStoredSession) {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => triggerFirebaseInit(), { timeout: 4000 });
      } else {
        setTimeout(triggerFirebaseInit, 3000);
      }
    }
  }

  return () => {
    isCancelled = true;
    if (unsubFirebase) unsubFirebase();
    if (unsubAdmin) unsubAdmin();
    if (unsubGuest) unsubGuest();
  };
}

/**
 * Non-blocking, zero-bundle telemetry event logger.
 * Sends asynchronous beacon or lightweight fetch without loading heavy client SDKs.
 */
export function logSanctuaryUsageEvent(entry: Omit<VisitLogEntry, 'timestamp' | 'userAgent'>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/usage-event', payload);
    } else {
      fetch('/api/usage-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}
