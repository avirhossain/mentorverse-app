
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthCheckComplete, refreshToken } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      if (!isAuthCheckComplete) {
        // If auth state is not yet resolved, do nothing and wait.
        return;
      }
      
      if (!user) {
        // If auth check is complete and there's no user, redirect to login.
        router.push('/admin/login');
        return;
      }

      // User is logged in, now we need to ensure their claims are fresh.
      await refreshToken(); 
      
      // After refreshing, the `isAdmin` value from the useUser hook should be up-to-date.
      // However, to be extra safe, we check it again. The `useUser` hook will re-render
      // with the correct value, but this provides an immediate check post-refresh.
      const freshToken = await user.getIdTokenResult(true);
      if (!freshToken.claims.admin) {
        console.log("Redirecting: User is not an admin.");
        router.push('/admin/login');
      }
    }

    checkAdmin();
  }, [isAuthCheckComplete, user, router, refreshToken]);
  
  // Show a loading skeleton while we verify the user's status.
  // This state persists until `isAuthCheckComplete` is true AND `isAdmin` is confirmed to be true.
  if (!isAuthCheckComplete || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="p-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex-1 p-8 space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  // If all checks pass, render the dashboard content.
  return <>{children}</>;
}
