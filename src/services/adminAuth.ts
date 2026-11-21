/**
 * Server-Verified Admin Authentication & 2-Factor Authentication (2FA) Client Service
 * All credential verification, scrypt hashing, TOTP validation, and session issuance
 * occur exclusively on the backend server. Session tokens are held strictly in memory.
 */

export const AUTHORIZED_ADMIN_EMAIL = 'moreed.raouf@gmail.com';

export interface AdminSession {
  email: string;
  verifiedAt: string;
  expiresAt: number; // Unix timestamp (ms)
  token: string;
}

export interface AdminAuthStatusResponse {
  configured: boolean;
  mode: 'env' | 'local' | 'setup';
  require2FA: boolean;
  adminEmail: string;
}

export interface AdminSetupResult {
  success: boolean;
  error?: string;
  session?: AdminSession;
  totpSecret?: string;
  otpauthUri?: string;
  recoveryCodes?: string[];
  totpEnabled?: boolean;
}

export interface AdminSecurityDetails {
  email: string;
  mode: 'env' | 'local';
  totpEnabled: boolean;
  totpSecret: string | null;
  otpauthUri: string | null;
  remainingRecoveryCodes: number;
  currentTotp: string | null;
  totpCountdown: number;
  updatedAt: string;
}

// Keep verified admin session strictly in memory (never in localStorage)
let activeAdminSession: AdminSession | null = null;

type AdminSessionListener = (session: AdminSession | null) => void;
const sessionListeners: Set<AdminSessionListener> = new Set();

export function onAdminSessionChange(listener: AdminSessionListener): () => void {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

function notifySessionListeners(session: AdminSession | null) {
  sessionListeners.forEach((fn) => {
    try {
      fn(session);
    } catch (e) {
      console.debug('Admin session listener notice:', e);
    }
  });
}

function setActiveAdminSession(session: AdminSession | null) {
  activeAdminSession = session;
  // Clean up any legacy insecure storage keys if present from older builds
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('aura_secure_admin_session');
      localStorage.removeItem('aura_secure_admin_creds');
      localStorage.removeItem('aura_admin_totp_secret');
    } catch {}
  }
  notifySessionListeners(session);
}

/**
 * Standard otpauth:// URI formatter for an explicit server-provided Base32 secret
 */
export function getGoogleAuthenticatorUri(
  secret: string,
  email: string = AUTHORIZED_ADMIN_EMAIL,
  issuer: string = 'Aura 432Hz Sanctuary'
): string {
  const cleanSecret = secret.toUpperCase().replace(/[= ]/g, '');
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${cleanSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Check whether server-side admin credentials are configured or awaiting first-run setup
 */
export async function fetchAdminAuthStatus(): Promise<AdminAuthStatusResponse> {
  const res = await fetch('/api/admin/auth/status', {
    method: 'GET',
    cache: 'no-store',
  });
  const data = (await res.json()) as Record<string, any>;
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || 'Could not check admin authentication status.');
  }
  return {
    configured: Boolean(data.configured),
    mode: data.mode || 'setup',
    require2FA: Boolean(data.require2FA),
    adminEmail: data.adminEmail || AUTHORIZED_ADMIN_EMAIL,
  };
}

/**
 * Complete one-time first-run setup to claim admin access with a server-hashed master password
 */
export async function setupAdminAccount(
  email: string,
  password: string,
  enable2FA: boolean = false
): Promise<AdminSetupResult> {
  try {
    const res = await fetch('/api/admin/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, enable2FA }),
    });
    const data = (await res.json()) as Record<string, any>;
    if (!res.ok || !data?.success || !data?.session) {
      return {
        success: false,
        error: data?.error || 'Failed to complete initial admin setup.',
      };
    }

    setActiveAdminSession(data.session as AdminSession);

    return {
      success: true,
      session: data.session as AdminSession,
      totpSecret: data.totpSecret,
      otpauthUri: data.otpauthUri,
      recoveryCodes: data.recoveryCodes,
      totpEnabled: Boolean(data.totpEnabled),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unable to reach authentication server.',
    };
  }
}

/**
 * Authenticate administrator against backend server (scrypt / env passcode + optional 2FA)
 */
