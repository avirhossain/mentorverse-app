'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Star, CheckCircle, Briefcase, GraduationCap, Clock, Calendar, MessageSquare, X, Zap } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Mentor } from '@/lib/types';

// --- Helper Components ---

const ExperienceItem = ({ item }) => (
    <div className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
        <h4 className="text-base font-semibold text-gray-800">{item.title} at {item.company}</h4>
        <p className="text-sm text-primary font-medium mb-1">{item.duration}</p>
        <p className="text-sm text-gray-600">{item.description}</p>
    </div>
);

const EducationItem = ({ item }) => (
    <div className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
        <h4 className="text-base font-semibold text-gray-800">{item.degree}</h4>
        <p className="text-sm text-gray-600">{item.institution}</p>
        <p className="text-xs text-primary/80 font-medium">{item.duration}</p>
    </div>
);

const ReviewCard = ({ review }) => (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" />
                <span className="font-bold text-sm text-gray-800">{review.rating}.0</span>
            </div>
            <p className="text-xs text-gray-500">{review.date}</p>
        </div>
        <p className="text-sm text-gray-700 mb-2 italic">"{review.text}"</p>
        <p className="text-xs font-semibold text-primary">— {review.mentee}</p>
    </div>
);

const CheckoutModal = ({ session, timeSlot, mentor, onClose }) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [showThankYou, setShowThankYou] = React.useState(false);

    const startTimeFull = timeSlot.time.split(' - ')[0];
    const displayTime = startTimeFull.replace(':00', '').trim();

    const handlePayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowThankYou(true); 
        }, 300); 
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
                    {showThankYou ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                            <p className="text-gray-600">
                                Thank you for booking your session with **{mentor.name}**. 
                                A confirmation email and calendar invite have been sent to you.
                            </p>
                            <button 
                                onClick={onClose} 
                                className="mt-6 w-full py-2 font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition"
                            >
                                Finish
                            </button>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Confirm Your Booking</h3>

                            <div className="border border-primary/20 rounded-lg p-4 bg-primary/10 mb-6 space-y-2">
                                <p className="flex justify-between text-gray-700">
                                    <span className="font-medium">Mentor:</span>
                                    <span className="font-semibold">{mentor.name}</span>
                                </p>
                                <p className="flex justify-between text-gray-700">
                                    <span className="font-medium">Session:</span>
                                    <span className="font-semibold text-primary">{session.name}</span>
                                </p>
                                <p className="flex justify-between text-gray-700">
                                    <span className="font-medium">Time Slot:</span>
                                    <span className="font-semibold">{timeSlot.date} @ {displayTime}</span>
                                </p>
                                <div className="pt-2 border-t mt-2 flex justify-between items-center text-lg font-bold">
                                    <span>Total Due:</span>
                                    <span className="text-green-600">{session.price} {session.currency}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handlePayment} 
                                className="w-full py-3 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-md flex items-center justify-center disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : `Pay Now ${session.price} ${session.currency}`}
                            </button>
                            <button 
                                onClick={onClose} 
                                className="w-full mt-2 py-2 text-gray-600 hover:text-gray-900 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MentorDetailsSkeleton = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 flex flex-col items-center border-t-4 border-primary">
        <Skeleton className="w-40 h-40 sm:w-48 sm:h-48 rounded-full mb-6" />
        <div className="w-full text-center space-y-3">
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-5 w-1/3 mx-auto" />
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md space-y-4">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md space-y-4">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
        </div>
      </div>
    </div>
);


