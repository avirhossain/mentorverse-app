'use client';
import React, { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, usePathname } from 'next/navigation';

interface AuthListenerProps {
  children: React.ReactNode;
}

export function AuthListener({ children }: AuthListenerProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If the user is loaded, is logged in, and is on the login page,
    // redirect them to the home page.
    if (!isUserLoading && user && pathname === '/login') {
      router.push('/');
    }
  }, [user, isUserLoading, pathname, router]);


  // If the user is loading, show a generic skeleton loader.
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

  // If a redirect is in progress, render null.
  if (user && pathname === '/login') {
    return null;
  }

  // If the user is not logged in, show the children (e.g., the AuthForm).
  // Or if they are logged in and on a different page, this component does nothing.
  return <>{children}</>;
}
