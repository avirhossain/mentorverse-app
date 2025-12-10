'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionForm } from '@/components/admin/SessionForm';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Session, Mentor } from '@/lib/types';
import { SessionsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function CreateSessionPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [formKey, setFormKey] = React.useState(Date.now());

  const mentorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentors'));
  }, [firestore]);
  const { data: mentors, isLoading: isLoadingMentors } =
    useCollection<Mentor>(mentorsQuery);

  const handleFormSubmit = async (data: Partial<Session>) => {
    if (!firestore) return;

    // Fetch existing sessions to generate new displayId
    const sessionsCollection = collection(firestore, 'sessions');
    const collectionSnapshot = await getDocs(sessionsCollection);
    const sessionCount = collectionSnapshot.size;
    const displayId = `S${String(sessionCount + 1).padStart(2, '0')}`;

    const selectedMentor = mentors?.find((m) => m.id === data.mentorId);
    const submissionData: Partial<Session> = {
      ...data,
      displayId: displayId,
      mentorName: selectedMentor?.name || 'Unknown Mentor',
    };

    SessionsAPI.createSession(firestore, submissionData as Session);
    toast({
      title: 'Session Created',
      description: `The session "${data.name}" has been created with ID ${displayId}.`,
    });
    // Reset the form by changing the key of the SessionForm component
    setFormKey(Date.now());
    router.push('/admin/sessions');
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full max-w-3xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7">
            <Link href="/admin/sessions">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Create New Session
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              Fill out the form to create a new session offering that mentees
              can book.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMentors ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            ) : (
              <SessionForm
                key={formKey} // Add key here
                mentors={mentors || []}
                onSubmit={handleFormSubmit}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
