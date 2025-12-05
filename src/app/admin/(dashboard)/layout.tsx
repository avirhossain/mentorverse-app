
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isAuthCheckComplete } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial authentication check is complete.
    if (!isAuthCheckComplete) {
      // While checking, show a loading skeleton to prevent content flash.
      return;
    }

    // If the check is complete and the user is not an admin,
    // force them to the admin login page without logging them out.
    if (!isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isAuthCheckComplete, router]);
  
  // While the auth check is running OR if the user has been found to not be an admin
  // (and is being redirected), show a loading skeleton.
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
  
  // If the auth check is complete and the user is a confirmed admin, render the dashboard content.
  return <>{children}</>;
}
