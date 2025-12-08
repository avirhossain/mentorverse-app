'use client';

import { MentorCard } from '@/components/mentee/MentorCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Mentor } from '@/lib/types';
import { Search } from 'lucide-react';

// Placeholder data - will be replaced with Firestore data
const placeholderMentors: Mentor[] = [
  {
    id: 'M01',
    name: 'Dr. Evelyn Reed',
    email: 'evelyn.reed@example.com',
    expertise: ['Quantum Physics', 'Astrobiology'],
    bio: 'Exploring the fabric of the universe, from quantum mechanics to the search for life beyond Earth.',
    totalSessions: 120,
    ratingAvg: 4.9,
    ratingCount: 45,
    isActive: true,
    createdAt: '2023-01-15T09:30:00Z',
    photoUrl: 'https://i.pravatar.cc/150?u=evelyn.reed@example.com'
  },
  {
    id: 'M02',
    name: 'Dr. Samuel Cortez',
    email: 'samuel.cortez@example.com',
    expertise: ['AI Ethics', 'Machine Learning'],
    bio: 'Passionate about building ethical and responsible AI. Guiding the next generation of AI developers.',
    totalSessions: 85,
    ratingAvg: 4.8,
    ratingCount: 30,
    isActive: true,
    createdAt: '2023-02-20T11:00:00Z',
    photoUrl: 'https://i.pravatar.cc/150?u=samuel.cortez@example.com'
  },
  {
    id: 'M03',
    name: 'Alicia Chen',
    email: 'alicia.chen@example.com',
    expertise: ['Product Management', 'UX/UI Design'],
    bio: 'Helping teams build products that users love. From idea to launch and beyond.',
    totalSessions: 210,
    ratingAvg: 4.9,
    ratingCount: 78,
    isActive: true,
    createdAt: '2022-11-10T14:00:00Z',
    photoUrl: 'https://i.pravatar.cc/150?u=alicia.chen@example.com'
  },
    {
    id: 'M04',
    name: 'Kenji Tanaka',
    email: 'kenji.tanaka@example.com',
    expertise: ['Cybersecurity', 'DevOps'],
    bio: 'Securing digital assets and streamlining development pipelines. Let\'s build a resilient infrastructure.',
    totalSessions: 150,
    ratingAvg: 4.7,
    ratingCount: 55,
    isActive: true,
    createdAt: '2023-03-10T14:00:00Z',
    photoUrl: 'https://i.pravatar.cc/150?u=kenji.tanaka@example.com'
  },
];

export default function MentorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Meet Our Mentors</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find the perfect expert to guide you on your journey.
        </p>
      </section>

      <div className="my-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or expertise..."
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="experience">Most Experienced</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {placeholderMentors.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
    </div>
  );
}
