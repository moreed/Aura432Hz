import type { SiteContentConfig, ConstructionSubscriber } from './siteContent';

/**
 * Isolated Admin Firestore sync module.
 * Only loaded dynamically on-demand inside the Admin Console,
 * ensuring public visitors never download the 539KB Firebase SDK.
 */
export async function fetchFirestoreSiteContent(): Promise<Partial<SiteContentConfig> | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const docRef = doc(db, 'system_settings', 'site_content');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Partial<SiteContentConfig>;
    }
  } catch (e) {
    console.debug('Firestore site content fetch notice:', e);
  }
  return null;
}

export async function saveFirestoreSiteContent(content: SiteContentConfig): Promise<void> {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const docRef = doc(db, 'system_settings', 'site_content');
    await setDoc(docRef, content, { merge: true });
  } catch (err) {
    console.debug('Failed to sync site content to Firestore:', err);
  }
}

export async function saveConstructionSubscriberToFirestore(subscriber: any): Promise<void> {
  try {
    const { collection, addDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const colRef = collection(db, 'construction_subscribers');
    await addDoc(colRef, subscriber);
  } catch (e) {
    console.debug('Firestore subscriber save notice:', e);
  }
}

export async function fetchConstructionSubscribersFromFirestore(): Promise<ConstructionSubscriber[]> {
  try {
    const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const colRef = collection(db, 'construction_subscribers');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ConstructionSubscriber, 'id'>),
      }));
    }
  } catch (e) {
    console.debug('Firestore subscribers query fallback:', e);
  }
  return [];
}

export async function fetchFirestoreAdminConfig(): Promise<any | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const docRef = doc(db, 'system_settings', 'admin_auth');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.debug('Firestore admin config notice:', e);
  }
  return null;
}

export async function saveFirestoreAdminConfig(updated: any): Promise<boolean> {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const docRef = doc(db, 'system_settings', 'admin_auth');
    await setDoc(docRef, updated, { merge: true });
    return true;
  } catch (err) {
    console.debug('Failed to sync admin credentials to Firestore:', err);
    return false;
  }
}
