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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy, getDoc, doc } from 'firebase/firestore';
import type { Waitlist, Session } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

// We need to store session info in the state to avoid re-fetching it for every row.
type EnrichedWaitlistEntry = Waitlist & {
  sessionId: string;
  sessionName?: string;
};

export default function WaitlistPage() {
  const firestore = useFirestore();
  const [enrichedWaitlist, setEnrichedWaitlist] = React.useState<EnrichedWaitlistEntry[]>([]);

  // 1. Fetch all waitlist entries from the collection group
  const waitlistQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collectionGroup(firestore, 'waitlist'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore]);

  const { data: waitlist, isLoading } = useCollection<Waitlist>(waitlistQuery, true); // Added a flag to bypass memoization check for collectionGroup

  // 2. Enrich waitlist entries with session names
  React.useEffect(() => {
    if (!waitlist || !firestore) return;

    const enrichEntries = async () => {
      const enriched: EnrichedWaitlistEntry[] = await Promise.all(
        waitlist.map(async (entry) => {
          // The path of a subcollection document is `sessions/{sessionId}/waitlist/{userId}`
          const pathSegments = (entry as any).ref.path.split('/');
          const sessionId = pathSegments[1];

          const sessionRef = doc(firestore, 'sessions', sessionId);
          const sessionSnap = await getDoc(sessionRef);

          return {
            ...entry,
            sessionId: sessionId,
            sessionName: sessionSnap.exists()
              ? (sessionSnap.data() as Session).name
              : 'Unknown Session',
          };
        })
      );
      setEnrichedWaitlist(enriched);
    };

    enrichEntries();
  }, [waitlist, firestore]);

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={4}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }

    if (enrichedWaitlist.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center">
            The waitlist is currently empty.
          </TableCell>
        </TableRow>
      );
    }

    return enrichedWaitlist.map((entry) => (
      <TableRow key={`${entry.sessionId}-${entry.menteeId}`}>
        <TableCell>
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/admin/mentees/${entry.menteeId}`}>
              {entry.menteeName || entry.phoneNumber}
            </Link>
          </Button>
        </TableCell>
        <TableCell>{entry.phoneNumber || 'Not provided'}</TableCell>
        <TableCell>
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/admin/sessions/${entry.sessionId}`}>
              {entry.sessionName}
            </Link>
          </Button>
        </TableCell>
        <TableCell>{format(new Date(entry.createdAt), 'PPp')}</TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Waitlists</CardTitle>
        <CardDescription>
          A centralized list of all users waiting for a spot in full sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentee Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Date Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
