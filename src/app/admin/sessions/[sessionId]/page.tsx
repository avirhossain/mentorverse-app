
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
import { ChevronLeft, PlayCircle, Copy } from 'lucide-react';
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
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SessionsAPI } from '@/lib/firebase-adapter';
import { v4 as uuidv4 } from 'uuid';

export default function SessionDetailsPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = React.use(params);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = React.useState(false);
  const [generatedLink, setGeneratedLink] = React.useState('');
  const [cleanRoomId, setCleanRoomId] = React.useState('');


  const sessionRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'sessions', sessionId) : null),
    [firestore, sessionId]
  );
  const { data: session, isLoading: loadingSession } = useDoc<Session>(sessionRef);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'sessionBookings'),
      where('sessionId', '==', sessionId),
      orderBy('bookingTime', 'asc')
    );
  }, [firestore, sessionId]);
  const { data: bookings, isLoading: loadingBookings } =
    useCollection<Booking>(bookingsQuery);

  const handleCreateMeeting = async () => {
    if (!firestore || !session) return;
    
    // The clean URL part, e.g., 'mentorverse-session-xxxx'
    const newCleanRoomId = `mentorverse-session-${sessionId.substring(0, 8)}-${uuidv4().substring(0, 4)}`;
    // The full URL to be shared
    const newLink = `${window.location.origin}/meeting/${newCleanRoomId}`;

    setCleanRoomId(newCleanRoomId);
    setGeneratedLink(newLink);
    setIsMeetingDialogOpen(true);
  };
  
  const handleStartAndNotify = async () => {
    if (!firestore || !session) return;
    
    const fullJaaSRoomName = `vpaas-magic-cookie-514c5de29b504a2e6ce4646314c2/${cleanRoomId}`;

    try {
        await SessionsAPI.startMeetingAndNotifyBookedMentees(firestore, sessionId, fullJaaSRoomName, bookings || []);
        toast({
          title: 'Meeting Started & Mentees Notified',
          description: 'All confirmed mentees have received a notification.',
        });
        window.open(generatedLink, '_blank');
        setIsMeetingDialogOpen(false);
    } catch(error) {
        console.error("Failed to start meeting and notify mentees: ", error);
        toast({
            variant: "destructive",
            title: "Operation Failed",
            description: "Could not start the meeting or send notifications."
        })
    }
  }


  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
        title: 'Link Copied!',
        description: 'The meeting link has been copied to your clipboard.',
    })
  }

  const hasConfirmedBookings = React.useMemo(() => {
    return bookings?.some(b => b.status === 'confirmed');
  }, [bookings]);


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
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/mentees/${booking.menteeId}`}>View Mentee</Link>
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
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
        <div className="ml-auto flex items-center gap-2">
            {session && hasConfirmedBookings && (
                <Button size="sm" onClick={handleCreateMeeting}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Meeting
                </Button>
            )}
            <Button asChild size="sm" variant="outline">
                <Link href={`/admin/sessions/${sessionId}/edit`}>Edit Session</Link>
            </Button>
        </div>
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
                Mentees who have booked this session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentee</TableHead>
                    <TableHead>Booking Status</TableHead>
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
     <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Start Session & Notify Mentees</DialogTitle>
            <DialogDescription>
                This will generate a unique meeting link, notify all confirmed mentees, and start the meeting in a new tab.
            </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <p>Meeting Link:</p>
            <div className="flex items-center space-x-2">
                <Input value={generatedLink} readOnly />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4"/>
                </Button>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsMeetingDialogOpen(false)}>Close</Button>
                <Button onClick={handleStartAndNotify}>Start & Notify</Button>
            </div>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
