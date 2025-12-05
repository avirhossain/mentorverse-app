
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
    // If auth check is not complete, we wait.
    if (!isAuthCheckComplete) {
      return;
    }

    // If auth check is complete, and the user is on the login page...
    if (isLoginPage) {
      // ...and they are an admin, redirect them to the dashboard.
      if (isAdmin) {
        router.push('/admin');
      }
      // Otherwise, they can stay on the login page.
    } else {
      // For any other admin page, if the user is not an admin, redirect them away.
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [user, isAdmin, isAuthCheckComplete, router, pathname, isLoginPage]);
  
  // If we are on the login page, and the user isn't an admin yet, render it.
  if (isLoginPage && !isAdmin) {
    return <>{children}</>;
  }


  // While checking authentication or if the user isn't an admin, show a loading state for protected pages.
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

  // If the user is an admin and the auth check is complete, render the protected admin content.
  return <>{children}</>;
}
