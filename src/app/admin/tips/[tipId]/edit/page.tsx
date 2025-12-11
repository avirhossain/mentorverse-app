
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TipForm } from '@/components/admin/TipForm';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Tip } from '@/lib/types';
import { TipsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditTipPage({
  params,
}: {
  params: { tipId: string };
}) {
  const { tipId } = params;
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const tipRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'tips', tipId) : null),
    [firestore, tipId]
  );
  const { data: tip, isLoading } = useDoc<Tip>(tipRef);

  const handleFormSubmit = (data: Partial<Tip>) => {
    if (!firestore || !tip) return;

    TipsAPI.updateTip(firestore, tip.id, data);
    toast({
      title: 'Tip Updated',
      description: `The tip "${data.title}" has been saved.`,
    });
    router.push(`/admin/tips/${tip.id}`);
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid w-full max-w-3xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7">
            <Link href={`/admin/tips/${tipId}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Edit Tip
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Update Tip Details</CardTitle>
            <CardDescription>
              Modify the form below and click save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-24" />
                <Skeleton className="h-10" />
              </div>
            )}
            {!isLoading && tip && (
              <TipForm tip={tip} onSubmit={handleFormSubmit} />
            )}
            {!isLoading && !tip && <p>Tip not found.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
