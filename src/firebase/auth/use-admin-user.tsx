'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, Auth } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase/provider'; // Use the hook to get auth instance

// The state no longer needs to hold the user object, only the admin status.
export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

// This hook is now completely standalone and dedicated to admin checks.
export const useAdminUser = (): AdminAuthState & { refreshToken: () => Promise<void> } => {
  const auth = useFirebaseAuth(); // Get auth instance from context
  const [state, setState] = useState<AdminAuthState>({
    user: null, // We still need the user object internally for refreshing tokens
    isAdmin: false,
    isAuthCheckComplete: false, // Start as false
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      console.log('[AdminAuth] Auth service not yet available.');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // If there's no user, they are not an admin. The check is complete.
        setState({
          user: null,
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      try {
        // A user is logged in, now check their token for the admin claim.
        const tokenResult = await firebaseUser.getIdTokenResult(false); // false = don't force refresh
        const adminStatus = !!tokenResult.claims.admin;
        
        setState({
          user: firebaseUser, // Keep user internally for token refreshes
          isAdmin: adminStatus,
          isAuthCheckComplete: true,
          userError: null,
        });
      } catch (err: any) {
        // If token fetching fails, they can't be an admin.
        setState({
          user: firebaseUser,
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: err,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  // Function to manually force a token refresh.
  const refreshToken = async () => {
    if (!state.user) {
      return;
    }
    await state.user.getIdToken(true); // Force refresh
    const tokenResult = await state.user.getIdTokenResult(true);
    const newIsAdmin = !!tokenResult.claims.admin;
    setState((prev) => ({
      ...prev,
      isAdmin: newIsAdmin,
      isAuthCheckComplete: true,
    }));
  };

  return { ...state, refreshToken };
};
