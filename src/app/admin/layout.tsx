'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    // Wait until the authentication check is fully complete
    if (isAuthCheckComplete) {
      // If check is complete and there's no user OR the user is not an admin, redirect
      if (!user || !isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, isAuthCheckComplete, router]);

  // While checking, show a loading state to prevent flashing content
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

  // If the user is an admin and the auth check is complete, render the admin content
  return <>{children}</>;
}
