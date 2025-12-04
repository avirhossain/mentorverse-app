'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    User, BookOpen, Clock, Zap, Star, ChevronRight, Calendar, Phone, Cake, Building, Briefcase, Mail, CheckCircle, Save, UploadCloud, LogOut, LayoutGrid, Heart, Bookmark, Wallet, PlusCircle, X, LogIn
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Mentee, Session } from '@/lib/types';
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


const ReviewModal = ({ session, user, onClose }) => {
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
        setIsSubmitting(true);
        
        try {
            if (!firestore) throw new Error('Firestore not available');
            if (!user) throw new Error('User not available');

            const mentorsRef = collection(firestore, 'mentors');
            const q = query(mentorsRef, where("name", "==", session.mentorName));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error(`Mentor '${session.mentorName}' not found.`);
            }

            const mentorDoc = querySnapshot.docs[0];
            const mentorRef = doc(firestore, 'mentors', mentorDoc.id);

            const newReview = {
                mentee: user.displayName || 'Anonymous User',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                rating,
                text: comment,
            };
            
            await updateDoc(mentorRef, {
                reviews: arrayUnion(newReview)
            });

            toast({ title: 'Success!', description: 'Your review has been submitted.' });
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

const ProfileInputField = ({ label, value, onChange, icon: Icon, type = 'text', readOnly = false }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{label}</label>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary transition duration-150">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 text-primary">
                <Icon className="w-5 h-5" />
            </div>
            <input
                type={type}
                value={value || ''}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full p-3 text-gray-800 dark:text-white dark:bg-gray-800 focus:outline-none ${readOnly ? 'bg-gray-100 cursor-not-allowed dark:bg-gray-900' : ''}`}
            />
        </div>
    </div>
);

const ProfilePictureUploader = ({ currentImage, onImageChange }) => {
    const [preview, setPreview] = useState(currentImage);

    useEffect(() => {
        setPreview(currentImage);
    }, [currentImage]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                onImageChange(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const inputId = "profile-picture-input";

    return (
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-xl transition duration-300 hover:scale-[1.03]">
                <img
                    src={preview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = 'https://placehold.co/150x150/7c3aed/ffffff?text=AR' }}
                />
                <label
                    htmlFor={inputId}
                    className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity duration-300"
                    title="Upload new image"
                >
                    <UploadCloud className="w-6 h-6 text-white" />
                </label>
            </div>
            <input
                id={inputId}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};


const ProfileDetails = ({ user, onSave }) => {
    const initialFormData = useMemo(() => ({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        sex: user?.sex || '',
        institution: user?.institution || '',
        job: user?.job || '',
        birthDate: user?.birthDate || '',
        profileImageUrl: user?.profileImageUrl || 'https://placehold.co/150x150/7c3aed/ffffff?text=AR',
    }), [user]);

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        setFormData(initialFormData);
    }, [initialFormData]);

    const hasChanges = useMemo(() => {
        return ['name', 'phone', 'sex', 'institution', 'job', 'birthDate', 'profileImageUrl'].some(key => initialFormData[key] !== formData[key]);
    }, [formData, initialFormData]);

    const handleChange = useCallback((key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleImageChange = useCallback((newImageUrl) => {
        setFormData(prev => ({ ...prev, profileImageUrl: newImageUrl }));
    }, []);

    const { toast } = useToast();

    const handleSubmit = async () => {
        try {
            await onSave(formData);
            toast({ title: "Success!", description: "Profile saved successfully!" });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
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
            <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
                Your Profile Details
            </h2>

            <ProfilePictureUploader
                currentImage={formData.profileImageUrl}
                onImageChange={handleImageChange}
            />

            <div className="space-y-4">
                <ProfileInputField
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    icon={User}
                />
                <ProfileInputField
                    label="Email"
                    value={formData.email}
                    readOnly={true}
                    icon={Mail}
                />
                <ProfileInputField
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    icon={Phone}
                    type="tel"
                />
                <ProfileInputField
                    label="Sex/Gender"
                    value={formData.sex}
                    onChange={(e) => handleChange('sex', e.target.value)}
                    icon={User}
                />
                <ProfileInputField
                    label="Date of Birth"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    icon={Cake}
                    type="date"
                />
                <ProfileInputField
                    label="Institution"
                    value={formData.institution}
                    onChange={(e) => handleChange('institution', e.target.value)}
                    icon={Building}
                />
                <ProfileInputField
                    label="Job Title"
                    value={formData.job}
                    onChange={(e) => handleChange('job', e.target.value)}
                    icon={Briefcase}
                />

                {hasChanges && (
                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            className="w-full flex items-center justify-center py-3 px-4 text-lg font-semibold rounded-xl text-white bg-primary hover:bg-primary/90 transition duration-150 shadow-lg"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Submit Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const AddBalanceModal = ({ onClose, onBalanceUpdate }) => {
    const [couponCode, setCouponCode] = useState('');
    const [bkashId, setBkashId] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleCouponSubmit = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        // Mock coupon validation
        if (couponCode.toUpperCase() === 'GUIDE500') {
            onBalanceUpdate(500); // Simulate adding 500
            setMessage({ type: 'success', text: 'Successfully added ৳500 to your balance!' });
            setTimeout(onClose, 2000);
        } else {
            setMessage({ type: 'error', text: 'Invalid coupon code. Please try again.' });
        }
    };

    const handleBkashSubmit = (e) => {
        e.preventDefault();
        setMessage({ type: 'info', text: 'We are verifying your payment and will get back to you within 3 hours.' });
        // In a real app, you'd send this to the backend
        console.log('bKash Transaction ID submitted:', bkashId);
        setTimeout(onClose, 3000);
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


const ActivitySection = ({ sessions, onReview }) => (
    <section>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center">
            <Clock className="w-8 h-8 mr-3 text-primary" />
            Previous Sessions
        </h2>
        <div className="space-y-4">
             {!sessions ? (
                <p className="text-gray-500 dark:text-gray-400">Loading sessions...</p>
            ) : sessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">You have no previous sessions.</p>
            ) : (
                sessions.map(session => {
                    const Icon = Briefcase; // Simplified
                    return (
                        <div key={session.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col sm:flex-row items-start justify-between transition duration-200 hover:shadow-xl hover:border-l-4 border-primary/80 border-l-4 border-transparent">
                            <div className="flex items-start flex-grow">
                                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg mr-4 flex-shrink-0">
                                    <Icon className="w-6 h-6 text-primary dark:text-primary/90" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{session.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-4">
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {session.date}</span>
                                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {session.durationMinutes} min</span>
                                    </p>
                                    <p className="text-sm font-semibold text-primary dark:text-primary/90 mt-1">
                                        Mentor: {session.mentorName}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:text-right flex flex-col items-start sm:items-end flex-shrink-0 ml-0 sm:ml-4">
                                <Button
                                    onClick={() => onReview(session)}
                                    variant="outline"
                                    size="sm"
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
    
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);

    const { data: menteeData, isLoading: isMenteeLoading } = useDoc<Mentee>(userDocRef);

    const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
    const [sessionToReview, setSessionToReview] = useState(null);
    
    const handleSaveProfile = async (updatedData) => {
        if (!userDocRef) throw new Error("User is not signed in.");
        await setDoc(userDocRef, updatedData, { merge: true });
    };

    const handleBalanceUpdate = (amount) => {
         if (!userDocRef || !menteeData) return;
        const newBalance = (menteeData.balance || 0) + amount;
        updateDoc(userDocRef, { balance: newBalance });
    };

    const handleLogout = () => {
        if(auth) {
            signOut(auth);
        }
    };
    
    const LogoutButton = () => (
        <div className="pt-8 mt-8">
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center py-3 px-4 text-lg font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 transition duration-150 shadow-lg"
            >
                <LogOut className="w-5 h-5 mr-2" />
                Log Out
            </button>
        </div>
    );

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
                                <ProfileDetails user={menteeData} onSave={handleSaveProfile} />
                            </aside>

                            <div className="lg:col-span-2 space-y-8">
                                <WalletSection balance={menteeData?.balance || 0} onAddBalanceClick={() => setShowAddBalanceModal(true)} />
                                <ActivitySection sessions={[]} onReview={setSessionToReview} />
                                <SavedContentSection content={[]} />
                                <LogoutButton />
                            </div>
                        </div>
                    </>
                ) : (
                    <NotLoggedInView />
                )}
            </main>

            {showAddBalanceModal && (
                <AddBalanceModal 
                    onClose={() => setShowAddBalanceModal(false)}
                    onBalanceUpdate={handleBalanceUpdate}
                />
            )}
            
            {sessionToReview && authUser && (
                <ReviewModal 
                    session={sessionToReview}
                    user={authUser}
                    onClose={() => setSessionToReview(null)}
                />
            )}
        </div>
    );
};
