'use client';
import React from 'react';
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

  // If the user is logged in and tries to access the login page,
  // redirect them to the home page.
  if (user && pathname === '/login') {
    router.push('/');
    return null; // Render nothing while redirecting
  }

  // If the user is not logged in, show the children (e.g., the AuthForm).
  // Or if they are logged in and on a different page, this component does nothing.
  return <>{children}</>;
}
