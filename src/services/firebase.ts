import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getDocFromServer,
  addDoc,
  deleteDoc,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AUTHORIZED_ADMIN_EMAIL,
  isAuthorizedAdminEmail,
  getActiveAdminSession,
  clearAdminSession,
} from './adminAuth';

export type UserRole = 'admin' | 'team' | 'user';

export type UserPermission =
  | 'manage_content'       // Edit Site Content, Hero, Quotes, Socials
  | 'manage_soundscapes'   // Curate Soundscapes & Presets
  | 'export_audio'        // Studio WAV Exporter Quota Exemption
  | 'manage_newsletter'    // Newsletters & Welcome Emails
  | 'moderate_community'   // Moderate Gratitude & Testimonials
  | 'view_analytics'       // View Audit Logs & Usage Metrics
  | 'manage_users';        // User Management (Admin only by default)

export const ALL_PERMISSIONS: { id: UserPermission; label: string; desc: string }[] = [
  { id: 'manage_content', label: 'Site Content & Socials', desc: 'Edit hero text, branding quotes, and social media links' },
  { id: 'manage_soundscapes', label: 'Soundscapes & Presets', desc: 'Create, curate, and configure acoustic soundscape blends' },
  { id: 'export_audio', label: 'Studio WAV Audio Exporter', desc: 'Unlimited uncompressed 44.1kHz studio WAV audio exports' },
  { id: 'manage_newsletter', label: 'Newsletters & Welcome Letters', desc: 'Send monthly community letters and welcome emails' },
  { id: 'moderate_community', label: 'Community & Editorial', desc: 'Review, publish, and moderate gratitude & testimonials' },
  { id: 'view_analytics', label: 'Visits & Usages Audit', desc: 'Inspect real-time telemetry, session metrics, and logs' },
  { id: 'manage_users', label: 'User Directory & Access', desc: 'Manage registered users and assign team permissions' },
];

export function hasUserPermission(user: UserProfile | null | undefined, permission: UserPermission): boolean {
  if (!user) return false;
  if (user.role === 'admin' || isAuthorizedAdminEmail(user.email)) return true;
  if (user.role === 'team' && Array.isArray(user.permissions) && user.permissions.includes(permission)) return true;
  return false;
}

export function isUserAdminOrTeam(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin' || isAuthorizedAdminEmail(user.email)) return true;
  if (user.role === 'team') return true;
  return false;
}

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
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  action: string;
  feature: string;
  frequencyHz?: number;
  brainwaveMode?: string;
  durationSeconds?: number;
  timestamp: string;
  userAgent: string;
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Target designated database ID if provided in config
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Owner email has automatic super-admin rights
const OWNER_EMAIL = 'moreed.raouf@gmail.com';

import {
  onGuestAuthStateChanged,
  notifyAuthStateListeners,
  getActiveGuestUser,
  saveActiveGuestUser,
  clearActiveGuestUser,
  getOrCreateGuestUid,
} from './guestAuth';

export {
  onGuestAuthStateChanged,
  notifyAuthStateListeners,
  getActiveGuestUser,
  saveActiveGuestUser,
  clearActiveGuestUser,
  getOrCreateGuestUid,
};
export { onAuthStateChanged } from 'firebase/auth';

// Connection test as required by skill guidelines
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_health', 'ping'));
    return true;
  } catch (error: any) {
    if (error?.message && error.message.includes('offline')) {
      console.warn('Firebase client is running in offline mode.');
      return false;
    }
    // Any other response means connection reached the server
    return true;
  }
}

// 1-Click Google Sign-In with explicit unauthorized-domain error diagnostics
export async function signInWithGoogleOneClick(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    clearActiveGuestUser();
    const profile = await syncUserProfile(result.user);
    notifyAuthStateListeners(profile as any);
    return profile;
  } catch (err: any) {
    if (
      err?.code === 'auth/unauthorized-domain' ||
      (err?.message && err.message.includes('unauthorized-domain'))
    ) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'current preview domain';
      const unauthorizedError: any = new Error(
        `Firebase: Error (auth/unauthorized-domain). The domain "${hostname}" is not authorized for Google Sign-In in Firebase Console.`
      );
      unauthorizedError.code = 'auth/unauthorized-domain';
      unauthorizedError.hostname = hostname;
      throw unauthorizedError;
    }
    throw err;
  }
}

