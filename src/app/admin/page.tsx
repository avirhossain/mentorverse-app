'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Users, Clock } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Mentor, Mentee, Session } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const mentorsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'mentors'), where('isActive', '==', true)) : null),
    [firestore]
  );
  const menteesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'mentees') : null),
    [firestore]
  );
  const runningSessionsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'sessions'), where('isActive', '==', true)) : null),
    [firestore]
  );
  
  const { data: mentors, isLoading: loadingMentors } = useCollection<Mentor>(mentorsQuery);
  const { data: mentees, isLoading: loadingMentees } = useCollection<Mentee>(menteesQuery);
  const { data: runningSessions, isLoading: loadingSessions } = useCollection<Session>(runningSessionsQuery);
  const { data: allSessions, isLoading: loadingAllSessions } = useCollection<Session>(useMemoFirebase(() => firestore ? collection(firestore, 'sessions') : null, [firestore]));

  const totalEarnings = allSessions?.reduce((acc, session) => acc + (session.sessionFee || 0), 0) ?? 0;
  const isLoading = loadingMentors || loadingMentees || loadingSessions || loadingAllSessions;

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
      loading: loadingAllSessions,
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
        </Card>
      ))}
    </div>
  );
}
