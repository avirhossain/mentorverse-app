'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isAuthCheckComplete } = useUser();
  const router = useRouter();

  console.log('[AdminLayout] Rendering with state:', { user: !!user, isAdmin, isAuthCheckComplete });

  useEffect(() => {
    console.log('[AdminLayout] useEffect triggered. State:', { user: !!user, isAdmin, isAuthCheckComplete });

    if (!isAuthCheckComplete) {
      console.log('[AdminLayout] Auth check not complete. Waiting...');
      return;
    }

    if (!user || !isAdmin) {
      console.log('[AdminLayout] REDIRECTING to /admin/login. Reason:', !user ? 'User is not logged in.' : 'User is not an admin.');
      router.push('/admin/login');
    } else {
      console.log('[AdminLayout] User is an admin. Allowing access.');
    }
  }, [user, isAdmin, isAuthCheckComplete, router]);

  if (!isAuthCheckComplete) {
    console.log('[AdminLayout] Showing loading skeleton because auth check is not complete.');
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

  // If auth is complete but user is not admin, they will be redirected.
  // We can show a skeleton here as well to prevent a flash of content before redirect.
  if (!isAdmin) {
     console.log('[AdminLayout] Showing loading skeleton because user is not (yet) admin.');
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

  console.log('[AdminLayout] Auth complete and user is admin. Rendering children.');
  return <>{children}</>;
}