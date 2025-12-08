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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

export function FeaturedMentors() {
  const firestore = useFirestore();

  const mentorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'mentors'),
      where('isActive', '==', true),
      limit(10)
    );
  }, [firestore]);

  const {
    data: mentors,
    isLoading,
    error,
  } = useCollection<Mentor>(mentorsQuery);

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
          Error loading mentors: {error.message}
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
