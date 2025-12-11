'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Booking, Mentee, Mentor, Disbursement } from '@/lib/types';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Users } from 'lucide-react';

export default function EarningsPage() {
  const firestore = useFirestore();

  const completedBookingsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'sessionBookings'),
            where('status', '==', 'completed'),
            orderBy('bookingTime', 'desc')
          )
        : null,
    [firestore]
  );
  const { data: bookings, isLoading: loadingBookings } =
    useCollection<Booking>(completedBookingsQuery);

  const menteesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'mentees'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );
  const { data: mentees, isLoading: loadingMentees } =
    useCollection<Mentee>(menteesQuery);

  const mentorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'mentors'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );
  const { data: mentors, isLoading: loadingMentors } =
    useCollection<Mentor>(mentorsQuery);

  const disbursementsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'disbursements'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore]
  );
  const { data: disbursements, isLoading: loadingDisbursements } =
    useCollection<Disbursement>(disbursementsQuery);

  const isLoading =
    loadingBookings || loadingMentees || loadingMentors || loadingDisbursements;

  const totalEarnings =
    bookings?.reduce((acc, booking) => acc + (booking.sessionFee || 0), 0) ?? 0;

  const totalMenteeBalance =
    mentees?.reduce((acc, mentee) => acc + (mentee.accountBalance || 0), 0) ?? 0;

  const mentorBalances = React.useMemo(() => {
    if (!mentors || !bookings || !disbursements) return [];

    const earningsByMentor =
      bookings.reduce((acc, booking) => {
        acc[booking.mentorId] = (acc[booking.mentorId] || 0) + booking.sessionFee;
        return acc;
      }, {} as { [key: string]: number }) || {};

    const payoutsByMentor =
      disbursements.reduce((acc, disbursement) => {
        acc[disbursement.mentorId] = (acc[disbursement.mentorId] || 0) + disbursement.totalAmount;
        return acc;
      }, {} as { [key: string]: number }) || {};

    return mentors.map(mentor => {
      const totalEarnings = earningsByMentor[mentor.id] || 0;
      const totalPayouts = payoutsByMentor[mentor.id] || 0;
      return {
        ...mentor,
        balance: totalEarnings - totalPayouts,
      };
    });
  }, [mentors, bookings, disbursements]);

  const renderBookingsTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={5}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }
    if (!bookings || bookings.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            No completed sessions found.
          </TableCell>
        </TableRow>
      );
    }
    return bookings.map((booking) => (
      <TableRow key={booking.id}>
        <TableCell>
          <div className="font-medium">{booking.sessionName}</div>
          <div className="text-sm text-muted-foreground">
            {booking.mentorName}
          </div>
        </TableCell>
        <TableCell>
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/admin/mentees/${booking.menteeId}`}>
              {booking.menteeName}
            </Link>
          </Button>
        </TableCell>
        <TableCell>
          {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}
        </TableCell>
        <TableCell>
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/admin/sessions/${booking.sessionId}`}>
              View Session
            </Link>
          </Button>
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(booking.sessionFee)}
        </TableCell>
      </TableRow>
    ));
  };

  const renderMenteesTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={4}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }
    if (!mentees || mentees.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center">
            No mentees found.
          </TableCell>
        </TableRow>
      );
    }
    return mentees.map((mentee, index) => (
      <TableRow key={mentee.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{mentee.displayId || mentee.id}</TableCell>
        <TableCell>
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/admin/mentees/${mentee.id}`}>{mentee.name}</Link>
          </Button>
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(mentee.accountBalance || 0)}
        </TableCell>
      </TableRow>
    ));
  };

  const renderMentorsTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={4}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }
    if (!mentorBalances || mentorBalances.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center">
            No mentors found.
          </TableCell>
        </TableRow>
      );
    }
    return mentorBalances.map((mentor, index) => (
      <TableRow key={mentor.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{mentor.id}</TableCell>
        <TableCell>
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/admin/mentors/${mentor.id}`}>{mentor.name}</Link>
          </Button>
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(mentor.balance)}
        </TableCell>
      </TableRow>
    ));
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Platform Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(totalEarnings)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mentee Balances
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(totalMenteeBalance)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Mentee Balances</CardTitle>
            <CardDescription>
              A list of all mentees and their current account balances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL.</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Balance (BDT)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderMenteesTableBody()}</TableBody>
            </Table>
          </CardContent>
          {mentees && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>{mentees.length}</strong> mentees
              </div>
            </CardFooter>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mentor Balances</CardTitle>
            <CardDescription>
              Each mentor's payable balance (Earnings - Payouts).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL.</TableHead>
                  <TableHead>Mentor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Balance (BDT)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderMentorsTableBody()}</TableBody>
            </Table>
          </CardContent>
          {mentors && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>{mentors.length}</strong> mentors
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
          <CardDescription>
            A detailed list of all completed and paid sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session / Mentor</TableHead>
                <TableHead>Mentee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Amount (BDT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderBookingsTableBody()}</TableBody>
          </Table>
        </CardContent>
        {bookings && (
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{bookings.length}</strong> completed sessions
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
