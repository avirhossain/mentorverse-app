'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUser } from '@/firebase/auth/use-admin-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/common/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthCheckComplete } = useAdminUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the authentication check is fully complete.
    if (isAuthCheckComplete) {
      // If the user is NOT an admin, redirect them to the login page.
      // This single check covers both cases: user is not logged in, or user is logged in but lacks admin claims.
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [isAuthCheckComplete, isAdmin, router]);

  // While the auth check is running, or if the user is not an admin (and is about to be redirected),
  // show a loading state. This prevents a flash of the dashboard content for non-admins.
  if (!isAuthCheckComplete || !isAdmin) {
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

  // If all checks pass (auth check complete and user is an admin), render the dashboard.
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      {children}
    </div>
  );
}