export async function verifyAdminLogin(
  email: string,
  passwordAttempt: string,
  twoFactorAttempt?: string
): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
  try {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: passwordAttempt,
        twoFactorCode: twoFactorAttempt || '',
      }),
    });
    const data = (await res.json()) as Record<string, any>;
    if (!res.ok || !data?.success || !data?.session) {
      return {
        success: false,
        error: data?.error || 'Administrator authentication failed.',
      };
    }

    setActiveAdminSession(data.session as AdminSession);

    return {
      success: true,
      session: data.session as AdminSession,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unable to reach authentication server.',
    };
  }
}

/**
 * Returns the active, unexpired in-memory AdminSession, or null if none
 */
export function getActiveAdminSession(): AdminSession | null {
  if (!activeAdminSession) return null;
  if (Date.now() >= activeAdminSession.expiresAt) {
    setActiveAdminSession(null);
    return null;
  }
  return activeAdminSession;
}

/**
 * Authorization headers helper for authenticated admin API requests
 */
export function getAdminAuthHeaders(): Record<string, string> {
  const session = getActiveAdminSession();
  if (!session?.token) return {};
  return {
    Authorization: `Bearer ${session.token}`,
  };
}

/**
 * Immediately revokes the server session and clears in-memory admin credentials
 */
export function clearAdminSession(): void {
  const existing = activeAdminSession;
  setActiveAdminSession(null);
  if (existing?.token) {
    fetch('/api/admin/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${existing.token}` },
    }).catch(() => {});
  }
}

/**
 * Fetch authenticated admin security details (TOTP status, QR URI, recovery count)
 */
export async function fetchAdminSecurityInfo(): Promise<AdminSecurityDetails> {
  const headers = getAdminAuthHeaders();
  if (!headers.Authorization) {
    throw new Error('Active administrator session required.');
  }
  const res = await fetch('/api/admin/auth/security', {
    method: 'GET',
    headers,
    cache: 'no-store',
  });
  const data = (await res.json()) as Record<string, any>;
  if (res.status === 401) {
    setActiveAdminSession(null);
  }
  if (!res.ok || !data?.success || !data?.security) {
    throw new Error(data?.error || 'Failed to load security configuration.');
  }
  return data.security as AdminSecurityDetails;
}

/**
 * Rotate server-hashed master password (requires current password)
 */
export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const headers = getAdminAuthHeaders();
  if (!headers.Authorization) {
    throw new Error('Active administrator session required.');
  }
  const res = await fetch('/api/admin/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = (await res.json()) as Record<string, any>;
  if (res.status === 401 && data?.error?.includes('session')) {
    setActiveAdminSession(null);
  }
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || 'Failed to update master password.');
  }
}

/**
 * Toggle 2FA requirement on server-stored admin credentials
 */
export async function setAdminTwoFactorEnabled(enabled: boolean): Promise<AdminSecurityDetails> {
  const headers = getAdminAuthHeaders();
  if (!headers.Authorization) {
    throw new Error('Active administrator session required.');
  }
  const res = await fetch('/api/admin/auth/2fa', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ enabled }),
  });
  const data = (await res.json()) as Record<string, any>;
  if (!res.ok || !data?.success || !data?.security) {
    throw new Error(data?.error || 'Failed to update 2FA setting.');
  }
  return data.security as AdminSecurityDetails;
}

/**
 * Generate a fresh set of one-time recovery codes (returned once)
 */
export async function regenerateAdminRecoveryCodes(): Promise<string[]> {
  const headers = getAdminAuthHeaders();
  if (!headers.Authorization) {
    throw new Error('Active administrator session required.');
  }
  const res = await fetch('/api/admin/auth/recovery-codes/regenerate', {
    method: 'POST',
    headers,
  });
  const data = (await res.json()) as Record<string, any>;
  if (!res.ok || !data?.success || !Array.isArray(data?.recoveryCodes)) {
    throw new Error(data?.error || 'Failed to regenerate recovery codes.');
  }
  return data.recoveryCodes as string[];
}

/**
 * Checks if a given email matches the designated sanctuary administrator
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}
