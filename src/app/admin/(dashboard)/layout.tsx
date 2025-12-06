
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

  console.log('[AdminLayout] Rendering with state:', { user: !!user, isAdmin, isAuthCheckComplete });

  // 1. While the auth check is running, show a loading screen.
  // Nothing else happens until isAuthCheckComplete is true.
  if (!isAuthCheckComplete) {
    console.log('[AdminLayout] Showing loading skeleton because auth check is not complete.');
    return (
      <div className="flex flex-col min-h-screen">
         <Header currentView="admin" />
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

  // 2. Once the auth check is complete, make a final decision.
  
  // If there's no user, redirect to login.
  if (!user) {
    console.log('[AdminLayout] Auth check complete, no user found. Redirecting to login.');
    router.push('/admin/login');
    // Render a loading state while redirecting
    return (
        <div className="flex flex-col min-h-screen">
             <Header currentView="admin" />
             <div className="flex-1 flex items-center justify-center">Redirecting to login...</div>
        </div>
    );
  }

  // If there is a user, but they are not an admin, show access denied.
  if (!isAdmin) {
    console.log('[AdminLayout] Auth check complete, user is not admin. Showing Access Denied.');
     return (
         <div className="flex flex-col min-h-screen bg-background">
            <Header currentView="admin" />
            <div className="flex-1 flex items-center justify-center text-center p-8">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-t-4 border-yellow-500">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">You do not have administrative privileges.</p>
                     <Button onClick={() => router.push('/admin/login')} className="mt-6">
                        Return to Login
                    </Button>
                </div>
            </div>
        </div>
     );
  }

  // 3. If all checks pass, render the admin dashboard content.
  console.log('[AdminLayout] Auth check complete, user is admin. Rendering dashboard.');
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      {children}
    </div>
  );
}
