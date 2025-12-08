'use client';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { MenteeFooter } from '@/components/mentee/MenteeFooter';
import { PublicDashboard } from '@/components/mentee/PublicDashboard';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MenteeHeader />
      <main className="flex-1">
        <PublicDashboard />
      </main>
      <MenteeFooter />
    </div>
  );
}
