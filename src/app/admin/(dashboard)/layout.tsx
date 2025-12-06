
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthCheckComplete } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('[AdminLayout Effect] Checking auth state:', { isAuthCheckComplete, user: !!user, isAdmin });
    
    // Once the initial auth check is complete, decide what to do.
    if (isAuthCheckComplete) {
      // If there's no user or the user is not an admin, redirect to the login page.
      if (!user || !isAdmin) {
        console.log('[AdminLayout Effect] No user or not admin. Redirecting to login.');
        router.push('/admin/login');
      }
    }
  }, [isAuthCheckComplete, user, isAdmin, router]);

  // 1. While the auth check is running, show a loading screen.
  if (!isAuthCheckComplete || !isAdmin || !user) {
    console.log('[AdminLayout Render] Showing loading skeleton. State:', { isAuthCheckComplete, isAdmin: !!isAdmin, user: !!user });
    return (
      <div className="flex flex-col min-h-screen">
         <Header currentView="admin" />
        <div className="flex-1 flex items-center justify-center">
            <div className="p-8 text-center">
                <p className="text-lg font-semibold">Verifying authentication...</p>
                <Skeleton className="h-4 w-48 mt-4 mx-auto" />
            </div>
        </div>
      </div>
    );
  }

  // 4. If all checks pass (auth check complete, user exists, user is admin), render the dashboard.
  console.log('[AdminLayout Render] Auth check complete, user is admin. Rendering dashboard.');
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      {children}
    </div>
  );
}
