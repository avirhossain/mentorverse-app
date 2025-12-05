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
    // If we are on the login page, we don't need to run any auth checks here.
    if (isLoginPage || !isAuthCheckComplete) {
      return;
    }

    // If check is complete and the user is not an admin, redirect.
    // This now applies to all admin pages EXCEPT the login page.
    if (!isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, isAuthCheckComplete, router, isLoginPage]);
  
  // If we are on the login page, just render it without any wrappers or checks.
  if (isLoginPage) {
    return <>{children}</>;
  }


  // While checking authentication for other admin pages, show a loading state.
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
