'use client';

import * as React from 'react';
import { MoreHorizontal, File, ListFilter } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { Mentee } from '@/lib/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

// Placeholder data for mentees
const placeholderMentees: Mentee[] = [
  {
    id: 'UM10001',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    accountBalance: 150,
    totalSessionsBooked: 5,
    isActive: true,
    createdAt: '2023-08-15T10:00:00Z',
  },
  {
    id: 'UM10002',
    name: 'Ben Carter',
    email: 'ben.c@example.com',
    accountBalance: 25,
    totalSessionsBooked: 2,
    isActive: true,
    createdAt: '2023-09-01T11:30:00Z',
  },
  {
    id: 'UM10003',
    name: 'Chloe Davis',
    email: 'chloe.d@example.com',
    accountBalance: 500,
    totalSessionsBooked: 12,
    isActive: true,
    createdAt: '2023-05-20T09:00:00Z',
  },
  {
    id: 'UM10004',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    accountBalance: 0,
    totalSessionsBooked: 1,
    isActive: false,
    createdAt: '2024-01-10T14:00:00Z',
  },
];

export default function MenteesPage() {
  const [mentees, setMentees] =
    React.useState<Mentee[]>(placeholderMentees);

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
                <TableHead>Mentee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Sessions</TableHead>
                <TableHead>Joined On</TableHead>
                <TableHead className="text-right">Account Balance</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentees.map((mentee) => (
                <TableRow key={mentee.id}>
                  <TableCell>
                      <div className="font-medium">{mentee.name}</div>
                      <div className="text-sm text-muted-foreground">{mentee.email} ({mentee.id})</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={mentee.isActive ? 'default' : 'secondary'}>
                      {mentee.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{mentee.totalSessionsBooked || 0}</TableCell>
                   <TableCell>
                    {format(new Date(mentee.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(mentee.accountBalance || 0)}
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
                        <DropdownMenuItem>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          View Session History
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem className="text-destructive">
                            Suspend Account
                        </DropdownMenuItem>
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
            Showing <strong>1-{mentees.length}</strong> of{' '}
            <strong>{mentees.length}</strong> mentees
          </div>
        </CardFooter>
      </Card>
    </>
  );
}