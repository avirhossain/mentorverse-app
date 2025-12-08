'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { MentorCard } from './MentorCard';
import type { Mentor } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

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
];


export function FeaturedMentors() {
  const mentors = placeholderMentors;
  const isLoading = false;
  const error = null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mt-10">
          <Carousel
            opts={{
              align: 'start',
            }}
            className="w-full"
          >
            <CarouselContent>
              {Array.from({ length: 3 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1">
                    <Skeleton className="h-[280px] w-full rounded-lg" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      );
    }

    if (error) {
      return (
        <p className="mt-10 text-center text-destructive">
          Error loading mentors: An error occurred.
        </p>
      );
    }

    if (!mentors || mentors.length === 0) {
      return (
        <p className="mt-10 text-center text-muted-foreground">
          No featured mentors available at the moment.
        </p>
      );
    }

    return (
      <div className="mt-10">
        <Carousel
          opts={{
            align: 'start',
            loop: mentors.length > 2,
          }}
          className="w-full"
        >
          <CarouselContent>
            {mentors.map((mentor) => (
              <CarouselItem
                key={mentor.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1">
                  <MentorCard mentor={mentor} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    );
  };

  return (
    <section className="bg-muted/40 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Meet Our Top Mentors
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-muted-foreground">
          Hand-picked experts to help you achieve your goals.
        </p>
        {renderContent()}
      </div>
    </section>
  );
}
