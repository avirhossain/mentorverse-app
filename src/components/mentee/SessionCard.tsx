
import { Clock, Calendar, Tag, Users, DollarSign, Edit, Star } from 'lucide-react';
import type { Session, Booking, Mentee, Review } from '@/lib/types';
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
import { format, parse, addMinutes } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { SessionBookingsAPI, SessionsAPI, ReviewsAPI } from '@/lib/firebase-adapter';
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
import { doc, collection, query, where } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Textarea } from '../ui/textarea';

interface SessionCardProps {
  session: Session | (Booking & { sessionName: string });
  isBooking?: boolean;
}

const getTypeBadgeVariant = (type: Session['sessionType']) => {
  switch (type) {
    case 'Free':
        return 'default';
    case 'Exclusive':
      return 'outline';
    default:
      return 'secondary';
  }
};


// Custom hook to manage booking status for the current user and session
function useBookingStatus(sessionId: string) {
    const { user } = useUser();
    const firestore = useFirestore();

    const bookingQuery = useMemoFirebase(() => {
        if (!firestore || !user || !sessionId) return null;
        return query(
            collection(firestore, 'sessionBookings'),
            where('menteeId', '==', user.uid),
            where('sessionId', '==', sessionId)
        );
    }, [firestore, user, sessionId]);

    const { data: bookings, isLoading } = useCollection<Booking>(bookingQuery);
    const userBooking = bookings?.[0];

    const reviewQuery = useMemoFirebase(() => {
        if (!firestore || !user || !userBooking) return null;
        return query(
            collection(firestore, 'reviews'),
            where('menteeId', '==', user.uid),
            where('bookingId', '==', userBooking.id)
        );
    }, [firestore, user, userBooking]);

    const { data: reviews } = useCollection<Review>(reviewQuery);

    return {
        userBooking,
        hasBooked: !!userBooking,
        hasReviewed: !!reviews && reviews.length > 0,
        isLoadingStatus: isLoading,
    };
}


