
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';

// Define the shape of the user authentication state
export interface UserAuthState {
  user: User | null;
  isAdmin: boolean;
  isUserLoading: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
  refreshToken: () => Promise<void>;
}

/**
 * A dedicated hook to manage and provide user authentication state.
 * @param auth - The Firebase Auth instance.
 */
export const useUser = (auth: Auth | null): UserAuthState => {
  const [userState, setUserState] = useState<Omit<UserAuthState, 'refreshToken'>>({
    user: null,
    isAdmin: false,
    isUserLoading: true,
    isAuthCheckComplete: false,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({
        user: null,
        isAdmin: false,
        isUserLoading: false,
        isAuthCheckComplete: true,
        userError: new Error("Auth service not available."),
      });
      return;
    }

    // Set initial loading state
    setUserState(prevState => ({ ...prevState, isUserLoading: true }));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // First, get the token without forcing a refresh
          let idTokenResult = await firebaseUser.getIdTokenResult();
          let isAdmin = !!idTokenResult.claims.admin;

          // If the admin claim isn't present, force a refresh and check again.
          // This handles the case where claims have just been updated on the server.
          if (!isAdmin) {
            idTokenResult = await firebaseUser.getIdTokenResult(true);
            isAdmin = !!idTokenResult.claims.admin;
          }
          
          setUserState({
            user: firebaseUser,
            isAdmin,
            isUserLoading: false,
            isAuthCheckComplete: true,
            userError: null,
          });
        } catch (error) {
          console.error("Error checking admin status:", error);
          setUserState({
            user: firebaseUser, // Still set user, but flag error
            isAdmin: false,
            isUserLoading: false,
            isAuthCheckComplete: true,
            userError: error as Error,
          });
        }
      } else {
        // No user is logged in
        setUserState({
          user: null,
          isAdmin: false,
          isUserLoading: false,
          isAuthCheckComplete: true,
          userError: null,
        });
      }
    }, (error) => {
      // Handle errors from the listener itself
      console.error("onAuthStateChanged error:", error);
      setUserState({
        user: null,
        isAdmin: false,
        isUserLoading: false,
        isAuthCheckComplete: true,
        userError: error,
      });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Rerun effect if the auth instance changes

  const refreshToken = useCallback(async () => {
    const user = auth?.currentUser;
    if (user) {
      try {
        // Force refresh the ID token
        await user.getIdToken(true);
        const freshTokenResult = await user.getIdTokenResult();
        const newIsAdmin = !!freshTokenResult.claims.admin;
        
        // Update the state with the new admin status
        setUserState(prevState => ({
          ...prevState,
          isAdmin: newIsAdmin,
          user: prevState.user, // User object reference is stable
          userError: null,
        }));
      } catch (error) {
        console.error("Error refreshing token:", error);
        setUserState(prevState => ({ ...prevState, userError: error as Error }));
      }
    }
  }, [auth]);

  return {
    ...userState,
    refreshToken,
  };
};
