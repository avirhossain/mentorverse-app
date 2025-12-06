'use client';

import React, { useEffect } from 'react';
import { notFound } from 'next/navigation'; // Import the notFound function
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
    if (isAuthCheckComplete && !isAdmin) {
      // If the check is done and the user is NOT an admin,
      // render the 404 "Not Found" page.
      notFound();
    }
  }, [isAuthCheckComplete, isAdmin]);

  if (!isAuthCheckComplete || !isAdmin) {
    // While the check is running, or if the user is not an admin (and is about to see a 404),
    // show a loading state. This prevents a flash of content for unauthorized users.
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

  // If all checks pass (auth check complete AND user is an admin), render the children.
  return <>{children}</>;
}
