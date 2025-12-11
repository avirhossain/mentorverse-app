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
import { formatCurrency } from '@/lib/utils';
import { Users, ChevronLeft } from 'lucide-react';

export default function EarningsPage() {
  const firestore = useFirestore();

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

  // Fetch related data for balance calculation
  const completedBookingsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'sessionBookings'),
            where('status', '==', 'completed')
          )
        : null,
    [firestore]
  );
  const { data: bookings, isLoading: loadingBookings } =
    useCollection<Booking>(completedBookingsQuery);

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
    loadingMentees || loadingMentors || loadingBookings || loadingDisbursements;

  const totalMenteeBalance =
    mentees?.reduce((acc, mentee) => acc + (mentee.accountBalance || 0), 0) ??
    0;

  const mentorBalances = React.useMemo(() => {
    if (!mentors || !bookings || !disbursements) return [];

    const earningsByMentor =
      bookings.reduce(
        (acc, booking) => {
          acc[booking.mentorId] =
            (acc[booking.mentorId] || 0) + booking.sessionFee;
          return acc;
        },
        {} as { [key: string]: number }
      ) || {};

    const payoutsByMentor =
      disbursements.reduce(
        (acc, disbursement) => {
          acc[disbursement.mentorId] =
            (acc[disbursement.mentorId] || 0) + disbursement.totalAmount;
          return acc;
        },
        {} as { [key: string]: number }
      ) || {};

    return mentors.map((mentor) => {
      const totalEarnings = earningsByMentor[mentor.id] || 0;
      const totalPayouts = payoutsByMentor[mentor.id] || 0;
      return {
        ...mentor,
        balance: totalEarnings - totalPayouts,
      };
    });
  }, [mentors, bookings, disbursements]);

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
  };

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-7 w-7">
          <Link href="/admin">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Earnings & Balances
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
}
