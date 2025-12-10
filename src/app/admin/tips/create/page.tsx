
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
import { useFirestore, useUser } from '@/firebase';
import type { Tip } from '@/lib/types';
import { TipsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateTipPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [formKey, setFormKey] = React.useState(Date.now());

  const handleFormSubmit = (data: Partial<Tip>) => {
    if (!firestore || !user) return;

    const newTip: Partial<Tip> = {
        ...data,
        adminId: user.uid,
        createdAt: new Date().toISOString(),
    };
    
    TipsAPI.createTip(firestore, newTip);

    toast({
      title: 'Tip Created',
      description: `The tip "${data.title}" has been saved.`,
    });
    setFormKey(Date.now()); // Reset form by changing key
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
            Create New Tip
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tip Details</CardTitle>
            <CardDescription>
              Fill out the form to create a new tip for mentees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TipForm key={formKey} onSubmit={handleFormSubmit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
