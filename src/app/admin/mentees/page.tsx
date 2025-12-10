'use client';

import * as React from 'react';
import Link from 'next/link';
import { File, ListFilter } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { Mentee } from '@/lib/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function MenteesPage() {
  const firestore = useFirestore();
  const menteesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentees'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: mentees, isLoading, error } = useCollection<Mentee>(menteesQuery);

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return <TableRow><TableCell colSpan={6} className="text-center text-destructive">Error loading mentees: {error.message}</TableCell></TableRow>
    }

    if (!mentees || mentees.length === 0) {
      return <TableRow><TableCell colSpan={6} className="text-center">No mentees found.</TableCell></TableRow>
    }

    return mentees.map((mentee, index) => (
      <TableRow key={mentee.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>
            <div className="font-medium">{mentee.name}</div>
            <div className="text-sm text-muted-foreground">{mentee.email}</div>
        </TableCell>
        <TableCell>
          <Badge variant={mentee.isActive ? 'default' : 'destructive'}>
            {mentee.isActive ? 'Active' : 'Suspended'}
          </Badge>
        </TableCell>
        <TableCell>{mentee.totalSessionsBooked || 0}</TableCell>
         <TableCell>
          {mentee.createdAt ? format(new Date(mentee.createdAt), 'MMM d, yyyy') : 'N/A'}
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(mentee.accountBalance || 0)}
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
          {/* No create button as mentees self-register */}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mentees</CardTitle>
          <CardDescription>
            View and manage all registered mentees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">S/N</TableHead>
                <TableHead>Mentee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Sessions</TableHead>
                <TableHead>Joined On</TableHead>
                <TableHead className="text-right">Account Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
        {mentees && (
            <CardFooter>
            <div className="text-xs text-muted-foreground">
                Showing <strong>1-{mentees.length}</strong> of{' '}
                <strong>{mentees.length}</strong> mentees
            </div>
            </CardFooter>
        )}
      </Card>
    </>
  );
}
