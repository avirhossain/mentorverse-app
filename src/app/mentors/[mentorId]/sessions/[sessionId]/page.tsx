
'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { Mentor, Session, Mentee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Computer, Users, X, Info, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

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


export default function MentorSessionDetailsPage({ params }: { params: { mentorId: string; sessionId: string } }) {
    const firestore = useFirestore();
    const resolvedParams = React.use(params);
    const { user } = useUser();
    const [bookingUpdate, setBookingUpdate] = useState(0);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    
    const mentorRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'mentors', resolvedParams.mentorId);
    }, [firestore, resolvedParams.mentorId]);

    const { data: mentor, isLoading: isMentorLoading } = useDoc<Mentor>(mentorRef);

    const session = useMemo(() => {
        if (!mentor) return null;
        return mentor.sessions?.find(s => s.id === resolvedParams.sessionId);
    }, [mentor, resolvedParams.sessionId]);

    const handleBookingComplete = () => {
        setBookingUpdate(prev => prev + 1);
    };

    const selectedSlot = session?.availability?.find(s => s.id === selectedSlotId);

    if (isMentorLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <SessionDetailsSkeleton />
            </div>
        );
    }

    if (!mentor || !session) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold">Session not found</h1>
                    <p className="text-gray-500">The session you are looking for does not exist or may have been moved.</p>
                     <Link href="/" className="mt-4 inline-block">
                        <Button>Go to Homepage</Button>
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900">{session.name}</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        With <Link href={`/mentors/${mentor.id}`} className="font-bold text-primary hover:underline">{mentor.name}</Link>
                    </p>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <DetailSection icon={CheckCircle} title="What You Will Learn">
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {session.learningObjectives?.map((item, index) => <li key={index}>{item}</li>) ?? <li>Details coming soon.</li>}
                            </ul>
                        </DetailSection>

                        <DetailSection icon={Users} title="Who is This For?">
                            <p className="text-gray-700">{session.whoIsItFor || 'Anyone interested in the topic.'}</p>
                        </DetailSection>

                        <DetailSection icon={Computer} title="Setup Requirements">
                            <p className="text-gray-700 whitespace-pre-line">{session.setupRequirements || 'No special setup required.'}</p>
                        </DetailSection>
                    </div>
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24 border-t-4 border-accent">
                             <div className={`mb-4 px-4 py-2 text-center text-xl font-bold text-white rounded-md ${session.price > 0 ? 'bg-primary' : 'bg-accent'}`}>
                                {session.price > 0 ? `Price: ৳${session.price}` : 'Free Session'}
                            </div>
                            <div className="space-y-3 text-gray-700 mb-6">
                                <p className="flex items-center"><Clock className="w-5 h-5 mr-2 text-primary/70" /> <strong>Duration:</strong> <span className="ml-auto">{session.duration} mins</span></p>
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="font-semibold text-md text-gray-700 flex items-center">Choose a time slot:</h4>
                                {session.availability && session.availability.length > 0 ? (
                                    <RadioGroup value={selectedSlotId || undefined} onValueChange={setSelectedSlotId}>
                                        <div className="space-y-2">
                                            {session.availability.map((slot) => (
                                                <div key={slot.id} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={slot.id} id={slot.id} />
                                                    <Label htmlFor={slot.id} className="font-normal cursor-pointer">
                                                        {slot.date} @ {slot.time}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No available slots for this session currently.</p>
                                )}
                            </div>

                            <Button 
                                onClick={() => setIsBookingModalOpen(true)}
                                disabled={!selectedSlotId}
                                className="w-full font-bold text-lg mt-6"
                            >
                                Book This Session
                            </Button>
                        </div>
                    </div>
                </div>

            </main>
            {isBookingModalOpen && selectedSlot && (
                 <CheckoutModal
                    session={session}
                    timeSlot={selectedSlot}
                    mentor={mentor}
                    onClose={() => setIsBookingModalOpen(false)}
                    onBookingComplete={handleBookingComplete}
                />
            )}
        </div>
    );
}
