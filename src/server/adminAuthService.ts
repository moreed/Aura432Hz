import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AUTHORIZED_ADMIN_EMAIL = 'moreed.raouf@gmail.com';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_FAILED_ATTEMPTS = 8;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const DATA_DIR = path.resolve(__dirname, '../../data');
const ADMIN_AUTH_FILE = path.resolve(DATA_DIR, 'admin_auth.json');

interface HashedCodeEntry {
  salt: string;
  hash: string;
}

interface PersistedAdminAuth {
  email: string;
  passwordSalt: string;
  passwordHash: string;
  totpEnabled: boolean;
  totpSecret: string;
  recoveryCodeHashes: HashedCodeEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ServerAdminSession {
  token: string;
  email: string;
  verifiedAt: string;
  expiresAt: number;
}

export interface AdminAuthStatus {
  configured: boolean;
  mode: 'env' | 'local' | 'setup';
  require2FA: boolean;
  adminEmail: string;
}

export interface AdminSecurityInfo {
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

// Active server-side sessions (in-memory, cryptographically random tokens)
const activeSessions = new Map<string, ServerAdminSession>();

// Lightweight IP brute-force throttling store
const failedAttemptsByIp = new Map<string, { count: number; resetAt: number }>();

function getEnvPasscode(): string | null {
  const val = process.env.ADMIN_PASSCODE?.trim();
  return val && val.length > 0 ? val : null;
}

function hashWithScrypt(secret: string, salt: string): string {
  return crypto.scryptSync(secret, salt, 64).toString('hex');
}

function timingSafeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifyScryptHash(secret: string, salt: string, expectedHexHash: string): boolean {
  try {
    const derived = crypto.scryptSync(secret, salt, 64);
    const expected = Buffer.from(expectedHexHash, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function generateBase32Secret(numBytes = 20): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.randomBytes(numBytes);
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/[= \t\n\r]/g, '');
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
  return Buffer.from(output);
}

export function generateServerTOTPCode(secret: string, timeOffsetSteps = 0): string {
  const keyBuffer = base32Decode(secret);
  const epochSeconds = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epochSeconds / 30) + timeOffsetSteps;

  const counterBuf = Buffer.alloc(8);
  counterBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac = crypto.createHmac('sha1', keyBuffer).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 1000000).padStart(6, '0');
}

function verifyServerTOTPCode(inputCode: string, secret: string): boolean {
  const clean = inputCode.trim().replace(/[\s-]/g, '');
  if (!/^\d{6}$/.test(clean)) return false;

  for (const offset of [0, -1, 1]) {
    const expected = generateServerTOTPCode(secret, offset);
    if (timingSafeCompareStrings(clean, expected)) {
      return true;
    }
  }
  return false;
}

export function buildOtpAuthUri(secret: string, email: string = AUTHORIZED_ADMIN_EMAIL): string {
  const issuer = 'Aura 432Hz Sanctuary';
  const cleanSecret = secret.toUpperCase().replace(/[= ]/g, '');
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${cleanSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

function generateRecoveryCodesSet(): { plainCodes: string[]; hashedEntries: HashedCodeEntry[] } {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const plainCodes: string[] = [];
  const hashedEntries: HashedCodeEntry[] = [];

  for (let i = 0; i < 6; i++) {
    const rand = crypto.randomBytes(8);
    let seg1 = '';
    let seg2 = '';
    for (let j = 0; j < 4; j++) {
      seg1 += chars[rand[j] % chars.length];
      seg2 += chars[rand[j + 4] % chars.length];
    }
    const code = `AUR-${seg1}-${seg2}`;
    const normalized = code.replace(/-/g, '').toUpperCase();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashWithScrypt(normalized, salt);
    plainCodes.push(code);
    hashedEntries.push({ salt, hash });
  }

  return { plainCodes, hashedEntries };
}

function readPersistedAdminAuth(): PersistedAdminAuth | null {
  try {
    if (!fs.existsSync(ADMIN_AUTH_FILE)) return null;
    const raw = fs.readFileSync(ADMIN_AUTH_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as PersistedAdminAuth;
    if (!parsed || !parsed.passwordHash || !parsed.passwordSalt) return null;
    return parsed;
  } catch (err) {
    console.error('[AdminAuth] Failed reading persisted auth record:', err);
    return null;
  }
}

function writePersistedAdminAuth(record: PersistedAdminAuth): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${ADMIN_AUTH_FILE}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(record, null, 2), { encoding: 'utf-8', mode: 0o600 });
  fs.renameSync(tmpFile, ADMIN_AUTH_FILE);
}

function pruneExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt <= now) {
      activeSessions.delete(token);
    }
  }
}

