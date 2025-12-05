
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import type { AdminUser } from '@/lib/types';


// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isAdmin: boolean;
  isUserLoading: boolean;
  isAuthCheckComplete: boolean;
  userError: Error | null;
  refreshToken: () => Promise<void>; // Add the refreshToken function
}

// Combined state for the Firebase context
export interface FirebaseContextState extends UserAuthState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser extends FirebaseContextState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult extends UserAuthState {}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<{
    children: ReactNode;
    firebaseApp: FirebaseApp | null;
    firestore: Firestore | null;
    auth: Auth | null;
}> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<Omit<UserAuthState, 'refreshToken'>>({
    user: null,
    isAdmin: false,
    isUserLoading: true,
    isAuthCheckComplete: false,
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isAdmin: false, isUserLoading: false, isAuthCheckComplete: true, userError: new Error("Auth service not provided.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
            try {
                // Force refresh to get the latest claims
                const idTokenResult = await firebaseUser.getIdTokenResult(true);
                const isAdmin = !!idTokenResult.claims.admin;
                
                setUserAuthState({ user: firebaseUser, isAdmin: isAdmin, isUserLoading: false, isAuthCheckComplete: true, userError: null });

            } catch (error) {
                 console.error("FirebaseProvider: Error checking admin status:", error);
                 setUserAuthState({ user: firebaseUser, isAdmin: false, isUserLoading: false, isAuthCheckComplete: true, userError: error as Error });
            }
        } else {
            // No user is logged in
            setUserAuthState({ user: null, isAdmin: false, isUserLoading: false, isAuthCheckComplete: true, userError: null });
        }
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isAdmin: false, isUserLoading: false, isAuthCheckComplete: true, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const refreshToken = useCallback(async () => {
    if (auth?.currentUser) {
      try {
        const idTokenResult = await auth.currentUser.getIdTokenResult(true);
        const newIsAdmin = !!idTokenResult.claims.admin;
        setUserAuthState(prevState => {
          if (prevState.isAdmin !== newIsAdmin) {
            return { ...prevState, isAdmin: newIsAdmin };
          }
          return prevState;
        });
      } catch (error) {
        console.error("Error refreshing token:", error);
        setUserAuthState(prevState => ({...prevState, userError: error as Error}));
      }
    }
  }, [auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      ...userAuthState,
      refreshToken, // Add to context
    };
  }, [firebaseApp, firestore, auth, userAuthState, refreshToken]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return context as FirebaseServicesAndUser;
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth | null => {
  return useContext(FirebaseContext)?.auth ?? null;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  return useContext(FirebaseContext)?.firestore ?? null;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  return useContext(FirebaseContext)?.firebaseApp ?? null;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }
  const { user, isUserLoading, userError, isAdmin, isAuthCheckComplete, refreshToken } = context;
  return { user, isUserLoading, userError, isAdmin, isAuthCheckComplete, refreshToken };
};
