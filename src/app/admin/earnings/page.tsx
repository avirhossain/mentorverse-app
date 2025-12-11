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
import type { Booking } from '@/lib/types';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

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
  const { data: bookings, isLoading } =
    useCollection<Booking>(completedBookingsQuery);

  const totalEarnings =
    bookings?.reduce((acc, booking) => acc + (booking.sessionFee || 0), 0) ?? 0;

  const renderTableBody = () => {
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
            <Link href={`/admin/mentees/${booking.menteeId}`}>{booking.menteeName}</Link>
          </Button>
        </TableCell>
        <TableCell>
          {format(new Date(booking.scheduledDate), 'MMM d, yyyy')}
        </TableCell>
        <TableCell>
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/admin/sessions/${booking.sessionId}`}>View Session</Link>
          </Button>
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(booking.sessionFee)}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-fit">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
          )}
        </CardContent>
      </Card>
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
            <TableBody>{renderTableBody()}</TableBody>
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
