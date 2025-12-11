'use client';
import { SessionCard } from './SessionCard';
import type { Booking, Session } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';

export function MySessions() {
  const firestore = useFirestore();
  const { user } = useUser();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'sessionBookings'),
      where('menteeId', '==', user.uid),
      where('status', 'in', ['confirmed', 'started']),
      orderBy('scheduledDate', 'asc'),
      limit(3)
    );
  }, [firestore, user]);

  const {
    data: bookings,
    isLoading,
    error,
  } = useCollection<Booking>(bookingsQuery);

  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = React.useState(true);

  React.useEffect(() => {
    if (bookings) {
      const fetchSessions = async () => {
        if (!firestore) return;
        setLoadingSessions(true);
        const sessionPromises = bookings.map(b => getDoc(doc(firestore, 'sessions', b.sessionId)));
        const sessionSnapshots = await Promise.all(sessionPromises);
        const fetchedSessions = sessionSnapshots.map(s => s.data() as Session);
        setSessions(fetchedSessions);
        setLoadingSessions(false);
      }
      fetchSessions();
    }
  }, [bookings, firestore]);


  const renderContent = () => {
    if (isLoading || loadingSessions) {
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
        {sessions.map((session) => {
          return (
            <SessionCard
              key={session.id}
              session={session}
            />
          );
        })}
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
