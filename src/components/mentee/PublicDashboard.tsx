'use client';
import { FeaturedMentors } from '@/components/mentee/FeaturedMentors';
import { UpcomingSessions } from '@/components/mentee/UpcomingSessions';
import type { Mentor, Session } from '@/lib/types';
import Image from 'next/image';

interface PublicDashboardProps {
  mentors: Mentor[];
  sessions: Session[];
}

export function PublicDashboard({ mentors, sessions }: PublicDashboardProps) {
  return (
    <>
      <section className="relative h-[50vh] md:h-[60vh] w-full">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
          alt="Mentorship"
          fill
          className="object-cover"
          priority
          data-ai-hint="people working"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Your dream and journey starts now.
          </h1>
          <p className="mt-4 max-w-2xl text-md md:text-lg text-gray-200">
            Connect with experienced mentors who can guide you to success.
          </p>
        </div>
      </section>
      <FeaturedMentors mentors={mentors} />
      <UpcomingSessions sessions={sessions} />
    </>
  );
}
