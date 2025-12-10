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
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Session } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SessionDetailsPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = params;
  const firestore = useFirestore();

  const sessionRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'sessions', sessionId) : null),
    [firestore, sessionId]
  );
  const { data: session, isLoading: loadingSession } = useDoc<Session>(sessionRef);

  return (
    <div className="grid flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-7 w-7">
          <Link href="/admin/sessions">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Session Details
        </h1>
      </div>

      {loadingSession ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
           <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : session ? (
        <Card>
          <CardHeader>
            <CardTitle>{session.name}</CardTitle>
            <CardDescription>
              Session ID: {session.displayId || session.id} <br/>
              Mentor: {session.mentorName}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">{session.offerings}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
