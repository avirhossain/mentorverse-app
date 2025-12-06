
'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    User, BookOpen, Clock, Zap, Star, ChevronRight, Calendar, Phone, Cake, Building, Briefcase, Mail, CheckCircle, Save, UploadCloud, LogOut, LayoutGrid, Heart, Bookmark, Wallet, PlusCircle, X, LogIn, Video, Edit
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, useDoc, useMemoFirebase, useAuth, useCollection } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc, setDoc, runTransaction, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Mentee, Session, Mentor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { signOut } from 'firebase/auth';


const NotLoggedInView = () => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-t-4 border-primary">
            <LogIn className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Access Your Account</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-sm">
                Please log in or create an account to view your dashboard, manage sessions, and more.
            </p>
            <div className="flex justify-center gap-4">
                 <Link href="/">
                    <Button size="lg" className="font-bold">
                       Go to Homepage
                    </Button>
                </Link>
            </div>
        </div>
    </div>
);


const RatingStarsInput = ({ rating, setRating }) => (
    <div className="flex items-center text-yellow-400">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-8 h-8 cursor-pointer transition duration-150 ${i < rating ? 'fill-yellow-400' : 'fill-transparent stroke-current'}`}
                strokeWidth={2}
                onClick={() => setRating(i + 1)}
            />
        ))}
    </div>
);


const ReviewModal = ({ session, user, onClose, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a rating.' });
            return;
        }
        if (!firestore || !user) return;
        
        setIsSubmitting(true);
        const mentorRef = doc(firestore, 'mentors', session.mentorId);

        try {
            await runTransaction(firestore, async (transaction) => {
                const mentorDoc = await transaction.get(mentorRef);
                if (!mentorDoc.exists()) {
                    throw new Error("Mentor profile not found.");
                }

                const mentorData = mentorDoc.data() as Mentor;
                const newReview = {
                    mentee: user.displayName || 'Anonymous User',
                    date: new Date().toISOString(),
                    rating,
                    text: comment,
                };

                const existingReviews = mentorData.reviews || [];
                const updatedReviews = [...existingReviews, newReview];
                
                const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
                const newAverageRating = totalRating / updatedReviews.length;
                const newRatingsCount = updatedReviews.length;

                transaction.update(mentorRef, {
                    reviews: updatedReviews,
                    rating: newAverageRating,
                    ratingsCount: newRatingsCount,
                });
            });

            toast({ title: 'Success!', description: 'Your review has been submitted.' });
            onReviewSubmitted(); // To refresh data if needed
            onClose();

        } catch (error) {
            console.error("Error submitting review:", error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Rate Session: {session.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Your Rating</label>
                        <RatingStarsInput rating={rating} setRating={setRating} />
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Your Comments (Optional)</label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={`How was your session with ${session.mentorName}?`}
                            rows={5}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSubmitting} className="font-bold text-lg">
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const RatingStars = ({ count }) => (
    <div className="flex items-center text-yellow-400">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 transition duration-150 ${i < count ? 'fill-yellow-400' : 'fill-transparent stroke-current'}`}
                strokeWidth={2}
            />
        ))}
    </div>
);

const ProfileInfoField = ({ label, value, name, icon: Icon, isEditing, onChange, type = "text" }) => (
    <div className="flex flex-col space-y-1">
        <label htmlFor={name} className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{label}</label>
        <div className="flex items-center">
            <div className="text-primary mr-3">
                <Icon className="w-5 h-5" />
            </div>
            {isEditing ? (
                 <Input 
                    id={name}
                    name={name}
                    type={type}
                    value={value || ''} 
                    onChange={onChange}
                    className="p-2 border rounded-md w-full"
                />
            ) : (
                <p className="w-full p-2 text-gray-800 dark:text-white">
                    {value || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                </p>
            )}
        </div>
    </div>
);

const ProfilePicture = ({ imageUrl, isEditing }) => (
    <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-xl">
            <img
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = 'https://placehold.co/150x150/7c3aed/ffffff?text=AR' }}
            />
            {isEditing && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-white" />
                </div>
            )}
        </div>
    </div>
);


