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
import { ChevronLeft, Star, Edit, Trash2, UserX, UserCheck } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Mentor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
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

export default function MentorDetailsPage({
  params,
}: {
  params: { mentorId: string };
}) {
  const { mentorId } = React.use(params);
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const mentorRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'mentors', mentorId) : null),
    [firestore, mentorId]
  );

  const { data: mentor, isLoading, error } = useDoc<Mentor>(mentorRef);

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
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                  {mentor.name}
                </h1>
                <Badge variant={mentor.isActive ? 'default' : 'destructive'}>
                  {mentor.isActive ? 'Active' : 'Suspended'}
                </Badge>
              </div>
            </div>
             <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/mentors/${mentorId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleToggleActive}>
                {mentor.isActive ? (
                  <UserX className="mr-2 h-4 w-4" />
                ) : (
                  <UserCheck className="mr-2 h-4 w-4" />
                )}
                {mentor.isActive ? 'Suspend' : 'Reactivate'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the mentor's profile and all associated data.
                    </AlertDialogDescription>
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
          <div className="grid gap-2">
            <h3 className="font-semibold">Biography</h3>
            <p className="text-sm text-muted-foreground">{mentor.bio || 'N/A'}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <h3 className="font-semibold">Hourly Rate</h3>
              <p className="text-sm">
                {formatCurrency(mentor.hourlyRate || 0)}
              </p>
            </div>
            <div className="grid gap-2">
              <h3 className="font-semibold">Total Sessions</h3>
              <p className="text-sm">{mentor.totalSessions || 0}</p>
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
              <span>
                {mentor.ratingAvg?.toFixed(1) || 'N/A'} ({mentor.ratingCount || 0}{' '}
                reviews)
              </span>
            </div>
            <span>
              Joined on {format(new Date(mentor.createdAt), 'MMM d, yyyy')}
            </span>
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
            <Link href="/admin/mentors">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Mentor Details</h1>
        </div>
        <Card>{renderContent()}</Card>
      </div>
    </div>
  );
}
