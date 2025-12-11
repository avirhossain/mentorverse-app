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
import { MentorForm } from '@/components/admin/MentorForm';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Mentor } from '@/lib/types';
import { MentorsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditMentorPage({
  params,
}: {
  params: { mentorId: string };
}) {
  const { mentorId } = React.use(params);
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const mentorRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'mentors', mentorId) : null),
    [firestore, mentorId]
  );
  const { data: mentor, isLoading } = useDoc<Mentor>(mentorRef);

  const handleFormSubmit = async (data: Partial<Mentor>) => {
    if (!firestore || !mentor) return;
    
    // If the email has changed, check if it's already in use by a mentee
    if (data.email && data.email !== mentor.email) {
        const menteesRef = collection(firestore, 'mentees');
        const q = query(menteesRef, where('email', '==', data.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({
                variant: 'destructive',
                title: 'Email Already Exists',
                description: `The email ${data.email} is already registered as a mentee.`,
            });
            return; // Stop the update process
        }
    }


    MentorsAPI.updateMentor(firestore, mentorId, data);
    toast({
      title: 'Mentor Updated',
      description: `The profile for ${data.name} has been updated.`,
    });
    router.push(`/admin/mentors/${mentorId}`);
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full max-w-3xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7">
            <Link href={`/admin/mentors/${mentorId}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Edit Mentor
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Update Mentor Profile</CardTitle>
            <CardDescription>
              Modify the details below and click save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-24" />
                <Skeleton className="h-10" />
              </div>
            )}
            {!isLoading && mentor && (
              <MentorForm mentor={mentor} onSubmit={handleFormSubmit} />
            )}
            {!isLoading && !mentor && <p>Mentor not found.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
