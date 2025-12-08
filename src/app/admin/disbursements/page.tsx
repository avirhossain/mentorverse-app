'use client';

import * as React from 'react';
import {
  PlusCircle,
  File,
  ListFilter,
  MoreHorizontal,
  Search,
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DisbursementForm } from '@/components/admin/DisbursementForm';
import type { Disbursement, Mentor } from '@/lib/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

// Placeholder data
const placeholderDisbursements: (Disbursement & { mentorName: string })[] = [
  {
    id: 'D01',
    mentorId: 'M02',
    mentorName: 'Dr. Samuel Cortez',
    totalAmount: 350,
    sessions: ['S05', 'S06'],
    status: 'paid',
    paidAt: '2024-05-30T10:00:00Z',
    createdAt: '2024-05-29T10:00:00Z',
    adminId: 'A01',
  },
  {
    id: 'D02',
    mentorId: 'M01',
    mentorName: 'Dr. Evelyn Reed',
    totalAmount: 150,
    sessions: ['S01', 'S04'],
    status: 'pending',
    createdAt: '2024-06-01T11:00:00Z',
    adminId: 'A01',
  },
];

const placeholderMentors: Mentor[] = [
  {
    id: 'M01',
    name: 'Dr. Evelyn Reed',
    email: 'e.reed@example.com',
    createdAt: '',
    isActive: true,
  },
  {
    id: 'M02',
    name: 'Dr. Samuel Cortez',
    email: 's.cortez@example.com',
    createdAt: '',
    isActive: true,
  },
  {
    id: 'M03',
    name: 'Alicia Chen',
    email: 'a.chen@example.com',
    createdAt: '',
    isActive: true,
  },
];

const getStatusBadgeVariant = (status: Disbursement['status']) => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export default function DisbursementsPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Disbursement | null>(null);

  const handleCreateNew = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Disbursement) => {
    setSelected(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Partial<Disbursement>) => {
    console.log('Disbursement form submitted', data);
    setIsFormOpen(false);
  };

  return (
    <>
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by mentor name or ID..."
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
              <DropdownMenuCheckboxItem checked>Pending</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Paid</DropdownMenuCheckboxItem>
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
                  Create
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {selected ? 'Edit Disbursement' : 'Create Disbursement'}
                </DialogTitle>
                <DialogDescription>
                  Manually record a payment to a mentor.
                </DialogDescription>
              </DialogHeader>
              <DisbursementForm
                disbursement={selected}
                mentors={placeholderMentors}
                onSubmit={handleFormSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Disbursements</CardTitle>
          <CardDescription>
            Track and manage payments to mentors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentor</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Paid On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount (BDT)</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderDisbursements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.mentorName}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.mentorId}
                    </div>
                  </TableCell>
                   <TableCell>
                    {format(new Date(item.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {item.paidAt
                      ? format(new Date(item.paidAt), 'MMM d, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.totalAmount)}
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
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={item.status === 'paid'}>
                          Mark as Paid
                        </DropdownMenuItem>
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
