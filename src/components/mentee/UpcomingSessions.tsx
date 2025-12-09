'use client';
import { SessionCard } from './SessionCard';
import type { Session } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';


export function UpcomingSessions() {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'sessions'),
      orderBy('scheduledDate', 'desc'),
      limit(3)
    );
  }, [firestore]);
  
  const { data: sessions, isLoading, error } = useCollection<Session>(sessionsQuery);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[320px] w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <p className="mt-10 text-center text-destructive">
          Error loading sessions: An error occurred.
        </p>
      );
    }

    if (!sessions || sessions.length === 0) {
      return (
        <p className="mt-10 text-center text-muted-foreground">
          No upcoming sessions scheduled. Check back soon!
        </p>
      );
    }

    return (
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
