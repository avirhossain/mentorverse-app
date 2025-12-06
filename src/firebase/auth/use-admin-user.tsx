
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase/provider'; 

export interface AdminAuthState {
  isAdmin: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
}

export const useAdminUser = (): AdminAuthState => {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isAuthCheckComplete: false,
    userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) {
      if (!state.isAuthCheckComplete) {
         setState(s => ({ ...s, isAuthCheckComplete: true, isAdmin: false }));
      }
      return;
    }

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        // NOT LOGGED IN: If there's no user, the check is complete, and they are not an admin.
        setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      // LOGGED IN: User is authenticated. Now, listen for our Firestore signal.
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const firestoreUnsubscribe = onSnapshot(userDocRef, async (snapshot) => {
        
        // The `lastLogin` field is our signal. If it's present, we check the token.
        // The snapshot listener will fire on login when the `lastLogin` field is updated.
        // It's important to check if the check is already complete to avoid re-running on other doc changes.
        if (snapshot.exists() && snapshot.data()?.lastLogin && !state.isAuthCheckComplete) {
          try {
            // Signal received. Force a token refresh to get the latest claims.
            const idTokenResult = await firebaseUser.getIdTokenResult(true);
            const hasAdminClaim = !!idTokenResult.claims.admin;
            
            setState({
              isAdmin: hasAdminClaim,
              isAuthCheckComplete: true,
              userError: null,
            });

          } catch (error: any) {
             setState({
              isAdmin: false,
              isAuthCheckComplete: true,
              userError: error,
            });
          }
        } else if (!state.isAuthCheckComplete) {
            // If the signal isn't present but we need to resolve the auth state,
            // we can check the token once without forcing a refresh.
            // This handles cases where the user is already logged in and navigating around.
            firebaseUser.getIdTokenResult().then(idTokenResult => {
                 setState({
                    isAdmin: !!idTokenResult.claims.admin,
                    isAuthCheckComplete: true,
                    userError: null,
                 });
            }).catch(error => {
                 setState({
                    isAdmin: false,
                    isAuthCheckComplete: true,
                    userError: error,
                 });
            });
        }
        
      }, (error) => {
         setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: error,
        });
      });
      
      return () => firestoreUnsubscribe();
    });

    return () => authUnsubscribe();
  }, [auth, firestore, state.isAuthCheckComplete]);

  return state;
};
