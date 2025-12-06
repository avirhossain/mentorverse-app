'use client';

import React from 'react';
import { AdminAuthProvider } from '@/firebase/auth/admin-auth-provider';
import { Header } from '@/components/common/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // The AdminAuthProvider will now handle all auth checks and redirection logic.
  // This layout is now only responsible for providing the consistent UI shell (Header).
  return (
    <AdminAuthProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header currentView="admin" />
        {children}
      </div>
    </AdminAuthProvider>
  );
}