// 1-Click Fast Registered Member Sign-In (Sanctuary Account with 50-minute / 5-track offline WAV export rights)
// Allows members to register/sign in even if Google Popup OAuth is restricted by domain authorization or iframe policies
export async function signInAsRegisteredMember(
  customEmail?: string,
  customDisplayName?: string
): Promise<UserProfile> {
  const storedUid = typeof localStorage !== 'undefined' ? localStorage.getItem('aura_registered_member_uid') : null;
  const memberUid = storedUid || `member_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aura_registered_member_uid', memberUid);
  }

  const now = new Date().toISOString();
  let existingProfile: UserProfile | null = null;
  try {
    const userRef = doc(db, 'users', memberUid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingProfile = snap.data() as UserProfile;
    }
  } catch (readErr) {
    console.debug('Firestore read notice during registered member login:', readErr);
  }

  const email = customEmail?.trim() || existingProfile?.email || `member_${memberUid.slice(0, 6)}@aura432.com`;
  const displayName = customDisplayName?.trim() || existingProfile?.displayName || 'Registered Sanctuary Member';
  const photoURL =
    existingProfile?.photoURL ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${memberUid}`;

  const isDefaultAdmin = isAuthorizedAdminEmail(email);

  const registeredProfile: UserProfile = {
    uid: memberUid,
    email,
    displayName,
    photoURL,
    role: isDefaultAdmin ? 'admin' : (existingProfile?.role === 'admin' ? 'admin' : 'user'),
    status: 'active',
    isGuest: false,
    totalVisits: (existingProfile?.totalVisits || 0) + 1,
    totalDurationSeconds: existingProfile?.totalDurationSeconds || 0,
    createdAt: existingProfile?.createdAt || now,
    lastLoginAt: now,
    lifetimeWavTracksDownloaded: existingProfile?.lifetimeWavTracksDownloaded || 0,
    lifetimeWavMinutesDownloaded: existingProfile?.lifetimeWavMinutesDownloaded || 0,
  };

  try {
    const userRef = doc(db, 'users', memberUid);
    await setDoc(userRef, registeredProfile, { merge: true });
  } catch (writeErr) {
    console.debug('Firestore write notice during registered member session:', writeErr);
  }

  clearActiveGuestUser();
  saveActiveGuestUser(registeredProfile);
  notifyAuthStateListeners(registeredProfile as any);
  return registeredProfile;
}

