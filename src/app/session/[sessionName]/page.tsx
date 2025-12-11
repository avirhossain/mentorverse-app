
'use client';

import * as React from 'react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Session, Booking, Mentee, Review } from '@/lib/types';
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
  Briefcase,
  Target,
  CheckSquare,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { SessionBookingsAPI, SessionsAPI, ReviewsAPI } from '@/lib/firebase-adapter';
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
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

function useBookingStatus(sessionId: string) {
    const { user } = useUser();
    const firestore = useFirestore();

    const bookingQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'sessionBookings'),
            where('menteeId', '==', user.uid),
            where('sessionId', '==', sessionId),
            where('status', 'in', ['confirmed', 'started', 'completed'])
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


export default function SessionDetailsPage({
  params,
}: {
  params: { sessionName: string };
}) {
  const { sessionName } = React.use(params);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [name, setName] = React.useState('');
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const decodedName = sessionName.replace(/-/g, ' ');
    return query(
      collection(firestore, 'sessions'),
      where('name', '==', decodedName)
    );
  }, [firestore, sessionName]);

  const {
    data: sessions,
    isLoading: isLoadingSession,
    error,
  } = useCollection<Session>(sessionsQuery);

  const session = sessions && sessions[0];
  
  const { userBooking, hasBooked, hasReviewed, isLoadingStatus } = useBookingStatus(session?.id || '');

  const menteeRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'mentees', user.uid);
  }, [firestore, user]);

  const { data: mentee, isLoading: isLoadingMentee } = useDoc<Mentee>(menteeRef);

  const bookedCount = session?.bookedCount || 0;
  const participantLimit = session?.participants || 1;
  const isFull = bookedCount >= participantLimit;
  const hasSufficientBalance = session && (mentee?.accountBalance || 0) >= session.sessionFee;

  const isLoading = isLoadingSession || isLoadingMentee || isLoadingStatus;


  const handleBooking = async () => {
    if (!user || !mentee) {
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
      menteeName: mentee?.name || user.displayName || 'Anonymous',
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
        title: 'Booking Confirmed!',
        description: `Your booking for "${session.name}" has been successful.`,
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
      toast({
        variant: 'destructive',
        title: 'Information Required',
        description:
          'Please provide your name and phone number to join the waitlist.',
      });
      return;
    }

    const menteeData = user
      ? {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          phone: phoneNumber || (user as any).phoneNumber || '',
        }
      : { id: uuidv4(), name, phone: phoneNumber };

    SessionsAPI.joinWaitlist(
      firestore,
      session.id,
      menteeData as Mentee,
      menteeData.phone
    );
    toast({
      title: 'Waitlist Joined',
      description: "We'll notify you if a spot opens up!",
    });
  };

  const renderFooter = () => {
    if (isLoading || !session) {
      return <Skeleton className="h-12 w-full" />;
    }

    if(hasBooked && userBooking) {
        if (userBooking.status === 'completed' || session.status === 'Expired' || userBooking.status === 'cancelled') {
             return (
                <div className="w-full text-center">
                    <p className="text-sm text-muted-foreground font-semibold mb-2">Session Expired</p>
                    {!hasReviewed && (
                         <Button variant="outline" size="sm" onClick={() => setIsReviewOpen(true)}>Write a Review</Button>
                    )}
                    {hasReviewed && (
                        <p className="text-sm text-muted-foreground">Thank you for your review!</p>
                    )}
                </div>
            );
        }
        if (userBooking.status === 'started' && userBooking.meetingUrl) {
            return (
                <Button asChild className="w-full text-lg">
                    <a href={userBooking.meetingUrl} target="_blank" rel="noopener noreferrer">Join Session</a>
                </Button>
            );
        }
        return (
            <div className="w-full text-center">
                 <Button className="w-full text-lg" disabled>Booking Confirmed</Button>
                 <p className="text-xs text-muted-foreground mt-1">The join link will be active when the session starts.</p>
            </div>
        )
    }

    if (isFull) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full text-lg" variant="secondary">
              Session Full - Notify Me
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Join the Waitlist</AlertDialogTitle>
              <AlertDialogDescription>
                This session is currently full. We'll notify you if a spot
                becomes available.
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
              <AlertDialogAction onClick={handleJoinWaitlist}>
                Join Waitlist
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
    
    const BookingDialog = () => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button className="w-full text-lg">
                {session.sessionFee > 0
                  ? `Book Now for ${formatCurrency(session.sessionFee)}`
                  : 'Claim Your Seat'}
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            {!user ? (
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
            ) : !hasSufficientBalance ? (
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
            ) : (
                 <>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Your Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                           {session.sessionFee > 0 ? (
                                <>
                                The session fee of{' '}
                                <span className="font-bold">{formatCurrency(session.sessionFee)}</span>{' '}
                                will be deducted from your account balance.
                                </>
                           ) : (
                               "This is a free session. Confirm to claim your spot."
                           )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-sm text-muted-foreground">
                        <p>Current Balance: {formatCurrency(mentee?.accountBalance || 0)}</p>
                        <p>New Balance: {formatCurrency((mentee?.accountBalance || 0) - session.sessionFee)}</p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBooking}>
                            Confirm & Book
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </>
            )}
          </AlertDialogContent>
        </AlertDialog>
    );

    return <BookingDialog />;
  };

  const ReviewDialog = ({ booking, session }: { booking: Booking, session: Session }) => {
    const [rating, setRating] = React.useState(0);
    const [reviewText, setReviewText] = React.useState('');

    const handleReviewSubmit = () => {
        if (!firestore || !user) return;
        if (rating === 0) {
            toast({ variant: "destructive", title: "Rating required", description: "Please select a star rating." });
            return;
        }

        const newReview: Review = {
            id: uuidv4(),
            bookingId: booking.id,
            mentorId: session.mentorId,
            menteeId: user.uid,
            rating: rating,
            reviewText: reviewText,
            createdAt: new Date().toISOString(),
        }

        ReviewsAPI.createReview(firestore, newReview);

        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
        setIsReviewOpen(false);
    };
    
    return (
        <AlertDialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Write a Review for "{booking.sessionName}"</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your feedback helps other mentees make better decisions.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4">
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
                  <p className="mt-2 text-muted-foreground">
                    {session.offerings}
                  </p>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Target className="h-5 w-5 text-primary" />
                    Who is this for?
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {session.bestSuitedFor}
                  </p>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    Requirements
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {session.requirements}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {session.sessionFee > 0 ? (
                  <span>{formatCurrency(session.sessionFee)}</span>
                ) : (
                  <span>Free Session</span>
                )}
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
              {session.participants && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {isFull && !hasBooked ? (
                          <span className="text-destructive">No Seats Available</span>
                      ) : (
                          `${bookedCount} / ${participantLimit} Seats Booked`
                      )}
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter>{renderFooter()}</CardFooter>
          </Card>
        </div>
      </div>
      {userBooking && <ReviewDialog booking={userBooking} session={session} />}
    </div>
  );
}

