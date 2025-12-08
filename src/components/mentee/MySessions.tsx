'use client';
import { SessionCard } from './SessionCard';
import type { Session } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';

export function MySessions() {
  const firestore = useFirestore();
  const { user } = useUser();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'sessions'),
      where('menteeId', '==', user.uid),
      where('status', 'in', ['confirmed', 'pending']),
      orderBy('scheduledDate', 'asc'),
      limit(3)
    );
  }, [firestore, user]);

  const {
    data: sessions,
    isLoading,
    error,
  } = useCollection<Session & { mentorName: string }>(sessionsQuery);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[320px] w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <p className="text-center text-destructive">
          Error loading your sessions: {error.message}
        </p>
      );
    }

    if (!sessions || sessions.length === 0) {
      return (
        <CardDescription>
          You have no upcoming sessions booked.
        </CardDescription>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={{ ...session, mentorName: session.mentorName || '...' }}
          />
        ))}
      </div>
    );
  };

  return (
     <Card>
      <CardHeader>
        <CardTitle>My Upcoming Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
