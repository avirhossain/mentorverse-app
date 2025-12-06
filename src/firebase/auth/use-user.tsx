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

      console.log('[useUser] User found. Attempting to get ID token with force refresh...');
      try {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        console.log('[useUser] Successfully got ID token. Claims:', tokenResult.claims);
        
        const adminStatus = !!tokenResult.claims.admin;
        console.log(`[useUser] isAdmin evaluated to: ${adminStatus}`);

        console.log('[useUser] Setting final state:');
        const finalState = {
          user: firebaseUser,
          isAdmin: adminStatus,
          isUserLoading: false,
          isAuthCheckComplete: true,
          userError: null,
        };
        console.log(finalState);
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
    await state.user.getIdToken(true);
    const tokenResult = await state.user.getIdTokenResult(true);
    const newIsAdmin = !!tokenResult.claims.admin;
    console.log(`[useUser] Token refreshed. New isAdmin status: ${newIsAdmin}`);
    setState((prev) => ({
      ...prev,
      isAdmin: newIsAdmin,
    }));
  };

  return { ...state, refreshToken };
};