
'use client';
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Zap, User, Calendar, Clock, Users, X, Info, Wallet, Video } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, runTransaction, addDoc } from 'firebase/firestore';
import type { Mentor, Session, Mentee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const MentorCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 flex flex-col items-center border border-gray-100 h-full">
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        <div className="text-center space-y-2">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-40 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
        </div>
        <div className="flex flex-wrap gap-2 mt-4 justify-center w-full">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
        </div>
    </div>
);


const MentorCard = ({ mentor }: { mentor: Mentor }) => (
    <Link href={`/mentors/${mentor.id}`} className="group block h-full">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-5 sm:p-6 flex flex-col items-center border border-gray-100 h-full text-center">
            <img 
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 mb-4" 
                src={mentor.avatar || 'https://placehold.co/150x150/7c3aed/ffffff?text=AR'} 
                alt={mentor.name} 
            />
            <div className="flex-grow">
                <div className="flex items-center justify-center">
                    <h3 className="text-xl font-bold text-gray-800 mr-2">{mentor.name}</h3>
                    <CheckCircle className="w-5 h-5 text-green-500 fill-green-100" />
                </div>
                <p className="text-sm text-primary font-medium mb-1">{mentor.title} at {mentor.company}</p>
                <div className="flex items-center justify-center text-sm font-medium text-yellow-500 mb-3">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    <span className="text-gray-800 font-bold mr-1">{mentor.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({mentor.ratingsCount} ratings)</span>
                </div>
                <p className="text-xs text-gray-600 italic line-clamp-2 mb-4">"{mentor.intro}"</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-auto">
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
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <div className="mt-6">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );

const SessionCard = ({ session, onBook, user }: { session: Session, onBook: (session: Session) => void, user: any }) => {
    const isBooked = user && session.bookedBy?.includes(user.uid);
    const availableSeats = session.maxParticipants - (session.bookedBy?.length || 0);
    const isFull = availableSeats <= 0;

    const [canJoin, setCanJoin] = useState(false);

    useEffect(() => {
        if (!isBooked) return;

        const checkTime = () => {
            const sessionDateTime = new Date(`${session.date} ${session.time}`);
            const now = new Date();
            const tenMinutes = 10 * 60 * 1000;
            
            // This comparison is naive and should be improved with a proper date library in a real app
            const isTimeCorrect = sessionDateTime.getTime() - now.getTime() < tenMinutes;
            const isSessionActive = session.status === 'active';
            
            setCanJoin(isSessionActive && isTimeCorrect);
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [session.date, session.time, session.status, isBooked]);

    return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-8 border-primary flex flex-col justify-between transition duration-300 hover:shadow-2xl hover:scale-[1.01] transform relative">
         <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold text-white rounded-full ${session.isFree ? 'bg-accent' : 'bg-primary'}`}>
            {session.isFree ? 'Free' : `৳${session.price}`}
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1 pr-16">{session.title}</h3>
            <p className="text-md text-gray-600 flex items-center mb-2">
                <User className="w-4 h-4 mr-2 text-primary" />
                Mentor:
                <Link href={`/mentors/${session.mentorId}`} className="font-extrabold text-primary ml-1 hover:underline">
                    {session.mentorName}
                </Link>
            </p>
            <div className="flex flex-col gap-y-2 text-sm text-gray-500">
                <p className="flex items-center font-medium">
                    <Calendar className="w-4 h-4 mr-1 text-primary/80" />
                    Date: <span className="text-gray-700 font-semibold ml-1">{session.date}</span>
                </p>
                <p className="flex items-center font-medium">
                    <Clock className="w-4 h-4 mr-1 text-primary/80" />
                    Time: <span className="text-gray-700 font-semibold ml-1">{session.time}</span>
                </p>
                <p className="flex items-center font-medium">
                    <Users className="w-4 h-4 mr-1 text-primary/80" />
                    Seats: <span className="text-gray-700 font-semibold ml-1">{availableSeats}/{session.maxParticipants} Left</span>
                </p>
            </div>
        </div>
        <div className="mt-6">
             <div className="flex items-center gap-2">
                {isBooked ? (
                    <>
                    <div className="flex-grow text-center">
                        <Button asChild variant={canJoin ? 'default' : 'outline'} disabled={!canJoin}>
                            <a href={canJoin ? session.jitsiLink : undefined} target="_blank" rel="noopener noreferrer" className="w-full font-bold">
                                <Video className="mr-2" /> Join Session
                            </a>
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">Link will be active 10m before the session starts.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={`/sessions/${session.id}`}>
                            See More
                        </Link>
                    </Button>
                    </>
                ) : (
                    <>
                    <Button 
                        onClick={() => onBook(session)} 
                        disabled={isFull} 
                        className="w-full font-bold"
                    >
                         {isFull ? 'Session Full' : 'Book Session'}
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={`/sessions/${session.id}`}>
                            See More
                        </Link>
                    </Button>
                    </>
                )}
            </div>
        </div>
    </div>
    )
};

const RegistrationModal = ({ session, user, onClose, onLogin, onBookingComplete }) => {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    // Fetch user's profile to check balance
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: menteeData } = useDoc<Mentee>(userDocRef);

    const [step, setStep] = React.useState('loading');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    useEffect(() => {
        if (!user) {
            setStep('auth_check');
        } else {
            // Wait for mentee data (with balance) to load
            if (menteeData !== undefined) {
                setStep('confirmation');
            }
        }
    }, [user, menteeData]);

    const handleBooking = async () => {
        if (!user || !firestore || !menteeData) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process booking.' });
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
                const currentUserData = userDoc.data() as Mentee;
                
                const price = currentSessionData.price || 0;
                const balance = currentUserData.balance || 0;

                if ((currentSessionData.bookedBy?.length || 0) >= currentSessionData.maxParticipants) {
                    throw new Error("This session is already full.");
                }
                if (currentSessionData.bookedBy?.includes(user.uid)) {
                    throw new Error("You have already booked this session.");
                }
                if (!currentSessionData.isFree) {
                    if (balance < price) {
                        setStep('insufficient_balance');
                        throw new Error("Insufficient balance.");
                    }
                    const newBalance = balance - price;
                    transaction.update(userRef, { balance: newBalance });

                    // Create a balance transaction record for auditing
                    const transactionsRef = collection(firestore, 'balance_transactions');
                    const newTransactionRef = doc(transactionsRef);
                    transaction.set(newTransactionRef, {
                        id: newTransactionRef.id,
                        userId: user.uid,
                        amount: -price,
                        source: 'session_payment',
                        description: `Payment for session: ${currentSessionData.title}`,
                        createdAt: new Date().toISOString(),
                    });
                }

                transaction.update(sessionRef, {
                    bookedBy: [...(currentSessionData.bookedBy || []), user.uid]
                });
            });
            
            onBookingComplete();
            setStep('thank_you');

        } catch (error) {
            // Don't show toast for insufficient balance, as we handle it with a UI step
            if (error.message !== "Insufficient balance.") {
                toast({ variant: 'destructive', title: 'Booking Failed', description: error.message });
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderContent = () => {
        switch (step) {
            case 'loading':
                return <div className="text-center py-6"><p>Loading...</p></div>;

            case 'auth_check':
                return (
                    <div className="text-center py-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Please Login to Book</h3>
                        <p className="text-gray-600 mb-6">To book a spot for this exclusive session, you need to have an account.</p>
                        <Button onClick={onLogin} className="w-full">Login to Continue</Button>
                    </div>
                );
            
            case 'insufficient_balance':
                return (
                     <div className="text-center py-6">
                        <Wallet className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Insufficient Balance</h3>
                        <p className="text-gray-600 mb-6">
                            Your current balance is not enough to book this session. Please add funds to your wallet and try again.
                        </p>
                        <Button onClick={() => router.push('/account')} className="w-full">Go to My Wallet</Button>
                    </div>
                );

            case 'confirmation':
                return (
                    <div className="pt-2">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Confirm Your Booking</h3>
                        <p className="text-md text-primary font-semibold mb-4">{session.title}</p>
                        
                        <div className="border rounded-lg p-4 bg-gray-50 mb-6 space-y-2">
                             <p className="flex justify-between text-gray-700">
                                <span className="font-medium">Session Cost:</span>
                                <span className="font-semibold">{session.isFree ? 'Free' : `৳${session.price}`}</span>
                            </p>
                             <p className="flex justify-between text-gray-700">
                                <span className="font-medium">Your Balance:</span>
                                <span className="font-semibold">৳{menteeData?.balance || 0}</span>
                            </p>
                            {!session.isFree && (
                                <p className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                                    <span>New Balance:</span>
                                    <span className="text-green-600">৳{(menteeData?.balance || 0) - session.price}</span>
                                </p>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            By clicking confirm, you agree to book this session. 
                            {!session.isFree && ` ৳${session.price} will be deducted from your account balance.`}
                        </p>

                        <Button 
                            onClick={handleBooking}
                            className="w-full font-bold text-lg"
                            disabled={isSubmitting}
                        >
                             {isSubmitting ? 'Processing...' : `Confirm & Book`}
                        </Button>
                    </div>
                );

            case 'thank_you':
                return (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                        <p className="text-gray-600 mb-6">You've successfully booked **{session.title}**. A confirmation has been sent to your email.</p>
                        <Button onClick={onClose} className="w-full">Close</Button>
                    </div>
                );

            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="p-4 flex justify-end">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="px-6 pb-6 pt-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};


export default function HomePage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [sessionToBook, setSessionToBook] = useState<Session | null>(null);
    const [bookingUpdate, setBookingUpdate] = useState(0);
    const router = useRouter();


    const mentorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'mentors'), orderBy('name'));
    }, [firestore]);

    const sessionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'sessions'), orderBy('date'));
    }, [firestore, bookingUpdate]);

    const { data: mentors, isLoading: isLoadingMentors } = useCollection<Mentor>(mentorsQuery);
    const { data: sessions, isLoading: isLoadingSessions } = useCollection<Session>(sessionsQuery);

    const handleBookSession = (session: Session) => {
        setSessionToBook(session);
    };

    const handleCloseModal = () => {
        setSessionToBook(null);
    };

    const handleBookingComplete = () => {
        // Force a re-fetch of sessions to get updated `bookedBy` array
        setBookingUpdate(prev => prev + 1);
    }

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header currentView="home" />

            <section className="bg-primary/5 text-center py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Your dream and journey starts now.
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Connect with top-tier mentors, join exclusive sessions, and unlock your full potential with Guidelab.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link href="#sessions">
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
                            sessions?.map((session) => (
                                <SessionCard key={session.id} session={session} onBook={handleBookSession} user={user} />
                            ))
                        )}
                    </div>
                </section>
            </main>

            {sessionToBook && (
                <RegistrationModal
                    session={sessionToBook}
                    user={user}
                    onClose={handleCloseModal}
                    onLogin={() => {
                        handleCloseModal();
                        router.push('/login');
                    }}
                    onBookingComplete={handleBookingComplete}
                />
            )}
        </div>
    );
};
