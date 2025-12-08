'use client';
import { SessionCard } from './SessionCard';
import type { Session } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

// Placeholder data, admin-managed sessions will be fetched in a real app
const placeholderSessions: Session[] = [
  {
    "id": "SES01",
    "mentorId": "MEN01",
    "mentorName": "Dr. Evelyn Reed",
    "name": "Intro to Quantum Computing",
    "sessionType": "Paid",
    "scheduledDate": "2024-08-15",
    "scheduledTime": "14:00",
    "sessionFee": 50,
    "isActive": true,
    "tag": "Tech",
  },
  {
    "id": "SES02",
    "mentorId": "MEN02",
    "mentorName": "Dr. Samuel Cortez",
    "name": "Fundamentals of UX Design",
    "sessionType": "Free",
    "scheduledDate": "2024-08-20",
    "scheduledTime": "11:00",
    "sessionFee": 0,
    "isActive": true,
    "tag": "Design"
  },
  {
    "id": "SES03",
    "mentorId": "MEN03",
    "mentorName": "Alicia Chen",
    "name": "Advanced Tailwind CSS",
    "sessionType": "Paid",
    "scheduledDate": "2024-09-01",
    "scheduledTime": "16:00",
    "sessionFee": 75,
    "isActive": true,
    "tag": "Web Dev"
  }
];

export function UpcomingSessions() {
  const sessions = placeholderSessions;
  const isLoading = false;
  const error = null;


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[320px] w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <p className="mt-10 text-center text-destructive">
          Error loading sessions.
        </p>
      );
    }

    if (!sessions || sessions.length === 0) {
      return (
        <p className="mt-10 text-center text-muted-foreground">
          No upcoming sessions scheduled. Check back soon!
        </p>
      );
    }

    return (
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Explore Upcoming Sessions
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-muted-foreground">
          Book your spot in one of our popular upcoming sessions.
        </p>
        {renderContent()}
      </div>
    </section>
  );
}
