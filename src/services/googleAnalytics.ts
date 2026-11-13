import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import type {
  Ga4PropertySummary,
  Ga4SyncPayload,
} from '../server/ga4Service';

export type {
  Ga4PropertySummary,
  Ga4SyncPayload,
  Ga4RealtimeScreenRow,
  Ga4RealtimeEventRow,
  Ga4SourceRow,
  Ga4PageRow,
  Ga4EventRow,
} from '../server/ga4Service';

export const GA4_MEASUREMENT_ID = 'G-D8TKJBBET7';
export const GA4_SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'] as const;

export type Ga4DateRange = 'today' | '7days' | '30days';

export interface Ga4Config {
  propertyId: string;
  propertyDisplayName: string;
  measurementId: string;
  updatedAt: string;
  updatedBy: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Strict in-memory OAuth access token cache (never stored in localStorage or sessionStorage)
let cachedGa4AccessToken: string | null = null;
let cachedGa4AccountEmail: string | null = null;
let cachedGa4ConnectedAt: string | null = null;
let isSigningInGa4 = false;

let _ga4Provider: GoogleAuthProvider | null = null;
function getGa4GoogleProvider(): GoogleAuthProvider {
  if (!_ga4Provider) {
    _ga4Provider = new GoogleAuthProvider();
    for (const scope of GA4_SCOPES) {
      _ga4Provider.addScope(scope);
    }
    _ga4Provider.setCustomParameters({
      prompt: 'select_account',
      include_granted_scopes: 'true',
    });
  }
  return _ga4Provider;
}

type Ga4AuthListener = (state: {
  connected: boolean;
  email: string | null;
  connectedAt: string | null;
}) => void;

const listeners = new Set<Ga4AuthListener>();

function emitAuthState() {
  const snapshot = {
    connected: Boolean(cachedGa4AccessToken),
    email: cachedGa4AccountEmail,
    connectedAt: cachedGa4ConnectedAt,
  };
  listeners.forEach((cb) => cb(snapshot));
}

export function subscribeToGa4Auth(cb: Ga4AuthListener): () => void {
  listeners.add(cb);
  cb({
    connected: Boolean(cachedGa4AccessToken),
    email: cachedGa4AccountEmail,
    connectedAt: cachedGa4ConnectedAt,
  });
  return () => {
    listeners.delete(cb);
  };
}

let authObserverInitialized = false;
export function initGa4AuthObserver(
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthCleared?: () => void
): () => void {
  if (!authObserverInitialized) {
    authObserverInitialized = true;
  }
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedGa4AccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedGa4AccessToken);
      } else if (!isSigningInGa4) {
        cachedGa4AccessToken = null;
        cachedGa4AccountEmail = null;
        cachedGa4ConnectedAt = null;
        emitAuthState();
        if (onAuthCleared) onAuthCleared();
      }
    } else {
      cachedGa4AccessToken = null;
      cachedGa4AccountEmail = null;
      cachedGa4ConnectedAt = null;
      emitAuthState();
      if (onAuthCleared) onAuthCleared();
    }
  });
}

export async function connectGoogleAnalyticsOAuth(): Promise<{
  user: User;
  accessToken: string;
  email: string;
}> {
  isSigningInGa4 = true;
  try {
    const provider = getGa4GoogleProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google sign-in completed, but no Analytics access token was returned. Please grant Analytics read permission.');
    }
    cachedGa4AccessToken = credential.accessToken;
    cachedGa4AccountEmail = result.user?.email || null;
    cachedGa4ConnectedAt = new Date().toISOString();
    emitAuthState();
    return {
      user: result.user,
      accessToken: cachedGa4AccessToken,
      email: cachedGa4AccountEmail || '',
    };
  } catch (err: any) {
    if (
      err?.code === 'auth/unauthorized-domain' ||
      (err?.message && err.message.includes('unauthorized-domain'))
    ) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      throw new Error(
        `Domain "${hostname}" is not authorized in Firebase Console Auth settings for Google Sign-In.`
      );
    }
    throw err;
  } finally {
    isSigningInGa4 = false;
  }
}

export function getGa4AccessToken(): string | null {
  return cachedGa4AccessToken;
}

export function getGa4AccountInfo(): { email: string | null; connectedAt: string | null } {
  return {
    email: cachedGa4AccountEmail,
    connectedAt: cachedGa4ConnectedAt,
  };
}

export function clearGa4AccessToken(): void {
  cachedGa4AccessToken = null;
  cachedGa4AccountEmail = null;
  cachedGa4ConnectedAt = null;
  emitAuthState();
}

// ==========================================
// Firestore GA4 Property Configuration
// ==========================================
const GA4_CONFIG_PATH = 'system_settings/ga4_config';

export async function loadGa4Config(): Promise<Ga4Config | null> {
  try {
    const ref = doc(db, 'system_settings', 'ga4_config');
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as Ga4Config;
  } catch (err: any) {
    if (err?.message?.toLowerCase().includes('permission')) {
      handleFirestoreError(err, OperationType.GET, GA4_CONFIG_PATH);
    }
    console.warn('Notice loading GA4 config from Firestore:', err?.message || err);
    return null;
  }
}

export async function saveGa4Config(config: {
  propertyId: string;
  propertyDisplayName?: string;
  updatedBy: string;
}): Promise<Ga4Config> {
  const cleanId = config.propertyId.replace(/^properties\//, '').trim();
  const payload: Ga4Config = {
    propertyId: cleanId,
    propertyDisplayName: config.propertyDisplayName?.trim() || `GA4 Property ${cleanId}`,
    measurementId: GA4_MEASUREMENT_ID,
    updatedAt: new Date().toISOString(),
    updatedBy: config.updatedBy,
  };
  try {
    const ref = doc(db, 'system_settings', 'ga4_config');
    await setDoc(ref, payload, { merge: true });
    return payload;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, GA4_CONFIG_PATH);
  }
}

// ==========================================
// Server Proxy Calls (Bearer Token Auth)
// ==========================================
export async function discoverGa4Properties(accessToken: string): Promise<Ga4PropertySummary[]> {
  const res = await fetch('/api/ga4/properties', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    code?: string;
    properties?: Ga4PropertySummary[];
  };
  if (!res.ok || !json?.success) {
    const err: any = new Error(json?.error || `Failed to list GA4 properties (HTTP ${res.status})`);
    err.status = res.status;
    err.code = json?.code;
    throw err;
  }
  return json.properties || [];
}

export async function syncGa4Statistics(
  accessToken: string,
  propertyId: string,
  range: Ga4DateRange = 'today'
): Promise<Ga4SyncPayload> {
  const res = await fetch('/api/ga4/sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ propertyId, range }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    code?: string;
    data?: Ga4SyncPayload;
  };
  if (!res.ok || !json?.success || !json?.data) {
    const err: any = new Error(json?.error || `Failed to sync GA4 metrics (HTTP ${res.status})`);
    err.status = res.status;
    err.code = json?.code;
    throw err;
  }
  return json.data;
}
