'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Users, Clock, ArrowUpRight } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Mentor, Mentee, Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const mentorsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'mentors') : null),
    [firestore]
  );
  const menteesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'mentees') : null),
    [firestore]
  );
  const runningSessionsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'sessions'), where('status', '==', 'Active'))
        : null,
    [firestore]
  );

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

  const { data: mentors, isLoading: loadingMentors } =
    useCollection<Mentor>(mentorsQuery);
  const { data: mentees, isLoading: loadingMentees } =
    useCollection<Mentee>(menteesQuery);
  const { data: runningSessions, isLoading: loadingSessions } =
    useCollection<Booking>(runningSessionsQuery);
  const { data: completedBookings, isLoading: loadingBookings } =
    useCollection<Booking>(completedBookingsQuery);

  const totalEarnings =
    completedBookings?.reduce(
      (acc, booking) => acc + (booking.sessionFee || 0),
      0
    ) ?? 0;
  const isLoading =
    loadingMentors || loadingMentees || loadingSessions || loadingBookings;

  const statItems = [
    {
      title: 'Total Mentors',
      value: mentors?.length.toString() ?? '0',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      loading: loadingMentors,
    },
    {
      title: 'Total Mentees',
      value: mentees?.length.toString() ?? '0',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      loading: loadingMentees,
    },
    {
      title: 'Running Sessions',
      value: runningSessions?.length.toString() ?? '0',
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      loading: loadingSessions,
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(totalEarnings),
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      loading: loadingBookings,
      link: '/admin/earnings',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            {item.loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{item.value}</div>
            )}
          </CardContent>
          {item.link && (
            <CardFooter>
              <Button asChild variant="link" className="p-0 h-auto text-xs">
                <Link href={item.link}>
                  More <ArrowUpRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
