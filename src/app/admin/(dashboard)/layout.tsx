'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/common/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthCheckComplete } = useUser();
  const router = useRouter();

  console.log('[AdminLayout] Rendering with state:', { user: !!user, isAdmin, isAuthCheckComplete });

  useEffect(() => {
    // This effect now only handles the case where a non-admin tries to access the dashboard directly.
    // The successful login redirect is handled by the login page itself.
    if (isAuthCheckComplete && !user) {
        console.log('[AdminLayout] Auth check complete, no user found. Redirecting to login.');
        router.push('/admin/login');
    }
  }, [isAuthCheckComplete, user, router]);


  // Show a loading skeleton only while the initial auth check is running.
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

  if (isAuthCheckComplete && !isAdmin && user) {
     return (
         <div className="flex flex-col min-h-screen bg-background">
            <Header currentView="admin" />
            <div className="flex-1 flex items-center justify-center text-center p-8">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-t-4 border-yellow-500">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">You do not have administrative privileges. Please log in with an admin account.</p>
                     <Button onClick={() => router.push('/admin/login')} className="mt-6">
                        Go to Login
                    </Button>
                </div>
            </div>
        </div>
     )
  }

  // If the checks pass, render the dashboard content.
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      {children}
    </div>
  );
}
