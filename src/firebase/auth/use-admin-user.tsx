'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { User } from 'firebase/auth';

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

    // For development, we are checking the email directly.
    // In production, it's highly recommended to use custom claims.
    const isAdminEmail = user.email === 'avirhossain@gmail.com';
    setIsAdmin(isAdminEmail);
    setIsCheckingAdmin(false);

  }, [user, isUserLoading]);

  return {
    user,
    isAdmin,
    // The overall loading state depends on both the user loading and admin check.
    isUserLoading: isUserLoading || isCheckingAdmin,
    userError,
  };
};
