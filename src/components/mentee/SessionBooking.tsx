'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Session } from '@/lib/types';
import { SessionCard } from './SessionCard';

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
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    );
  };

  return renderSessions();
}
