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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { TipsAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';

export default function TipsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Tip | null>(null);

  const tipsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tips'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: tips, isLoading, error } = useCollection<Tip>(tipsQuery);

  const handleCreateNew = () => {
    setSelected(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Tip) => {
    setSelected(item);
    setIsFormOpen(true);
  };

  const handleDelete = (tipId: string) => {
    if (!firestore) return;
    TipsAPI.deleteTip(firestore, tipId);
    toast({ title: 'Tip Deleted' });
  };

  const handleFormSubmit = (data: Partial<Tip>) => {
    if (!firestore) return;
    if (selected) {
      TipsAPI.updateTip(firestore, selected.id, data);
      toast({ title: 'Tip Updated' });
    } else {
      const newTip: Tip = {
        ...data,
        id: '', // Firestore will generate it
        adminId: 'admin', // Replace with actual admin ID
        createdAt: new Date().toISOString(),
        isActive: data.isActive ?? true,
      } as Tip;
      TipsAPI.createTip(firestore, newTip);
      toast({ title: 'Tip Created' });
    }
    setIsFormOpen(false);
  };

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return <TableRow><TableCell colSpan={4} className="text-center text-destructive">Error: {error.message}</TableCell></TableRow>;
    }
    if (!tips || tips.length === 0) {
      return <TableRow><TableCell colSpan={4} className="text-center">No tips found.</TableCell></TableRow>;
    }
    return tips.map((tip) => (
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
              <DropdownMenuItem onClick={() => handleDelete(tip.id)}>Delete</DropdownMenuItem>
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
              {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}