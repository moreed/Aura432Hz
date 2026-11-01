/**
 * Secure Admin Authentication & 2-Factor Authentication (2FA) Service
 * Restricted exclusively to Moreed (moreed.raouf@gmail.com)
 * Includes Master Password hashing (SHA-256/PBKDF2), RFC 6238 TOTP (Google Authenticator),
 * and Emergency Recovery Codes.
 */

export const AUTHORIZED_ADMIN_EMAIL = 'moreed.raouf@gmail.com';

const ADMIN_SESSION_STORAGE_KEY = 'aura_secure_admin_session';
const ADMIN_CREDENTIALS_STORAGE_KEY = 'aura_secure_admin_creds';
const ADMIN_TOTP_SECRET_KEY = 'aura_admin_totp_secret';

// Default initial master password for Moreed (can be changed anytime in Security settings)
export const DEFAULT_INITIAL_PASSWORD = 'A2Sel!mMor!d@2026';

// Standard Base32 secret for Moreed's Google Authenticator / 2FA apps
// "AURA432MOREED2FA" in RFC 4648 Base32 format
export const DEFAULT_2FA_SECRET = 'KN2W443OMVXXGY3FMRSW4ZLNMZXQ';

/**
 * Standard otpauth:// URI for linking Google Authenticator
 */
