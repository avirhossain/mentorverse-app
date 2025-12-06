'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, Auth } from 'firebase/auth';

export interface UserAuthState {
  user: User | null;
  isAdmin: boolean;
  isUserLoading: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

export const useUser = (auth: Auth | null): UserAuthState & { refreshToken: () => Promise<void> } => {
  const [state, setState] = useState<UserAuthState>({
    user: null,
    isAdmin: false,
    isUserLoading: true,
    isAuthCheckComplete: false,
    userError: null,
  });

  useEffect(() => {
    console.log('[useUser] Hook initialized. Auth object available:', !!auth);
    if (!auth) {
      console.log('[useUser] Auth service not available. Setting non-authed state.');
      setState({
        user: null,
        isAdmin: false,
        isUserLoading: false,
        isAuthCheckComplete: true,
        userError: new Error("Auth service not available."),
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[useUser] onAuthStateChanged fired. User:', firebaseUser?.email || 'null');
      if (!firebaseUser) {
        console.log('[useUser] No user found. Setting logged-out state.');
        setState({
          user: null,
          isAdmin: false,
          isUserLoading: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      console.log('[useUser] User found. Getting ID token result without force refresh...');
      try {
        // Do NOT force refresh here. Let's get the state as quickly as possible.
        // The login page will be responsible for the forced refresh.
        const tokenResult = await firebaseUser.getIdTokenResult(false); 
        console.log('[useUser] Successfully got initial ID token. Claims:', tokenResult.claims);
        
        const adminStatus = !!tokenResult.claims.admin;
        console.log(`[useUser] isAdmin evaluated to: ${adminStatus}`);

        const finalState = {
          user: firebaseUser,
          isAdmin: adminStatus,
          isUserLoading: false,
          isAuthCheckComplete: true,
          userError: null,
        };
        console.log('[useUser] Setting final state:', finalState);
        setState(finalState);

      } catch (err: any) {
        console.error('[useUser] Error getting token result:', err);
        setState({
          user: firebaseUser,
          isAdmin: false,
          isUserLoading: false,
          isAuthCheckComplete: true,
          userError: err,
        });
      }
    });

    return () => {
      console.log('[useUser] Unsubscribing from onAuthStateChanged.');
      unsubscribe();
    };
  }, [auth]);

  const refreshToken = async () => {
    if (!state.user) return;
    console.log('[useUser] refreshToken called.');
    // Force refresh the token
    await state.user.getIdToken(true);
    // Get the new result
    const tokenResult = await state.user.getIdTokenResult(true);
    const newIsAdmin = !!tokenResult.claims.admin;
    console.log(`[useUser] Token refreshed. New isAdmin status: ${newIsAdmin}`);
    // Update the state with the new claim
    setState((prev) => ({
      ...prev,
      isAdmin: newIsAdmin,
    }));
  };

  return { ...state, refreshToken };
};