const ProfileDetails = ({ user, onUpdate, onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(user);
    const { toast } = useToast();

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await onUpdate(formData);
            toast({ title: 'Success!', description: 'Your profile has been updated.' });
            setIsEditing(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        }
    };
    
    if (!user) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 border-primary h-full">
                <Skeleton className="w-32 h-32 rounded-full mx-auto mb-6" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 border-primary h-full relative">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    Your Profile
                </h2>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                </Button>
            </div>
            

            <ProfilePicture
                imageUrl={formData?.profileImageUrl || 'https://placehold.co/150x150/7c3aed/ffffff?text=AR'}
                isEditing={isEditing}
            />

            <div className="space-y-4">
                <ProfileInfoField label="Full Name" name="name" value={formData.name} icon={User} isEditing={isEditing} onChange={handleChange} />
                <ProfileInfoField label="Email" name="email" value={formData.email} icon={Mail} isEditing={false} onChange={handleChange} />
                <ProfileInfoField label="Phone Number" name="phone" value={formData.phone} icon={Phone} isEditing={isEditing} onChange={handleChange} />
                <ProfileInfoField label="Sex/Gender" name="sex" value={formData.sex} icon={User} isEditing={isEditing} onChange={handleChange} />
                <ProfileInfoField label="Date of Birth" name="birthDate" value={formData.birthDate} icon={Cake} isEditing={isEditing} onChange={handleChange} type="date" />
                <ProfileInfoField label="Institution" name="institution" value={formData.institution} icon={Building} isEditing={isEditing} onChange={handleChange} />
                <ProfileInfoField label="Job Title" name="job" value={formData.job} icon={Briefcase} isEditing={isEditing} onChange={handleChange} />
            </div>
            
            {isEditing && (
                <div className="mt-8">
                    <Button onClick={handleSave} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            )}
             <div className="pt-8 mt-8 border-t">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center py-3 px-4 text-lg font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 transition duration-150 shadow-lg"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Log Out
                </button>
            </div>
        </div>
    );
};

