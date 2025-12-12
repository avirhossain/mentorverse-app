'use client';
import { SessionCard } from './SessionCard';
import type { Session } from '@/lib/types';

interface UpcomingSessionsProps {
  sessions: Session[];
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  const renderContent = () => {
    if (!sessions || sessions.length === 0) {
      return (
        <p className="mt-10 text-center text-muted-foreground">
          No upcoming sessions scheduled. Check back soon!
        </p>
      );
    }

    return (
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Explore Upcoming Sessions
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-muted-foreground">
          Book your spot in one of our popular upcoming sessions.
        </p>
        {renderContent()}
      </div>
    </section>
  );
}
