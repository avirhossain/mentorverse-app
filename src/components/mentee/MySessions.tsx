'use client';
import { SessionCard } from './SessionCard';
import type { Booking } from '@/lib/types';
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

    if (!bookings || bookings.length === 0) {
      return (
        <CardDescription>
          You have no upcoming sessions booked.
        </CardDescription>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => {
          // Adapt the booking object to the SessionCard props
          const sessionLike = {
            ...booking,
            name: booking.sessionName,
            // These fields might not exist on booking, provide defaults
            tag: undefined, 
            offerings: undefined,
            bestSuitedFor: undefined,
            requirements: undefined,
            sessionType: booking.sessionFee === 0 ? 'Free' : 'Paid',
          };
          return (
            <SessionCard
              key={booking.id}
              session={sessionLike}
              isBooking
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
