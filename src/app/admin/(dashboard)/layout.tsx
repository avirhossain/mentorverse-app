'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthCheckComplete } = useUser();
  const router = useRouter();

  console.log('[AdminLayout] Rendering with state:', { user: !!user, isAdmin, isAuthCheckComplete });

  useEffect(() => {
    console.log('[AdminLayout] useEffect triggered. State:', { user: !!user, isAdmin, isAuthCheckComplete });

    if (!isAuthCheckComplete) {
      console.log('[AdminLayout] Auth check not complete. Waiting...');
      // If auth isn't complete yet, we don't do anything.
      return;
    }

    // Set a timer to check admin status after a delay.
    // This gives time for the custom claim to propagate after login.
    const verificationTimer = setTimeout(() => {
      console.log(`[AdminLayout] 5-second timer finished. Checking admin status now. isAdmin: ${isAdmin}`);
      // After 5 seconds, if the auth check is complete but the user is NOT an admin, redirect.
      if (!user || !isAdmin) {
        console.log('[AdminLayout] REDIRECTING to /admin/login. Reason:', !user ? 'User is not logged in.' : 'User is not an admin.');
        router.push('/admin/login');
      } else {
        console.log('[AdminLayout] User is an admin. No redirect needed.');
      }
    }, 5000); // 5-second delay

    // Cleanup function to clear the timer if the component unmounts
    return () => {
      console.log('[AdminLayout] Clearing verification timer.');
      clearTimeout(verificationTimer);
    };

  }, [user, isAdmin, isAuthCheckComplete, router]);

  // Show a loading skeleton only while the initial auth check is running.
  if (!isAuthCheckComplete) {
    console.log('[AdminLayout] Showing loading skeleton because auth check is not complete.');
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

  // If the auth check is complete, render the children immediately.
  // The useEffect timer will handle the redirect if necessary after the delay.
  console.log('[AdminLayout] Auth complete. Rendering children while timer runs.');
  return <>{children}</>;
}
