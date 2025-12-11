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
import {
  DollarSign,
  Users,
  Clock,
  ArrowUpRight,
  PlayCircle,
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Mentor, Mentee, Booking, Session } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateMeetingForm } from '@/components/admin/CreateMeetingForm';
import { SessionBookingsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  const [isMeetingFormOpen, setIsMeetingFormOpen] = React.useState(false);
  const router = useRouter();

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
        ? query(
            collection(firestore, 'sessions'),
            where('status', '==', 'Active')
          )
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
    useCollection<Session>(runningSessionsQuery);
  const { data: completedBookings, isLoading: loadingBookings } =
    useCollection<Booking>(completedBookingsQuery);

  const totalEarnings =
    completedBookings?.reduce(
      (acc, booking) => acc + (booking.sessionFee || 0),
      0
    ) ?? 0;
  const isLoading =
    loadingMentors || loadingMentees || loadingSessions || loadingBookings;

  const handleMeetingFormSubmit = async (values: {
    mentorId?: string;
    subject: string;
    isShareable: boolean;
  }) => {
    if (!firestore || !adminUser) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database or admin user not available.',
      });
      return;
    }

    try {
      const finalMentorId = values.mentorId === 'none' ? undefined : values.mentorId;
      
      const roomName = await SessionBookingsAPI.createInstantMeeting(firestore, {
        ...values,
        mentorId: finalMentorId,
        mentor: mentors?.find((m) => m.id === finalMentorId),
        admin: adminUser
      });

      toast({
        title: 'Meeting Created',
        description: `The meeting "${values.subject}" has been started.`,
      });
      setIsMeetingFormOpen(false);

      // Open the meeting in a new page inside the app
      if (roomName) {
        router.push(`/admin/meeting/${encodeURIComponent(roomName)}`);
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create meeting',
        description: error.message,
      });
    }
  };

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
    <>
      <div className="flex items-center justify-end gap-2 mb-4">
        <Dialog open={isMeetingFormOpen} onOpenChange={setIsMeetingFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Instant Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create an Instant Meeting</DialogTitle>
              <DialogDescription>
                Set up a one-to-one or shareable meeting right now.
              </DialogDescription>
            </DialogHeader>
            <CreateMeetingForm
              mentors={mentors || []}
              isLoading={loadingMentors}
              onSubmit={handleMeetingFormSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
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
    </>
  );
}
