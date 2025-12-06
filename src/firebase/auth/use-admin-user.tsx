
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase/provider'; 

export interface AdminAuthState {
  isAdmin: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

export const useAdminUser = (): AdminAuthState => {
  const auth = useFirebaseAuth();
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isAuthCheckComplete: false,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      if (!state.isAuthCheckComplete) {
         setState(s => ({ ...s, isAuthCheckComplete: true, isAdmin: false }));
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      try {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const newIsAdmin = !!tokenResult.claims.admin;
        
        setState({ isAdmin: newIsAdmin, isAuthCheckComplete: true, userError: null });

      } catch (err: any) {
        setState({ isAdmin: false, userError: err, isAuthCheckComplete: true });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  return state;
};
