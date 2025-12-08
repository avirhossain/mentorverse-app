'use client';
import { SessionCard } from './SessionCard';
import type { Session } from '@/lib/types';

// Using placeholder data until we fetch from Firestore
const placeholderSessions: (Session & { mentorName: string })[] = [
  {
    id: 'S01',
    mentorId: 'M01',
    mentorName: 'Dr. Evelyn Reed',
    name: 'Intro to Quantum Computing',
    sessionType: 'Paid',
    bookingTime: '2024-05-10T10:00:00Z',
    scheduledDate: '2024-08-20',
    scheduledTime: '14:00',
    status: 'confirmed',
    sessionFee: 75,
    adminDisbursementStatus: 'pending',
  },
  {
    id: 'S02',
    mentorId: 'M02',
    mentorName: 'Dr. Samuel Cortez',
    name: 'Ethical Frameworks for AI',
    sessionType: 'Free',
    bookingTime: '2024-05-11T11:30:00Z',
    scheduledDate: '2024-08-22',
    scheduledTime: '16:00',
    status: 'pending',
    sessionFee: 0,
    adminDisbursementStatus: 'pending',
  },
  {
    id: 'S03',
    mentorId: 'M03',
    mentorName: 'Alicia Chen',
    name: 'Advanced UX Prototyping',
    sessionType: 'Paid',
    bookingTime: '2024-05-12T09:00:00Z',
    scheduledDate: '2024-08-25',
    scheduledTime: '10:00',
    status: 'confirmed',
    sessionFee: 150,
    adminDisbursementStatus: 'pending',
  },
];

export function UpcomingSessions() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Explore Upcoming Sessions
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-muted-foreground">
          Book your spot in one of our popular upcoming sessions.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {placeholderSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </section>
  );
}
