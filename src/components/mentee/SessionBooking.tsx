'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Session, Booking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionBookingsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface SessionBookingProps {
  mentorId: string;
}

export function SessionBooking({ mentorId }: SessionBookingProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sessions'), where('mentorId', '==', mentorId), where('status', '==', 'Active'));
  }, [firestore, mentorId]);

  const { data: sessions, isLoading, error } = useCollection<Session>(sessionsQuery);

  const handleBooking = async (session: Session) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to book a session.',
      });
      return;
    }
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database connection not available.',
      });
      return;
    }

    const newBooking: Booking = {
      id: uuidv4(),
      sessionId: session.id,
      sessionName: session.name,
      mentorId: session.mentorId,
      mentorName: session.mentorName,
      menteeId: user.uid,
      menteeName: user.displayName || 'Anonymous',
      bookingTime: new Date().toISOString(),
      scheduledDate: session.scheduledDate as string,
      scheduledTime: session.scheduledTime as string,
      status: 'confirmed',
      sessionFee: session.sessionFee,
      adminDisbursementStatus: 'pending',
    };

    try {
      await SessionBookingsAPI.createBooking(firestore, newBooking);
      toast({
        title: 'Session Booked!',
        description: `Your booking for "${session.name}" has been confirmed.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message || 'Could not complete your booking.',
      });
    }
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
              <Button onClick={() => handleBooking(session)}>Book Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return renderSessions();
}
