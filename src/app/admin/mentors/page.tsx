'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusCircle, File, MoreHorizontal } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MentorForm } from '@/components/admin/MentorForm';
import type { Mentor } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { MentorsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function MentorsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isEditFormOpen, setIsEditFormOpen] = React.useState(false);
  const [selectedMentor, setSelectedMentor] = React.useState<Mentor | null>(
    null
  );

  const mentorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentors'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: mentors, isLoading, error } = useCollection<Mentor>(mentorsQuery);

  const handleEdit = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsEditFormOpen(true);
  };

  const handleDelete = (mentorId: string) => {
    if (!firestore) return;
    MentorsAPI.deleteMentor(firestore, mentorId);
    toast({ title: 'Mentor Deleted' });
  };

  const handleEditFormSubmit = (data: Partial<Mentor>) => {
    if (!firestore || !selectedMentor) return;

    MentorsAPI.updateMentor(firestore, selectedMentor.id, data);
    toast({
      title: 'Mentor Updated',
      description: `${data.name}'s profile has been updated.`,
    });

    setIsEditFormOpen(false);
  };

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={5}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-destructive">
            Error loading mentors: {error.message}
          </TableCell>
        </TableRow>
      );
    }

    if (!mentors || mentors.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            No mentors found.
          </TableCell>
        </TableRow>
      );
    }

    return mentors.map((mentor) => (
      <TableRow key={mentor.id}>
        <TableCell>
          <div className="font-medium">{mentor.name}</div>
          <div className="text-sm text-muted-foreground">{mentor.id}</div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {mentor.expertise?.slice(0, 2).map((exp) => (
              <Badge key={exp} variant="outline">
                {exp}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-right">{mentor.totalSessions || 0}</TableCell>
        <TableCell className="text-right">
          {mentor.ratingAvg?.toFixed(1) || 'N/A'}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(mentor)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(mentor.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <TableHead>Expertise</TableHead>
                <TableHead className="text-right">Total Sessions</TableHead>
                <TableHead className="text-right">Avg. Rating</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
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

      {/* Dialog for Editing */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Mentor</DialogTitle>
            <DialogDescription>
              Update the mentor's profile information.
            </DialogDescription>
          </DialogHeader>
          <MentorForm mentor={selectedMentor} onSubmit={handleEditFormSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
}
