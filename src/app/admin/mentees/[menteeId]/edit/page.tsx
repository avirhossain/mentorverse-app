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
import { MenteeForm } from '@/components/admin/MenteeForm';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Mentee } from '@/lib/types';
import { MenteesAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditMenteePage({
  params,
}: {
  params: { menteeId: string };
}) {
  const { menteeId } = React.use(params);
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const menteeRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'mentees', menteeId) : null),
    [firestore, menteeId]
  );
  const { data: mentee, isLoading } = useDoc<Mentee>(menteeRef);

  const handleFormSubmit = (data: Partial<Mentee>) => {
    if (!firestore) return;

    MenteesAPI.updateMentee(firestore, menteeId, data);
    toast({
      title: 'Mentee Updated',
      description: `The profile for ${data.name} has been updated.`,
    });
    router.push(`/admin/mentees/${menteeId}`);
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full max-w-3xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7">
            <Link href={`/admin/mentees/${menteeId}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Edit Mentee
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Update Mentee Profile</CardTitle>
            <CardDescription>
              Modify the details below and click save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            )}
            {!isLoading && mentee && (
              <MenteeForm mentee={mentee} onSubmit={handleFormSubmit} />
            )}
            {!isLoading && !mentee && <p>Mentee not found.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
