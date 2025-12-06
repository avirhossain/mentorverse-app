'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, Auth } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase/provider'; 

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
  checkAdminStatus: () => Promise<boolean>;
}

export const useAdminUser = (): AdminAuthState => {
  const auth = useFirebaseAuth();
  const [state, setState] = useState<Omit<AdminAuthState, 'checkAdminStatus'>>({
    user: auth?.currentUser || null,
    isAdmin: false,
    isAuthCheckComplete: false,
    userError: null,
  });

  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    if (!auth?.currentUser) {
      setState(s => ({ ...s, isAdmin: false }));
      return false;
    }
    try {
      const tokenResult = await auth.currentUser.getIdTokenResult(true); // Force refresh
      const newIsAdmin = !!tokenResult.claims.admin;
      setState(s => ({ ...s, isAdmin: newIsAdmin, user: auth.currentUser, isAuthCheckComplete: true }));
      return newIsAdmin;
    } catch (err: any) {
      setState(s => ({ ...s, isAdmin: false, userError: err, isAuthCheckComplete: true }));
      return false;
    }
  }, [auth]);

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
      // Initial check on page load
      await checkAdminStatus();
    });

    return () => {
      unsubscribe();
    };
  }, [auth, checkAdminStatus]);

  return { ...state, checkAdminStatus };
};
