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
import { Skeleton } from '@/components/ui/skeleton';

const placeholderMentors: Mentor[] = [
  {
    id: 'MEN01',
    name: 'Dr. Evelyn Reed',
    email: 'e.reed@example.com',
    bio: 'Quantum physicist with 15+ years of experience in academia and industry. Passionate about making complex topics accessible.',
    expertise: ['Quantum Computing', 'AI Ethics', 'Theoretical Physics'],
    ratingAvg: 4.9,
    ratingCount: 85,
    photoUrl: 'https://i.pravatar.cc/150?u=evelyn.reed@example.com',
    isActive: true,
    createdAt: '2023-01-10T00:00:00Z',
  },
  {
    id: 'MEN02',
    name: 'Dr. Samuel Cortez',
    email: 's.cortez@example.com',
    bio: 'Award-winning UX designer and product strategist. I help startups build intuitive and beautiful user experiences.',
    expertise: ['UX/UI Design', 'Product Strategy', 'Figma'],
    ratingAvg: 4.8,
    ratingCount: 120,
    photoUrl: 'https://i.pravatar.cc/150?u=samuel.cortez@example.com',
    isActive: true,
    createdAt: '2023-02-20T00:00:00Z',
  },
  {
    id: 'MEN03',
    name: 'Mazhar',
    email: 'mazhar@example.com',
    bio: 'Cloud architect with a decade of experience in building scalable and resilient systems on AWS and GCP.',
    expertise: ['Cloud Architecture', 'DevOps', 'Kubernetes'],
    ratingAvg: 4.9,
    ratingCount: 75,
    photoUrl: 'https://i.pravatar.cc/150?u=mazhar@example.com',
    isActive: true,
    createdAt: '2023-03-15T00:00:00Z',
  }
];

export default function MentorsPage() {
  const mentors = placeholderMentors;
  const isLoading = false;
  const error = null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[280px] w-full rounded-lg" />
          ))}
        </div>
      );
    }
    
    if (error) {
       return <p className="text-center text-destructive">Error: An error occurred.</p>
    }

    if (!mentors || mentors.length === 0) {
      return <p className="text-center text-muted-foreground">No mentors found.</p>
    }

    return (
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mentors.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
    )
  }


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
      {renderContent()}
    </div>
  );
}
