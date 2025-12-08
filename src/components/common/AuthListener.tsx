'use client';
import React from 'react';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { MenteeDashboard } from '@/components/mentee/MenteeDashboard';

interface AuthListenerProps {
  children: React.ReactNode;
}

export function AuthListener({ children }: AuthListenerProps) {
  const { user, isUserLoading } = useUser();

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

  if (user) {
    return <MenteeDashboard />;
  }

  return <>{children}</>;
}
