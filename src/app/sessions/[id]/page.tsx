'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { Session } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Computer, Users, Video, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const DetailSection = ({ icon: Icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-primary/20">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Icon className="w-6 h-6 mr-3 text-primary" />
            {title}
        </h3>
        {children}
    </div>
);

const SessionDetailsSkeleton = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        </div>
    </div>
);

const BookingModal = ({ session, user, onClose, onBookingComplete }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const router = useRouter();

    const handleBooking = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
            return;
        }

        setIsSubmitting(true);
        const sessionRef = doc(firestore, 'sessions', session.id);
        const userRef = doc(firestore, 'users', user.uid);

        try {
            await runTransaction(firestore, async (transaction) => {
                const sessionDoc = await transaction.get(sessionRef);
                const userDoc = await transaction.get(userRef);

                if (!sessionDoc.exists()) throw new Error("Session does not exist.");
                if (!userDoc.exists()) throw new Error("User profile not found.");

                const currentSessionData = sessionDoc.data() as Session;
                const currentUserData = userDoc.data();

                if ((currentSessionData.bookedBy?.length || 0) >= currentSessionData.maxParticipants) {
                    throw new Error("This session is already full.");
                }
                if (currentSessionData.bookedBy?.includes(user.uid)) {
                    throw new Error("You have already booked this session.");
                }
                if (!currentSessionData.isFree) {
                    const price = currentSessionData.price || 0;
                    const balance = currentUserData.balance || 0;
                    if (balance < price) {
                        throw new Error("Insufficient balance.");
                    }
                    transaction.update(userRef, { balance: balance - price });
                }
                transaction.update(sessionRef, {
                    bookedBy: [...(currentSessionData.bookedBy || []), user.uid]
                });
            });
            onBookingComplete();
            toast({ title: 'Success!', description: 'You have successfully booked the session.' });
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Booking Failed', description: error.message });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="p-4 flex justify-between items-center border-b">
                    <h3 className="text-2xl font-bold text-gray-800">Confirm Booking</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6">
                    <p className="text-lg font-semibold text-primary mb-2">{session.title}</p>
                    <p className="mb-4 text-gray-600">You are about to book this session. Please confirm your action.</p>
                    <Button onClick={handleBooking} disabled={isSubmitting} className="w-full font-bold text-lg">
                        {isSubmitting ? 'Processing...' : session.isFree ? 'Book for Free' : `Pay ৳${session.price} & Book`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function SessionDetailsPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const [bookingUpdate, setBookingUpdate] = useState(0);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    
    const sessionRef = useMemoFirebase(() => {
        if (!firestore || !params.id) return null;
        return doc(firestore, 'sessions', params.id);
    }, [firestore, params, bookingUpdate]);

    const { data: session, isLoading } = useDoc<Session>(sessionRef);
    
    const handleBookingComplete = () => {
        setBookingUpdate(prev => prev + 1);
    };

    const [canJoin, setCanJoin] = useState(false);

    useEffect(() => {
        if (!session) return;

        const checkTime = () => {
            const sessionDateTime = new Date(`${session.date} ${session.time}`);
            const now = new Date();
            const tenMinutes = 10 * 60 * 1000;
            
            const isTimeCorrect = sessionDateTime.getTime() - now.getTime() < tenMinutes;
            const isSessionActive = session.status === 'active';
            
            setCanJoin(isSessionActive && isTimeCorrect);
        };

        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [session]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <SessionDetailsSkeleton />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold">Session not found</h1>
                    <p className="text-gray-500">The session you are looking for does not exist or may have been moved.</p>
                </div>
            </div>
        );
    }
    
    const isBooked = user && session.bookedBy?.includes(user.uid);
    const availableSeats = session.maxParticipants - (session.bookedBy?.length || 0);
    const isFull = availableSeats <= 0;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="mb-8">
                    <p className="text-primary font-semibold">{session.date} at {session.time}</p>
                    <h1 className="text-4xl font-extrabold text-gray-900">{session.title}</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        With <Link href={`/mentors/${session.mentorId}`} className="font-bold text-primary hover:underline">{session.mentorName}</Link>
                    </p>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <DetailSection icon={CheckCircle} title="What You Will Learn">
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {session.learningObjectives?.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </DetailSection>

                        <DetailSection icon={Users} title="Who is This For?">
                            <p className="text-gray-700">{session.whoIsItFor}</p>
                        </DetailSection>

                        <DetailSection icon={Computer} title="Setup Requirements">
                            <p className="text-gray-700 whitespace-pre-line">{session.setupRequirements}</p>
                        </DetailSection>
                    </div>
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24 border-t-4 border-accent">
                            <div className={`mb-4 px-4 py-2 text-center text-xl font-bold text-white rounded-md ${session.isFree ? 'bg-accent' : 'bg-primary'}`}>
                                {session.isFree ? 'Free Session' : `Price: ৳${session.price}`}
                            </div>
                            <div className="space-y-3 text-gray-700">
                                <p className="flex items-center"><Clock className="w-5 h-5 mr-2 text-primary/70" /> <strong>Duration:</strong> <span className="ml-auto">{session.durationMinutes} mins</span></p>
                                <p className="flex items-center"><Users className="w-5 h-5 mr-2 text-primary/70" /> <strong>Seats Left:</strong> <span className="ml-auto">{availableSeats}/{session.maxParticipants}</span></p>
                                <p className="flex items-center"><Video className="w-5 h-5 mr-2 text-primary/70" /> <strong>Platform:</strong> <span className="ml-auto">Jitsi Meet</span></p>
                            </div>
                            {isBooked ? (
                                <div className="text-center mt-6">
                                    <Button asChild variant={canJoin ? 'default' : 'outline'} disabled={!canJoin} className="w-full font-bold">
                                        <a href={canJoin ? session.jitsiLink : undefined} target="_blank" rel="noopener noreferrer">
                                            <Video className="mr-2" /> Join Session
                                        </a>
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-2">Link will be active 10m before the session starts.</p>
                                </div>
                            ) : (
                                 <Button 
                                    onClick={() => setIsBookingModalOpen(true)}
                                    disabled={isFull}
                                    className="w-full font-bold text-lg mt-6"
                                >
                                    {isFull ? 'Session Full' : 'Book This Session'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

            </main>
            {isBookingModalOpen && (
                <BookingModal
                    session={session}
                    user={user}
                    onClose={() => setIsBookingModalOpen(false)}
                    onBookingComplete={handleBookingComplete}
                />
            )}
        </div>
    );
}
