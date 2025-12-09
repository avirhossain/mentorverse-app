'use client';

import * as React from 'react';
import { PlusCircle, File, ListFilter, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SessionForm } from '@/components/admin/SessionForm';
import type { Session, Mentor } from '@/lib/types';
import { format, isPast, parseISO } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { SessionsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';

const getTypeBadgeVariant = (type: Session['sessionType']) => {
    switch (type) {
        case 'Paid': return 'default';
        case 'Free': return 'secondary';
        case 'Exclusive': return 'outline';
        default: return 'secondary';
    }
}

const getStatus = (session: Session): { text: string; variant: "default" | "secondary" | "destructive" } => {
    // Ensure date and time are valid before parsing
    if (!session.scheduledDate || !session.scheduledTime) {
        return { text: 'Invalid Date', variant: 'destructive' };
    }
    try {
        const sessionDate = parseISO(`${session.scheduledDate}T${session.scheduledTime}`);
        if (isPast(sessionDate)) {
            return { text: 'Expired', variant: 'destructive' };
        }
        return { text: 'Active', variant: 'default' };
    } catch (e) {
        return { text: 'Invalid Date', variant: 'destructive' };
    }
};


export default function SessionsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'sessions'),
      orderBy('scheduledDate', 'desc'),
      limit(50)
    );
  }, [firestore]);
  const { data: sessions, isLoading, error } = useCollection<Session>(sessionsQuery);

  const mentorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentors'));
  }, [firestore]);
  const { data: mentors, isLoading: isLoadingMentors } = useCollection<Mentor>(mentorsQuery);


  const handleCreateNew = () => {
    setSelectedSession(null);
    setIsFormOpen(true);
  };

  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  };
  
  const handleDelete = (sessionId: string) => {
    if (!firestore) return;
    SessionsAPI.deleteSession(firestore, sessionId);
    toast({ title: 'Session deleted' });
  }

  const handleFormSubmit = (data: Partial<Session>) => {
    if (!firestore) return;

    // The mentorName should be derived from the selected mentorId
    const selectedMentor = mentors?.find(m => m.id === data.mentorId);
    const submissionData = {
        ...data,
        mentorName: selectedMentor?.name || 'Unknown Mentor',
    };

    if (selectedSession) { // Update
      SessionsAPI.updateSession(firestore, selectedSession.id, submissionData);
       toast({ title: 'Session Updated', description: `The session "${data.name}" has been updated.` });
    } else { // Create
      SessionsAPI.createSession(firestore, submissionData as Session);
      toast({ title: 'Session Created', description: `The session "${data.name}" has been created.` });
    }
    
    setIsFormOpen(false);
    setSelectedSession(null);
  };
  
  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={7}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }
    
    if (error) {
       return <TableRow><TableCell colSpan={7} className="text-center text-destructive">Error loading sessions: {error.message}</TableCell></TableRow>
    }
    
    if (!sessions || sessions.length === 0) {
      return <TableRow><TableCell colSpan={7} className="text-center">No sessions found.</TableCell></TableRow>
    }
    
    return sessions.map((session) => {
      const status = getStatus(session);
      return (
        <TableRow key={session.id}>
          <TableCell>
              <div className="font-medium">{session.name}</div>
          </TableCell>
          <TableCell>{session.mentorName}</TableCell>
          <TableCell>
            {session.scheduledDate ? format(new Date(session.scheduledDate), 'MMM d, yyyy') : 'N/A'} at {session.scheduledTime}
          </TableCell>
          <TableCell>
             <Badge variant={getTypeBadgeVariant(session.sessionType)}>
                {session.sessionType}
             </Badge>
          </TableCell>
          <TableCell>
            <Badge variant={status.variant}>
              {status.text}
            </Badge>
          </TableCell>
          <TableCell className="text-right">${session.sessionFee.toFixed(2)}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-haspopup="true"
                  size="icon"
                  variant="ghost"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(session)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(session.id)}>
                    Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      )
    });
  }


  return (
    <>
      <div className="flex items-center">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search sessions..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem>Expired</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1" onClick={handleCreateNew}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-rap">
                  Create Session
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[725px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedSession ? 'Edit Session Offering' : 'Create Session Offering'}
                </DialogTitle>
                <DialogDescription>
                  {selectedSession
                    ? "Update the session's details."
                    : 'Create a new session template that mentees can book.'}
                </DialogDescription>
              </DialogHeader>
              {isFormOpen && (
                <SessionForm
                  key={selectedSession?.id || 'new'}
                  session={selectedSession}
                  mentors={mentors || []}
                  onSubmit={handleFormSubmit}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Session Offerings</CardTitle>
          <CardDescription>
            Manage all available session templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fee (BDT)</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
