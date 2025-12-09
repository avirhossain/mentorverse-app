'use client';

import { SessionCard } from '@/components/mentee/SessionCard';
import type { Session } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';


export default function SessionsPage() {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'sessions'),
      orderBy('scheduledDate', 'desc')
    );
  }, [firestore]);

  const { data: sessions, isLoading, error } = useCollection<Session>(sessionsQuery);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[320px] w-full rounded-lg" />
          ))}
        </div>
      )
    }

    if (error) {
      return <p className="text-center text-destructive">Error: An error occurred.</p>
    }

    if(!sessions || sessions.length === 0) {
      return <p className="text-center text-muted-foreground">No sessions found.</p>
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Explore Sessions</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find and book sessions to accelerate your growth.
        </p>
      </section>

       <div className="my-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by session or mentor name..."
            className="pl-8"
          />
        </div>
      </div>
      {renderContent()}
    </div>
  );
}
