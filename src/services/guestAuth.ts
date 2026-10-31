export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  role: 'admin' | 'user' | 'listener' | 'contributor' | 'editor' | 'team';
  status?: 'active' | 'suspended';
  totalVisits?: number;
  totalDurationSeconds?: number;
  createdAt?: string;
  lastLoginAt?: string;
  isGuest?: boolean;
  lifetimeWavTracksDownloaded?: number;
  lifetimeWavMinutesDownloaded?: number;
}

const GUEST_STORAGE_KEY = 'aura_active_guest_user';
const GUEST_UID_KEY = 'aura_guest_uid';

const guestAuthListeners: Array<(user: UserProfile | null) => void> = [];

export function onGuestAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
  guestAuthListeners.push(callback);
  return () => {
    const index = guestAuthListeners.indexOf(callback);
    if (index > -1) {
      guestAuthListeners.splice(index, 1);
    }
  };
}

export function notifyAuthStateListeners(user: UserProfile | null): void {
  guestAuthListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.debug('Guest auth listener notification notice:', e);
    }
  });
}

export function getActiveGuestUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveGuestUser(profile: UserProfile): void {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.debug('Failed to cache guest user:', e);
  }
}

export function clearActiveGuestUser(): void {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch (e) {
    console.debug('Failed to clear guest user:', e);
  }
}

export function getOrCreateGuestUid(isAdmin = false): string {
  if (isAdmin) {
    return 'admin_master_owner';
  }
  try {
    let uid = localStorage.getItem(GUEST_UID_KEY);
    if (!uid) {
      uid = `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(GUEST_UID_KEY, uid);
    }
    return uid;
  } catch {
    return `guest_${Date.now()}`;
  }
}
