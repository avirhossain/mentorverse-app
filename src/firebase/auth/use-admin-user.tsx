
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase/provider'; 

export interface AdminAuthState {
  isAdmin: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

export const useAdminUser = (): AdminAuthState => {
  const auth = useFirebaseAuth();

  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isAuthCheckComplete: false,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      if (!state.isAuthCheckComplete) {
         setState(s => ({ ...s, isAuthCheckComplete: true, isAdmin: false }));
      }
      return;
    }

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        // NOT LOGGED IN: Check is complete, user is not an admin.
        return setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
      }

      // LOGGED IN: User is authenticated. Force a token refresh to get latest claims.
      try {
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        const hasAdminClaim = !!idTokenResult.claims.admin;
        
        setState({
          isAdmin: hasAdminClaim,
          isAuthCheckComplete: true,
          userError: null,
        });

      } catch (error: any) {
        setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: error,
        });
      }
    }, (error) => {
        // Handle errors from the listener itself
        setState({
            isAdmin: false,
            isAuthCheckComplete: true,
            userError: error,
        });
    });

    return () => authUnsubscribe();
    // The dependency array is intentionally empty to run this effect only once.
    // The onAuthStateChanged listener handles all subsequent auth state changes.
  }, [auth]);

  return state;
};
