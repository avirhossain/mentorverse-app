'use client';

import * as React from 'react';
import { PlusCircle, File, ListFilter, MoreHorizontal } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { SessionForm } from '@/components/admin/SessionForm';
import type { Session, Mentor } from '@/lib/types';
import { format } from 'date-fns';

// Placeholder data
const placeholderSessions: (Session & { mentorName: string })[] = [
  {
    id: 'S01',
    mentorId: 'M01',
    mentorName: 'Dr. Evelyn Reed',
    menteeId: 'U01',
    name: 'Intro to Quantum Computing',
    sessionType: 'Paid',
    bookingTime: '2024-05-10T10:00:00Z',
    scheduledDate: '2024-05-20',
    scheduledTime: '14:00',
    status: 'confirmed',
    sessionFee: 75,
    adminDisbursementStatus: 'pending',
  },
  {
    id: 'S02',
    mentorId: 'M02',
    mentorName: 'Dr. Samuel Cortez',
    menteeId: 'U02',
    name: 'Ethical Frameworks for AI',
    sessionType: 'Free',
    bookingTime: '2024-05-11T11:30:00Z',
    scheduledDate: '2024-05-22',
    scheduledTime: '16:00',
    status: 'pending',
    sessionFee: 0,
    adminDisbursementStatus: 'pending',
  },
  {
    id: 'S03',
    mentorId: 'M03',
    mentorName: 'Alicia Chen',
    menteeId: 'U03',
    name: 'Advanced UX Prototyping',
    sessionType: 'Exclusive',
    bookingTime: '2024-05-12T09:00:00Z',
    scheduledDate: '2024-05-25',
    scheduledTime: '10:00',
    status: 'completed',
    sessionFee: 150,
    adminDisbursementStatus: 'paid',
  },
];

const placeholderMentors: Mentor[] = [
    { id: 'M01', name: 'Dr. Evelyn Reed', email: 'e.reed@example.com', createdAt: '', isActive: true },
    { id: 'M02', name: 'Dr. Samuel Cortez', email: 's.cortez@example.com', createdAt: '', isActive: true },
    { id: 'M03', name: 'Alicia Chen', email: 'a.chen@example.com', createdAt: '', isActive: true },
];

export default function SessionsPage() {
  const [sessions, setSessions] = React.useState(placeholderSessions);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(
    null
  );

  const handleCreateNew = () => {
    setSelectedSession(null);
    setIsFormOpen(true);
  };

  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Partial<Session>) => {
    console.log('Session form submitted', data);
    // Here you would handle the actual data submission (create or update)
    setIsFormOpen(false);
  };

  return (
    <>
      <div className="flex items-center">
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
              <DropdownMenuCheckboxItem checked>Pending</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Confirmed</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Cancelled</DropdownMenuCheckboxItem>
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
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Create Session
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[725px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedSession ? 'Edit Session' : 'Create Session'}
                </DialogTitle>
                <DialogDescription>
                  {selectedSession
                    ? "Update the session's details."
                    : 'Fill in the details to schedule a new session.'}
                </DialogDescription>
              </DialogHeader>
              <SessionForm
                session={selectedSession}
                mentors={placeholderMentors}
                onSubmit={handleFormSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Manage all scheduled mentorship sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.name}</TableCell>
                  <TableCell>{session.mentorName}</TableCell>
                  <TableCell>
                    {format(new Date(session.scheduledDate), 'MMM d, yyyy')} at {session.scheduledTime}
                  </TableCell>
                  <TableCell>
                     <Badge variant={
                        session.sessionType === 'Free' ? 'secondary' : 
                        session.sessionType === 'Paid' ? 'default' : 
                        'outline'
                     }>
                        {session.sessionType}
                     </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={session.status === 'completed' ? 'default' : session.status === 'confirmed' ? 'outline' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${session.sessionFee}</TableCell>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                         <DropdownMenuItem>Cancel Session</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{sessions.length}</strong> of{' '}
            <strong>{sessions.length}</strong> sessions
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
