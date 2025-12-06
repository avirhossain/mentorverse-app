
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
    // This effect runs after the component renders and whenever its dependencies change.
    // It's the correct place to handle side effects like redirection.
    console.log('[AdminLayout Effect] Checking auth state:', { isAuthCheckComplete, user: !!user, isAdmin });
    
    // If the authentication check is complete and there's no user, redirect to login.
    if (isAuthCheckComplete && !user) {
      console.log('[AdminLayout Effect] No user found. Redirecting to login.');
      router.push('/admin/login');
    }
  }, [isAuthCheckComplete, user, isAdmin, router]);

  // 1. While the auth check is running, show a loading screen.
  if (!isAuthCheckComplete) {
    console.log('[AdminLayout Render] Showing loading skeleton because auth check is not complete.');
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

  // 2. If auth check is complete, but there's no user yet, show a redirecting message.
  // The useEffect will handle the actual navigation.
  if (!user) {
    console.log('[AdminLayout Render] No user, rendering redirecting message.');
     return (
        <div className="flex flex-col min-h-screen">
             <Header currentView="admin" />
             <div className="flex-1 flex items-center justify-center">Redirecting to login...</div>
        </div>
    );
  }

  // 3. If there is a user, but they are not an admin, show access denied.
  if (!isAdmin) {
    console.log('[AdminLayout Render] User is not admin. Showing Access Denied.');
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

  // 4. If all checks pass, render the admin dashboard content.
  console.log('[AdminLayout Render] Auth check complete, user is admin. Rendering dashboard.');
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      {children}
    </div>
  );
}
