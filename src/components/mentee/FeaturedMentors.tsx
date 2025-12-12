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

interface FeaturedMentorsProps {
  mentors: Mentor[];
}

export function FeaturedMentors({ mentors }: FeaturedMentorsProps) {
  const renderContent = () => {
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
                className="sm:basis-1/2 lg:basis-1/3"
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
          Featured Mentors
        </h2>
        {renderContent()}
      </div>
    </section>
  );
}
