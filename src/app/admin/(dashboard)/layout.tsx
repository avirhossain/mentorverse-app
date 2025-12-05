
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
    // Log the state every time the effect runs
    console.log('[AdminLayout] Auth Check:', { isAuthCheckComplete, isAdmin, user: !!user });

    // Wait until the initial authentication check is complete.
    if (!isAuthCheckComplete) {
      console.log('[AdminLayout] Waiting for auth check to complete...');
      return;
    }

    // If the check is complete and the user is not an admin,
    // force them to the admin login page.
    if (!isAdmin) {
      console.log('[AdminLayout] Not an admin. Redirecting to /admin/login');
      router.push('/admin/login');
    } else {
      console.log('[AdminLayout] Admin access granted.');
    }
  }, [isAdmin, isAuthCheckComplete, router, user]);
  
  // If authentication is still loading OR if the user is not yet confirmed as an admin,
  // show a skeleton screen to prevent flashing the admin content to non-admin users.
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
  
  // If the user is a confirmed admin, render the admin dashboard content.
  return <>{children}</>;
}
