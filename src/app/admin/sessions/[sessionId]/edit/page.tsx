
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionForm } from '@/components/admin/SessionForm';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Session, Mentor } from '@/lib/types';
import { SessionsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function EditSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = React.use(params);
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const sessionRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'sessions', sessionId) : null),
    [firestore, sessionId]
  );
  const { data: session, isLoading: isLoadingSession } = useDoc<Session>(sessionRef);

  const mentorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentors'));
  }, [firestore]);
  const { data: mentors, isLoading: isLoadingMentors } =
    useCollection<Mentor>(mentorsQuery);

  const handleFormSubmit = (data: Partial<Session>) => {
    if (!firestore) return;

    SessionsAPI.updateSession(firestore, sessionId, data);
    toast({
      title: 'Session Updated',
      description: `The session "${data.name}" has been updated.`,
    });
    router.push('/admin/sessions');
  };

  const handleDelete = () => {
    if (!firestore || !session) return;
    SessionsAPI.deleteSession(firestore, sessionId);
    toast({
        title: 'Session Deleted',
        description: `The session "${session.name}" has been removed.`,
        variant: 'destructive',
    });
    router.push('/admin/sessions');
  }

  const isLoading = isLoadingSession || isLoadingMentors;

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
            Edit Session
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Update Session Details</CardTitle>
            <CardDescription>
              Modify the form below to update the session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            )}
            {!isLoading && session && (
              <SessionForm
                session={session}
                mentors={mentors || []}
                onSubmit={handleFormSubmit}
              />
            )}
            {!isLoading && !session && <p>Session not found.</p>}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex w-full justify-between">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Session
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the session.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
