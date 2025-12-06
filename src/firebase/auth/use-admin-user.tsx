'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, Auth } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase/provider'; 

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

export const useAdminUser = (): AdminAuthState => {
  const auth = useFirebaseAuth();
  const [state, setState] = useState<AdminAuthState>({
    user: auth?.currentUser || null,
    isAdmin: false,
    isAuthCheckComplete: false,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      if (!state.isAuthCheckComplete) {
         setState(s => ({ ...s, isAuthCheckComplete: true, user: null, isAdmin: false }));
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setState({
          user: null,
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const newIsAdmin = !!tokenResult.claims.admin;
        setState({ user: firebaseUser, isAdmin: newIsAdmin, isAuthCheckComplete: true, userError: null });
      } catch (err: any) {
        setState({ user: firebaseUser, isAdmin: false, userError: err, isAuthCheckComplete: true });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  return state;
};
