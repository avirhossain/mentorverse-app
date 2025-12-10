
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function MentorDetailsPage({ params }: { params: { mentorId: string } }) {
  const { mentorId } = params;

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
            Mentor Details
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Mentor Details Page</CardTitle>
            <CardDescription>
              This is a placeholder page for a mentor's details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The unique ID for this mentor is:</p>
            <pre className="mt-2 rounded-md bg-muted p-4">
              <code>{mentorId}</code>
            </pre>
            <p className="mt-4 text-muted-foreground">
              (Data fetching will be implemented in a future step.)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
