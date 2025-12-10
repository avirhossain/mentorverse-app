
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
import { ChevronLeft, Star } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Mentor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function MentorDetailsPage({
  params,
}: {
  params: { mentorId: string };
}) {
  const { mentorId } = params;
  const firestore = useFirestore();

  const mentorRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'mentors', mentorId) : null),
    [firestore, mentorId]
  );

  const { data: mentor, isLoading, error } = useDoc<Mentor>(mentorRef);

  const renderContent = () => {
    if (isLoading) {
      return (
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Separator />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      );
    }

    if (error) {
      return (
        <CardContent>
          <p className="text-destructive">
            Error loading mentor: {error.message}
          </p>
        </CardContent>
      );
    }

    if (!mentor) {
      return (
        <CardContent>
          <p>No mentor found with this ID.</p>
        </CardContent>
      );
    }

    return (
      <>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <h3 className="font-semibold">Biography</h3>
            <p className="text-sm text-muted-foreground">{mentor.bio || 'N/A'}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm">{mentor.email}</p>
            </div>
            <div className="grid gap-2">
              <h3 className="font-semibold">Hourly Rate</h3>
              <p className="text-sm">
                {formatCurrency(mentor.hourlyRate || 0)}
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            <h3 className="font-semibold">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise?.length ? (
                mentor.expertise.map((exp) => (
                  <Badge key={exp} variant="secondary">
                    {exp}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">N/A</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 border-t px-6 py-4">
            <div className="flex w-full justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{mentor.ratingAvg?.toFixed(1) || 'N/A'} ({mentor.ratingCount || 0} reviews)</span>
                </div>
                 <span>Joined on {format(new Date(mentor.createdAt), 'MMM d, yyyy')}</span>
            </div>
        </CardFooter>
      </>
    );
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full max-w-3xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7">
            <Link href="/admin/mentors">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {mentor?.name || 'Mentor Details'}
            </h1>
            {mentor && (
              <Badge variant={mentor.isActive ? 'default' : 'destructive'}>
                {mentor.isActive ? 'Active' : 'Suspended'}
              </Badge>
            )}
          </div>
        </div>
        <Card>{renderContent()}</Card>
      </div>
    </div>
  );
}
