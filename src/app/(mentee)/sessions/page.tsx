'use client';

import { SessionCard } from '@/components/mentee/SessionCard';
import type { Session } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const placeholderSessions: (Session & { mentorName: string })[] = [
  {
    id: 'S01',
    mentorId: 'M01',
    mentorName: 'Dr. Evelyn Reed',
    menteeId: '',
    name: 'Intro to Quantum Computing',
    sessionType: 'Paid',
    bookingTime: '2024-05-10T10:00:00Z',
    scheduledDate: '2024-07-20',
    scheduledTime: '14:00',
    status: 'confirmed',
    sessionFee: 75,
    adminDisbursementStatus: 'pending',
    tag: 'Beginner',
  },
  {
    id: 'S02',
    mentorId: 'M02',
    mentorName: 'Dr. Samuel Cortez',
    menteeId: '',
    name: 'Ethical Frameworks for AI',
    sessionType: 'Free',
    bookingTime: '2024-05-11T11:30:00Z',
    scheduledDate: '2024-07-22',
    scheduledTime: '16:00',
    status: 'pending',
    sessionFee: 0,
    adminDisbursementStatus: 'pending',
    tag: 'Intermediate',
  },
  {
    id: 'S03',
    mentorId: 'M03',
    mentorName: 'Alicia Chen',
    menteeId: '',
    name: 'Advanced UX Prototyping',
    sessionType: 'Paid',
    bookingTime: '2024-05-12T09:00:00Z',
    scheduledDate: '2024-07-25',
    scheduledTime: '10:00',
    status: 'confirmed',
    sessionFee: 150,
    adminDisbursementStatus: 'paid',
    tag: 'Advanced',
  },
  {
    id: 'S04',
    mentorId: 'M01',
    mentorName: 'Dr. Evelyn Reed',
    menteeId: '',
    name: 'Astrobiology Basics',
    sessionType: 'Paid',
    bookingTime: '2024-06-01T14:00:00Z',
    scheduledDate: '2024-08-10',
    scheduledTime: '11:00',
    status: 'confirmed',
    sessionFee: 75,
    adminDisbursementStatus: 'pending',
    tag: 'Beginner',
  },
    {
    id: 'S05',
    mentorId: 'M04',
    mentorName: 'Kenji Tanaka',
    menteeId: '',
    name: 'DevOps on a Shoestring',
    sessionType: 'Free',
    bookingTime: '2024-06-05T10:00:00Z',
    scheduledDate: '2024-08-01',
    scheduledTime: '18:00',
    status: 'confirmed',
    sessionFee: 0,
    adminDisbursementStatus: 'pending',
    tag: 'All Levels',
  },
];

export default function SessionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Explore Sessions</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find and book sessions to accelerate your growth.
        </p>
      </section>

       <div className="my-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by session or mentor name..."
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-4">
           <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Soonest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {placeholderSessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
