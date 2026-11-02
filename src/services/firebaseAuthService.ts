export async function initFirebaseSession(
  onUserChange: (user: any) => void,
  clearGuest: () => void,
  createAdminProfile: (email?: string) => any,
  getActiveAdminSession: () => any,
  getActiveGuestUser: () => any
): Promise<(() => void) | null> {
  try {
    const { auth, onAuthStateChanged, syncUserProfile, validateFirestoreConnection } = await import('./firebase');
    validateFirestoreConnection().catch(() => {});

    const unsub = onAuthStateChanged(auth, async (fbUser: any) => {
      if (fbUser) {
        try {
          const profile = await syncUserProfile(fbUser);
          onUserChange(profile);
          clearGuest();
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      } else {
        const currentAdmin = getActiveAdminSession();
        if (currentAdmin) {
          onUserChange(createAdminProfile(currentAdmin.email));
          return;
        }
        const guest = getActiveGuestUser();
        onUserChange(guest as any);
      }
    });
    return unsub;
  } catch (err) {
    console.warn('Deferred Firebase auth initialization notice:', err);
    return null;
  }
}
