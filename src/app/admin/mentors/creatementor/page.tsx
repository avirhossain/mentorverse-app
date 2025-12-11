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
import { MentorForm } from '@/components/admin/MentorForm';
import { useFirestore } from '@/firebase';
import type { Mentor } from '@/lib/types';
import { MentorsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export default function CreateMentorPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [formKey, setFormKey] = React.useState(Date.now());


  const handleFormSubmit = (data: Partial<Mentor>) => {
    if (!firestore) return;

    const newId = uuidv4();
    const newMentor: Mentor = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    } as Mentor;

    MentorsAPI.createMentor(firestore, newMentor);
    toast({
      title: 'Mentor Created',
      description: `A new profile for ${data.name} has been created.`,
    });
    // Redirect to the new mentor's detail page after creation
    router.push(`/admin/mentors/${newId}`);
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
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Create New Mentor
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Mentor Profile</CardTitle>
            <CardDescription>
              Fill in the details to add a new mentor to the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MentorForm key={formKey} onSubmit={handleFormSubmit} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
