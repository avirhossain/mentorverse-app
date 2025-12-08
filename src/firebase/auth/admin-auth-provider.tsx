'use client';

import React, { type ReactNode } from 'react';
import { useAdminUser } from './use-admin-user';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminAuthProviderProps {
  children: ReactNode;
}

/**
 * A component that acts as a boundary for admin-only pages.
 * It checks for admin status and redirects non-admins to the admin login page.
 * It also handles the loading state while checking for authentication.
 */
export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const { isAdmin, isUserLoading } = useAdminUser();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // If auth check is done, user is not an admin, and they are NOT on the login page...
    if (!isUserLoading && !isAdmin) {
       // Redirect them to the login page.
       router.push('/admin/login');
    }
     // If auth check is done, user IS an admin, and they are on the login page...
    if (!isUserLoading && isAdmin && pathname === '/admin/login') {
      // Redirect them to the main admin dashboard.
      router.push('/admin');
    }
  }, [isAdmin, isUserLoading, router, pathname]);

  // While checking, show a loading state to prevent flashing content.
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  // If the user is an admin, render the protected content.
  if (isAdmin) {
    return <>{children}</>;
  }

  // If redirecting, or if user is not an admin, render null.
  return null;
}
