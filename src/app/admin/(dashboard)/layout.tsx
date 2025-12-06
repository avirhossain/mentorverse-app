
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

  // Only show a loading skeleton while the initial auth check is in progress.
  // After the check, the useEffect will either redirect or the content will be rendered.
  if (!isAuthCheckComplete) {
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
  // If they are not an admin, they will be redirected by the useEffect above.
  return <>{children}</>;
}
