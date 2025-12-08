import { Clock, Calendar, Tag } from 'lucide-react';
import type { Session, Booking } from '@/lib/types';
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
import { useUser, useFirestore } from '@/firebase';
import { BookingsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

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

  const handleBooking = () => {
    if (!user) {
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

    const newBooking: Booking = {
      id: uuidv4(),
      sessionId: session.id,
      sessionName: session.name,
      mentorId: session.mentorId,
      mentorName: session.mentorName,
      menteeId: user.uid,
      menteeName: user.displayName || 'Anonymous',
      bookingTime: new Date().toISOString(),
      scheduledDate: session.scheduledDate,
      scheduledTime: session.scheduledTime,
      status: 'confirmed',
      sessionFee: session.sessionFee,
      adminDisbursementStatus: 'pending',
    };

    BookingsAPI.createBooking(firestore, newBooking);

    toast({
      title: 'Session Booked!',
      description: `Your booking for "${session.name}" has been confirmed.`,
    });
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
          {'tag' in session && session.tag && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{session.tag}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch p-4 pt-0">
        <div className="mb-4 text-center text-2xl font-bold">
          {session.sessionType === 'Free'
            ? 'Free'
            : formatCurrency(session.sessionFee)}
        </div>
        <div className="flex gap-2">
          {isBooking ? (
             <Button className="w-full">View Details</Button>
          ) : (
            <>
              <Button variant="outline" className="w-full">
                See More
              </Button>
              <Button className="w-full" onClick={handleBooking}>Book Session</Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

    