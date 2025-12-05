
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
    if (!isAuthCheckComplete) {
      // If the authentication check isn't complete, we don't do anything.
      // The skeleton below will be shown for protected pages.
      return;
    }

    if (isLoginPage) {
      // If we are on the login page and the user is already an admin,
      // redirect them to the main admin dashboard.
      if (isAdmin) {
        router.push('/admin');
      }
    } else {
      // If we are on any other admin page and the user is NOT an admin,
      // redirect them to the login page.
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [isAdmin, isAuthCheckComplete, router, isLoginPage]);
  
  // CASE 1: If we are on the login page, always render it (the useEffect handles redirecting away if already logged in).
  if (isLoginPage) {
    return <>{children}</>;
  }

  // CASE 2: If we are on a protected page and the user is not a verified admin yet, show a loading skeleton.
  if (!isAdmin) {
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

  // CASE 3: Auth check is complete, user is an admin, and it's not the login page. Render the protected content.
  return <>{children}</>;
}
