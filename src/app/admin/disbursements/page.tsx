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
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { DisbursementAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

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
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Disbursement | null>(null);

  const disbursementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'disbursements'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: disbursements, isLoading: loadingDisbursements } = useCollection<Disbursement>(disbursementsQuery);

  const mentorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentors'), where('isActive', '==', true));
  }, [firestore]);
  const { data: mentors, isLoading: loadingMentors } = useCollection<Mentor>(mentorsQuery);

  const handleCreateNew = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Disbursement) => {
    setSelected(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Partial<Disbursement>) => {
    if (!firestore || !adminUser || !mentors) return;
    
    const selectedMentor = mentors.find(m => m.id === data.mentorId);

    if (!selectedMentor) {
      toast({
        variant: 'destructive',
        title: 'Mentor not found',
      });
      return;
    }

    const newDisbursement: Disbursement = {
      id: uuidv4(),
      mentorId: data.mentorId!,
      mentorName: selectedMentor.name,
      totalAmount: data.totalAmount!,
      note: data.note,
      bookingIds: [], // This could be populated from a selection in a more advanced form
      status: 'paid', // Assuming direct creation marks it as paid
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      adminId: adminUser.uid,
    };

    DisbursementAPI.createDisbursement(firestore, newDisbursement);

    toast({
      title: 'Disbursement Created',
      description: `${formatCurrency(data.totalAmount || 0)} has been recorded for ${selectedMentor.name}.`,
    });
    
    setIsFormOpen(false);
  };

  const renderTableBody = () => {
    if (loadingDisbursements) {
      return Array.from({ length: 2 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (!disbursements || disbursements.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center">No disbursements found.</TableCell>
        </TableRow>
      );
    }

    return disbursements.map((item) => (
        <TableRow key={item.id}>
          <TableCell>
            <div className="font-medium">{item.mentorName}</div>
            <div className="text-sm text-muted-foreground">{item.mentorId}</div>
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
      ));
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
                  Manually record a payment to a mentor. This will create a payout record for the mentor.
                </DialogDescription>
              </DialogHeader>
              <DisbursementForm
                disbursement={selected}
                mentors={mentors || []}
                onSubmit={handleFormSubmit}
                isLoading={loadingMentors}
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
              {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
