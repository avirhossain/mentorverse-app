
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
import type { Mentor } from '@/lib/types';
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  Star,
  Activity,
  Trash2,
  Edit,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MentorsAPI } from '@/lib/firebase-adapter';
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
import { MentorForm } from '@/components/admin/MentorForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface MentorDetailsPageProps {
  params: {
    mentorId: string;
  };
}

export default function MentorDetailsPage({ params }: MentorDetailsPageProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { mentorId } = params;

  const [isEditFormOpen, setIsEditFormOpen] = React.useState(false);

  const mentorRef = useMemoFirebase(() => {
    if (!firestore || !mentorId) return null;
    return doc(firestore, 'mentors', mentorId);
  }, [firestore, mentorId]);

  const { data: mentor, isLoading, error } = useDoc<Mentor>(mentorRef);

  const handleDelete = () => {
    if (!firestore || !mentor) return;
    MentorsAPI.deleteMentor(firestore, mentor.id);
    toast({
      title: 'Mentor Deleted',
      description: `${mentor.name}'s profile has been removed.`,
    });
    router.push('/admin/mentors');
  };

  const handleEditFormSubmit = (data: Partial<Mentor>) => {
    if (!firestore || !mentor) return;
    MentorsAPI.updateMentor(firestore, mentor.id, data);
    toast({
      title: 'Mentor Updated',
      description: `${data.name}'s profile has been updated.`,
    });
    setIsEditFormOpen(false);
  };
  
  const handleSuspend = () => {
    if (!firestore || !mentor) return;
    MentorsAPI.updateMentor(firestore, mentor.id, { isActive: false });
    toast({
      title: 'Mentor Suspended',
      description: `${mentor.name}'s profile has been suspended and will be hidden.`,
    });
  };

  const handleReactivate = () => {
    if (!firestore || !mentor) return;
    MentorsAPI.updateMentor(firestore, mentor.id, { isActive: true });
    toast({
      title: 'Mentor Reactivated',
      description: `${mentor.name}'s profile is now active and visible.`,
    });
  };

  if (isLoading) {
    return <MentorDetailsSkeleton />;
  }

  if (error || !mentor) {
    console.error(error);
    notFound();
  }

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
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Mentor Details
          </h1>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Image
                src={mentor.photoUrl || 'https://i.pravatar.cc/150'}
                alt={`Photo of ${mentor.name}`}
                width={80}
                height={80}
                className="rounded-full"
                data-ai-hint="person portrait"
              />
              <div className="flex-1">
                <CardTitle className="text-3xl">{mentor.name}</CardTitle>
                <CardDescription>{mentor.id}</CardDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mentor.expertise?.map((exp) => (
                    <Badge key={exp} variant="secondary">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>
               <Badge
                variant={mentor.isActive ? 'default' : 'destructive'}
                className="ml-auto"
              >
                {mentor.isActive ? 'Active' : 'Suspended'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <InfoItem icon={Mail} label="Email" value={mentor.email} />
              <InfoItem
                icon={Phone}
                label="Phone"
                value={mentor.phone || 'Not provided'}
              />
              <InfoItem
                icon={Calendar}
                label="Joined On"
                value={format(new Date(mentor.createdAt), 'MMMM d, yyyy')}
              />
              <InfoItem
                icon={Star}
                label="Average Rating"
                value={`${mentor.ratingAvg?.toFixed(1) || 'N/A'} (${
                  mentor.ratingCount || 0
                } reviews)`}
              />
            </div>
            <div className="space-y-4">
              <InfoItem
                icon={Activity}
                label="Total Sessions"
                value={mentor.totalSessions || 0}
              />
              <InfoItem
                label="Biography"
                value={mentor.bio || 'Not provided'}
                isBlock
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
            <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Edit Mentor</DialogTitle>
                  <DialogDescription>
                    Update the mentor's profile information.
                  </DialogDescription>
                </DialogHeader>
                <MentorForm mentor={mentor} onSubmit={handleEditFormSubmit} />
              </DialogContent>
            </Dialog>
             {mentor.isActive ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend Mentor
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will suspend {mentor.name}'s profile and hide it from the mentee app.
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
                Reactivate Mentor
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-red-800 hover:bg-red-900">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete{' '}
                    {mentor.name}'s profile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
  isBlock = false,
}: {
  icon?: React.ElementType;
  label: string;
  value: string | number;
  isBlock?: boolean;
}) => (
  <div className="flex items-start gap-4">
    {Icon && <Icon className="mt-1 h-5 w-5 text-muted-foreground" />}
    <div className={!Icon ? 'w-full' : ''}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={`text-base font-semibold ${
          isBlock ? 'mt-1 whitespace-pre-wrap' : ''
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const MentorDetailsSkeleton = () => (
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
            {Array.from({ length: 4 }).map((_, i) => (
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
