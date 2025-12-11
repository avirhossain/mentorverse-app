import { Clock, Calendar, Tag, Users, DollarSign } from 'lucide-react';
import type { Session, Booking, Mentee } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { SessionBookingsAPI, SessionsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import * as React from 'react';
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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

interface SessionCardProps {
  session: Session | (Booking & { sessionName: string });
  isBooking?: boolean;
}

const getTypeBadgeVariant = (type: Session['sessionType']) => {
  switch (type) {
    case 'Paid':
      return 'default';
    case 'Free':
      return 'secondary';
    case 'Exclusive':
      return 'outline';
    default:
      return 'secondary';
  }
};

export function SessionCard({ session, isBooking = false }: SessionCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [name, setName] = React.useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

  const menteeRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'mentees', user.uid);
  }, [firestore, user]);

  const { data: mentee } = useDoc<Mentee>(menteeRef);

  const bookedCount = session.bookedCount || 0;
  const participantLimit = session.participants || 1;
  const isFull = bookedCount >= participantLimit;

  const hasSufficientBalance = (mentee?.accountBalance || 0) >= session.sessionFee;

  const handleBookingConfirm = async () => {
    if (!user || !mentee) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to book a session.',
      });
      return;
    }

    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database connection not available.',
      });
      return;
    }

    if (isFull) {
        toast({
            variant: 'destructive',
            title: 'Session Full',
            description: 'This session has no available seats.',
        });
        return;
    }

    if (!hasSufficientBalance) {
        toast({
            variant: 'destructive',
            title: 'Insufficient Balance',
            description: 'Please add funds to your account before booking.',
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
      await SessionBookingsAPI.createBooking(firestore, newBooking, user.uid);
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
    } finally {
        setIsCheckoutOpen(false);
    }
  };

  const handleJoinWaitlist = () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }
    
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
    if (isBooking) {
        const booking = session as Booking;
        if (booking.status === 'started' && booking.meetingUrl) {
            return (
                <Button asChild className="w-full">
                    <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">Join Meeting</a>
                </Button>
            );
        }
        return <Button className="w-full" disabled>Meeting not started</Button>;
    }

    if (isFull) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" variant="secondary">
              Notify Me
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Join the Waitlist</AlertDialogTitle>
              <AlertDialogDescription>
                This session is currently full. Provide your details below, and we'll
                notify you if a spot becomes available.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4">
               {!user && (
                 <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                        id="name" 
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
               )}
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                        id="phone" 
                        placeholder="Your Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required={!user}
                    />
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
    
    const renderCheckoutContent = () => {
      if (!user) {
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Login Required</AlertDialogTitle>
              <AlertDialogDescription>
                You need to be logged in to book this session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Link href="/login">Login</Link>
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        );
      }

      if (hasSufficientBalance) {
        return (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Your Booking</AlertDialogTitle>
              <AlertDialogDescription>
                The session fee of{' '}
                <span className="font-bold">{formatCurrency(session.sessionFee)}</span>{' '}
                will be deducted from your account balance.
              </AlertDialogDescription>
            </AlertDialogHeader>
             <div className="text-sm">
                <p>Current Balance: {formatCurrency(mentee?.accountBalance || 0)}</p>
                <p>New Balance: {formatCurrency((mentee?.accountBalance || 0) - session.sessionFee)}</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBookingConfirm}>
                Confirm & Book
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        );
      }
      
      return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Insufficient Balance</AlertDialogTitle>
                <AlertDialogDescription>
                    Your current balance is <span className="font-bold">{formatCurrency(mentee?.accountBalance || 0)}</span>, but this session costs <span className="font-bold">{formatCurrency(session.sessionFee)}</span>. Please add funds to your account.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                    <Link href="/dashboard">Add Balance</Link>
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
      )
    };


    return (
      <div className="flex gap-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/session/${encodeURIComponent(session.name)}`}>See More</Link>
        </Button>
        <AlertDialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
            <AlertDialogTrigger asChild>
                <Button className="w-full">
                    Book Session
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                {renderCheckoutContent()}
            </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="pr-4 text-lg">{session.name}</CardTitle>
          <Badge variant={getTypeBadgeVariant(session.sessionType)}>
            {session.sessionType}
          </Badge>
        </div>
        <CardDescription>By {session.mentorName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          {session.scheduledDate && session.scheduledTime && (
             <>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(session.scheduledDate), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{session.scheduledTime}</span>
              </div>
            </>
          )}
           <div className="flex items-center gap-2 pt-2 font-semibold text-foreground">
                
                <span>
                   {session.sessionType !== 'Free' && formatCurrency(session.sessionFee)}
                </span>
            </div>
          {'tag' in session && session.tag && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{session.tag}</span>
            </div>
          )}
           {session.participants && (
            <div className="flex items-center gap-2 font-medium">
                <Users className="h-4 w-4" />
                <span>
                    {isFull ? (
                        <span className="text-destructive">No Seats Available</span>
                    ) : (
                        `${bookedCount}/${participantLimit} Seats Booked`
                    )}
                </span>
            </div>
           )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch p-4 pt-0">
        {renderFooter()}
      </CardFooter>
    </Card>
  );
}
