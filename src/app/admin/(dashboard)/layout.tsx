
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
      if (!isAuthCheckComplete) return;

      // Ensure user object is available before trying to refresh
      if (user) {
        // Force token refresh to make sure admin claim is loaded
        await refreshToken(); 
      }
      
      // Now that claims are refreshed, check isAdmin status
      // We need to get the latest isAdmin state after refreshToken,
      // but the hook might not have updated yet. Let's rely on the onAuthStateChanged logic.
      // The logic inside onAuthStateChanged in the provider is the source of truth.
      if (!isAdmin) {
        router.push('/admin/login'); // Only redirect if confirmed NOT admin
      }
    }

    checkAdmin();
  }, [isAdmin, isAuthCheckComplete, user, router, refreshToken]);

  // Show loading skeleton while the auth check is running or if the user is not an admin
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
  
  // If the checks pass, render the dashboard content.
  return <>{children}</>;
}
