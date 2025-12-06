
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUser } from '@/firebase/auth/use-admin-user'; // Import the new hook
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/common/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthCheckComplete } = useAdminUser(); // Use the new hook
  const router = useRouter();

  useEffect(() => {
    // Once the initial auth check is complete, decide what to do.
    if (isAuthCheckComplete) {
      // If there's no user or the user is not an admin, redirect to the login page.
      if (!user || !isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [isAuthCheckComplete, user, isAdmin, router]);

  // While the auth check is running, or if the user is not an admin yet, show a loading screen.
  if (!isAuthCheckComplete || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
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

  // If all checks pass (auth check complete, user exists, user is admin), render the dashboard.
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      {children}
    </div>
  );
}
