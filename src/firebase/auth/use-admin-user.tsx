
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
      // If auth service isn't ready, mark check as complete but not admin.
      if (!state.isAuthCheckComplete) {
         setState({ isAdmin: false, isAuthCheckComplete: true, userError: new Error("Auth service not available.") });
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        // No user is logged in. The check is complete, and they are not an admin.
        setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      // A user is logged in. Force a refresh of the ID token to get the latest claims.
      // This is the critical step to ensure we have up-to-date information.
      try {
        const idTokenResult = await firebaseUser.getIdTokenResult(true); // true == force refresh
        const hasAdminClaim = !!idTokenResult.claims.admin;
        
        // The check is now complete. Set the admin status based on the refreshed token.
        setState({
          isAdmin: hasAdminClaim,
          isAuthCheckComplete: true,
          userError: null,
        });

      } catch (error: any) {
        // An error occurred while trying to get the token.
        setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: error,
        });
      }
    });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, [auth]); // Rerun the effect if the auth instance changes

  return state;
};
