'use client';

import { useState, useEffect } from 'react';
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
    user: auth?.currentUser || null, // Initialize with current user if available
    isAdmin: false,
    isAuthCheckComplete: false,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      // If auth service is not ready, mark check as complete with no user/admin.
      if (!state.isAuthCheckComplete) {
         setState(s => ({ ...s, isAuthCheckComplete: true, user: null, isAdmin: false }));
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // If there's no user, they are not an admin. The check is complete.
        setState({
          user: null,
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      try {
        // A user is logged in, now check their token for the admin claim.
        // Force refresh to ensure we have the latest claims.
        const tokenResult = await firebaseUser.getIdTokenResult(true); 
        const adminStatus = !!tokenResult.claims.admin;
        
        setState({
          user: firebaseUser,
          isAdmin: adminStatus,
          isAuthCheckComplete: true,
          userError: null,
        });
      } catch (err: any) {
        // If token fetching fails, they can't be an admin.
        setState({
          user: firebaseUser,
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: err,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  return state;
};
