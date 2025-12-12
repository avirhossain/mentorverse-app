'use client';

import * as React from 'react';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { MenteeFooter } from '@/components/mentee/MenteeFooter';

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MenteeHeader />
      <main className="flex-1">
        {children}
      </main>
      <MenteeFooter />
    </div>
  );
}
