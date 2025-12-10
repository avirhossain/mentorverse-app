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
import {
  ChevronLeft,
  Users,
  Wallet,
  CalendarCheck,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  PlusCircle,
  PlayCircle,
} from 'lucide-react';
import {
  useDoc,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Mentee, Booking, Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MenteesAPI, BookingsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AddBalanceForm, type AddBalanceFormValues } from '@/components/admin/AddBalanceForm';

export default function MenteeDetailsPage({
  params,
}: {
  params: { menteeId: string };
}) {
  const { menteeId } = React.use(params);
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isAddBalanceOpen, setIsAddBalanceOpen] = React.useState(false);

  // Data fetching
  const menteeRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'mentees', menteeId) : null),
    [firestore, menteeId]
  );
  const { data: mentee, isLoading: loadingMentee } = useDoc<Mentee>(menteeRef);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'bookings'),
      where('menteeId', '==', menteeId),
      orderBy('bookingTime', 'desc')
    );
  }, [firestore, menteeId]);
  const { data: bookings, isLoading: loadingBookings } =
    useCollection<Booking>(bookingsQuery);

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, `mentees/${menteeId}/transactions`),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, menteeId]);
  const { data: transactions, isLoading: loadingTransactions } =
    useCollection<Transaction>(transactionsQuery);

  const isLoading = loadingMentee || loadingBookings || loadingTransactions;

  // --- Handlers ---
  const handleToggleActive = () => {
    if (!firestore || !mentee) return;
    const newStatus = !mentee.isActive;
    MenteesAPI.updateMentee(firestore, menteeId, { isActive: newStatus });
    toast({
      title: `Mentee ${newStatus ? 'Reactivated' : 'Suspended'}`,
      description: `${mentee.name}'s account is now ${
        newStatus ? 'active' : 'suspended'
      }.`,
    });
  };

  const handleDelete = () => {
    if (!firestore || !mentee) return;
    // Note: Deleting a user in Firestore doesn't delete their Auth record.
    // This would require a Cloud Function for a complete cleanup.
    MenteesAPI.deleteMentee(firestore, menteeId);
    toast({
      title: 'Mentee Deleted',
      description: `${mentee.name} has been removed from the database.`,
      variant: 'destructive',
    });
    router.push('/admin/mentees');
  };

  const handleAddBalance = (values: AddBalanceFormValues) => {
    if (!firestore || !mentee) return;
    MenteesAPI.addBalance(firestore, menteeId, values.amount, values.description, values.reference);
    toast({
      title: 'Balance Updated',
      description: `${formatCurrency(values.amount)} was added to ${
        mentee.name
      }'s account.`,
    });
    setIsAddBalanceOpen(false);
  };
  
  const handleStartMeeting = (bookingId: string) => {
    if (!firestore) return;
    BookingsAPI.startMeeting(firestore, bookingId);
    toast({
        title: "Meeting Started",
        description: "The meeting link has been generated and a notification has been sent to the mentee.",
    });
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mentee) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mentee Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No mentee could be found with this ID.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/admin/mentees">
              <ChevronLeft className="mr-2 h-4 w-4" /> Go back to mentees list
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-7 w-7">
          <Link href="/admin/mentees">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {mentee.name}
        </h1>
        <Badge variant={mentee.isActive ? 'default' : 'destructive'}>
          {mentee.isActive ? 'Active' : 'Suspended'}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/mentees/${menteeId}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleToggleActive}>
            {mentee.isActive ? (
              <UserX className="mr-2 h-4 w-4" />
            ) : (
              <UserCheck className="mr-2 h-4 w-4" />
            )}
            {mentee.isActive ? 'Suspend' : 'Reactivate'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  mentee's profile.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mentee.accountBalance || 0)}
            </div>
          </CardContent>
          <CardFooter>
            <Dialog open={isAddBalanceOpen} onOpenChange={setIsAddBalanceOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Balance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Balance to Account</DialogTitle>
                  <DialogDescription>
                    Add funds to {mentee.name}'s account. This will be recorded
                    as a 'topup' transaction.
                  </DialogDescription>
                </DialogHeader>
                <AddBalanceForm
                  onSubmit={handleAddBalance}
                  currentBalance={mentee.accountBalance || 0}
                />
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mentee.totalSessionsBooked || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joined Date</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(mentee.createdAt), 'MMM d, yyyy')}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conducted Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings && bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">{booking.sessionName}</div>
                        <div className="text-sm text-muted-foreground">
                          with {booking.mentorName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.scheduledDate), 'PP')}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(booking.sessionFee)}
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.status === 'confirmed' && (
                           <Button size="sm" onClick={() => handleStartMeeting(booking.id)}>
                            <PlayCircle className="mr-2 h-4 w-4"/>
                            Start Meeting
                          </Button>
                        )}
                        {booking.status === 'started' && (
                          <Button size="sm" asChild>
                            <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">Join Meeting</a>
                          </Button>
                        )}
                         {booking.status === 'completed' && (
                           <Badge variant="secondary">Completed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No sessions taken yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="font-medium capitalize">{tx.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {tx.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(tx.createdAt), 'PPp')}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          tx.type === 'topup' || tx.type === 'refund'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'topup' || tx.type === 'refund' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No transactions recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
