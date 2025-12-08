'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Users, BookOpen, Clock } from 'lucide-react';

const statItems = [
    {
        title: 'Total Mentors',
        value: '0',
        icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
        title: 'Total Mentees',
        value: '0',
        icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
        title: 'Running Sessions',
        value: '0',
        icon: <Clock className="h-4 w-4 text-muted-foreground" />,
    },
    {
        title: 'Total Earnings',
        value: '$0',
        icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    }
]

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
            <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                {item.title}
                </CardTitle>
                {item.icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
            </Card>
        ))}
    </div>
  );
}
