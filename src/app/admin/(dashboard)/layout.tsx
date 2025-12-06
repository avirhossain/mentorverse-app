'use client';

import React from 'react';
import { Header } from '@/components/common/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Authorization has been temporarily removed for development.
  // TODO: Re-enable AdminAuthProvider before production.
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      {children}
    </div>
  );
}