export function SessionCard({ session, isBooking = false }: SessionCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [name, setName] = React.useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);

  const { userBooking, hasBooked, hasReviewed, isLoadingStatus } = useBookingStatus(session.id);


  const menteeRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'mentees', user.uid);
  }, [firestore, user]);

  const { data: mentee } = useDoc<Mentee>(menteeRef);

  const bookedCount = session.bookedCount || 0;
  const participantLimit = session.participants || 1;
  const isFull = bookedCount >= participantLimit;
  const availableSeats = participantLimit - bookedCount;

  const [sessionState, setSessionState] = React.useState<'upcoming' | 'ongoing' | 'finished'>('upcoming');

  React.useEffect(() => {
    if (!session.scheduledDate || !session.scheduledTime) {
      setSessionState('upcoming');
      return;
    };

    const checkSessionState = () => {
      try {
        const now = new Date();
        const datePart = parse(session.scheduledDate!, 'yyyy-MM-dd', new Date());
        if (isNaN(datePart.getTime())) {
            setSessionState('upcoming');
            return;
        };

        const [hours, minutes] = session.scheduledTime!.split(':').map(Number);
        datePart.setHours(hours, minutes);
        
        const startTime = datePart;
        const endTime = addMinutes(startTime, session.duration || 0);

        if (now >= startTime && now < endTime) {
          setSessionState('ongoing');
        } else if (now >= endTime) {
          setSessionState('finished');
        } else {
          setSessionState('upcoming');
        }
      } catch {
        setSessionState('upcoming'); // parsing failed, assume upcoming
      }
    };

    checkSessionState();
    const interval = setInterval(checkSessionState, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [session.scheduledDate, session.scheduledTime, session.duration]);


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

  const renderAction = () => {
    if (sessionState === 'finished') {
        if (hasBooked && !hasReviewed) {
             return <Button variant="outline" size="sm" onClick={() => setIsReviewOpen(true)}>Write a Review</Button>
        }
        return <Button variant="secondary" disabled>Expired</Button>
    }
    
    if (sessionState === 'ongoing') {
       if (userBooking?.meetingUrl) {
            return (
                <Button asChild className="w-full">
                    <a href={userBooking.meetingUrl} target="_blank" rel="noopener noreferrer">Join Now</a>
                </Button>
            );
        }
        return <Button variant="destructive" className="w-full" disabled>Session in Progress</Button>
    }

    // State 1: User has booked this session
    if (hasBooked && userBooking) {
        if (userBooking.status === 'started' && userBooking.meetingUrl) {
            return (
                <Button asChild>
                    <a href={userBooking.meetingUrl} target="_blank" rel="noopener noreferrer">Join Session</a>
                </Button>
            );
        }
        return <Button disabled>Booked</Button>
    }

    // State 2: Session is full and user has NOT booked
    if (isFull) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" variant="secondary">
              Join Waitlist
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
    
    // State 3: Session is available for booking
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
    );
  };
  
  const ReviewDialog = ({ session, userBooking }: { session: Session, userBooking?: Booking }) => {
    const [rating, setRating] = React.useState(0);
    const [reviewText, setReviewText] = React.useState('');
    const [guestName, setGuestName] = React.useState('');
    const [guestPhone, setGuestPhone] = React.useState('');

    const handleReviewSubmit = () => {
        if (!firestore) return;
        if (rating === 0) {
            toast({ variant: "destructive", title: "Rating required", description: "Please select a star rating." });
            return;
        }
        if (!user && !guestName) {
            toast({ variant: "destructive", title: "Name required", description: "Please enter your name." });
            return;
        }

        const newReview: Partial<Review> = {
            id: uuidv4(),
            bookingId: userBooking?.id, // Can be undefined for guests
            mentorId: session.mentorId,
            rating,
            reviewText,
            createdAt: new Date().toISOString(),
        };

        if (user) {
            newReview.menteeId = user.uid;
            newReview.menteeName = user.displayName || 'Anonymous';
        } else {
            newReview.menteeId = `guest_${uuidv4()}`; // Create a guest ID
            newReview.menteeName = guestName;
            newReview.menteePhone = guestPhone;
        }

        ReviewsAPI.createReview(firestore, newReview as Review);

        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
        setIsReviewOpen(false);
    };
    
    return (
        <AlertDialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Write a Review for "{session.name}"</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your feedback helps other mentees make better decisions.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4">
                    {!user && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="guest-name">Name</Label>
                                <Input id="guest-name" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your Name" />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="guest-phone">Phone (Optional)</Label>
                                <Input id="guest-phone" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Your Phone Number" />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-center items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`h-8 w-8 cursor-pointer transition-colors ${
                            rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                            onClick={() => setRating(star)}
                        />
                        ))}
                    </div>
                    <Textarea 
                        placeholder="Share your experience..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReviewSubmit}>Submit Review</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
  };


  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="pr-4 text-lg">{session.name}</CardTitle>
          {session.sessionType === 'Free' && (
            <Badge variant={getTypeBadgeVariant(session.sessionType)}>
              {session.sessionType}
            </Badge>
          )}
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
                <span>{session.scheduledTime} {session.duration && `(${session.duration} mins)`}</span>
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
                        {isFull && !hasBooked ? (
                            <span className="text-destructive">No Seats Available</span>
                        ) : (
                            `Seats Left: Only ${availableSeats} / ${participantLimit}`
                        )}
                    </span>
                </div>
           )}
        </div>
      </CardContent>
      <CardFooter className="flex items-stretch gap-2 p-4 pt-0">
        <Button variant="outline" className="w-full" asChild>
            <Link href={`/session/${session.name.replace(/\s+/g, '-')}`}>See More</Link>
        </Button>
        <div className="w-full">
            {isLoadingStatus ? <div className="h-9 w-full rounded-md bg-muted animate-pulse" /> : renderAction()}
        </div>
      </CardFooter>
      <ReviewDialog session={session} userBooking={userBooking} />
    </Card>
  );
}

    