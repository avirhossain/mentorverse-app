
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusCircle, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Mentor } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function MentorsPage() {
  const firestore = useFirestore();

  const mentorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentors'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const {
    data: mentors,
    isLoading,
    error,
  } = useCollection<Mentor>(mentorsQuery);

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-destructive">
            Error loading mentors: {error.message}
          </TableCell>
        </TableRow>
      );
    }

    if (!mentors || mentors.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center">
            No mentors found.
          </TableCell>
        </TableRow>
      );
    }

    return mentors.map((mentor) => (
      <TableRow key={mentor.id}>
        <TableCell className="font-medium">{mentor.name}</TableCell>
        <TableCell>
          {mentor.createdAt ? format(new Date(mentor.createdAt), 'MMM d, yyyy') : 'N/A'}
        </TableCell>
        <TableCell>
           <Badge variant={mentor.isActive ? 'default' : 'destructive'}>
            {mentor.isActive ? 'Active' : 'Suspended'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          {mentor.totalSessions || 0}
        </TableCell>
        <TableCell className="text-right">
          {mentor.ratingAvg?.toFixed(1) || 'N/A'}
        </TableCell>
        <TableCell className="text-right">
            <Button asChild variant="link" size="sm">
              <Link href={`/admin/mentors/${mentor.id}`}>View</Link>
            </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <div className="flex items-center">
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-rap">
              Export
            </span>
          </Button>
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/admin/mentors/creatementor">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create Mentor
              </span>
            </Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mentors</CardTitle>
          <CardDescription>
            Manage your mentors and view their performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Joined On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Sessions</TableHead>
                <TableHead className="text-right">Avg. Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableBody()}</TableBody>
          </Table>
        </CardContent>
        {mentors && (
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-{mentors.length}</strong> of{' '}
              <strong>{mentors.length}</strong> mentors
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
