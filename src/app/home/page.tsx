'use client';
import React, { useMemo } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Mentor } from '@/lib/types';

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


export default function HomePage() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const firestore = useFirestore();

    const mentorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'mentors'), orderBy('name'));
    }, [firestore]);

    const { data: mentors, isLoading } = useCollection<Mentor>(mentorsQuery);

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} currentView="home"/>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8 sm:mb-10">
                    Find Your Guide
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => <MentorCardSkeleton key={index} />)
                    ) : (
                        mentors?.map((mentor) => (
                            <MentorCard key={mentor.id} mentor={mentor} />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};
