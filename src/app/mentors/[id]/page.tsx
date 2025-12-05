
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Star, CheckCircle, Briefcase, GraduationCap, Clock, Calendar, MessageSquare, X, Zap, Wallet } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, runTransaction, collection, setDoc } from 'firebase/firestore';
import type { Mentor, Session, Mentee } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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

const CheckoutModal = ({ session, timeSlot, mentor, onClose, onBookingComplete }) => {
    const firestore = useFirestore();
    const { user } = useUser();
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
    
    const startTimeFull = timeSlot.time.split(' - ')[0];
    const displayTime = startTimeFull.replace(':00', '').trim();

    useEffect(() => {
        if (!user) {
            setStep('auth_check');
        } else {
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
        const userRef = doc(firestore, 'users', user.uid);

        try {
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) throw new Error("User profile not found.");
                
                const currentUserData = userDoc.data() as Mentee;
                const price = session.price || 0;
                const balance = currentUserData.balance || 0;

                if (price > 0) {
                     if (balance < price) {
                        setStep('insufficient_balance');
                        throw new Error("Insufficient balance.");
                    }
                    const newBalance = balance - price;
                    transaction.update(userRef, { balance: newBalance });
                    
                    const newTransactionRef = doc(collection(firestore, 'balance_transactions'));
                    transaction.set(newTransactionRef, {
                        id: newTransactionRef.id,
                        userId: user.uid,
                        amount: -price,
                        source: 'session_payment',
                        description: `Payment for session: ${session.name} with ${mentor.name}`,
                        createdAt: new Date().toISOString(),
                    });
                }
                
                const newSessionRef = doc(collection(firestore, 'users', user.uid, 'sessions'));
                 transaction.set(newSessionRef, {
                    id: newSessionRef.id,
                    title: session.name,
                    mentorName: mentor.name,
                    mentorId: mentor.id,
                    date: timeSlot.date,
                    time: timeSlot.time,
                    isFree: price === 0,
                    durationMinutes: session.duration,
                    price: price,
                    status: 'scheduled',
                    createdAt: new Date().toISOString(),
                 });
            });
            
            onBookingComplete();
            setStep('thank_you');

        } catch (error) {
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
                        <Button onClick={() => router.push('/login')} className="w-full">Login to Continue</Button>
                    </div>
                );
            
            case 'insufficient_balance':
                return (
                     <div className="text-center py-6">
                        <Wallet className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Insufficient Balance</h3>
                        <p className="text-gray-600 mb-6">Your current balance is not enough to book this session. Please add funds and try again.</p>
                        <Button onClick={() => router.push('/account')} className="w-full">Go to My Wallet</Button>
                    </div>
                );

            case 'confirmation':
                 return (
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
                             <p className="flex justify-between text-gray-700">
                                <span className="font-medium">Your Balance:</span>
                                <span className="font-semibold">৳{menteeData?.balance || 0}</span>
                            </p>
                            <div className="pt-2 border-t mt-2 flex justify-between items-center text-lg font-bold">
                                <span>Total Due:</span>
                                <span className="text-green-600">{session.price > 0 ? `৳${session.price}` : 'Free'}</span>
                            </div>
                        </div>
                        
                        <Button 
                            onClick={handleBooking} 
                            className="w-full py-3 text-lg font-bold"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : `Confirm & Pay ৳${session.price}`}
                        </Button>
                        <Button 
                            onClick={onClose} 
                            variant="ghost"
                            className="w-full mt-2"
                        >
                            Cancel
                        </Button>
                    </div>
                );
            case 'thank_you':
                return (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                        <p className="text-gray-600">Thank you for booking your session with {mentor.name}. A confirmation has been sent to your account dashboard.</p>
                        <Button onClick={onClose} className="mt-6 w-full">Finish</Button>
                    </div>
                );
            default:
                 return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
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

