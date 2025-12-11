
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
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Tip } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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
import { useToast } from '@/hooks/use-toast';
import { TipsAPI } from '@/lib/firebase-adapter';
import { useRouter } from 'next/navigation';

export function TipDetailsClient({ tipId }: { tipId: string }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const tipRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'tips', tipId) : null),
    [firestore, tipId]
  );
  const { data: tip, isLoading } = useDoc<Tip>(tipRef);

  const handleDelete = () => {
    if (!firestore || !tip) return;
    TipsAPI.deleteTip(firestore, tipId);
    toast({
      variant: 'destructive',
      title: 'Tip Deleted',
      description: `The tip "${tip.title}" has been removed.`,
    });
    router.push('/admin/tips');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      );
    }

    if (!tip) {
      return (
        <CardContent>
          <p>This tip could not be found.</p>
        </CardContent>
      );
    }

    return (
      <>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl">{tip.title}</CardTitle>
            <Badge variant={tip.isActive ? 'default' : 'secondary'}>
              {tip.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <CardDescription>
            Published on {format(new Date(tip.createdAt), 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{tip.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className='flex items-center gap-2'>
                 <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/tips/${tipId}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this
                        tip.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                        Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
            <Link href="/admin/tips">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Tip Details
          </h1>
        </div>
        <Card>{renderContent()}</Card>
      </div>
    </div>
  );
}
