'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Auth, IdTokenResult } from 'firebase/auth';
import { useAuth } from '../provider';

export interface AdminAuthState {
  isAdmin: boolean;
  isUserLoading: boolean;
  isAuthCheckComplete: boolean;
  adminTokenResult: IdTokenResult | null;
}

export const useAdminUser = (): AdminAuthState => {
  const { user, isUserLoading: isUserAuthLoading, isAuthCheckComplete: isUserAuthCheckComplete } = useUser();
  const auth = useAuth() as Auth;
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminTokenResult, setAdminTokenResult] = useState<IdTokenResult | null>(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState<boolean>(false);

  useEffect(() => {
    const checkForAdminClaim = async () => {
      if (isUserAuthLoading) {
        // We're still waiting for the initial user auth state to be determined.
        return;
      }

      if (!user) {
        // User is not logged in. They are not an admin.
        setIsAdmin(false);
        setAdminTokenResult(null);
        setIsAuthCheckComplete(true);
        return;
      }
      
      try {
        // Force refresh the token to get the latest custom claims.
        const idTokenResult = await user.getIdTokenResult(true);
        const hasAdminClaim = !!idTokenResult.claims.admin;

        setIsAdmin(hasAdminClaim);
        setAdminTokenResult(idTokenResult);
      } catch (error) {
        console.error("Error checking for admin claim:", error);
        setIsAdmin(false);
        setAdminTokenResult(null);
      } finally {
        setIsAuthCheckComplete(true);
      }
    };

    checkForAdminClaim();
  }, [user, isUserAuthLoading, isUserAuthCheckComplete, auth]);

  return { 
    isAdmin, 
    isUserLoading: !isAuthCheckComplete && isUserAuthLoading, 
    isAuthCheckComplete, 
    adminTokenResult 
  };
};
