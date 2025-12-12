'use client';

import * as React from 'react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Booking, Review, Session } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReviewsAPI } from '@/lib/firebase-adapter';
import { v4 as uuidv4 } from 'uuid';

function PastSessionCard({ booking }: { booking: Booking }) {
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const sessionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'sessions', booking.sessionId);
  }, [firestore, booking.sessionId]);
  const { data: session } = useDoc<Session>(sessionRef);

  const reviewQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'reviews'),
      where('bookingId', '==', booking.id),
      where('menteeId', '==', user.uid)
    );
  }, [firestore, user, booking.id]);
  const { data: reviews, isLoading: isLoadingReview } =
    useCollection<Review>(reviewQuery);

  const hasReviewed = reviews && reviews.length > 0;

  const ReviewDialog = () => {
    const [rating, setRating] = React.useState(0);
    const [reviewText, setReviewText] = React.useState('');

    const handleReviewSubmit = () => {
      if (!firestore || !user || !session) return;
      if (rating === 0) {
        toast({
          variant: 'destructive',
          title: 'Rating required',
          description: 'Please select a star rating.',
        });
        return;
      }

      const newReview: Review = {
        id: uuidv4(),
        bookingId: booking.id,
        mentorId: booking.mentorId,
        menteeId: user.uid,
        menteeName: user.displayName || 'Anonymous',
        rating: rating,
        reviewText: reviewText,
        createdAt: new Date().toISOString(),
      };

      ReviewsAPI.createReview(firestore, newReview);
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });
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
            <AlertDialogAction onClick={handleReviewSubmit}>
              Submit Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{booking.sessionName}</CardTitle>
        <CardDescription>
          {format(new Date(booking.scheduledDate), 'PPP')} with{' '}
          <Link href={`/${booking.mentorName.replace(/\s+/g, '-')}`} className="text-primary hover:underline">
            {booking.mentorName}
          </Link>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        {isLoadingReview ? (
          <Skeleton className="h-10 w-24" />
        ) : hasReviewed ? (
          <p className="text-sm text-muted-foreground">Review submitted</p>
        ) : (
          <Button variant="outline" onClick={() => setIsReviewOpen(true)}>
            Write a Review
          </Button>
        )}
      </CardFooter>
      <ReviewDialog />
    </Card>
  );
}

export default function MySessionsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'sessionBookings'),
      where('menteeId', '==', user.uid),
      orderBy('bookingTime', 'desc')
    );
  }, [firestore, user]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  if (isUserLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">My Sessions</h1>
        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please log in to see your sessions.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Sessions</h1>
      {bookings && bookings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <PastSessionCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">No Sessions Yet</h2>
            <p className="text-muted-foreground mt-2">You haven't booked any sessions.</p>
            <Button asChild className="mt-4">
                <Link href="/">Explore Sessions</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
