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
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Session, Booking } from '@/lib/types';
import { ChevronLeft, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookingsAPI } from '@/lib/firebase-adapter';
import { format } from 'date-fns';

export default function SessionDetailsPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = params;
  const firestore = useFirestore();
  const { toast } = useToast();

  const sessionRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'sessions', sessionId) : null),
    [firestore, sessionId]
  );
  const { data: session, isLoading: loadingSession } = useDoc<Session>(sessionRef);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'bookings'),
      where('sessionId', '==', sessionId),
      orderBy('bookingTime', 'asc')
    );
  }, [firestore, sessionId]);
  const { data: bookings, isLoading: loadingBookings } =
    useCollection<Booking>(bookingsQuery);

  const handleStartMeeting = (bookingId: string) => {
    if (!firestore) return;
    BookingsAPI.startMeeting(firestore, bookingId);
    toast({
      title: 'Meeting Started',
      description:
        'The meeting link has been generated and a notification has been sent to the mentee.',
    });
  };

  const renderBookings = () => {
    if (loadingBookings) {
      return Array.from({ length: 2 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={3}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }

    if (!bookings || bookings.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center">
            No one has booked this session yet.
          </TableCell>
        </TableRow>
      );
    }

    return bookings.map((booking) => (
      <TableRow key={booking.id}>
        <TableCell>
          <div className="font-medium">{booking.menteeName}</div>
          <div className="text-sm text-muted-foreground">
            Booked on {format(new Date(booking.bookingTime), 'PP')}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={booking.status === 'completed' ? 'secondary' : 'default'}>{booking.status}</Badge>
        </TableCell>
        <TableCell className="text-right">
          {booking.status === 'confirmed' && (
            <Button size="sm" onClick={() => handleStartMeeting(booking.id)}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Meeting
            </Button>
          )}
          {booking.status === 'started' && (
            <Button size="sm" asChild>
              <a
                href={booking.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Meeting
              </a>
            </Button>
          )}
        </TableCell>
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
        <Button asChild size="sm">
            <Link href={`/admin/sessions/${sessionId}/edit`}>Edit Session</Link>
        </Button>
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
        <>
          <Card>
            <CardHeader>
              <CardTitle>{session.name}</CardTitle>
              <CardDescription>
                Session ID: {session.displayId || session.id} <br />
                Mentor: {session.mentorName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{session.offerings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Booked Mentees</CardTitle>
              <CardDescription>
                Manage and start meetings for mentees who have booked this
                session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderBookings()}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
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
