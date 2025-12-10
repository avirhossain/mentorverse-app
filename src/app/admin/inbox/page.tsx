'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { SpecialRequest } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';

export default function InboxPage() {
  const firestore = useFirestore();

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'specialRequests'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore]);

  const { data: requests, isLoading } = useCollection<SpecialRequest>(requestsQuery);

  const getStatusVariant = (status: SpecialRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'denied':
        return 'destructive';
    }
  };

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}>
            <Skeleton className="h-10 w-full" />
          </TableCell>
        </TableRow>
      ));
    }
    if (!requests || requests.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center">
            Your inbox is empty.
          </TableCell>
        </TableRow>
      );
    }
    return requests.map((req) => (
      <TableRow key={req.id}>
        <TableCell>
          <div className="font-medium">{req.menteeName}</div>
          <div className="text-sm text-muted-foreground">to {req.mentorName}</div>
        </TableCell>
        <TableCell className="max-w-xs truncate">
            {req.message}
        </TableCell>
        <TableCell>
          {format(new Date(req.createdAt), 'MMM d, yyyy, p')}
        </TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
        </TableCell>
        <TableCell className="text-right">
          {req.status === 'pending' && (
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline">
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button size="sm" variant="destructive">
                <X className="mr-2 h-4 w-4" /> Deny
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Special Requests Inbox</CardTitle>
        <CardDescription>
          Review and respond to special session requests from mentees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