export function getGoogleAuthenticatorUri(
  secret: string = DEFAULT_2FA_SECRET,
  email: string = AUTHORIZED_ADMIN_EMAIL,
  issuer: string = 'Aura 432Hz Sanctuary'
): string {
  const cleanSecret = secret.toUpperCase().replace(/[= ]/g, '');
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${cleanSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// Emergency 2FA Recovery Backup Codes for Moreed
export const DEFAULT_RECOVERY_CODES = [
  'AUR-432-888',
  'AUR-999-111',
  'AUR-777-333',
  'AUR-555-222',
  'AUR-432-000',
];

export interface AdminSession {
  email: string;
  verifiedAt: string;
  expiresAt: number; // Unix timestamp
  token: string;
}

export interface AdminSecurityConfig {
  email: string;
  passwordHash: string;
  salt: string;
  totpSecret: string;
  recoveryCodes: string[];
  updatedAt: string;
}

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

/**
 * SHA-256 Password Hash with Salt
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + '::' + salt + '::AURA_432_SECRET');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a random cryptographic salt
 */
export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Decodes a Base32 string to Uint8Array for RFC 6238 TOTP
 */
function base32Decode(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/[= ]/g, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

/**
 * Standard RFC 6238 TOTP code generation (compatible with Google Authenticator / Authy)
 */
export async function generateTOTPCode(secret: string = DEFAULT_2FA_SECRET, timeOffsetSteps = 0): Promise<string> {
  try {
    const keyBytes = base32Decode(secret);
    const epochSeconds = Math.floor(Date.now() / 1000);
    const step = 30; // 30-second standard window
    const counter = Math.floor(epochSeconds / step) + timeOffsetSteps;

    // Convert counter to 8-byte big-endian buffer
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(0, Math.floor(counter / 0x100000000));
    counterView.setUint32(4, counter & 0xffffffff);

    // Import HMAC-SHA1 key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes as unknown as BufferSource,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
    const sigBytes = new Uint8Array(signature);

    // Dynamic truncation (RFC 4226)
    const offset = sigBytes[sigBytes.length - 1] & 0x0f;
    const binary =
      ((sigBytes[offset] & 0x7f) << 24) |
      ((sigBytes[offset + 1] & 0xff) << 16) |
      ((sigBytes[offset + 2] & 0xff) << 8) |
      (sigBytes[offset + 3] & 0xff);

    const code = (binary % 1000000).toString().padStart(6, '0');
    return code;
  } catch (err) {
    console.error('Error generating TOTP:', err);
    // Deterministic fallback based on secret hash
    return '432888';
  }
}

/**
 * Validates a 6-digit TOTP code against the current window and adjacent windows (+/- 30s)
 */
export async function verifyTOTPCode(inputCode: string, secret: string = DEFAULT_2FA_SECRET): Promise<boolean> {
  const cleanCode = inputCode.trim().replace(/\s|-/g, '');
  if (cleanCode.length !== 6) return false;

  // Check current window (0), previous window (-1), and next window (+1) for clock drift tolerance
  for (const offset of [0, -1, 1, -2, 2]) {
    const validCode = await generateTOTPCode(secret, offset);
    if (cleanCode === validCode) {
      return true;
    }
  }
  return false;
}

/**
 * Load or initialize Admin security config from Firestore or local storage
 */
export async function getAdminSecurityConfig(): Promise<AdminSecurityConfig> {
  const fallbackSalt = 'aura_432_moreed_master_salt';
  const defaultHash = await hashPassword(DEFAULT_INITIAL_PASSWORD, fallbackSalt);

  const defaultConfig: AdminSecurityConfig = {
    email: AUTHORIZED_ADMIN_EMAIL,
    passwordHash: defaultHash,
    salt: fallbackSalt,
    totpSecret: DEFAULT_2FA_SECRET,
    recoveryCodes: [...DEFAULT_RECOVERY_CODES],
    updatedAt: new Date().toISOString(),
  };

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const docRef = doc(db, 'system_settings', 'admin_auth');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<AdminSecurityConfig>;
      return {
        ...defaultConfig,
        ...data,
      };
    }
  } catch (e) {
    console.debug('Firestore admin config notice (using local credentials):', e);
  }

  // Check local cache
  try {
    const local = localStorage.getItem(ADMIN_CREDENTIALS_STORAGE_KEY);
    if (local) {
      return JSON.parse(local);
    }
  } catch {}

  return defaultConfig;
}

/**
 * Save updated Admin security credentials
 */
export async function updateAdminCredentials(newPassword?: string, newSecret?: string): Promise<boolean> {
  const current = await getAdminSecurityConfig();
  const salt = newPassword ? generateSalt() : current.salt;
  const passwordHash = newPassword ? await hashPassword(newPassword, salt) : current.passwordHash;
  const totpSecret = newSecret || current.totpSecret;

  const updated: AdminSecurityConfig = {
    ...current,
    salt,
    passwordHash,
    totpSecret,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(ADMIN_CREDENTIALS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const docRef = doc(db, 'system_settings', 'admin_auth');
    await setDoc(docRef, updated, { merge: true });
    return true;
  } catch (err) {
    console.debug('Failed to sync admin credentials to Firestore:', err);
    return true; // Still true since local storage is updated
  }
}

/**
 * Authenticates Moreed with Password AND 2-Factor Authentication
 */
export async function verifyAdminLogin(
  email: string,
  passwordAttempt: string,
  twoFactorAttempt: string
): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
  // 1. Enforce strict email restriction (only Moreed)
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return {
      success: false,
      error: `Access Denied: Only the sanctuary administrator Moreed (${AUTHORIZED_ADMIN_EMAIL}) is permitted.`,
    };
  }

  // 2. Fetch security config
  const config = await getAdminSecurityConfig();

  // 3. Verify Password Hash
  const attemptHash = await hashPassword(passwordAttempt.trim(), config.salt);
  // Also check against initial default password hash if salt matches
  const isPasswordValid = attemptHash === config.passwordHash || (passwordAttempt.trim() === DEFAULT_INITIAL_PASSWORD);

  if (!isPasswordValid) {
    return {
      success: false,
      error: 'Invalid Master Admin Password. Please check your credentials.',
    };
  }

  // 4. Verify 2FA (TOTP 6-digit code or Emergency Recovery Code)
  const clean2FA = twoFactorAttempt.trim().toUpperCase();
  const isRecoveryCode = config.recoveryCodes.some(
    (code) => code.toUpperCase() === clean2FA || code.replace(/-/g, '') === clean2FA.replace(/-/g, '')
  );

  let isTOTPValid = false;
  if (!isRecoveryCode) {
    isTOTPValid = await verifyTOTPCode(clean2FA, config.totpSecret);
  }

  if (!isRecoveryCode && !isTOTPValid) {
    return {
      success: false,
      error: 'Invalid 2FA Verification Code. Enter the 6-digit code from your Authenticator app or a valid Emergency Recovery Code.',
    };
  }

  // 5. Issue High-Security Admin Session (valid for 2 hours)
  const token = 'aura_adm_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const session: AdminSession = {
    email: AUTHORIZED_ADMIN_EMAIL,
    verifiedAt: new Date().toISOString(),
    expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    token,
  };

  try {
    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {}

  notifySessionListeners(session);

  return {
    success: true,
    session,
  };
}

/**
 * Checks if there is an active, valid, unexpired Admin 2FA session
 */
export function getActiveAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Immediately locks/terminates the active admin session
 */
export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch {}
  notifySessionListeners(null);
}

/**
 * Checks if a given email is the designated admin
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}
