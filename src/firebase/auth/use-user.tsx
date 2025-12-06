'use client';

import { useState, useEffect, useContext } from 'react';
import { User, onAuthStateChanged, Auth } from 'firebase/auth';
import { FirebaseContext } from '@/firebase/provider';

// Simplified state for a regular user, no admin checks.
export interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

// This is the internal hook implementation.
export const useUserHook = (auth: Auth | null): UserAuthState => {
  const [state, setState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    isAuthCheckComplete: false,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setState({
        user: null,
        isUserLoading: false,
        isAuthCheckComplete: true,
        userError: new Error("Auth service not available."),
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Just check for the user's existence. No claim checks needed.
      setState({
        user: firebaseUser,
        isUserLoading: false,
        isAuthCheckComplete: true,
        userError: null,
      });
    });

    return () => unsubscribe();
  }, [auth]);

  return state;
};


// This is the public hook that components will use.
// It no longer returns admin-related properties.
export const useUser = (): UserAuthState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }

  // Return only the relevant user auth state.
  return {
    user: context.user,
    isUserLoading: context.isUserLoading,
    isAuthCheckComplete: context.isAuthCheckComplete,
    userError: context.userError,
  };
};
