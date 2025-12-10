'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Session } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionBookingProps {
  mentorId: string;
}

export function SessionBooking({ mentorId }: SessionBookingProps) {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sessions'), where('mentorId', '==', mentorId), where('status', '==', 'Active'));
  }, [firestore, mentorId]);

  const { data: sessions, isLoading, error } = useCollection<Session>(sessionsQuery);

  const handleBooking = (sessionId: string) => {
    // Implement booking logic here
    console.log('Booking session:', sessionId);
  };

  const renderSessions = () => {
    if (isLoading) {
      return <div>Loading sessions...</div>;
    }

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    if (!sessions || sessions.length === 0) {
      return <div>No available sessions</div>;
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle>{session.name}</CardTitle>
              <CardDescription>{session.duration} minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{session.offerings}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleBooking(session.id)}>Book Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return renderSessions();
}
