
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
  Copy,
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = React.useState(false);
  const [generatedLink, setGeneratedLink] = React.useState('');

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

  const handleCreateMeeting = () => {
    const cleanRoomId = `mentees-meet-${uuidv4()}`;
    const newLink = `${window.location.origin}/meeting/${cleanRoomId}`;
    setGeneratedLink(newLink);
    toast({
      title: 'Meeting Link Generated',
      description: 'You can now start the meeting or copy the link.',
    });
  };
  
  const handleStartMeeting = () => {
    window.open(generatedLink, '_blank');
    setIsMeetingDialogOpen(false);
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
        title: 'Link Copied!',
        description: 'The meeting link has been copied to your clipboard.',
    })
  }

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
        <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setGeneratedLink('')}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Instant Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Instant Meeting</DialogTitle>
              <DialogDescription>
                Generate a unique link for an instant meeting session.
              </DialogDescription>
            </DialogHeader>
            {generatedLink ? (
              <div className="space-y-4">
                <p>Share this link with participants:</p>
                <div className="flex items-center space-x-2">
                    <Input value={generatedLink} readOnly />
                    <Button variant="outline" size="icon" onClick={handleCopyLink}>
                        <Copy className="h-4 w-4"/>
                    </Button>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsMeetingDialogOpen(false)}>Close</Button>
                    <Button onClick={handleStartMeeting}>Start Meeting</Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <Button onClick={handleCreateMeeting}>Generate Meeting Link</Button>
              </div>
            )}
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
