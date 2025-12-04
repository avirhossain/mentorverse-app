'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Zap, User, CheckCircle, Clock, Calendar, Users, X, ExternalLink } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, doc, runTransaction } from 'firebase/firestore';
import type { Session } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { parse, differenceInMinutes } from 'date-fns';

const SessionCardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-xl border-l-8 border-primary flex flex-col md:flex-row justify-between items-start md:items-center">
    <div className="mb-4 md:mb-0 md:w-3/5 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
    <div className="w-full md:w-auto">
      <Skeleton className="h-12 w-full md:w-48 rounded-lg" />
    </div>
  </div>
);


const RegistrationModal = ({ session, user, onClose, onSignUp, onLogin }) => {
    const [step, setStep] = React.useState(user ? 'form' : 'auth_check');
    const [reason, setReason] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    useEffect(() => {
        if (user) {
            setStep('form');
        } else {
            setStep('auth_check');
        }
    }, [user]);

    const handleBooking = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to book.' });
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

            toast({ title: 'Success!', description: 'You have successfully booked the session.' });
            setStep('thank_you');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Booking Failed', description: error.message });
            setIsSubmitting(false);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (reason.length < 10) return; 
        handleBooking();
    };

    const renderContent = () => {
        switch (step) {
            case 'auth_check':
                return (
                    <div className="text-center py-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Please Login or Sign Up</h3>
                        <p className="text-gray-600 mb-6">
                            To book a spot for this exclusive session, you need to have an account.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={onLogin}
                                className="w-full py-3 font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-md"
                            >
                                Login
                            </button>
                            <button
                                onClick={onSignUp} 
                                className="w-full py-3 font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                );

            case 'form':
                return (
                    <form onSubmit={handleSubmit} className="pt-2">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Register for the Session</h3>
                        <p className="text-md text-primary font-semibold mb-4">{session.title}</p>

                        <div className="mb-4">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                What is the main reason you want to attend this session? (Optional)
                            </label>
                            <textarea
                                id="reason"
                                rows="4"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            ></textarea>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full py-3 text-lg font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-md flex items-center justify-center disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : session.isFree ? 'Book for Free' : `Pay ৳${session.price} & Book`}
                        </button>
                    </form>
                );

            case 'thank_you':
                return (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Submitted!</h3>
                        <p className="text-gray-600 mb-6">
                            Thank you! You've successfully booked **{session.title}**. We have sent a confirmation and calendar invite to your email.
                        </p>
                        <button 
                            onClick={onClose} 
                            className="mt-4 w-full py-2 font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition"
                        >
                            Close
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
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

const SessionBookingButton = ({ session, user, onBook }) => {
    const [isLinkActive, setIsLinkActive] = useState(false);
    const hasBooked = useMemo(() => session.bookedBy?.includes(user?.uid), [session, user]);

    useEffect(() => {
        if (!hasBooked) return;

        const checkTime = () => {
            const now = new Date();
            // This is a simplified date parsing. For production, a more robust library like date-fns is recommended.
            const sessionDateStr = `${session.date} ${new Date().getFullYear()} ${session.time}`;
            try {
                const sessionStartTime = parse(sessionDateStr, 'do MMMM yyyy hh:mm a', new Date());
                const diff = differenceInMinutes(sessionStartTime, now);
                if (diff <= 5 && diff >= -session.durationMinutes) {
                    setIsLinkActive(true);
                } else {
                    setIsLinkActive(false);
                }
            } catch (error) {
                console.error("Error parsing date:", error);
                // Handle cases with less specific dates gracefully if needed
                if(session.date.toLowerCase().includes("today")) {
                     setIsLinkActive(true); // Simplified logic
                }
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [session, hasBooked]);
    
    if (hasBooked) {
        return (
            <a
                href={isLinkActive ? session.jitsiLink : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full md:w-48 py-3 font-bold rounded-lg transition shadow-lg text-lg transform flex items-center justify-center ${isLinkActive ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02]' : 'bg-gray-400 text-white cursor-not-allowed'}`}
                onClick={(e) => !isLinkActive && e.preventDefault()}
            >
                {isLinkActive ? <>Join Now <ExternalLink className="w-4 h-4 ml-2" /></> : 'Booked'}
            </a>
        );
    }
    
    const seatsLeft = session.maxParticipants - (session.bookedBy?.length || 0);

    return (
        <button
            onClick={() => onBook(session)}
            className="w-full md:w-48 py-3 font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-lg text-lg transform hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={seatsLeft <= 0}
        >
            {seatsLeft <= 0 ? 'Fully Booked' : (session.isFree ? 'Book Seat (Free)' : `Book for ৳${session.price}`)}
        </button>
    );
};

export default function ExclusiveSessionsPage() {
    const { user, isUserLoading } = useUser(); 
    const [sessionToBook, setSessionToBook] = React.useState(null);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const firestore = useFirestore();

    const sessionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'sessions'), orderBy('date'));
    }, [firestore]);

    const { data: sessions, isLoading } = useCollection<Session>(sessionsQuery);

    const handleBookSeat = (session) => {
        setSessionToBook(session);
    };

    const handleCloseModal = () => {
        setSessionToBook(null);
    };

    const handleSignUp = () => {
        // In a real app, this would redirect to a sign-up page
        console.log("Redirecting to sign-up...");
        alert("Redirecting to sign-up page (simulation).");
        handleCloseModal();
    };

    const handleLogin = () => {
        // In a real app, this would open a login modal or redirect
        console.log("Redirecting to login...");
        alert("Redirecting to login page (simulation).");
        handleCloseModal();
    };

    return (
      <div className="min-h-screen bg-background font-sans">
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} currentView="exclusive" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 flex items-center border-b pb-3 border-primary/20">
                <Zap className="w-8 h-8 mr-3 text-primary fill-primary/10" />
                Upcoming Exclusive Sessions
            </h2>
            <p className="text-lg text-gray-600 mb-10">
                Join these limited-seating, high-value sessions. Book your spot now!
            </p>
            
            <div className="space-y-6">
                {isLoading || isUserLoading ? (
                    Array.from({ length: 3 }).map((_, index) => <SessionCardSkeleton key={index} />)
                ) : (
                    sessions?.map((session) => {
                        const seatsLeft = session.maxParticipants - (session.bookedBy?.length || 0);
                        return (
                            <div 
                                key={session.id} 
                                className="bg-white p-6 rounded-xl shadow-xl border-l-8 border-primary flex flex-col md:flex-row justify-between items-start md:items-center transition duration-300 hover:shadow-2xl hover:scale-[1.01] transform"
                            >
                                <div className="mb-4 md:mb-0 md:w-3/5">
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
                                        <p className="flex items-center text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                                            <Clock className="w-4 h-4 mr-1" />
                                            Duration: <span className="font-semibold ml-1">{session.durationMinutes} min</span>
                                        </p>
                                        <p className={`flex items-center font-extrabold px-2 py-0.5 rounded-full ${seatsLeft > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                            <Users className="w-4 h-4 mr-1" />
                                            {seatsLeft > 0 ? `${seatsLeft} Seats Left` : 'Full'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="w-full md:w-auto">
                                    <SessionBookingButton session={session} user={user} onBook={handleBookSeat} />
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>

        {sessionToBook && (
            <RegistrationModal 
                session={sessionToBook}
                user={user}
                onClose={handleCloseModal}
                onSignUp={handleSignUp}
                onLogin={handleLogin}
            />
        )}
      </div>
    );
};
