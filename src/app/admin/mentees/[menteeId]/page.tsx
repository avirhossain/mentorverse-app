
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
import { ChevronLeft, Users, Wallet, CalendarCheck } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Mentee } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function MenteeDetailsPage({
  params,
}: {
  params: { menteeId: string };
}) {
  const { menteeId } = React.use(params);
  const firestore = useFirestore();

  const menteeRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'mentees', menteeId) : null),
    [firestore, menteeId]
  );
  const {
    data: mentee,
    isLoading: loadingMentee,
    error: menteeError,
  } = useDoc<Mentee>(menteeRef);

  const renderMenteeDetails = () => {
    if (loadingMentee) {
      return (
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Separator />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      );
    }

    if (menteeError) {
      return (
        <CardContent>
          <p className="text-destructive">
            Error loading mentee: {menteeError.message}
          </p>
        </CardContent>
      );
    }

    if (!mentee) {
      return (
        <CardContent>
          <p>No mentee found with this ID.</p>
        </CardContent>
      );
    }

    return (
      <>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-semibold">{mentee.name}</h1>
            <Badge variant={mentee.isActive ? 'default' : 'destructive'}>
              {mentee.isActive ? 'Active' : 'Suspended'}
            </Badge>
          </div>
          <CardDescription>
            {mentee.email} {mentee.phone && `| ${mentee.phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sessions
                </CardTitle>
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
                <CardTitle className="text-sm font-medium">
                  Joined Date
                </CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {format(new Date(mentee.createdAt), 'MMM d, yyyy')}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Mentee ID: {mentee.id}
          </div>
        </CardFooter>
      </>
    );
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full max-w-4xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7">
            <Link href="/admin/mentees">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Mentee Details
          </h1>
        </div>
        <Card>{renderMenteeDetails()}</Card>
      </div>
    </div>
  );
}
