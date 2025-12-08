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

// Using placeholder data until we fetch from Firestore
const placeholderMentors: Mentor[] = [
  {
    id: 'M01',
    name: 'Dr. Evelyn Reed',
    email: 'evelyn.reed@example.com',
    bio: 'Quantum physicist and astrobiologist with 15+ years at NASA. Passionate about mentoring the next generation of scientists.',
    expertise: ['Quantum Physics', 'Astrobiology', 'Research'],
    photoUrl: 'https://i.pravatar.cc/300?u=evelyn.reed@example.com',
    ratingAvg: 4.9,
    isActive: true,
    createdAt: '',
  },
  {
    id: 'M02',
    name: 'Dr. Samuel Cortez',
    email: 'samuel.cortez@example.com',
    bio: 'Leading expert in AI ethics and machine learning. Consults for major tech companies on responsible AI development.',
    expertise: ['AI Ethics', 'Machine Learning', 'Tech Policy'],
    photoUrl: 'https://i.pravatar.cc/300?u=samuel.cortez@example.com',
    ratingAvg: 4.8,
    isActive: true,
    createdAt: '',
  },
  {
    id: 'M03',
    name: 'Alicia Chen',
    email: 'alicia.chen@example.com',
    bio: 'Award-winning product designer with a focus on user-centric mobile apps. Scaled two startups to successful exits.',
    expertise: ['Product Design', 'UX/UI', 'Startups'],
    photoUrl: 'https://i.pravatar.cc/300?u=alicia.chen@example.com',
    ratingAvg: 4.9,
    isActive: true,
    createdAt: '',
  },
  {
    id: 'M04',
    name: 'Marcus Holloway',
    email: 'marcus.h@example.com',
    bio: 'Cybersecurity specialist with a knack for making complex topics accessible. Author of "The Digital Fortress".',
    expertise: ['Cybersecurity', 'Networking', 'Digital Privacy'],
    photoUrl: 'https://i.pravatar.cc/300?u=marcus.h@example.com',
    ratingAvg: 4.7,
    isActive: true,
    createdAt: '',
  },
];

export function FeaturedMentors() {
  return (
    <section className="bg-muted/40 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Meet Our Top Mentors
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-muted-foreground">
          Hand-picked experts to help you achieve your goals.
        </p>
        <div className="mt-10">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {placeholderMentors.map((mentor) => (
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
      </div>
    </section>
  );
}
