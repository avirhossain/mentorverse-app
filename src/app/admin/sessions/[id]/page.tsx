
'use client';
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import type { Session, Mentee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, PlayCircle, User, Mail, Check, X, Info } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


const SessionDetailsSkeleton = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        </div>
    </div>
);

const DetailCard = ({ icon: Icon, title, value }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border flex items-start">
        <div className="p-2 bg-primary/10 rounded-md mr-4">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const BookedUserCard = ({ user }) => (
    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-3">
                 <User className="w-5 h-5 text-green-700" />
            </div>
            <div>
                <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
        </div>
        <Link href={`/admin/users/${user.id}`} passHref>
             <Button variant="ghost" size="sm"><Info className="w-4 h-4 mr-1"/> View</Button>
        </Link>
    </div>
);

export default function AdminSessionDetailsPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const resolvedParams = React.use(params);
    const [bookedUsers, setBookedUsers] = useState<Mentee[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    const sessionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'sessions', resolvedParams.id);
    }, [firestore, resolvedParams.id, fetchTrigger]);

    const { data: session, isLoading: isLoadingSession } = useDoc<Session>(sessionRef);

    useEffect(() => {
        const fetchBookedUsers = async () => {
            if (!firestore || !session || !session.bookedBy || session.bookedBy.length === 0) {
                setBookedUsers([]);
                setIsLoadingUsers(false);
                return;
            }
            
            setIsLoadingUsers(true);
            try {
                // Firestore 'in' query is limited to 30 items. If more, we need multiple queries.
                const userIds = session.bookedBy;
                const users: Mentee[] = [];
                const chunks = [];
                for (let i = 0; i < userIds.length; i += 30) {
                    chunks.push(userIds.slice(i, i + 30));
                }

                for (const chunk of chunks) {
                    const usersQuery = query(collection(firestore, 'users'), where('id', 'in', chunk));
                    const querySnapshot = await getDocs(usersQuery);
                    querySnapshot.forEach((doc) => {
                        users.push({ id: doc.id, ...doc.data() } as Mentee);
                    });
                }
                
                setBookedUsers(users);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not fetch booked users." });
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchBookedUsers();
    }, [firestore, session]);
    
    const handleUpdateStatus = async (status: 'active' | 'completed') => {
        if (!sessionRef) return;
        try {
            await updateDoc(sessionRef, { status: status });
            setFetchTrigger(t => t + 1); // Trigger re-fetch
            toast({ title: "Success", description: `Session is now ${status}.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update session status." });
        }
    };
    
    if (isLoadingSession) {
        return (
            <div className="min-h-screen bg-background">
                <Header currentView="admin"/>
                <SessionDetailsSkeleton />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-background">
                <Header currentView="admin"/>
                <div className="text-center py-20 px-4">
                    <h1 className="text-2xl font-bold">Session not found</h1>
                    <p className="text-gray-500">The session you are looking for does not exist.</p>
                </div>
            </div>
        );
    }
    
    const sessionDate = new Date(session.createdAt);

    return (
        <div className="min-h-screen bg-background">
            <Header currentView="admin"/>
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="mb-8">
                     <Link href="/admin" className="text-sm text-primary hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{session.title}</h1>
                    <p className="mt-1 text-lg text-gray-600 dark:text-gray-300">
                        With <Link href={`/mentors/${session.mentorId}`} className="font-bold text-primary hover:underline">{session.mentorName}</Link>
                    </p>
                </header>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailCard icon={Calendar} title="Date" value={sessionDate.toLocaleDateString()} />
                        <DetailCard icon={Clock} title="Time" value={sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                        <DetailCard icon={Users} title="Booked / Max" value={`${session.bookedBy?.length || 0} / ${session.maxParticipants}`} />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-t-4 border-primary/20">
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Session Control</h2>
                             {session.status === 'scheduled' && (
                                <Button onClick={() => handleUpdateStatus('active')} className="w-full sm:w-auto">
                                    <PlayCircle className="mr-2"/> Start Session
                                </Button>
                            )}
                             {session.status === 'active' && (
                                <Button variant="destructive" onClick={() => handleUpdateStatus('completed')} className="w-full sm:w-auto">
                                    <Check className="mr-2"/> Mark as Completed
                                </Button>
                            )}
                             {session.status === 'completed' && (
                                <span className="flex items-center font-bold text-green-600"><Check className="mr-2"/> Session Completed</span>
                            )}
                         </div>
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                            Starting the session will change its status to 'active' and enable the join button for users.
                         </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-t-4 border-primary/20">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Booked Mentees</h2>
                        {isLoadingUsers ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full"/>
                                <Skeleton className="h-12 w-full"/>
                            </div>
                        ) : bookedUsers.length > 0 ? (
                            <div className="space-y-3">
                                {bookedUsers.map(user => <BookedUserCard key={user.id} user={user} />)}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No one has booked this session yet.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

    