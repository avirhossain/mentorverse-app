'use client';
import { SessionCard } from './SessionCard';
import type { Session } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy, getDoc, doc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from 'react';

type SessionWithMentorName = Session & { mentorName: string };

export function UpcomingSessions() {
  const firestore = useFirestore();
  const [sessionsWithMentors, setSessionsWithMentors] = useState<SessionWithMentorName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'sessions'),
      where('status', 'in', ['pending', 'confirmed']),
      where('sessionType', 'in', ['Free', 'Paid']),
      orderBy('scheduledDate', 'asc'),
      limit(6)
    );
  }, [firestore]);

  const {
    data: sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useCollection<Session>(sessionsQuery);

  useEffect(() => {
    if (sessionsLoading) {
      setIsLoading(true);
      return;
    }
    if (sessionsError) {
      setError(sessionsError);
      setIsLoading(false);
      return;
    }

    if (!sessions || !firestore) {
      setIsLoading(false);
      setSessionsWithMentors([]);
      return;
    }

    const fetchMentorNames = async () => {
      setIsLoading(true);
      try {
        const enrichedSessions = await Promise.all(
          sessions.map(async (session) => {
            let mentorName = '...';
            if (session.mentorId) {
              const mentorRef = doc(firestore, 'mentors', session.mentorId);
              const mentorSnap = await getDoc(mentorRef);
              if (mentorSnap.exists()) {
                mentorName = mentorSnap.data().name || 'Mentor';
              }
            }
            return { ...session, mentorName };
          })
        );
        setSessionsWithMentors(enrichedSessions);
      } catch (e: any) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorNames();
  }, [sessions, sessionsLoading, sessionsError, firestore]);


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
          Error loading sessions: {error.message}
        </p>
      );
    }

    if (sessionsWithMentors.length === 0) {
      return (
        <p className="mt-10 text-center text-muted-foreground">
          No upcoming sessions scheduled. Check back soon!
        </p>
      );
    }

    return (
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sessionsWithMentors.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
          />
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
