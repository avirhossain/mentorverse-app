'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase/provider';

export interface UserAuthState {
  user: User | null;
  isAdmin: boolean;
  isUserLoading: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

export const useUser = (): UserAuthState & { refreshToken: () => Promise<void> } => {
  const auth = useFirebaseAuth();

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
        // 🔥 FIX: force refresh ID token to get the latest custom claims
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        console.log("🔥 Claims (refreshed):", tokenResult.claims);

        setState({
          user: firebaseUser,
          isAdmin: !!tokenResult.claims.admin,
          isUserLoading: false,
          isAuthCheckComplete: true,
          userError: null,
        });
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
    await state.user.getIdToken(true); // refresh
    const tokenResult = await state.user.getIdTokenResult(true);
    setState((prev) => ({
      ...prev,
      isAdmin: !!tokenResult.claims.admin,
    }));
  };

  return { ...state, refreshToken };
};
