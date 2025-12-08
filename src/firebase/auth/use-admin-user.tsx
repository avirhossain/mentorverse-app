'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { User, getIdTokenResult } from 'firebase/auth';

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isUserLoading: boolean;
  userError: Error | null;
}

export const useAdminUser = (): AdminAuthState => {
  const { user, isUserLoading, userError } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      // If the user object is still loading, we can't check for admin status.
      return;
    }

    if (!user) {
      // If there's no user, they can't be an admin.
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }

    // User is available, now check for the admin custom claim.
    getIdTokenResult(user)
      .then((idTokenResult) => {
        // The 'admin' claim is a custom claim set on the user's token.
        // It must be set via the Firebase Admin SDK on a backend.
        const isAdminClaim = idTokenResult.claims.admin === true;
        setIsAdmin(isAdminClaim);
      })
      .catch((error) => {
        console.error('Error getting ID token result:', error);
        setIsAdmin(false);
      })
      .finally(() => {
        setIsCheckingAdmin(false);
      });
  }, [user, isUserLoading]);

  return {
    user,
    isAdmin,
    // The overall loading state depends on both the user loading and admin check.
    isUserLoading: isUserLoading || isCheckingAdmin,
    userError,
  };
};
