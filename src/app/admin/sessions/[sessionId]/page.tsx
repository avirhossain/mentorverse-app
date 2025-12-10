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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useDoc,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import type { Session, Waitlist } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

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

  const waitlistQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, `sessions/${sessionId}/waitlist`),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, sessionId]
  );
  const { data: waitlist, isLoading: loadingWaitlist } =
    useCollection<Waitlist>(waitlistQuery);

  const isLoading = loadingSession || loadingWaitlist;

  const renderWaitlist = () => {
    if (loadingWaitlist) {
      return Array.from({ length: 2 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={3}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }

    if (!waitlist || waitlist.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center">
            The waitlist is empty.
          </TableCell>
        </TableRow>
      );
    }

    return waitlist.map((entry) => (
      <TableRow key={entry.menteeId}>
        <TableCell>{entry.menteeName}</TableCell>
        <TableCell>{entry.phoneNumber || 'Not provided'}</TableCell>
        <TableCell>{format(new Date(entry.createdAt), 'PPp')}</TableCell>
      </TableRow>
    ));
  };

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
        </Card>
      ) : session ? (
        <Card>
          <CardHeader>
            <CardTitle>{session.name}</CardTitle>
            <CardDescription>
              Session ID: {session.displayId || session.id}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Waitlist</CardTitle>
          <CardDescription>
            Users who will be notified if a spot opens up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentee Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderWaitlist()}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
