'use client';

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Mentee } from '@/lib/types';
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Calendar,
  BadgeDollarSign,
  Activity,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MenteesAPI } from '@/lib/firebase-adapter';
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

interface MenteeDetailsPageProps {
  params: {
    menteeId: string;
  };
}

export default function MenteeDetailsPage({ params }: MenteeDetailsPageProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { menteeId } = React.use(params);

  const menteeRef = useMemoFirebase(() => {
    if (!firestore || !menteeId) return null;
    return doc(firestore, 'mentees', menteeId);
  }, [firestore, menteeId]);

  const { data: mentee, isLoading, error } = useDoc<Mentee>(menteeRef);

  const handleSuspend = () => {
    if (!firestore || !mentee) return;
    MenteesAPI.updateMentee(firestore, mentee.id, { isActive: false });
    toast({
      title: 'Account Suspended',
      description: `${mentee.name}'s account has been suspended.`,
    });
  };

  const handleReactivate = () => {
    if (!firestore || !mentee) return;
    MenteesAPI.updateMentee(firestore, mentee.id, { isActive: true });
    toast({
      title: 'Account Reactivated',
      description: `${mentee.name}'s account is now active.`,
    });
  };

  if (isLoading) {
    return <MenteeDetailsSkeleton />;
  }

  if (error || !mentee) {
    // This could be a permissions error or document not found
    console.error(error);
    notFound();
  }

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
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Image
                src={mentee.photoUrl || 'https://i.pravatar.cc/150'}
                alt={`Photo of ${mentee.name}`}
                width={80}
                height={80}
                className="rounded-full"
                data-ai-hint="person portrait"
              />
              <div className="flex-1">
                <CardTitle className="text-3xl">{mentee.name}</CardTitle>
                <CardDescription>{mentee.id}</CardDescription>
              </div>
              <Badge
                variant={mentee.isActive ? 'default' : 'destructive'}
                className="ml-auto"
              >
                {mentee.isActive ? 'Active' : 'Suspended'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <InfoItem icon={Mail} label="Email" value={mentee.email} />
              <InfoItem
                icon={Phone}
                label="Phone"
                value={mentee.phone || 'Not provided'}
              />
              <InfoItem
                icon={Calendar}
                label="Joined On"
                value={format(new Date(mentee.createdAt), 'MMMM d, yyyy')}
              />
            </div>
            <div className="space-y-4">
              <InfoItem
                icon={BadgeDollarSign}
                label="Account Balance"
                value={formatCurrency(mentee.accountBalance || 0)}
              />
              <InfoItem
                icon={Activity}
                label="Sessions Booked"
                value={mentee.totalSessionsBooked || 0}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline">Edit Profile</Button>
            {mentee.isActive ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will suspend {mentee.name}'s account and prevent them
                      from logging in or using the app.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSuspend}>
                      Yes, Suspend
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="secondary" onClick={handleReactivate}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Reactivate Account
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-start gap-4">
    <Icon className="mt-1 h-5 w-5 text-muted-foreground" />
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  </div>
);

const MenteeDetailsSkeleton = () => (
  <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
    <div className="mx-auto grid w-full max-w-4xl flex-1 auto-rows-max gap-4">
      <Skeleton className="h-8 w-48" />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-6 w-6" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-6 w-6" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
