
'use client';

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Tip } from '@/lib/types';
import { ChevronLeft, Calendar, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TipsAPI } from '@/lib/firebase-adapter';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TipForm } from '@/components/admin/TipForm';

export default function TipDetailsPage({ params }: { params: { tipId: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const { tipId } = params;

  const [isEditFormOpen, setIsEditFormOpen] = React.useState(false);

  const tipRef = useMemoFirebase(() => {
    if (!firestore || !tipId) return null;
    return doc(firestore, 'tips', tipId);
  }, [firestore, tipId]);

  const { data: tip, isLoading, error } = useDoc<Tip>(tipRef);

  const handleEditFormSubmit = (data: Partial<Tip>) => {
    if (!firestore || !tip) return;
    TipsAPI.updateTip(firestore, tip.id, data);
    toast({
      title: 'Tip Updated',
      description: `The tip "${data.title}" has been updated.`,
    });
    setIsEditFormOpen(false);
  };
  
  const handleDelete = () => {
    if (!firestore || !tip) return;
    TipsAPI.deleteTip(firestore, tip.id);
    toast({
        title: "Tip Deleted",
        description: `The tip "${tip.title}" has been permanently removed.`
    });
    router.push('/admin/tips');
  }

  if (isLoading) {
    return <TipDetailsSkeleton />;
  }

  if (error || !tip) {
    if(error) console.error("Error fetching tip:", error);
    return notFound();
  }

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
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-3xl">{tip.title}</CardTitle>
                    <CardDescription className="mt-1">
                        Published on {format(new Date(tip.createdAt), 'MMMM d, yyyy')}
                    </CardDescription>
                </div>
                <Badge variant={tip.isActive ? 'default' : 'destructive'}>
                    {tip.isActive ? 'Active' : 'Inactive'}
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="prose max-w-none dark:prose-invert">
                <p>{tip.description}</p>
            </div>
          </CardContent>
           <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
             <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Tip
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Edit Tip</DialogTitle>
                  <DialogDescription>
                    Update the content of the tip.
                  </DialogDescription>
                </DialogHeader>
                <TipForm tip={tip} onSubmit={handleEditFormSubmit} />
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this tip.
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

const TipDetailsSkeleton = () => (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full max-w-3xl flex-1 auto-rows-max gap-4">
        <Skeleton className="h-8 w-40" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="mt-4 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
      </div>
    </div>
)