const MentorDetailsPage = ({ mentor }: { mentor: Mentor }) => {
    const [selectedSession, setSelectedSession] = React.useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState(null);
    const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);

    useEffect(() => {
        if (mentor?.sessions?.length > 0) {
            setSelectedSession(mentor.sessions[0]);
        }
        if (mentor?.availability?.length > 0) {
            setSelectedTimeSlot(mentor.availability[0]);
        }
    }, [mentor]);

    const handleConfirmPayment = () => {
        if (!selectedSession || !selectedTimeSlot) {
            console.error("Please select both a session and an availability slot.");
            return;
        }
        setShowCheckoutModal(true);
    };

    if (!mentor) return <MentorDetailsSkeleton />;

    return (
        <div className="bg-background min-h-screen pb-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
                
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 flex flex-col items-center border-t-4 border-primary">
                    
                    <img 
                        src={mentor.avatar} 
                        alt={mentor.name} 
                        className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover ring-4 ring-primary/20 mb-6"
                    />
                    
                    <div className="flex-grow text-center">
                        <div className="flex items-center justify-center mb-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mr-3">{mentor.name}</h1>
                            <CheckCircle className="w-5 h-5 text-green-500 fill-green-100" />
                        </div>
                        <h2 className="text-lg sm:text-xl text-primary font-medium mb-2">{mentor.title} at {mentor.company}</h2>
                        
                        <div className="flex items-center justify-center text-base font-medium text-yellow-500 mb-4">
                            <Star className="w-5 h-5 mr-1 fill-current" />
                            <span className="text-gray-800 font-bold mr-2">{mentor.rating.toFixed(1)}</span>
                            <span className="text-gray-500">({mentor.ratingsCount} ratings)</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                            {mentor.skills.map(skill => (
                                <span key={skill} className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><MessageSquare className="w-6 h-6 mr-2 text-primary" /> Mentor Introduction</h3>
                        <p className="text-gray-700 leading-relaxed">{mentor.intro}</p>
                    </div>

                    {mentor.professionalExperience.length > 0 && (
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                            <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center"><Briefcase className="w-6 h-6 mr-2 text-primary" /> Professional Experience</h3>
                            {mentor.professionalExperience.map((item, index) => (
                                <ExperienceItem key={index} item={item} />
                            ))}
                        </div>
                    )}

                    {mentor.education.length > 0 && (
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                            <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center"><GraduationCap className="w-6 h-6 mr-2 text-primary" /> Education</h3>
                            {mentor.education.map((item, index) => (
                                <EducationItem key={index} item={item} />
                            ))}
                        </div>
                    )}

                    {mentor.sessions.length > 0 && (
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border-t-4 border-green-500">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Zap className="w-6 h-6 mr-2 text-green-600" /> Book Your Session</h3>
                            
                            <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center"><Clock className="w-4 h-4 mr-2 text-primary" /> Select Session Tier</h4>
                            <div className="space-y-3 mb-6">
                                {mentor.sessions.map((session) => (
                                    <label 
                                        key={session.id}
                                        className={`flex flex-col p-4 border rounded-lg cursor-pointer transition ${selectedSession?.id === session.id 
                                            ? 'border-primary bg-primary/10 ring-2 ring-primary' 
                                            : 'border-gray-200 hover:border-primary/50'}`}
                                        onClick={() => setSelectedSession(session)}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-gray-800 text-base">{session.name}</span>
                                            <span className="text-xl font-extrabold text-primary">
                                                {session.price}<span className="text-sm font-normal"> {session.currency}</span>
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">{session.description}</p>
                                    </label>
                                ))}
                            </div>

                            {mentor.availability.length > 0 && (
                                <>
                                    <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary" /> Choose Available Time</h4>
                                    <div className="flex flex-wrap gap-3 mb-8">
                                        {mentor.availability.map((slot) => {
                                            const startTimeFull = slot.time.split(' - ')[0];
                                            const startTime = startTimeFull.replace(':00', '').trim();

                                            return (
                                                <button
                                                    key={slot.id}
                                                    className={`py-2 px-4 border rounded-full text-sm font-medium transition ${selectedTimeSlot?.id === slot.id
                                                        ? 'bg-primary text-white border-primary shadow-md'
                                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-primary/10 hover:border-primary/40'}`}
                                                    onClick={() => setSelectedTimeSlot(slot)}
                                                >
                                                    {slot.date} {startTime}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            <button 
                                onClick={handleConfirmPayment}
                                className="w-full py-3 text-lg font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-xl transform hover:scale-[1.01]"
                                disabled={!selectedSession || !selectedTimeSlot}
                            >
                                Confirm Payment ({selectedSession?.price || 'N/A'} {selectedSession?.currency})
                            </button>
                        </div>
                    )}


                    {mentor.reviews.length > 0 && (
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                            <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center"><Star className="w-6 h-6 mr-2 text-primary fill-primary/10" /> Mentees Reviews ({mentor.reviews.length})</h3>
                            <div className="space-y-4">
                                {mentor.reviews.map((review, index) => (
                                    <ReviewCard key={index} review={review} />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
            
            {showCheckoutModal && selectedSession && selectedTimeSlot && (
                <CheckoutModal
                    session={selectedSession}
                    timeSlot={selectedTimeSlot}
                    mentor={mentor}
                    onClose={() => setShowCheckoutModal(false)}
                />
            )}
        </div>
    );
};

export default function MentorPage({ params: { id } }: { params: { id: string } }) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const firestore = useFirestore();

    const mentorRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'mentors', id);
    }, [firestore, id]);

    const { data: mentor, isLoading } = useDoc<Mentor>(mentorRef);

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <main>
                {isLoading ? <MentorDetailsSkeleton /> : <MentorDetailsPage mentor={mentor} />}
            </main>
        </div>
    );
};
