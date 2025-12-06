'use client';

import React from 'react';
import { Header } from '@/components/common/Header';
import { useAdminUser } from '@/firebase';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthCheckComplete } = useAdminUser();

  if (!isAuthCheckComplete) {
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

  if (!isAdmin) {
    notFound();
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      {children}
    </div>
  );
}
