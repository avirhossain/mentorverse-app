
'use client';

import * as React from 'react';
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Session, Booking, Mentee } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Briefcase,
  Target,
  CheckSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { SessionBookingsAPI, SessionsAPI } from '@/lib/firebase-adapter';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function SessionDetailsPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = React.use(params);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [name, setName] = React.useState('');


  const sessionRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'sessions', sessionId) : null),
    [firestore, sessionId]
  );
  const {
    data: session,
    isLoading,
    error,
  } = useDoc<Session>(sessionRef);

  const bookedCount = session?.bookedCount || 0;
  const participantLimit = session?.participants || 1;
  const isFull = bookedCount >= participantLimit;

  const handleBooking = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to book a session.',
      });
      return;
    }

    if (!firestore || !session) return;
    
    if (isFull) {
        toast({
            variant: 'destructive',
            title: 'Session Full',
            description: 'This session has no available seats.',
        });
        return;
    }

    const newBooking: Booking = {
      id: uuidv4(),
      sessionId: session.id,
      sessionName: session.name,
      mentorId: session.mentorId,
      mentorName: session.mentorName,
      menteeId: user.uid,
      menteeName: user.displayName || 'Anonymous',
      bookingTime: new Date().toISOString(),
      scheduledDate: session.scheduledDate as string,
      scheduledTime: session.scheduledTime as string,
      status: 'confirmed',
      sessionFee: session.sessionFee,
      adminDisbursementStatus: 'pending',
    };

    try {
      await SessionBookingsAPI.createBooking(firestore, newBooking);
      toast({
        title: 'Session Booked!',
        description: `Your booking for "${session.name}" has been confirmed.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message || 'Could not complete your booking.',
      });
    }
  };

  const handleJoinWaitlist = () => {
    if (!firestore || !session) return;
    
    if (!user && (!name || !phoneNumber)) {
        toast({ variant: 'destructive', title: 'Information Required', description: 'Please provide your name and phone number to join the waitlist.' });
        return;
    }

    const menteeData = user 
        ? { id: user.uid, name: user.displayName || 'Anonymous', phone: phoneNumber || (user as any).phoneNumber || '' } 
        : { id: uuidv4(), name, phone: phoneNumber };

    SessionsAPI.joinWaitlist(firestore, session.id, menteeData as Mentee, menteeData.phone);
    toast({
      title: 'Waitlist Joined',
      description: "We'll notify you if a spot opens up!",
    });
  };

  const renderFooter = () => {
    if (isLoading || !session) {
      return <Skeleton className="h-10 w-1/2" />;
    }
    if (isFull) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" variant="secondary">
              Session Full - Notify Me
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Join the Waitlist</AlertDialogTitle>
              <AlertDialogDescription>
                This session is currently full. We'll notify you if a spot becomes available.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4">
               {!user && (
                 <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
               )}
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Your Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required={!user} />
                </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleJoinWaitlist}>Join Waitlist</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return (
      <Button onClick={handleBooking} className="w-full text-lg">
        Book Now for {formatCurrency(session.sessionFee)}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="mt-2 h-6 w-1/2" />
        <Card className="mt-8">
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-12 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>;
  }

  if (!session) {
    return <p>Session not found.</p>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{session.name}</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          with {session.mentorName}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Briefcase className="h-5 w-5 text-primary" />
                    What you will learn
                  </h3>
                  <p className="mt-2 text-muted-foreground">{session.offerings}</p>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Target className="h-5 w-5 text-primary" />
                    Who is this for?
                  </h3>
                  <p className="mt-2 text-muted-foreground">{session.bestSuitedFor}</p>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    Requirements
                  </h3>
                  <p className="mt-2 text-muted-foreground">{session.requirements}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{formatCurrency(session.sessionFee)}</span>
                <Badge variant="secondary">{session.sessionType}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {format(new Date(session.scheduledDate as string), 'PPP')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{session.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {bookedCount} / {participantLimit} booked
                </span>
              </div>
            </CardContent>
            <CardFooter>{renderFooter()}</CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