const BookingSection = ({ mentor, onBook }) => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border-t-4 border-green-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Zap className="w-6 h-6 mr-2 text-green-600" /> Book a Session</h3>
            <Accordion type="single" collapsible className="w-full" defaultValue={mentor.sessions?.[0]?.id}>
                {mentor.sessions?.map((session) => (
                    <AccordionItem value={session.id} key={session.id}>
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex justify-between items-center w-full">
                                <span className="text-lg font-semibold text-gray-800">{session.name}</span>
                                <span className="text-xl font-extrabold text-primary">
                                    {session.price > 0 ? `৳${session.price}` : 'Free'}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="pt-2 pb-4 space-y-4">
                                <p className="text-sm text-gray-600">{session.description}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-2" /> Duration: {session.duration} minutes
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-md text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary" /> Choose a time slot:</h4>
                                    {session.availability && session.availability.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {session.availability.map((slot) => (
                                                <Button
                                                    key={slot.id}
                                                    variant="outline"
                                                    onClick={() => onBook(session, slot)}
                                                >
                                                    {slot.date} @ {slot.time.split(' - ')[0]}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No available slots for this session currently.</p>
                                    )}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};


const MentorDetailsPage = ({ mentor }: { mentor: Mentor }) => {
    const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
    const [selectedBooking, setSelectedBooking] = React.useState<{session: any, timeSlot: any} | null>(null);
    const [bookingUpdate, setBookingUpdate] = React.useState(0);

    const handleBookNow = (session, timeSlot) => {
        setSelectedBooking({ session, timeSlot });
        setShowCheckoutModal(true);
    };
    
    const handleBookingComplete = () => {
        setBookingUpdate(prev => prev + 1);
        // The modal will close itself upon success.
    };

    if (!mentor) return <MentorDetailsSkeleton />;

    return (
        <div className="bg-background min-h-screen pb-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
                
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 flex flex-col items-center border-t-4 border-primary">
                    
                    <img 
                        src={mentor.avatar || 'https://placehold.co/150x150/7c3aed/ffffff?text=AR'} 
                        alt={mentor.name} 
                        className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover ring-4 ring-primary/20 mb-6"
                    />
                    
                    <div className="flex-grow text-center">
                        <div className="flex items-center justify-center mb-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mr-3">{mentor.name}</h1>
                            <CheckCircle className="w-5 h-5 text-green-500 fill-green-100" />
                        </div>
                        <h2 className="text-lg sm:text-xl text-primary font-medium mb-2">{mentor.title} at {mentor.company}</h2>
                        
                        {mentor.rating > 0 && (
                            <div className="flex items-center justify-center text-base font-medium text-yellow-500 mb-4">
                                <Star className="w-5 h-5 mr-1 fill-current" />
                                <span className="text-gray-800 font-bold mr-2">{mentor.rating.toFixed(1)}</span>
                                {mentor.ratingsCount >= 30 && (
                                    <span className="text-gray-500">({mentor.ratingsCount} ratings)</span>
                                )}
                            </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                            {mentor.skills?.map(skill => (
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

                    {mentor.sessions && mentor.sessions.length > 0 && (
                        <BookingSection mentor={mentor} onBook={handleBookNow} />
                    )}

                    {mentor.professionalExperience && mentor.professionalExperience.length > 0 && (
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                            <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center"><Briefcase className="w-6 h-6 mr-2 text-primary" /> Professional Experience</h3>
                            {mentor.professionalExperience.map((item, index) => (
                                <ExperienceItem key={index} item={item} />
                            ))}
                        </div>
                    )}

                    {mentor.education && mentor.education.length > 0 && (
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                            <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center"><GraduationCap className="w-6 h-6 mr-2 text-primary" /> Education</h3>
                            {mentor.education.map((item, index) => (
                                <EducationItem key={index} item={item} />
                            ))}
                        </div>
                    )}

                    {mentor.reviews && mentor.reviews.length > 0 && (
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
            
            {showCheckoutModal && selectedBooking && (
                <CheckoutModal
                    session={selectedBooking.session}
                    timeSlot={selectedBooking.timeSlot}
                    mentor={mentor}
                    onClose={() => setShowCheckoutModal(false)}
                    onBookingComplete={handleBookingComplete}
                />
            )}
        </div>
    );
};

export default function MentorPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();

    const mentorRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'mentors', params.id);
    }, [firestore, params]);

    const { data: mentor, isLoading } = useDoc<Mentor>(mentorRef);

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />
            <main>
                {isLoading ? <MentorDetailsSkeleton /> : <MentorDetailsPage mentor={mentor} />}
            </main>
        </div>
    );
};

    