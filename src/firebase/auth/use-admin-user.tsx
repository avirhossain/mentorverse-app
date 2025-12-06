'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, Auth } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase/provider'; // Use the hook to get auth instance

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
    user: null,
    isAdmin: false,
    isAuthCheckComplete: false, // Start as false
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      console.log('[AdminAuth] Auth service not yet available.');
      // Don't set to complete until auth is available
      return;
    }

    console.log('[AdminAuth] Auth service available. Setting up onAuthStateChanged.');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AdminAuth] onAuthStateChanged fired. User:', firebaseUser?.email || 'null');
      if (!firebaseUser) {
        setState({
          user: null,
          isAdmin: false,
          isAuthCheckComplete: true, // Check is complete, no user.
          userError: null,
        });
        return;
      }

      console.log('[AdminAuth] User found. Getting initial ID token...');
      try {
        // Check for admin claim on the token.
        const tokenResult = await firebaseUser.getIdTokenResult(false); 
        const adminStatus = !!tokenResult.claims.admin;
        console.log(`[AdminAuth] Initial check: isAdmin is ${adminStatus}.`);
        setState({
          user: firebaseUser,
          isAdmin: adminStatus,
          isAuthCheckComplete: true,
          userError: null,
        });
      } catch (err: any) {
        console.error('[AdminAuth] Error getting initial token:', err);
        setState({
          user: firebaseUser,
          isAdmin: false,
          isAuthCheckComplete: true, // Still complete, but with an error.
          userError: err,
        });
      }
    });

    return () => {
      console.log('[AdminAuth] Unsubscribing from onAuthStateChanged.');
      unsubscribe();
    };
  }, [auth]); // Dependency on auth instance

  // Function to manually force a token refresh.
  const refreshToken = async () => {
    if (!state.user) {
      console.log('[AdminAuth] refreshToken called but no user is set.');
      return;
    }
    console.log('[AdminAuth] Forcing token refresh...');
    await state.user.getIdToken(true); // Force refresh
    const tokenResult = await state.user.getIdTokenResult(true);
    const newIsAdmin = !!tokenResult.claims.admin;
    console.log(`[AdminAuth] Token refreshed. New isAdmin status: ${newIsAdmin}`);
    setState((prev) => ({
      ...prev,
      isAdmin: newIsAdmin,
      isAuthCheckComplete: true, // Refresh completes the check
    }));
  };

  return { ...state, refreshToken };
};
