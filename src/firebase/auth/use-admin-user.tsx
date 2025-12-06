
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
      console.log('[useAdminUser:useEffect] Auth service not yet available.');
      return;
    }

    console.log('[useAdminUser:useEffect] Setting up onAuthStateChanged listener.');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // If there's no user, they are not an admin. The check is complete.
        console.log('[useAdminUser:onAuthStateChanged] No user found. Setting isAdmin: false.');
        setState({
          user: null,
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      console.log('[useAdminUser:onAuthStateChanged] User detected:', firebaseUser.uid, '. Checking for admin claim...');
      try {
        // A user is logged in, now check their token for the admin claim.
        const tokenResult = await firebaseUser.getIdTokenResult(true); // true = force refresh to ensure latest claims
        const adminStatus = !!tokenResult.claims.admin;
        
        console.log('[useAdminUser:onAuthStateChanged] Admin claim found:', tokenResult.claims.admin, '. Setting isAdmin:', adminStatus);
        
        setState({
          user: firebaseUser, // Keep user internally for token refreshes
          isAdmin: adminStatus,
          isAuthCheckComplete: true,
          userError: null,
        });
      } catch (err: any) {
        console.error('[useAdminUser:onAuthStateChanged] Error fetching token:', err);
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
      console.log('[useAdminUser:useEffect] Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, [auth]);

  // Function to manually force a token refresh.
  const refreshToken = async () => {
    if (!state.user) {
      console.log('[useAdminUser:refreshToken] No user to refresh.');
      return;
    }
    console.log('[useAdminUser:refreshToken] Forcing token refresh for user:', state.user.uid);
    await state.user.getIdToken(true); // Force refresh
    const tokenResult = await state.user.getIdTokenResult(true);
    const newIsAdmin = !!tokenResult.claims.admin;
    console.log('[useAdminUser:refreshToken] Refresh complete. New admin status:', newIsAdmin);
    setState((prev) => ({
      ...prev,
      isAdmin: newIsAdmin,
      isAuthCheckComplete: true, // Ensure this stays true
    }));
  };

  return { ...state, refreshToken };
};