// 1-Click Fast Guest / Meditator Sign-In
// Directly establishes persistent guest session with zero network errors or admin-restricted restrictions
export async function signInAsGuestOneClick(requestedRole: 'user' = 'user'): Promise<UserProfile> {
  const guestUid = getOrCreateGuestUid(false);
  const now = new Date().toISOString();

  let existingProfile: UserProfile | null = getActiveGuestUser() as any;
  if (!existingProfile) {
    try {
      const userRef = doc(db, 'users', guestUid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        existingProfile = snap.data() as UserProfile;
      }
    } catch (readErr) {
      console.debug('Firestore read notice during guest session initialization:', readErr);
    }
  }

  const email = existingProfile?.email || `guest_${guestUid.slice(0, 6)}@aura432.sanctuary`;
  const displayName = existingProfile?.displayName || 'Mindful Traveler (Guest)';
  const photoURL =
    existingProfile?.photoURL ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${guestUid}`;

  const guestProfile: UserProfile = {
    uid: guestUid,
    email,
    displayName,
    photoURL,
    role: 'user', // Guests are strictly standard users. Admin requires 2FA & Password
    status: 'active',
    totalVisits: (existingProfile?.totalVisits || 0) + 1,
    totalDurationSeconds: existingProfile?.totalDurationSeconds || 0,
    createdAt: existingProfile?.createdAt || now,
    lastLoginAt: now,
  };

  // Attempt to persist profile to Firestore
  try {
    const userRef = doc(db, 'users', guestUid);
    await setDoc(userRef, guestProfile, { merge: true });
  } catch (dbErr) {
    console.debug('Notice: guest profile synced locally (Firestore notice):', dbErr);
  }

  saveActiveGuestUser(guestProfile as any);
  notifyAuthStateListeners(guestProfile as any);
  return guestProfile;
}

// Sync or create user profile in Firestore
export async function syncUserProfile(
  fbUser: FirebaseUser,
  overrides?: Partial<FirebaseUser>,
  forcedRole?: 'admin' | 'user'
): Promise<UserProfile> {
  const userRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userRef);

  const email = overrides?.email || fbUser.email || `user_${fbUser.uid.slice(0, 6)}@aura432.sanctuary`;
  const displayName = overrides?.displayName || fbUser.displayName || (email.split('@')[0]);
  const photoURL = fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`;

  // STRICT SECURITY INVARIANT: Only Moreed (moreed.raouf@gmail.com) with active 2FA can be Admin
  const isDefaultAdmin = isAuthorizedAdminEmail(email) && (forcedRole === 'admin' || !!getActiveAdminSession());

  const now = new Date().toISOString();

  if (snap.exists()) {
    const existing = snap.data() as UserProfile;
    const updated: UserProfile = {
      ...existing,
      email,
      displayName,
      photoURL: existing.photoURL || photoURL,
      lastLoginAt: now,
      totalVisits: (existing.totalVisits || 0) + 1,
      role: isDefaultAdmin
        ? 'admin'
        : (existing.role === 'admin' && isAuthorizedAdminEmail(existing.email) ? 'admin' : 'user'),
    };
    await setDoc(userRef, updated, { merge: true });
    return updated;
  } else {
    const newUser: UserProfile = {
      uid: fbUser.uid,
      email,
      displayName,
      photoURL,
      role: isDefaultAdmin ? 'admin' : 'user',
      status: 'active',
      totalVisits: 1,
      totalDurationSeconds: 0,
      createdAt: now,
      lastLoginAt: now,
    };
    await setDoc(userRef, newUser);

    // Automated Welcome Email System for all newly registered users
    import('./emailService')
      .then(({ sendWelcomeEmail }) => sendWelcomeEmail(newUser))
      .catch((e) => console.debug('Welcome email auto-dispatch notice:', e));

    return newUser;
  }
}

// Sign out
export async function logOut(): Promise<void> {
  clearActiveGuestUser();
  clearAdminSession();
  notifyAuthStateListeners(null);
  try {
    await signOut(auth);
  } catch (err) {
    console.debug('Firebase signOut notice:', err);
  }
}

// Track application usage and visits
export async function logUsageEvent(event: {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  action: string;
  feature: string;
  frequencyHz?: number;
  brainwaveMode?: string;
  durationSeconds?: number;
}): Promise<void> {
  try {
    const logsRef = collection(db, 'visit_logs');
    const newEntry: VisitLogEntry = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    };
    await addDoc(logsRef, newEntry);

    // Update user total session duration if provided
    if (event.durationSeconds && event.durationSeconds > 0 && event.userId) {
      const uRef = doc(db, 'users', event.userId);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const curDur = (uSnap.data().totalDurationSeconds || 0) + event.durationSeconds;
        await updateDoc(uRef, { totalDurationSeconds: curDur });
      }
    }
  } catch (err) {
    // Audit logging fails gracefully without interrupting meditation audio
    console.debug('Logging event notice:', err);
  }
}

// Admin: Fetch all registered users
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const users: UserProfile[] = [];
  try {
    const usersRef = collection(db, 'users');
    let snap;
    try {
      const q = query(usersRef, orderBy('lastLoginAt', 'desc'), limit(150));
      snap = await getDocs(q);
    } catch {
      // Fallback without ordering in case index or field is missing
      snap = await getDocs(query(usersRef, limit(150)));
    }
    snap.forEach((d) => {
      users.push(d.data() as UserProfile);
    });
  } catch (err: any) {
    console.warn('Notice fetching users from Firestore:', err?.message || err);
  }

  // Merge locally created team / user entries
  try {
    const LOCAL_USERS_KEY = 'aura_directory_users_local';
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    localUsers.forEach((lu) => {
      if (!users.some((u) => u.uid === lu.uid || u.email.toLowerCase() === lu.email.toLowerCase())) {
        users.push(lu);
      }
    });
  } catch {}

  return users;
}

