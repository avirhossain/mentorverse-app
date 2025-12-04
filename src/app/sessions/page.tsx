'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Zap, User, CheckCircle, Clock, Calendar, Users, X } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Session } from '@/lib/types';

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


const RegistrationModal = ({ session, isLoggedIn, onClose, onSignUp }) => {
    const [step, setStep] = React.useState(isLoggedIn ? 'form' : 'auth_check');
    const [reason, setReason] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const renderContent = () => {
        switch (step) {
            case 'auth_check':
                return (
                    <div className="text-center py-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">One step closer!</h3>
                        <p className="text-gray-600 mb-6">
                            Since you're a guest, please sign up or apply for a guest seat to secure your spot.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={onSignUp} 
                                className="w-full py-3 font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-md"
                            >
                                Sign Up & Book Now (Recommended)
                            </button>
                            <button
                                onClick={() => setStep('form')}
                                className="w-full py-3 font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition"
                            >
                                Continue as Guest (Limited Access)
                            </button>
                        </div>
                    </div>
                );

            case 'form':
                const handleSubmit = (e) => {
                    e.preventDefault();
                    if (reason.length < 10) return; 

                    setIsSubmitting(true);
                    setTimeout(() => {
                        console.log(`Booking submitted for ${session.title}. Reason: ${reason}`);
                        setIsSubmitting(false);
                        setStep('thank_you');
                    }, 500);
                };

                return (
                    <form onSubmit={handleSubmit} className="pt-2">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Register for the Session</h3>
                        <p className="text-md text-primary font-semibold mb-4">{session.title}</p>

                        <div className="mb-4">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                What is the main reason you want to attend this session? (Min 10 chars)
                            </label>
                            <textarea
                                id="reason"
                                rows="4"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                                required
                            ></textarea>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full py-3 text-lg font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-md flex items-center justify-center disabled:opacity-50"
                            disabled={isSubmitting || reason.length < 10}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </>
                            ) : 'Submit Registration'}
                        </button>
                    </form>
                );

            case 'thank_you':
                return (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Submitted!</h3>
                        <p className="text-gray-600 mb-6">
                            Thank you for your interest in **{session.title}**. We are reviewing your application and will send your confirmation and calendar invite shortly.
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


export default function ExclusiveSessionsPage() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false); 
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
        console.log("Redirecting user to sign-up...");
        setIsLoggedIn(true); 
    };

    return (
      <div className="min-h-screen bg-background font-sans">
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} currentView="exclusive" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative">
             <div className="mb-4 text-center">
                <button
                    onClick={() => setIsLoggedIn(!isLoggedIn)}
                    className={`px-4 py-2 text-sm font-bold rounded-full transition shadow-md ${isLoggedIn 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-primary text-white hover:bg-primary/90'}`}
                >
                    Toggle Login Status: {isLoggedIn ? 'Logged In' : 'Guest'}
                </button>
                {isLoggedIn ? (
                     <p className="text-xs text-green-700 mt-1">Status: You are logged in and can book directly.</p>
                ) : (
                    <p className="text-xs text-primary mt-1">Status: You are a guest. Try to book a session!</p>
                )}
               
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 flex items-center border-b pb-3 border-primary/20">
                <Zap className="w-8 h-8 mr-3 text-primary fill-primary/10" />
                Upcoming Free Exclusive Sessions
            </h2>
            <p className="text-lg text-gray-600 mb-10">
                Join these limited-seating, high-value sessions completely free of charge. Book your spot now!
            </p>
            
            <div className="space-y-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => <SessionCardSkeleton key={index} />)
                ) : (
                    sessions?.map((session) => (
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
                                    <p className="flex items-center text-green-600 font-extrabold bg-green-100 px-2 py-0.5 rounded-full">
                                        <Users className="w-4 h-4 mr-1" />
                                        {session.seats} Seats Left!
                                    </p>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-auto">
                                <button
                                    onClick={() => handleBookSeat(session)}
                                    className="w-full md:w-48 py-3 font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-lg text-lg transform hover:scale-[1.02]"
                                >
                                    Book Seat (Free)
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {sessionToBook && (
            <RegistrationModal 
                session={sessionToBook}
                isLoggedIn={isLoggedIn}
                onClose={handleCloseModal}
                onSignUp={handleSignUp}
            />
        )}
      </div>
    );
};
