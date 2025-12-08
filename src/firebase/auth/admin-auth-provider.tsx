'use client';

import React, { type ReactNode } from 'react';
import { useAdminUser } from './use-admin-user';
import { useRouter } from 'next/navigation';
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

  React.useEffect(() => {
    // If the user check is complete and the user is not an admin, redirect.
    if (!isUserLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isUserLoading, router]);

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

  // If not loading and not an admin, render nothing as a redirect is in progress.
  return null;
}
