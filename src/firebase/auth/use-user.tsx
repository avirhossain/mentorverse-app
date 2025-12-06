'use client';

import { useState, useEffect, useContext } from 'react';
import { User, onAuthStateChanged, Auth } from 'firebase/auth';
import { FirebaseContext } from '@/firebase/provider';

export interface UserAuthState {
  user: User | null;
  isAdmin: boolean;
  isUserLoading: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

// This is the internal hook implementation.
export const useUserHook = (auth: Auth | null): UserAuthState & { refreshToken: () => Promise<void> } => {
  const [state, setState] = useState<UserAuthState>({
    user: null,
    isAdmin: false,
    isUserLoading: true,
    isAuthCheckComplete: false,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
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
      if (!firebaseUser) {
        setState({
          user: null,
          isAdmin: false,
          isUserLoading: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      try {
        const tokenResult = await firebaseUser.getIdTokenResult(false); 
        const adminStatus = !!tokenResult.claims.admin;
        const finalState = {
          user: firebaseUser,
          isAdmin: adminStatus,
          isUserLoading: false,
          isAuthCheckComplete: true,
          userError: null,
        };
        setState(finalState);
      } catch (err: any) {
        setState({
          user: firebaseUser,
          isAdmin: false,
          isUserLoading: false,
          isAuthCheckComplete: true,
          userError: err,
        });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const refreshToken = async () => {
    if (!state.user) return;
    await state.user.getIdToken(true);
    const tokenResult = await state.user.getIdTokenResult(true);
    const newIsAdmin = !!tokenResult.claims.admin;
    setState((prev) => ({
      ...prev,
      isAdmin: newIsAdmin,
      isAuthCheckComplete: true, // Ensure this is true after refresh
    }));
  };

  return { ...state, refreshToken };
};


// This is the public hook that components will use.
export const useUser = (): UserAuthState & { refreshToken: () => Promise<void> } => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }

  // The 'refreshToken' function is already part of the context value.
  return context as UserAuthState & { refreshToken: () => Promise<void> };
};
