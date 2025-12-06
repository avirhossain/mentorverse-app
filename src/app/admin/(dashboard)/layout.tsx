'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthCheckComplete } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial authentication check is complete before making any decisions.
    if (!isAuthCheckComplete) {
      return;
    }

    // If the check is complete and the user is either not logged in or is not an admin,
    // then redirect them to the login page.
    if (!user || !isAdmin) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, isAuthCheckComplete, router]);

  // While the auth check is running or if the user is not an admin (and is about to be redirected),
  // show a loading skeleton. This prevents a flash of the dashboard content for non-admin users.
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

  // If the auth check is complete and the user is a verified admin, render the dashboard content.
  return <>{children}</>;
}
