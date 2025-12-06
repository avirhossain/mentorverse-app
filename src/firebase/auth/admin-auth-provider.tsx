
'use client';

import React, { useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useAdminUser } from '@/firebase/auth/use-admin-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/common/Header';

/**
 * This component acts as a strict gatekeeper for the admin section.
 * It uses the useAdminUser hook to check authentication and admin status,
 * and handles rendering the loading state, the children, or showing a 404 page.
 */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthCheckComplete } = useAdminUser();

  useEffect(() => {
    // This effect runs whenever the auth state changes.
    // We only make a decision once the initial authentication check is complete.
    if (isAuthCheckComplete && !isAdmin) {
      // If the check is done and the user is NOT an admin,
      // render the 404 "Not Found" page. This is a security best practice.
      notFound();
    }
  }, [isAuthCheckComplete, isAdmin]);

  // While the auth check is running, we MUST show a loading state.
  // This prevents a flash of content for unauthorized users and gives the
  // useAdminUser hook time to get the correct admin status.
  if (!isAuthCheckComplete) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
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

  // If the check is complete AND the user is an admin (because the useEffect didn't redirect),
  // then we can safely render the admin dashboard content.
  if (isAdmin) {
    return <>{children}</>;
  }

  // As a final fallback, show the loading state. This covers the brief moment
  // after the check completes but before the useEffect's `notFound()` call is processed.
  return (
      <div className="flex flex-col min-h-screen bg-background">
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
