'use client';
import React from 'react';
import { Star, CheckCircle, Zap, User, Calendar, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Mentor, Session } from '@/lib/types';
import { Button } from '@/components/ui/button';

const MentorCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 flex flex-col items-start border border-gray-100 h-full">
        <div className="flex items-start space-x-3 sm:space-x-4 mb-4 w-full">
            <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-full" />
            <div className="flex-grow space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
            </div>
        </div>
        <Skeleton className="h-4 w-1/3 mb-3" />
        <div className="flex flex-wrap gap-2 mt-auto w-full">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
        </div>
    </div>
);


const MentorCard = ({ mentor }: { mentor: Mentor }) => (
    <Link href={`/mentors/${mentor.id}`} className="group block h-full">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-5 sm:p-6 flex flex-col items-start border border-gray-100 h-full">
            <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                <img className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-violet-100" src={mentor.avatar} alt={mentor.name} />
                <div>
                    <div className="flex items-center">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mr-2">{mentor.name}</h3>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 fill-green-100" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">{mentor.title} at {mentor.company}</p>
                    <p className="text-xs text-gray-600 italic line-clamp-2">"{mentor.intro}"</p>
                </div>
            </div>
            <div className="flex items-center text-sm font-medium text-yellow-500 mb-3">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span className="text-gray-800 font-bold mr-1">{mentor.rating.toFixed(1)}</span>
                <span className="text-gray-500">({mentor.ratingsCount} ratings)</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
                {mentor.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    </Link>
);

const SessionCardSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-8 border-gray-200 flex flex-col justify-between">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="mt-6">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );

const SessionCard = ({ session }: { session: Session }) => (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-8 border-primary flex flex-col justify-between transition duration-300 hover:shadow-2xl hover:scale-[1.01] transform">
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{session.title}</h3>
            <p className="text-md text-gray-600 flex items-center mb-2">
                <User className="w-4 h-4 mr-2 text-primary" />
                Mentor: <span className="font-extrabold text-primary ml-1">{session.mentorName}</span>
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                <p className="flex items-center font-medium">
                    <Calendar className="w-4 h-4 mr-1 text-primary/80" />
                    Date: <span className="text-gray-700 font-semibold ml-1">{session.date}</span>
                </p>
                <p className="flex items-center font-medium">
                    <Clock className="w-4 h-4 mr-1 text-primary/80" />
                    Time: <span className="text-gray-700 font-semibold ml-1">{session.time}</span>
                </p>
            </div>
        </div>
        <Link href="/sessions" className="w-full mt-6">
            <Button className="w-full font-bold text-lg">
                View Session
            </Button>
        </Link>
    </div>
);


export default function HomePage() {
    const firestore = useFirestore();

    const mentorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'mentors'), orderBy('name'));
    }, [firestore]);

    const sessionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'sessions'), orderBy('date'));
    }, [firestore]);

    const { data: mentors, isLoading: isLoadingMentors } = useCollection<Mentor>(mentorsQuery);
    const { data: sessions, isLoading: isLoadingSessions } = useCollection<Session>(sessionsQuery);

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header currentView="home"/>

            <section className="bg-primary/5 text-center py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Your dream and journey starts now.
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Connect with top-tier mentors, join exclusive sessions, and unlock your full potential with Guidelab.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link href="/sessions">
                            <Button size="lg" className="font-bold">
                                <Zap className="mr-2" /> Explore Sessions
                            </Button>
                        </Link>
                        <Link href="#mentors">
                            <Button size="lg" variant="outline" className="font-bold bg-white">
                                Find a Mentor
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
                <section id="mentors">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8 sm:mb-10">
                        Featured Mentors
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {isLoadingMentors ? (
                            Array.from({ length: 4 }).map((_, index) => <MentorCardSkeleton key={index} />)
                        ) : (
                            mentors?.map((mentor) => (
                                <MentorCard key={mentor.id} mentor={mentor} />
                            ))
                        )}
                    </div>
                </section>

                <section id="sessions">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8 sm:mb-10">
                        Upcoming Sessions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoadingSessions ? (
                             Array.from({ length: 3 }).map((_, index) => <SessionCardSkeleton key={index} />)
                        ) : (
                            sessions?.slice(0, 3).map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};