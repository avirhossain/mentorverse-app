
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import type { Mentor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Computer, Users, X, Info } from 'lucide-react';
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
    // This is a simplified checkout modal for demonstration.
    // In a real app, you would handle login, payment, etc.
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleBooking = async () => {
        setIsSubmitting(true);
        // Here you would add your booking logic (e.g., call a Firebase function)
        // For now, we'll just simulate a success.
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({ title: "Booking Confirmed!", description: `Your session with ${mentor.name} is booked.` });
        setIsSubmitting(false);
        onBookingComplete();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="p-4 flex justify-between items-center border-b">
                    <h3 className="text-2xl font-bold text-gray-800">Confirm Booking</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6">
                    <p className="text-lg font-semibold text-primary mb-2">{session.name}</p>
                    <p className="mb-1"><strong>Mentor:</strong> {mentor.name}</p>
                    <p className="mb-1"><strong>Date:</strong> {timeSlot.date}</p>
                    <p className="mb-4"><strong>Time:</strong> {timeSlot.time}</p>
                    <Button onClick={handleBooking} disabled={isSubmitting} className="w-full font-bold text-lg">
                        {isSubmitting ? 'Processing...' : `Pay ৳${session.price} & Book`}
                    </Button>
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
    }, [firestore, resolvedParams]);

    const { data: mentor, isLoading: isMentorLoading } = useDoc<Mentor>(mentorRef);

    const session = useMemo(() => {
        if (!mentor) return null;
        return mentor.sessions.find(s => s.id === resolvedParams.sessionId);
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
