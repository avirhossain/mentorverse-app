
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
        // Not logged in, so definitely not an admin.
        setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: null,
        });
        return;
      }

      // User is logged in. Now, we listen for our Firestore signal.
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const firestoreUnsubscribe = onSnapshot(userDocRef, async (snapshot) => {
        
        // The `lastLogin` field is our signal. If it's present, we check the token.
        // The snapshot listener will fire on login when the `lastLogin` field is updated.
        if (snapshot.exists() && snapshot.data()?.lastLogin) {
          try {
            // The signal was received. Force a token refresh to get the latest claims.
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
        }
        // If there's no `lastLogin` field, we don't do anything yet,
        // just wait for the login page to provide the signal.
        // We can set a timeout here to prevent waiting forever.
        // For now, if the user is logged in but we don't get the signal,
        // we'll eventually need to time out and consider them not an admin for this session.
        
      }, (error) => {
         setState({
          isAdmin: false,
          isAuthCheckComplete: true,
          userError: error,
        });
      });
      
      // Return the cleanup function for the Firestore listener
      return () => firestoreUnsubscribe();
    });

    // Return the cleanup function for the Auth listener
    return () => authUnsubscribe();
  }, [auth, firestore]);

  return state;
};