function createSession(email: string): ServerAdminSession {
  pruneExpiredSessions();
  const token = crypto.randomBytes(32).toString('hex');
  const session: ServerAdminSession = {
    token,
    email,
    verifiedAt: new Date().toISOString(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  activeSessions.set(token, session);
  return session;
}

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = failedAttemptsByIp.get(clientIp);
  if (!entry) return { allowed: true };
  if (now >= entry.resetAt) {
    failedAttemptsByIp.delete(clientIp);
    return { allowed: true };
  }
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { allowed: true };
}

function recordFailedAttempt(clientIp: string): void {
  const now = Date.now();
  const entry = failedAttemptsByIp.get(clientIp);
  if (!entry || now >= entry.resetAt) {
    failedAttemptsByIp.set(clientIp, { count: 1, resetAt: now + LOCKOUT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailedAttempts(clientIp: string): void {
  failedAttemptsByIp.delete(clientIp);
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length >= 32 ? token : null;
}

export function verifyAdminBearerToken(authHeader?: string): ServerAdminSession | null {
  const token = extractBearerToken(authHeader);
  if (!token) return null;
  pruneExpiredSessions();
  const session = activeSessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

export function revokeAdminBearerToken(authHeader?: string): boolean {
  const token = extractBearerToken(authHeader);
  if (!token) return false;
  return activeSessions.delete(token);
}

export function getAdminAuthStatus(): AdminAuthStatus {
  const envPasscode = getEnvPasscode();
  const persisted = readPersistedAdminAuth();

  if (envPasscode) {
    return {
      configured: true,
      mode: 'env',
      require2FA: Boolean(persisted?.totpEnabled && persisted?.totpSecret),
      adminEmail: AUTHORIZED_ADMIN_EMAIL,
    };
  }

  if (persisted) {
    return {
      configured: true,
      mode: 'local',
      require2FA: Boolean(persisted.totpEnabled && persisted.totpSecret),
      adminEmail: persisted.email || AUTHORIZED_ADMIN_EMAIL,
    };
  }

  return {
    configured: false,
    mode: 'setup',
    require2FA: false,
    adminEmail: AUTHORIZED_ADMIN_EMAIL,
  };
}

export function setupInitialAdminCredentials(
  email: string,
  password: string,
  enable2FA: boolean = false
): {
  success: boolean;
  statusCode: number;
  error?: string;
  session?: ServerAdminSession;
  totpSecret?: string;
  otpauthUri?: string;
  recoveryCodes?: string[];
  totpEnabled?: boolean;
} {
  // Block if already configured via environment passcode or persisted local record
  if (getEnvPasscode() || readPersistedAdminAuth()) {
    return {
      success: false,
      statusCode: 409,
      error: 'Administrator access is already configured. Please sign in instead.',
    };
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return {
      success: false,
      statusCode: 403,
      error: `Only the authorized sanctuary administrator (${AUTHORIZED_ADMIN_EMAIL}) may claim admin access.`,
    };
  }

  const trimmedPassword = (password || '').trim();
  if (trimmedPassword.length < 8 || trimmedPassword.length > 128) {
    return {
      success: false,
      statusCode: 400,
      error: 'Master password must be between 8 and 128 characters.',
    };
  }

  const passwordSalt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashWithScrypt(trimmedPassword, passwordSalt);
  const totpSecret = generateBase32Secret(20);
  const { plainCodes, hashedEntries } = generateRecoveryCodesSet();
  const nowIso = new Date().toISOString();

  const record: PersistedAdminAuth = {
    email: AUTHORIZED_ADMIN_EMAIL,
    passwordSalt,
    passwordHash,
    totpEnabled: Boolean(enable2FA),
    totpSecret,
    recoveryCodeHashes: hashedEntries,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  writePersistedAdminAuth(record);
  const session = createSession(AUTHORIZED_ADMIN_EMAIL);

  return {
    success: true,
    statusCode: 201,
    session,
    totpSecret,
    otpauthUri: buildOtpAuthUri(totpSecret, AUTHORIZED_ADMIN_EMAIL),
    recoveryCodes: plainCodes,
    totpEnabled: record.totpEnabled,
  };
}

export function authenticateAdminLogin(
  email: string,
  passwordAttempt: string,
  twoFactorAttempt: string | undefined,
  clientIp: string
): {
  success: boolean;
  statusCode: number;
  error?: string;
  session?: ServerAdminSession;
} {
  const rate = checkRateLimit(clientIp);
  if (!rate.allowed) {
    return {
      success: false,
      statusCode: 429,
      error: `Too many failed sign-in attempts. Please wait ${rate.retryAfterSeconds} seconds before trying again.`,
    };
  }

  const envPasscode = getEnvPasscode();
  const persisted = readPersistedAdminAuth();

  if (!envPasscode && !persisted) {
    return {
      success: false,
      statusCode: 409,
      error: 'Administrator password has not been configured yet. Complete first-run setup first.',
    };
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    recordFailedAttempt(clientIp);
    return {
      success: false,
      statusCode: 403,
      error: `Access denied. Only the authorized sanctuary administrator (${AUTHORIZED_ADMIN_EMAIL}) is permitted.`,
    };
  }

  const candidatePassword = (passwordAttempt || '').trim();
  if (!candidatePassword) {
    return {
      success: false,
      statusCode: 400,
      error: 'Master password is required.',
    };
  }

  // Verify password against env passcode override first, else persisted scrypt hash
  let passwordValid = false;
  if (envPasscode) {
    passwordValid = timingSafeCompareStrings(candidatePassword, envPasscode);
  } else if (persisted) {
    passwordValid = verifyScryptHash(candidatePassword, persisted.passwordSalt, persisted.passwordHash);
  }

  if (!passwordValid) {
    recordFailedAttempt(clientIp);
    return {
      success: false,
      statusCode: 401,
      error: 'Invalid master password. Please check your credentials and try again.',
    };
  }

  // Verify 2FA if enabled in persisted config
  const require2FA = Boolean(persisted?.totpEnabled && persisted?.totpSecret);
  if (require2FA && persisted) {
    const clean2FA = (twoFactorAttempt || '').trim();
    if (!clean2FA) {
      return {
        success: false,
        statusCode: 401,
        error: 'A 6-digit Authenticator code or unused recovery code is required.',
      };
    }

    let valid2FA = verifyServerTOTPCode(clean2FA, persisted.totpSecret);

    if (!valid2FA && Array.isArray(persisted.recoveryCodeHashes) && persisted.recoveryCodeHashes.length > 0) {
      const normalizedRecovery = clean2FA.replace(/[\s-]/g, '').toUpperCase();
      const matchedIdx = persisted.recoveryCodeHashes.findIndex((entry) =>
        verifyScryptHash(normalizedRecovery, entry.salt, entry.hash)
      );
      if (matchedIdx !== -1) {
        valid2FA = true;
        // Consume one-time recovery code immediately
        persisted.recoveryCodeHashes.splice(matchedIdx, 1);
        persisted.updatedAt = new Date().toISOString();
        writePersistedAdminAuth(persisted);
      }
    }

    if (!valid2FA) {
      recordFailedAttempt(clientIp);
      return {
        success: false,
        statusCode: 401,
        error: 'Invalid 2FA verification code. Enter the current 6-digit code or an unused recovery code.',
      };
    }
  }

  clearFailedAttempts(clientIp);
  const session = createSession(AUTHORIZED_ADMIN_EMAIL);

  return {
    success: true,
    statusCode: 200,
    session,
  };
}

export function getAdminSecurityDetails(authHeader?: string): AdminSecurityInfo | null {
  const session = verifyAdminBearerToken(authHeader);
  if (!session) return null;

  const envPasscode = getEnvPasscode();
  const persisted = readPersistedAdminAuth();
  const totpSecret = persisted?.totpSecret || null;
  const countdown = 30 - (Math.floor(Date.now() / 1000) % 30);

  return {
    email: AUTHORIZED_ADMIN_EMAIL,
    mode: envPasscode ? 'env' : 'local',
    totpEnabled: Boolean(persisted?.totpEnabled && totpSecret),
    totpSecret,
    otpauthUri: totpSecret ? buildOtpAuthUri(totpSecret, AUTHORIZED_ADMIN_EMAIL) : null,
    remainingRecoveryCodes: persisted?.recoveryCodeHashes?.length ?? 0,
    currentTotp: totpSecret ? generateServerTOTPCode(totpSecret) : null,
    totpCountdown: countdown,
    updatedAt: persisted?.updatedAt || session.verifiedAt,
  };
}

export function changeAdminPassword(
  authHeader: string | undefined,
  currentPassword: string,
  newPassword: string
): { success: boolean; statusCode: number; error?: string } {
  const session = verifyAdminBearerToken(authHeader);
  if (!session) {
    return { success: false, statusCode: 401, error: 'Active administrator session required.' };
  }

  if (getEnvPasscode()) {
    return {
      success: false,
      statusCode: 409,
      error: 'Admin passcode is currently controlled by the server ADMIN_PASSCODE environment variable. Update it in your deployment environment secrets.',
    };
  }

  const persisted = readPersistedAdminAuth();
  if (!persisted) {
    return { success: false, statusCode: 404, error: 'Admin credential record not found.' };
  }

  const trimmedCurrent = (currentPassword || '').trim();
  const trimmedNew = (newPassword || '').trim();

  if (!verifyScryptHash(trimmedCurrent, persisted.passwordSalt, persisted.passwordHash)) {
    return { success: false, statusCode: 401, error: 'Current master password is incorrect.' };
  }

  if (trimmedNew.length < 8 || trimmedNew.length > 128) {
    return { success: false, statusCode: 400, error: 'New password must be between 8 and 128 characters.' };
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashWithScrypt(trimmedNew, newSalt);

  persisted.passwordSalt = newSalt;
  persisted.passwordHash = newHash;
  persisted.updatedAt = new Date().toISOString();
  writePersistedAdminAuth(persisted);

  // Revoke all other active sessions except the current caller's token
  const currentToken = extractBearerToken(authHeader);
  for (const token of activeSessions.keys()) {
    if (token !== currentToken) {
      activeSessions.delete(token);
    }
  }

  return { success: true, statusCode: 200 };
}

export function setAdminTwoFactor(
  authHeader: string | undefined,
  enabled: boolean
): { success: boolean; statusCode: number; error?: string; info?: AdminSecurityInfo } {
  const session = verifyAdminBearerToken(authHeader);
  if (!session) {
    return { success: false, statusCode: 401, error: 'Active administrator session required.' };
  }

  let persisted = readPersistedAdminAuth();
  if (!persisted) {
    // Env-mode admin enabling 2FA for the first time: create a TOTP record alongside env password
    const randomSalt = crypto.randomBytes(16).toString('hex');
    const totpSecret = generateBase32Secret(20);
    const { hashedEntries } = generateRecoveryCodesSet();
    const nowIso = new Date().toISOString();
    persisted = {
      email: AUTHORIZED_ADMIN_EMAIL,
      passwordSalt: randomSalt,
      passwordHash: hashWithScrypt(crypto.randomBytes(32).toString('hex'), randomSalt),
      totpEnabled: Boolean(enabled),
      totpSecret,
      recoveryCodeHashes: hashedEntries,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  } else {
    if (!persisted.totpSecret) {
      persisted.totpSecret = generateBase32Secret(20);
    }
    persisted.totpEnabled = Boolean(enabled);
    persisted.updatedAt = new Date().toISOString();
  }

  writePersistedAdminAuth(persisted);
  const info = getAdminSecurityDetails(authHeader) || undefined;
  return { success: true, statusCode: 200, info };
}

export function regenerateAdminRecoveryCodes(
  authHeader: string | undefined
): { success: boolean; statusCode: number; error?: string; recoveryCodes?: string[] } {
  const session = verifyAdminBearerToken(authHeader);
  if (!session) {
    return { success: false, statusCode: 401, error: 'Active administrator session required.' };
  }

  let persisted = readPersistedAdminAuth();
  if (!persisted) {
    const randomSalt = crypto.randomBytes(16).toString('hex');
    const nowIso = new Date().toISOString();
    persisted = {
      email: AUTHORIZED_ADMIN_EMAIL,
      passwordSalt: randomSalt,
      passwordHash: hashWithScrypt(crypto.randomBytes(32).toString('hex'), randomSalt),
      totpEnabled: false,
      totpSecret: generateBase32Secret(20),
      recoveryCodeHashes: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }

  const { plainCodes, hashedEntries } = generateRecoveryCodesSet();
  persisted.recoveryCodeHashes = hashedEntries;
  persisted.updatedAt = new Date().toISOString();
  writePersistedAdminAuth(persisted);

  return { success: true, statusCode: 200, recoveryCodes: plainCodes };
}
