'use client';

import * as React from 'react';
import {
  PlusCircle,
  File,
  ListFilter,
  MoreHorizontal,
} from 'lucide-react';
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
import { TipForm } from '@/components/admin/TipForm';
import type { Tip } from '@/lib/types';
import { format } from 'date-fns';

// Placeholder data
const placeholderTips: Tip[] = [
  {
    id: 'T01',
    title: 'How to Prepare for Your First Mentorship Session',
    description: 'A quick guide to get the most out of your meeting.',
    isActive: true,
    createdAt: '2024-05-15T10:00:00Z',
    adminId: 'A01',
  },
  {
    id: 'T02',
    title: 'Setting Clear Goals with Your Mentor',
    description: 'Define what you want to achieve.',
    isActive: true,
    createdAt: '2024-05-20T11:30:00Z',
    adminId: 'A01',
  },
  {
    id: 'T03',
    title: 'The Art of Following Up',
    description: 'Keep the momentum going after your session ends.',
    isActive: false,
    createdAt: '2024-04-10T09:00:00Z',
    adminId: 'A01',
  },
];

export default function TipsPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Tip | null>(null);

  const handleCreateNew = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Tip) => {
    setSelected(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Partial<Tip>) => {
    console.log('Tip form submitted', data);
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
              <Button
                size="sm"
                className="h-8 gap-1"
                onClick={handleCreateNew}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Create Tip
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{selected ? 'Edit Tip' : 'Create Tip'}</DialogTitle>
                <DialogDescription>
                  Provide a helpful tip or article for mentees.
                </DialogDescription>
              </DialogHeader>
              <TipForm tip={selected} onSubmit={handleFormSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tips for Mentees</CardTitle>
          <CardDescription>
            Create and manage helpful content for your users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderTips.map((tip) => (
                <TableRow key={tip.id}>
                  <TableCell className="font-medium">{tip.title}</TableCell>
                  <TableCell>
                    <Badge variant={tip.isActive ? 'default' : 'secondary'}>
                      {tip.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(tip.createdAt), 'MMM d, yyyy')}
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
                        <DropdownMenuItem onClick={() => handleEdit(tip)}>
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
      </Card>
    </>
  );
}
