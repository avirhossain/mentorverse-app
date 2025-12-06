
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
      if (firebaseUser) {
        // TEMPORARY: Hardcoding isAdmin to true on any successful login as per user request.
        // This is insecure and should be reverted before going live.
        setState({
          isAdmin: true,
          isAuthCheckComplete: true,
          userError: null,
        });
      } else {
        // If there is no user, they are definitely not an admin.
        setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  return state;
};
