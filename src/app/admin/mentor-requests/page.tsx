'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { MentorRequest } from '@/lib/types';
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
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Mail } from 'lucide-react';
import { MentorRequestsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';

export default function MentorRequestsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = React.useState<MentorRequest | null>(null);

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentorRequests'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: requests, isLoading } = useCollection<MentorRequest>(requestsQuery);
  
  const handleMarkAsReviewed = (request: MentorRequest) => {
    if (!firestore) return;
    MentorRequestsAPI.updateRequest(firestore, request.id, { status: 'reviewed' });
    toast({
        title: 'Marked as Reviewed',
        description: `Application from ${request.name} has been marked as reviewed.`,
    });
  };

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (!requests || requests.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center">No mentor applications found.</TableCell>
        </TableRow>
      );
    }
    return requests.map((req) => (
      <TableRow key={req.id}>
        <TableCell>
          <div className="font-medium">{req.name}</div>
          <div className="text-sm text-muted-foreground">{req.phone}</div>
        </TableCell>
        <TableCell>{format(new Date(req.createdAt), 'PPp')}</TableCell>
        <TableCell>
          <Badge variant={req.status === 'pending' ? 'destructive' : 'secondary'}>
            {req.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right flex gap-2 justify-end">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">View Summary</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Professional Summary for {req.name}</DialogTitle>
                    </DialogHeader>
                    <p className="py-4 text-sm text-muted-foreground">{req.professionalSummary}</p>
                </DialogContent>
            </Dialog>
            <Button asChild variant="outline" size="sm">
                <a href={`mailto:${req.phone}`}>
                    <Mail className="mr-2 h-4 w-4" /> Email
                </a>
            </Button>
          {req.status === 'pending' && (
            <Button size="sm" onClick={() => handleMarkAsReviewed(req)}>
              <Check className="mr-2 h-4 w-4" /> Mark as Reviewed
            </Button>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor Applications</CardTitle>
        <CardDescription>
          Review and manage applications from users who want to become mentors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Date</TableHead>
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
