
import * as React from 'react';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { MenteeFooter } from '@/components/mentee/MenteeFooter';
import { PublicDashboard } from '@/components/mentee/PublicDashboard';
import { MotivationalChat } from '@/components/common/MotivationalChat';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { initializeFirebaseOnServer } from '@/firebase/index.server';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Mentor, Session } from '@/lib/types';


async function getHomepageData() {
  const { firestore } = await initializeFirebaseOnServer();

  // Fetch Mentors
  const mentorsQuery = query(
    collection(firestore, 'mentors'),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(5)
  );
  const mentorsPromise = getDocs(mentorsQuery);

  // Fetch Sessions
  const sessionsQuery = query(
    collection(firestore, 'sessions'),
    where('status', '==', 'Active'),
    orderBy('scheduledDate', 'desc'),
    limit(3)
  );
  const sessionsPromise = getDocs(sessionsQuery);

  const [mentorsSnapshot, sessionsSnapshot] = await Promise.all([mentorsPromise, sessionsPromise]);

  const mentors = mentorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Mentor[];
  const sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[];

  return { mentors, sessions };
}


// This is now a Server Component
export default async function HomePage() {
  const { mentors, sessions } = await getHomepageData();

  // The MotivationalChat is a client component that needs to be stateful on its own.
  // We can wrap it in its own client component if needed, or keep it as is if it manages its own state.
  // For now, we will render it from a client component wrapper.
  const ClientFeatures = () => {
    'use client';
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    return (
      <>
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
          aria-label="Open motivational chat"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <MotivationalChat open={isChatOpen} onOpenChange={setIsChatOpen} />
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MenteeHeader />
      <main className="flex-1">
        <PublicDashboard mentors={mentors} sessions={sessions} />
      </main>
      <MenteeFooter />
      <ClientFeatures />
    </div>
  );
}
