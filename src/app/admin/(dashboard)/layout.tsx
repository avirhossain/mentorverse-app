
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthCheckComplete } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial authentication check is complete.
    if (!isAuthCheckComplete) {
      return;
    }

    // If the check is complete and there's no user or the user is not an admin, redirect.
    if (!user || !isAdmin) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, isAuthCheckComplete, router]);

  // While the initial auth check is running, show a loading skeleton.
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

  // If the user is a verified admin, render the dashboard content.
  if (isAdmin) {
    return <>{children}</>;
  }

  // If not an admin, show a loading state while redirecting to avoid a flash of content.
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
