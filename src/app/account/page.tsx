'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    User, BookOpen, Clock, Zap, Star, ChevronRight, Calendar, Phone, Cake, Building, Briefcase, Mail, CheckCircle, Save, UploadCloud, LogOut, LayoutGrid, Heart, Bookmark, Wallet, PlusCircle, X
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


const MOCK_USER = {
    id: 'user-001',
    name: 'Alexandra Reid',
    email: 'alex.reid@example.com',
    phone: '555-0101-555',
    sex: 'Female',
    institution: 'Tech University',
    job: 'Senior Developer',
    birthDate: '1995-10-25',
    profileImageUrl: 'https://placehold.co/150x150/7c3aed/ffffff?text=AR',
    balance: 500, // Starting balance
};

const MOCK_SESSIONS = [
    { id: 1, title: 'Deep Dive into React Hooks', type: 'Coding', date: '2025-11-18', duration: '60 min', rating: 0, mentorName: 'Jasmine Chen', mentorId: '1' },
    { id: 2, title: 'Introduction to Figma Design', type: 'Design', date: '2025-11-15', duration: '45 min', rating: 0, mentorName: 'Marcus Bell', mentorId: '2' },
    { id: 3, title: 'Mastering Advanced SQL Queries', type: 'Data', date: '2025-11-10', duration: '90 min', rating: 0, mentorName: 'Anya Sharma', mentorId: '3' },
    { id: 4, title: 'Effective Remote Team Communication', type: 'Soft Skills', date: '2025-11-05', duration: '30 min', rating: 0, mentorName: 'David Smith', mentorId: '4' },
];

const MOCK_BOOKMARKED_CONTENT = [
    { id: 101, title: 'The 5-Minute Rule for Productivity', topic: 'Productivity Tip', type: 'Tip', icon: Clock },
    { id: 102, title: 'CSS Grid vs Flexbox Cheat Sheet', topic: 'Web Dev Resource', type: 'Tip', icon: LayoutGrid },
    { id: 103, title: 'Mastering Advanced SQL Queries', topic: 'Data Session', type: 'Session', mentorName: 'Mr. David Lee' },
    { id: 104, title: 'Color Psychology in UI/UX', topic: 'Design Tip', type: 'Tip', icon: Heart },
    { id: 105, title: 'Deep Dive into React Hooks', topic: 'Coding Session', type: 'Session', mentorName: 'Dr. John Smith' },
];

const getCategoryIcon = (type) => {
    switch (type) {
        case 'Coding': return Briefcase;
        case 'Design': return Building;
        case 'Data': return Zap;
        case 'Soft Skills': return User;
        default: return BookOpen;
    }
}

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

            const mentorsRef = collection(firestore, 'mentors');
            const q = query(mentorsRef, where("name", "==", session.mentorName));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error(`Mentor '${session.mentorName}' not found.`);
            }

            const mentorDoc = querySnapshot.docs[0];
            const mentorRef = doc(firestore, 'mentors', mentorDoc.id);

            const newReview = {
                mentee: user.name,
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
                value={value}
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
        name: user.name,
        email: user.email,
        phone: user.phone,
        sex: user.sex,
        institution: user.institution,
        job: user.job,
        birthDate: user.birthDate,
        profileImageUrl: user.profileImageUrl,
    }), [user]);

    const [formData, setFormData] = useState(initialFormData);

    const hasChanges = useMemo(() => {
        return ['name', 'phone', 'sex', 'institution', 'job', 'birthDate', 'profileImageUrl'].some(key => initialFormData[key] !== formData[key]);
    }, [formData, initialFormData]);

    const handleChange = useCallback((key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleImageChange = useCallback((newImageUrl) => {
        setFormData(prev => ({ ...prev, profileImageUrl: newImageUrl }));
    }, []);

    const [message, setMessage] = useState('');
    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    }

    const handleSubmit = () => {
        console.log("Submitting changes:", formData);
        onSave(formData);
        showMessage('Profile saved successfully! (Simulated)');
    };
    

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 border-primary h-full relative">
            {message && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 p-3 bg-green-500 text-white rounded-lg shadow-xl flex items-center space-x-2 animate-pulse">
                    <CheckCircle className="w-5 h-5" />
                    <span>{message}</span>
                </div>
            )}
            
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
                <p className="text-4xl font-black text-green-700 dark:text-white">৳{balance.toLocaleString()}</p>
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
            {sessions.map(session => {
                const Icon = getCategoryIcon(session.type);
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
                                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {session.duration}</span>
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
                                disabled={session.rating > 0} // Disable if already rated
                            >
                                <Star className="w-4 h-4 mr-2" />
                                {session.rating > 0 ? 'Reviewed' : 'Rate & Review'}
                            </Button>
                        </div>
                    </div>
                );
            })}
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
            {content.map(item => {
                const Icon = item.type === 'Tip' ? item.icon : getCategoryIcon(item.topic.replace(' Session', ''));
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
            })}
        </div>
    </section>
);

export default function AccountPage() {
    const [user, setUser] = useState(MOCK_USER);
    const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
    const [sessionToReview, setSessionToReview] = useState(null);
    
    const handleSaveProfile = (updatedData) => {
        console.log("Saving profile data to database:", updatedData);
        setUser(prev => ({...prev, ...updatedData}));
    };

    const handleBalanceUpdate = (amount) => {
        setUser(prev => ({...prev, balance: prev.balance + amount}));
    };

    const handleLogout = () => {
        console.log("Logout function executed. User should be redirected now.");
        alert('Logged out successfully! (Simulated)');
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

    return (
        <div className="min-h-screen bg-background dark:bg-gray-900 font-sans transition duration-300">
            <Header currentView="account"/>

            <div className="max-w-6xl mx-auto p-4 sm:p-8">
                <header className="py-6 mb-8">
                  <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center">
                      <User className="w-8 h-8 mr-3 text-primary" />
                      Account Dashboard
                  </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <aside className="lg:col-span-1">
                        <ProfileDetails user={user} onSave={handleSaveProfile} />
                    </aside>

                    <div className="lg:col-span-2 space-y-8">
                        <WalletSection balance={user.balance} onAddBalanceClick={() => setShowAddBalanceModal(true)} />
                        <ActivitySection sessions={MOCK_SESSIONS} onReview={setSessionToReview} />
                        <SavedContentSection content={MOCK_BOOKMARKED_CONTENT} />
                        <LogoutButton />
                    </div>
                </div>
            </div>

            {showAddBalanceModal && (
                <AddBalanceModal 
                    onClose={() => setShowAddBalanceModal(false)}
                    onBalanceUpdate={handleBalanceUpdate}
                />
            )}
            
            {sessionToReview && (
                <ReviewModal 
                    session={sessionToReview}
                    user={user}
                    onClose={() => setSessionToReview(null)}
                />
            )}
        </div>
    );
};