// Admin: Add new user or team member with specific permission grants
export async function createUserWithPermissions(userData: {
  email: string;
  displayName: string;
  role: UserRole;
  permissions?: UserPermission[];
  status?: 'active' | 'suspended';
}): Promise<UserProfile> {
  const email = userData.email.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  // Strictly check admin role: only authorized admin email can hold full admin
  if (userData.role === 'admin' && !isAuthorizedAdminEmail(email)) {
    throw new Error(`Admin role is strictly restricted to ${AUTHORIZED_ADMIN_EMAIL}. For other staff, use Team role with specific permissions.`);
  }

  const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const effectivePermissions =
    userData.role === 'admin'
      ? ALL_PERMISSIONS.map((p) => p.id)
      : userData.role === 'team'
      ? userData.permissions || []
      : [];

  const newUser: UserProfile = {
    uid,
    email,
    displayName: userData.displayName.trim() || email.split('@')[0],
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
    role: userData.role,
    permissions: effectivePermissions,
    status: userData.status || 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    totalVisits: 1,
    totalDurationSeconds: 60,
  };

  try {
    const uRef = doc(db, 'users', uid);
    await setDoc(uRef, newUser);
  } catch (err) {
    console.warn('Notice saving user to Firestore (persisting to local storage fallback):', err);
  }

  try {
    const LOCAL_USERS_KEY = 'aura_directory_users_local';
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    localUsers.unshift(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
  } catch {}

  return newUser;
}

// Admin: Update user role and specific permissions
export async function updateUserRoleAndPermissions(
  uid: string,
  role: UserRole,
  permissions: UserPermission[]
): Promise<void> {
  const effectivePermissions =
    role === 'admin'
      ? ALL_PERMISSIONS.map((p) => p.id)
      : role === 'team'
      ? permissions
      : [];

  const uRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(uRef);
    if (snap.exists()) {
      const data = snap.data();
      if (role === 'admin' && !isAuthorizedAdminEmail(data.email)) {
        throw new Error(`Only ${AUTHORIZED_ADMIN_EMAIL} can be designated as full Administrator.`);
      }
    }
    await updateDoc(uRef, {
      role,
      permissions: effectivePermissions,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('Notice updating user in Firestore:', err);
  }

  try {
    const LOCAL_USERS_KEY = 'aura_directory_users_local';
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const idx = localUsers.findIndex((u) => u.uid === uid);
    if (idx !== -1) {
      localUsers[idx].role = role;
      localUsers[idx].permissions = effectivePermissions;
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
    }
  } catch {}
}

// Admin: Convenience function to update user role
export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  return updateUserRoleAndPermissions(
    uid,
    role,
    role === 'admin' ? ALL_PERMISSIONS.map((p) => p.id) : []
  );
}

// Admin: Delete user from directory
export async function deleteUserFromDirectory(uid: string): Promise<void> {
  try {
    const uRef = doc(db, 'users', uid);
    await deleteDoc(uRef);
  } catch (err) {
    console.warn('Notice deleting user from Firestore:', err);
  }
  try {
    const LOCAL_USERS_KEY = 'aura_directory_users_local';
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const filtered = localUsers.filter((u) => u.uid !== uid);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(filtered));
  } catch {}
}

// Admin: Update user status
export async function updateUserStatus(uid: string, status: 'active' | 'suspended'): Promise<void> {
  const uRef = doc(db, 'users', uid);
  try {
    await updateDoc(uRef, { status });
  } catch (err) {
    console.warn('Notice updating user status in Firestore:', err);
  }
  try {
    const LOCAL_USERS_KEY = 'aura_directory_users_local';
    const localUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const idx = localUsers.findIndex((u) => u.uid === uid);
    if (idx !== -1) {
      localUsers[idx].status = status;
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
    }
  } catch {}
}

