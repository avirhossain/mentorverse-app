'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Star, Edit, Trash2, UserX, UserCheck, DollarSign, Users, Wallet } from 'lucide-react';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { Mentor, Booking, Payout } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { MentorsAPI } from '@/lib/firebase-adapter';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export default function MentorDetailsPage({
  params,
}: {
  params: { mentorId: string };
}) {
  const { mentorId } = React.use(params);
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  // Mentor document
  const mentorRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'mentors', mentorId) : null),
    [firestore, mentorId]
  );
  const { data: mentor, isLoading: loadingMentor, error: mentorError } = useDoc<Mentor>(mentorRef);

  // Completed bookings for this mentor
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sessionBookings'), where('mentorId', '==', mentorId), where('status', '==', 'completed'));
  }, [firestore, mentorId]);
  const { data: bookings, isLoading: loadingBookings } = useCollection<Booking>(bookingsQuery);
  
  // Payouts for this mentor
  const payoutsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentors', mentorId, 'payouts'));
  }, [firestore, mentorId]);
  const { data: payouts, isLoading: loadingPayouts } = useCollection<Payout>(payoutsQuery);

  const totalEarnings = React.useMemo(() => {
    return bookings?.reduce((acc, booking) => acc + booking.sessionFee, 0) ?? 0;
  }, [bookings]);

  const totalWithdrawals = React.useMemo(() => {
    return payouts?.reduce((acc, payout) => acc + payout.amount, 0) ?? 0;
  }, [payouts]);

  const isLoading = loadingMentor || loadingBookings || loadingPayouts;

  const handleToggleActive = () => {
    if (!firestore || !mentor) return;
    const newStatus = !mentor.isActive;
    MentorsAPI.updateMentor(firestore, mentorId, { isActive: newStatus });
    toast({
      title: `Mentor ${newStatus ? 'Reactivated' : 'Suspended'}`,
      description: `${mentor.name}'s profile is now ${newStatus ? 'visible' : 'hidden'}.`,
    });
  };

  const handleDelete = () => {
    if (!firestore || !mentor) return;
    MentorsAPI.deleteMentor(firestore, mentorId);
    toast({
      title: 'Mentor Deleted',
      description: `${mentor.name} has been permanently removed.`,
    });
    router.push('/admin/mentors');
  };

  const statCards = [
    { title: "Total Sessions", value: mentor?.totalSessions ?? 0, icon: <Users className="h-4 w-4 text-muted-foreground" /> },
    { title: "Total Earnings", value: formatCurrency(totalEarnings), icon: <DollarSign className="h-4 w-4 text-muted-foreground" /> },
    { title: "Withdrawals", value: formatCurrency(totalWithdrawals), icon: <Wallet className="h-4 w-4 text-muted-foreground" /> },
  ];

  const renderMentorDetails = () => {
    if (loadingMentor) {
      return (
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" /> <Skeleton className="h-4 w-1/2" /> <Separator />
            <Skeleton className="h-20 w-full" /> <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      );
    }

    if (mentorError) {
      return <CardContent><p className="text-destructive">Error loading mentor: {mentorError.message}</p></CardContent>;
    }

    if (!mentor) {
      return <CardContent><p>No mentor found with this ID.</p></CardContent>;
    }

    return (
      <>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{mentor.name}</h1>
              <Badge variant={mentor.isActive ? 'default' : 'destructive'}>
                {mentor.isActive ? 'Active' : 'Suspended'}
              </Badge>
            </div>
             <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm"><Link href={`/admin/mentors/${mentorId}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link></Button>
              <Button variant="outline" size="sm" onClick={handleToggleActive}>
                {mentor.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                {mentor.isActive ? 'Suspend' : 'Reactivate'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />Delete</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the mentor's profile.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <CardDescription>{mentor.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
           <div className="grid gap-2"><h3 className="font-semibold">Biography</h3><p className="text-sm text-muted-foreground">{mentor.bio || 'N/A'}</p></div><Separator />
           <div className="grid gap-2"><h3 className="font-semibold">Experience</h3><p className="text-sm text-muted-foreground">{mentor.experience || 'N/A'}</p></div><Separator />
           <div className="grid gap-2"><h3 className="font-semibold">Education</h3><p className="text-sm text-muted-foreground">{mentor.education || 'N/A'}</p></div><Separator />
           <div className="grid gap-2"><h3 className="font-semibold">What You Can Expect</h3><p className="text-sm text-muted-foreground">{mentor.whatToExpect || 'N/A'}</p></div><Separator />
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2"><h3 className="font-semibold">Awards</h3>
                <div className="flex flex-wrap gap-2">{mentor.awards?.length ? mentor.awards.map(award => <Badge key={award} variant="secondary">{award}</Badge>) : <p className="text-sm text-muted-foreground">N/A</p>}</div>
             </div>
          </div>
          <div className="grid gap-2"><h3 className="font-semibold">Expertise</h3>
            <div className="flex flex-wrap gap-2">{mentor.expertise?.length ? mentor.expertise.map(exp => <Badge key={exp} variant="secondary">{exp}</Badge>) : <p className="text-sm text-muted-foreground">N/A</p>}</div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 border-t px-6 py-4">
          <div className="flex w-full justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><Star className="h-4 w-4" /><span>{mentor.ratingAvg?.toFixed(1) || 'N/A'} ({mentor.ratingCount || 0} reviews)</span></div>
            <span>Joined on {format(new Date(mentor.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </CardFooter>
      </>
    );
  };
  
  const renderBookingsTable = () => {
    if (loadingBookings) {
       return Array.from({ length: 2 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>);
    }
    if (!bookings || bookings.length === 0) {
      return <TableRow><TableCell colSpan={4} className="text-center">No completed sessions found.</TableCell></TableRow>;
    }
    return bookings.map(booking => (
      <TableRow key={booking.id}>
        <TableCell>{format(new Date(booking.scheduledDate), 'MMM d, yyyy')}</TableCell>
        <TableCell>{booking.sessionName}</TableCell>
        <TableCell>
            <Button asChild variant="link" className="p-0 h-auto"><Link href={`/admin/mentees/${booking.menteeId}`}>{booking.menteeName}</Link></Button>
        </TableCell>
        <TableCell className="text-right">{formatCurrency(booking.sessionFee)}</TableCell>
      </TableRow>
    ));
  }

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-7 w-7"><Link href="/admin/mentors"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Back</span></Link></Button>
        <h1 className="text-xl font-semibold">Mentor Details</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{card.title}</CardTitle>{card.icon}</CardHeader>
            <CardContent>{isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{card.value}</div>}</CardContent>
          </Card>
        ))}
      </div>
       <div className="grid gap-4">
        <Card>{renderMentorDetails()}</Card>
        <Card>
            <CardHeader><CardTitle>Conducted Sessions</CardTitle><CardDescription>History of all completed sessions.</CardDescription></CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Mentee</TableHead>
                        <TableHead className="text-right">Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderBookingsTable()}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