const AddBalanceModal = ({ onClose, onBalanceUpdate, user, firestore }) => {
    const [couponCode, setCouponCode] = useState('');
    const [bkashId, setBkashId] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const { toast } = useToast();

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!firestore || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot process request.' });
            return;
        }

        const couponRef = doc(firestore, 'coupons', couponCode.toUpperCase());
        const userRef = doc(firestore, 'users', user.uid);
        const transactionRef = doc(collection(firestore, 'balance_transactions'));

        try {
            await runTransaction(firestore, async (transaction) => {
                const couponDoc = await transaction.get(couponRef);
                if (!couponDoc.exists() || couponDoc.data().isUsed) {
                    throw new Error("This coupon is invalid or has already been used.");
                }

                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw new Error("User profile not found.");
                }

                const couponData = couponDoc.data();
                const newBalance = (userDoc.data().balance || 0) + couponData.amount;

                transaction.update(userRef, { balance: newBalance });
                transaction.update(couponRef, { 
                    isUsed: true,
                    usedBy: user.uid,
                    usedAt: new Date().toISOString(),
                });
                transaction.set(transactionRef, {
                    id: transactionRef.id,
                    userId: user.uid,
                    amount: couponData.amount,
                    source: 'coupon',
                    description: `Coupon: ${couponCode.toUpperCase()}`,
                    createdAt: new Date().toISOString(),
                });
            });

            toast({ title: 'Success!', description: `Balance updated successfully.` });
            onBalanceUpdate();
            onClose();

        } catch (error) {
            toast({ variant: 'destructive', title: 'Redemption Failed', description: error.message });
        }
    };
    
    const handleBkashSubmit = async (e) => {
        e.preventDefault();
        const amountInput = (e.target as HTMLFormElement).elements.namedItem('amount') as HTMLInputElement;
        const amount = Number(amountInput.value);

        if (!firestore || !user || !bkashId || !amount) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill all fields.' });
            return;
        }
        
        const paymentRef = doc(collection(firestore, 'pending_payments'));
        try {
            await setDoc(paymentRef, {
                id: paymentRef.id,
                userId: user.uid,
                transactionId: bkashId,
                amount,
                status: 'pending',
                createdAt: new Date().toISOString(),
            });
             setMessage({ type: 'info', text: 'We are verifying your payment and will get back to you within 3 hours.' });
            setTimeout(onClose, 3000);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Add Balance</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <Tabs defaultValue="coupon" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="coupon">Coupon Code</TabsTrigger>
                            <TabsTrigger value="bkash">bKash Payment</TabsTrigger>
                        </TabsList>
                        <TabsContent value="coupon">
                            <form onSubmit={handleCouponSubmit} className="space-y-4 mt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Enter a valid coupon code to add balance to your account.</p>
                                <Input 
                                    placeholder="Enter Coupon Code" 
                                    value={couponCode} 
                                    onChange={(e) => setCouponCode(e.target.value)} 
                                    className="text-center text-lg tracking-widest"
                                    required
                                />
                                <Button type="submit" className="w-full">Redeem Coupon</Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="bkash">
                            <form onSubmit={handleBkashSubmit} className="space-y-4 mt-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Submit your bKash payment transaction ID for manual verification.</p>
                                <Input 
                                    placeholder="Enter Amount" 
                                    name="amount"
                                    type="number"
                                    className="text-center"
                                    required
                                />
                                <Input 
                                    placeholder="Enter bKash TrxID" 
                                    value={bkashId} 
                                    onChange={(e) => setBkashId(e.target.value)} 
                                    className="text-center"
                                    required
                                />
                                <Button type="submit" className="w-full">Submit for Verification</Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                    {message.text && (
                        <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
                            message.type === 'success' ? 'bg-green-100 text-green-800' : 
                            message.type === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const WalletSection = ({ balance, onAddBalanceClick }) => (
    <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 border-green-500 mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
            <Wallet className="w-8 h-8 mr-3 text-green-600" />
            My Wallet
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-between bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Current Balance</p>
                <p className="text-4xl font-black text-green-700 dark:text-white">৳{(balance || 0).toLocaleString()}</p>
            </div>
            <Button 
                onClick={onAddBalanceClick}
                className="mt-4 sm:mt-0 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold"
            >
                <PlusCircle className="mr-2" /> Add Balance
            </Button>
        </div>
    </section>
);

const JoinButton = ({ session }) => {
    const [canJoin, setCanJoin] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const sessionDateTime = new Date(session.createdAt);
            const now = new Date();
            const tenMinutes = 10 * 60 * 1000;
            
            const isTimeCorrect = sessionDateTime.getTime() - now.getTime() < tenMinutes;
            const isSessionActive = session.status === 'active';
            
            setCanJoin(isSessionActive && isTimeCorrect);
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [session.createdAt, session.status]);

    return (
        <div className="text-center">
            <Button asChild variant={canJoin ? 'default' : 'outline'} disabled={!canJoin}>
                <a href={canJoin ? session.jitsiLink : undefined} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Video className="w-4 h-4 mr-2" />
                    Join Session
                </a>
            </Button>
            <p className="text-xs text-gray-500 mt-2">Link active 10m before start</p>
        </div>
    );
};

const UpcomingSessions = ({ sessions, isLoading }) => (
     <section>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-primary" />
            Upcoming Sessions
        </h2>
        <div className="space-y-4">
             {isLoading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading upcoming sessions...</p>
            ) : !sessions || sessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">You have no upcoming sessions.</p>
            ) : (
                sessions.map(session => (
                    <div key={session.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col sm:flex-row items-start justify-between transition duration-200 hover:shadow-xl hover:border-l-4 border-primary/80 border-l-4 border-transparent">
                        <div className="flex items-start flex-grow mb-4 sm:mb-0">
                            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg mr-4 flex-shrink-0">
                                <Zap className="w-6 h-6 text-primary dark:text-primary/90" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{session.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="flex items-center mt-1 sm:mt-0"><Clock className="w-3 h-3 mr-1" /> {session.durationMinutes} min</span>
                                </p>
                                <p className="text-sm font-semibold text-primary dark:text-primary/90 mt-1">
                                    Mentor: {session.mentorName}
                                </p>
                            </div>
                        </div>
                         <div className="mt-4 sm:mt-0 w-full sm:w-auto sm:text-right flex flex-col items-start sm:items-end flex-shrink-0 ml-0 sm:ml-4">
                               <JoinButton session={session} />
                         </div>
                    </div>
                ))
            )}
        </div>
    </section>
);


const ActivitySection = ({ sessions, isLoading, onReview }) => (
    <section>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center">
            <Clock className="w-8 h-8 mr-3 text-primary" />
            Previous Sessions
        </h2>
        <div className="space-y-4">
             {isLoading ? (
                <p>Loading sessions...</p>
            ) : sessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">You have no previous sessions.</p>
            ) : (
                sessions.map(session => {
                    const Icon = Briefcase; // Simplified
                    return (
                        <div key={session.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col sm:flex-row items-start justify-between transition duration-200 hover:shadow-xl hover:border-l-4 border-primary/80 border-l-4 border-transparent">
                            <div className="flex items-start flex-grow mb-4 sm:mb-0">
                                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg mr-4 flex-shrink-0">
                                    <Icon className="w-6 h-6 text-primary dark:text-primary/90" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{session.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(session.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center mt-1 sm:mt-0"><Clock className="w-3 h-3 mr-1" /> {session.durationMinutes} min</span>
                                    </p>
                                    <p className="text-sm font-semibold text-primary dark:text-primary/90 mt-1">
                                        Mentor: {session.mentorName}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:text-right flex flex-col items-start sm:items-end flex-shrink-0 ml-0 sm:ml-4 w-full sm:w-auto">
                                <Button
                                    onClick={() => onReview(session)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    <Star className="w-4 h-4 mr-2" />
                                    Rate & Review
                                </Button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </section>
);


const SavedContentSection = ({ content }) => (
    <section className="mt-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center">
            <Bookmark className="w-8 h-8 mr-3 text-red-500 fill-red-100 dark:fill-red-900/50" />
            Bookmarked Content
        </h2>
        <div className="grid grid-cols-1 gap-4">
            {content.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">You have no bookmarked content.</p>
            ) : (
                content.map(item => {
                    const Icon = item.type === 'Tip' ? item.icon : Briefcase;
                    return (
                        <div key={item.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-red-500 transition duration-200 hover:shadow-xl flex items-start">
                            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg mr-4 flex-shrink-0">
                                <Icon className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold dark:text-white truncate">{item.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {item.type}: {item.topic}
                                </p>
                                {item.mentorName && (
                                    <Link href="#" className="mt-1 text-xs font-semibold text-primary dark:text-primary/90 hover:underline flex items-center">
                                        Mentor: {item.mentorName}
                                    </Link>
                                )}
                                <Link href="#" className="mt-2 text-sm text-primary dark:text-primary/90 hover:underline flex items-center font-medium">
                                    View Content <ChevronRight className="w-3 h-3 ml-1" />
                                </Link>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </section>
);

export default function AccountPage() {
    const { user: authUser, isUserLoading } = useUser();
    const firestore = useFirestore();
    const auth = useAuth();
    
    const [balanceUpdate, setBalanceUpdate] = useState(0);
    const [reviewUpdate, setReviewUpdate] = useState(0);

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser, balanceUpdate]);

    const { data: menteeData, isLoading: isMenteeLoading } = useDoc<Mentee>(userDocRef);

    const userSessionsQuery = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return query(collection(firestore, `users/${authUser.uid}/sessions`));
    }, [firestore, authUser, reviewUpdate]);

    const { data: allUserSessions, isLoading: isLoadingUserSessions } = useCollection<Session>(userSessionsQuery);
    
    const upcomingSessions = allUserSessions?.filter(s => s.status === 'scheduled' || s.status === 'active') || [];
    const previousSessions = allUserSessions?.filter(s => s.status === 'completed') || [];


    const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
    const [sessionToReview, setSessionToReview] = useState(null);

    const handleBalanceUpdate = () => {
        setBalanceUpdate(prev => prev + 1);
    };

    const handleLogout = () => {
        if(auth) {
            signOut(auth);
        }
    };
    
    const handleProfileUpdate = async (updatedData: Mentee) => {
        if (!userDocRef) throw new Error("User reference not available.");
        await updateDoc(userDocRef, updatedData);
    };

    const isLoading = isUserLoading || isMenteeLoading;

    return (
        <div className="min-h-screen bg-background dark:bg-gray-900 font-sans transition duration-300">
            <Header currentView="account"/>

            <main className="max-w-6xl mx-auto p-4 sm:p-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                         <Skeleton className="w-48 h-48 rounded-full" />
                    </div>
                ) : authUser && menteeData ? (
                    <>
                        <header className="py-6 mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center">
                            <User className="w-8 h-8 mr-3 text-primary" />
                            Account Dashboard
                        </h1>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <aside className="lg:col-span-1">
                                <ProfileDetails user={menteeData} onUpdate={handleProfileUpdate} onLogout={handleLogout} />
                            </aside>

                            <div className="lg:col-span-2 space-y-8">
                                <WalletSection balance={menteeData?.balance || 0} onAddBalanceClick={() => setShowAddBalanceModal(true)} />
                                <UpcomingSessions sessions={upcomingSessions} isLoading={isLoadingUserSessions} />
                                <ActivitySection sessions={previousSessions} isLoading={isLoadingUserSessions} onReview={setSessionToReview} />
                                <SavedContentSection content={[]} />
                            </div>
                        </div>
                    </>
                ) : (
                    <NotLoggedInView />
                )}
            </main>

            {showAddBalanceModal && authUser && (
                <AddBalanceModal 
                    onClose={() => setShowAddBalanceModal(false)}
                    onBalanceUpdate={handleBalanceUpdate}
                    user={authUser}
                    firestore={firestore}
                />
            )}
            
            {sessionToReview && authUser && (
                <ReviewModal 
                    session={sessionToReview}
                    user={authUser}
                    onClose={() => setSessionToReview(null)}
                    onReviewSubmitted={() => setReviewUpdate(p => p + 1)}
                />
            )}
        </div>
    );
};