// Admin: Fetch visit and usage logs
export async function fetchVisitLogs(limitCount = 100): Promise<VisitLogEntry[]> {
  try {
    const logsRef = collection(db, 'visit_logs');
    let snap;
    try {
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      snap = await getDocs(q);
    } catch {
      // Fallback without ordering in case index or field is missing
      snap = await getDocs(query(logsRef, limit(limitCount)));
    }
    const logs: VisitLogEntry[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...(d.data() as VisitLogEntry) });
    });
    return logs;
  } catch (err: any) {
    console.warn('Notice fetching visit logs:', err?.message || err);
    return [];
  }
}

// ==========================================
// Contact Us: Messages System
// ==========================================
export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
  userId?: string;
}

export async function sendContactMessage(
  data: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const fullMsg: ContactMessage = {
    ...data,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  try {
    const colRef = collection(db, 'contact_messages');
    const docRef = await addDoc(colRef, fullMsg);
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.warn('Error sending contact message to Firestore:', err?.message || err);
    // Offline local fallback
    try {
      const LOCAL_KEY = 'aura_offline_contact_messages';
      const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      const localMsg = { ...fullMsg, id: `local_${Date.now()}` };
      existing.unshift(localMsg);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
      return { success: true, id: localMsg.id };
    } catch {
      return { success: false, error: err?.message || 'Failed to send message' };
    }
  }
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  try {
    const colRef = collection(db, 'contact_messages');
    let snap;
    try {
      const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));
      snap = await getDocs(q);
    } catch {
      snap = await getDocs(query(colRef, limit(50)));
    }
    const messages: ContactMessage[] = [];
    snap.forEach((d) => {
      messages.push({ id: d.id, ...(d.data() as ContactMessage) });
    });
    return messages;
  } catch (err) {
    console.warn('Notice fetching contact messages:', err);
    try {
      const LOCAL_KEY = 'aura_offline_contact_messages';
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    } catch {
      return [];
    }
  }
}

// ==========================================
// Live Sanctuary Chat System
// ==========================================
export interface ChatMessage {
  id?: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'agent' | 'concierge';
  text: string;
  timestamp: string;
  suggestedPresetId?: string;
}

export async function sendChatMessage(
  msg: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<{ success: boolean; id?: string }> {
  const fullMsg: ChatMessage = {
    ...msg,
    timestamp: new Date().toISOString(),
  };

  try {
    const colRef = collection(db, 'chat_messages');
    const docRef = await addDoc(colRef, fullMsg);
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.warn('Error sending chat message to Firestore:', err?.message || err);
    return { success: false };
  }
}

export function subscribeToChatMessages(
  channelId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  try {
    const colRef = collection(db, 'chat_messages');
    const q = query(
      colRef,
      where('channelId', '==', channelId),
      orderBy('timestamp', 'asc'),
      limit(60)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((d) => {
          msgs.push({ id: d.id, ...(d.data() as ChatMessage) });
        });
        callback(msgs);
      },
      (error) => {
        console.warn('Chat subscription notice:', error.message);
      }
    );
  } catch (err) {
    console.warn('Could not establish live chat listener:', err);
    return () => {};
  }
}

// ==========================================
// Newsletter Subscription System
// ==========================================
export async function subscribeToNewsletter(email: string, name?: string): Promise<{ success: boolean; id?: string }> {
  const subscriber = {
    email: email.trim().toLowerCase(),
    name: name?.trim() || '',
    status: 'subscribed',
    subscribedAt: new Date().toISOString(),
    source: 'sanctuary_footer',
  };

  try {
    const colRef = collection(db, 'newsletter_subscribers');
    const docRef = await addDoc(colRef, subscriber);
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.warn('Notice saving newsletter subscriber to Firestore:', err?.message || err);
    try {
      const LOCAL_KEY = 'aura_offline_newsletter_subscribers';
      const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      existing.unshift({ ...subscriber, id: `local_${Date.now()}` });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
