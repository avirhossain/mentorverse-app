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
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Wait until the initial authentication check is complete.
    if (!isAuthCheckComplete) {
      return;
    }

    // If the user is a confirmed admin...
    if (isAdmin) {
      // ...and they are on the login page, redirect them to the dashboard.
      if (isLoginPage) {
        router.push('/admin');
      }
    } else {
      // If the user is NOT an admin and they are NOT on the login page,
      // force them to the login page.
      if (!isLoginPage) {
        router.push('/admin/login');
      }
    }
  }, [isAdmin, isAuthCheckComplete, router, isLoginPage, pathname]);
  
  // If authentication is still loading and we are on a protected page, show a skeleton screen.
  if (!isAuthCheckComplete && !isLoginPage) {
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
  
  // Render the children (either the login page for non-admins, or the dashboard for admins).
  // The useEffect above handles all redirection logic.
  return <>{children}</>;
}