
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
        if (!state.isAuthCheckComplete) {
          setState({
            isAdmin: false,
            isAuthCheckComplete: true,
            userError: null,
          });
        }
        return;
      }

      // LOGGED IN: User is authenticated. Now, listen for our Firestore signal.
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const firestoreUnsubscribe = onSnapshot(userDocRef, async (snapshot) => {
        
        const handleClaimCheck = async () => {
           try {
              // Force a token refresh to get the latest claims.
              const idTokenResult = await firebaseUser.getIdTokenResult(true);
              const hasAdminClaim = !!idTokenResult.claims.admin;
              
              if (!state.isAuthCheckComplete || state.isAdmin !== hasAdminClaim) {
                setState({
                  isAdmin: hasAdminClaim,
                  isAuthCheckComplete: true,
                  userError: null,
                });
              }

            } catch (error: any) {
               if (!state.isAuthCheckComplete) {
                  setState({
                    isAdmin: false,
                    isAuthCheckComplete: true,
                    userError: error,
                  });
               }
            }
        };

        // The `lastLogin` field is our signal. If it's present, we check the token.
        if (snapshot.exists() && snapshot.data()?.lastLogin) {
          handleClaimCheck();
        } else if (!snapshot.exists()) {
            // This handles the case where an admin user might not have a doc in the 'users' collection.
            // We still want to check their claims if they successfully log in.
            handleClaimCheck();
        }
        
      }, (error) => {
         if (!state.isAuthCheckComplete) {
            setState({
              isAdmin: false,
              isAuthCheckComplete: true,
              userError: error,
            });
         }
      });
      
      return () => firestoreUnsubscribe();
    }, (error) => {
        // Handle errors from onAuthStateChanged itself
         if (!state.isAuthCheckComplete) {
            setState({
                isAdmin: false,
                isAuthCheckComplete: true,
                userError: error,
            });
         }
    });

    return () => authUnsubscribe();
  }, [auth, firestore, state.isAuthCheckComplete, state.isAdmin]);

  return state;
};
