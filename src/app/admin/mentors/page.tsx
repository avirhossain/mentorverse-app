'use client';

import * as React from 'react';
import { PlusCircle, File, ListFilter, MoreHorizontal } from 'lucide-react';
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
import { MentorForm } from '@/components/admin/MentorForm';
import type { Mentor } from '@/lib/types';

// Placeholder data
const placeholderMentors: Mentor[] = [
  {
    id: 'M01',
    name: 'Dr. Evelyn Reed',
    email: 'evelyn.reed@example.com',
    expertise: ['Quantum Physics', 'Astrobiology'],
    totalSessions: 120,
    ratingAvg: 4.9,
    ratingCount: 45,
    isActive: true,
    createdAt: '2023-01-15T09:30:00Z',
  },
  {
    id: 'M02',
    name: 'Dr. Samuel Cortez',
    email: 'samuel.cortez@example.com',
    expertise: ['AI Ethics', 'Machine Learning'],
    totalSessions: 85,
    ratingAvg: 4.8,
    ratingCount: 30,
    isActive: true,
    createdAt: '2023-02-20T11:00:00Z',
  },
  {
    id: 'M03',
    name: 'Alicia Chen',
    email: 'alicia.chen@example.com',
    expertise: ['Product Management', 'UX/UI Design'],
    totalSessions: 210,
    ratingAvg: 4.9,
    ratingCount: 78,
    isActive: false,
    createdAt: '2022-11-10T14:00:00Z',
  },
];

export default function MentorsPage() {
  const [mentors, setMentors] =
    React.useState<Mentor[]>(placeholderMentors);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedMentor, setSelectedMentor] = React.useState<Mentor | null>(
    null
  );

  const handleCreateNew = () => {
    setSelectedMentor(null);
    setIsFormOpen(true);
  };

  const handleEdit = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Partial<Mentor>) => {
    console.log('Form submitted', data);
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
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Inactive</DropdownMenuCheckboxItem>
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
                  Create Mentor
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedMentor ? 'Edit Mentor' : 'Create Mentor'}
                </DialogTitle>
                <DialogDescription>
                  {selectedMentor
                    ? "Update the mentor's profile information."
                    : 'Fill in the details to add a new mentor.'}
                </DialogDescription>
              </DialogHeader>
              <MentorForm
                mentor={selectedMentor}
                onSubmit={handleFormSubmit}
              />
            </DialogContent>
          </Dialog>
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
                <TableHead>Status</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead className="text-right">Total Sessions</TableHead>
                <TableHead className="text-right">Avg. Rating</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentors.map((mentor) => (
                <TableRow key={mentor.id}>
                  <TableCell className="font-medium">{mentor.name}</TableCell>
                  <TableCell>
                    <Badge variant={mentor.isActive ? 'default' : 'secondary'}>
                      {mentor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {mentor.expertise?.slice(0, 2).map((exp) => (
                        <Badge key={exp} variant="outline">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {mentor.totalSessions}
                  </TableCell>
                  <TableCell className="text-right">
                    {mentor.ratingAvg?.toFixed(1)}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(mentor)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
            Showing <strong>1-{mentors.length}</strong> of{' '}
            <strong>{mentors.length}</strong> mentors
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
