
'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, Auth } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase/provider'; 

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

export const useAdminUser = (): AdminAuthState => {
  const auth = useFirebaseAuth();
  const [state, setState] = useState<AdminAuthState>({
    user: auth?.currentUser || null,
    isAdmin: false,
    isAuthCheckComplete: false, // Start as false to indicate check is in progress
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      if (!state.isAuthCheckComplete) {
         setState(s => ({ ...s, isAuthCheckComplete: true, user: null, isAdmin: false }));
      }
      return;
    }

    // This listener is the single source of truth for the user's auth state.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If no user is logged in, the check is complete, and they are not an admin.
      if (!firebaseUser) {
        setState({
          user: null,
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      // If a user is found, we immediately check their token for the admin claim.
      // We force a refresh (true) to ensure we get the latest claims after login.
      try {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const newIsAdmin = !!tokenResult.claims.admin;
        
        // Only after the token is verified do we mark the auth check as complete.
        setState({ user: firebaseUser, isAdmin: newIsAdmin, isAuthCheckComplete: true, userError: null });

      } catch (err: any) {
        // If token verification fails for any reason, treat as a non-admin.
        // The check is complete, but the outcome is "not an admin".
        setState({ user: firebaseUser, isAdmin: false, userError: err, isAuthCheckComplete: true });
      }
    });

    // Clean up the listener when the component unmounts.
    return () => {
      unsubscribe();
    };
  // We only want this effect to run once when the auth instance is available.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  return state;
};
