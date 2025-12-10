'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusCircle, File, ListFilter, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Session } from '@/lib/types';
import { format } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

const getTypeBadgeVariant = (type: Session['sessionType']) => {
    switch (type) {
        case 'Paid': return 'default';
        case 'Free': return 'secondary';
        case 'Exclusive': return 'outline';
        case 'Special Request': return 'destructive';
        default: return 'secondary';
    }
}

const getStatusBadgeVariant = (status?: Session['status']): "default" | "secondary" | "destructive" => {
    if (status === 'Expired') {
        return 'destructive';
    }
    if (status === 'Active') {
        return 'default';
    }
    return 'secondary';
};


export default function SessionsPage() {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'sessions'),
      orderBy('scheduledDate', 'desc'),
      limit(50)
    );
  }, [firestore]);
  const { data: sessions, isLoading, error } = useCollection<Session>(sessionsQuery);

  
  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={8}>
            <Skeleton className="h-8 w-full" />
          </TableCell>
        </TableRow>
      ));
    }
    
    if (error) {
       return <TableRow><TableCell colSpan={8} className="text-center text-destructive">Error loading sessions: {error.message}</TableCell></TableRow>
    }
    
    if (!sessions || sessions.length === 0) {
      return <TableRow><TableCell colSpan={8} className="text-center">No sessions found.</TableCell></TableRow>
    }
    
    return sessions.map((session) => {
      return (
        <TableRow key={session.id}>
          <TableCell className="font-medium">{session.displayId || session.id}</TableCell>
          <TableCell>{session.name}</TableCell>
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
            <Badge variant={getStatusBadgeVariant(session.status)}>
              {session.status || 'Draft'}
            </Badge>
          </TableCell>
          <TableCell className="text-right">{formatCurrency(session.sessionFee)}</TableCell>
          <TableCell className="text-right">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/sessions/${session.id}/edit`}>Edit</Link>
            </Button>
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
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/admin/sessions/createsession">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create Session
              </span>
            </Link>
          </Button>
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
                <TableHead className="w-[100px]">Session ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fee (BDT)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
