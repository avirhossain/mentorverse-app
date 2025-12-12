'use client';

import * as React from 'react';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { MenteeFooter } from '@/components/mentee/MenteeFooter';
import { PublicDashboard } from '@/components/mentee/PublicDashboard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { Mentor, Session } from '@/lib/types';
import { ClientFeatures } from '@/components/mentee/ClientFeatures';
import { Skeleton } from '@/components/ui/skeleton';


// This is now a Client Component
export default function HomePage() {
  const firestore = useFirestore();

  // Fetch Mentors
  const mentorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'mentors'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [firestore]);
  
  const { data: mentors, isLoading: isLoadingMentors } = useCollection<Mentor>(mentorsQuery);

  // Fetch Sessions
  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'sessions'),
      where('status', '==', 'Active'),
      orderBy('scheduledDate', 'desc'),
      limit(3)
    );
  }, [firestore]);
  
  const { data: sessions, isLoading: isLoadingSessions } = useCollection<Session>(sessionsQuery);

  const isLoading = isLoadingMentors || isLoadingSessions;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MenteeHeader />
      <main className="flex-1">
        {isLoading ? (
             <div className="space-y-8 py-8">
                <Skeleton className="h-[60vh] w-full" />
                <div className="container mx-auto px-4">
                    <Skeleton className="h-40 w-full" />
                </div>
                 <div className="container mx-auto px-4">
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        ) : (
             <PublicDashboard mentors={mentors || []} sessions={sessions || []} />
        )}
      </main>
      <MenteeFooter />
      <ClientFeatures />
    </div>
  );
}
