
'use client';
import React, { useState, useEffect } from 'react';
import { FilePlus, Users as UsersIcon, X, PlusCircle, Trash2, User, Briefcase, Lightbulb, Ticket, Banknote, Edit, ShieldX } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, doc, runTransaction, deleteDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import type { Mentor, Mentee, Session, Tip, Coupon, PendingPayment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl transform transition-all">
      <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

const CouponForm = ({ onSave, onClose }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ code: '', amount: 0, expiresAt: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newCoupon = {
                ...formData,
                amount: Number(formData.amount),
                isUsed: false,
                createdAt: new Date().toISOString(),
                id: formData.code.toUpperCase(),
            };
            await onSave(newCoupon);
            toast({ title: 'Success!', description: 'New coupon created.' });
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to save coupon: ${error.message}` });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="code" placeholder="Coupon Code (e.g., WELCOME50)" value={formData.code} onChange={handleChange} required />
            <Input name="amount" type="number" placeholder="Amount (e.g., 500)" value={formData.amount} onChange={handleChange} required />
            <Input name="expiresAt" type="date" placeholder="Expiry Date" value={formData.expiresAt} onChange={handleChange} />
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Coupon</Button>
            </div>
        </form>
    );
};

const PaymentApprovalList = ({ payments, onApprove, isLoading }) => (
    <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Banknote className="w-6 h-6 mr-3 text-primary" />
            Pending bKash Payments
        </h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-t-4 border-primary/50 space-y-3">
             {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : payments && payments.length > 0 ? (
                payments.map((payment) => (
                    <div key={payment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">TrxID: <span className="font-bold text-primary">{payment.transactionId}</span></p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">User ID: {payment.userId}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount: ৳{payment.amount}</p>
                        </div>
                        <Button onClick={() => onApprove(payment)}>Approve</Button>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No pending payments.</p>
            )}
        </div>
    </div>
);


const MentorForm = ({ mentor, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        company: '',
        intro: '',
        skills: '',
        avatar: 'https://placehold.co/150x150/4F46E5/FFFFFF?text=New',
        status: 'active',
        professionalExperience: [],
        education: [],
        sessions: [],
        availability: [],
        reviews: [],
        ...mentor,
        skills: mentor?.skills?.join(', ') || '',
    });

    const { toast } = useToast();
    const firestore = useFirestore();
    const isEditing = !!mentor;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (value) => {
        setFormData(prev => ({ ...prev, status: value }));
    };

    const handleDynamicChange = (section, index, e) => {
        const { name, value } = e.target;
        const list = [...formData[section]];
        list[index][name] = value;
        setFormData(prev => ({ ...prev, [section]: list }));
    };
    
    const addDynamicItem = (section, item) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], item]
        }));
    };

    const removeDynamicItem = (section, index) => {
        const list = [...formData[section]];
        list.splice(index, 1);
        setFormData(prev => ({ ...prev, [section]: list }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Firestore is not available.`,
            });
            return;
        }
        
        try {
            const processedData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()),
                sessions: formData.sessions.map(s => ({...s, price: Number(s.price), duration: Number(s.duration)})),
                reviews: formData.reviews.map(r => ({...r, rating: Number(r.rating)})),
            };

            if (isEditing) {
                await onSave(processedData);
                toast({ title: 'Success!', description: 'Mentor profile updated.' });
            } else {
                const mentorsCol = collection(firestore, 'mentors');
                const mentorsSnapshot = await getDocs(mentorsCol);
                const newId = (mentorsSnapshot.size + 1).toString();
                
                const newMentor = {
                    ...processedData,
                    id: newId,
                    rating: formData.reviews.length > 0 ? formData.reviews.reduce((acc, r) => acc + Number(r.rating), 0) / formData.reviews.length : 0,
                    ratingsCount: formData.reviews.length,
                    availability: formData.availability.map(a => ({...a, id: Math.random()})),
                };
                await onSave(newMentor);
                toast({ title: 'Success!', description: 'New mentor profile created.' });
            }
            onClose();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to save mentor: ${error.message}`,
            });
        }
    };
    
    const renderDynamicSection = (sectionTitle, sectionKey, fields, newItem) => (
        <div className="space-y-3 p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">{sectionTitle}</h4>
            {formData[sectionKey].map((item, index) => (
                <div key={index} className="p-3 border rounded-md space-y-2 relative bg-gray-50 dark:bg-gray-700/50">
                     <Button type="button" size="sm" variant="ghost" className="absolute top-2 right-2 p-1 h-auto" onClick={() => removeDynamicItem(sectionKey, index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                    {fields.map(field => (
                         <Input 
                            key={field.name}
                            name={field.name}
                            type={field.type || 'text'}
                            placeholder={field.placeholder}
                            value={item[field.name]}
                            onChange={(e) => handleDynamicChange(sectionKey, index, e)}
                        />
                    ))}
                    {sectionKey === 'sessions' && (
                        <div className="pl-4 mt-2 space-y-2 border-l-2 border-primary">
                            <h5 className="text-sm font-semibold">Available Slots for this Session</h5>
                             {formData.availability.map((avail, availIndex) => (
                                <div key={availIndex} className="flex items-center gap-2">
                                    <Input name="date" placeholder="Date (e.g., 18th November)" value={avail.date} onChange={(e) => handleDynamicChange('availability', availIndex, e)} />
                                    <Input name="time" placeholder="Time (e.g., 7:00 PM - 8:00 PM)" value={avail.time} onChange={(e) => handleDynamicChange('availability', availIndex, e)} />
                                    <Button type="button" size="sm" variant="ghost" className="p-1 h-auto" onClick={() => removeDynamicItem('availability', availIndex)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addDynamicItem('availability', { date: '', time: ''})}>
                                <PlusCircle className="w-4 h-4 mr-2"/> Add Slot
                            </Button>
                        </div>
                    )}
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addDynamicItem(sectionKey, newItem)}>
                <PlusCircle className="w-4 h-4 mr-2"/> Add {sectionTitle.slice(0, -1)}
            </Button>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                <Input name="title" placeholder="Job Title (e.g., Staff Software Engineer)" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="company" placeholder="Company (e.g., Google)" value={formData.company} onChange={handleChange} required />
                <Input name="avatar" placeholder="Profile Picture URL" value={formData.avatar} onChange={handleChange} />
            </div>
            
            <Input name="skills" placeholder="Skills (comma-separated, e.g., React, System Design)" value={formData.skills} onChange={handleChange} required />
            <Textarea name="intro" placeholder="Mentor Introduction" value={formData.intro} onChange={handleChange} required />
            
            <Select onValueChange={handleStatusChange} value={formData.status}>
                <SelectTrigger>
                    <SelectValue placeholder="Select account status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
            </Select>

            {renderDynamicSection('Professional Experiences', 'professionalExperience',
                [
                    { name: 'title', placeholder: 'Job Title' },
                    { name: 'company', placeholder: 'Company' },
                    { name: 'duration', placeholder: 'Duration (e.g., 2020 - Present)' },
                    { name: 'description', placeholder: 'Description' }
                ],
                { title: '', company: '', duration: '', description: '' }
            )}

            {renderDynamicSection('Education', 'education',
                [
                    { name: 'degree', placeholder: 'Degree' },
                    { name: 'institution', placeholder: 'Institution' },
                    { name: 'duration', placeholder: 'Duration (e.g., 2014 - 2016)' },
                ],
                { degree: '', institution: '', duration: '' }
            )}

            {renderDynamicSection('Offered Sessions', 'sessions',
                [
                    { name: 'id', placeholder: 'Session ID (e.g., interview)' },
                    { name: 'name', placeholder: 'Session Name (e.g., 60 min Interview Prep)' },
                    { name: 'price', placeholder: 'Price', type: 'number' },
                    { name: 'currency', placeholder: 'Currency (e.g., ৳)' },
                    { name: 'duration', placeholder: 'Duration (in minutes)', type: 'number' },
                    { name: 'description', placeholder: 'Session Description' }
                ],
                { id: '', name: '', price: 0, currency: '৳', duration: 60, description: '' }
            )}

            {renderDynamicSection('Mentees Reviews', 'reviews',
                [
                    { name: 'mentee', placeholder: 'Mentee Name' },
                    { name: 'date', placeholder: 'Date (e.g., Nov 1, 2025)' },
                    { name: 'rating', placeholder: 'Rating (1-5)', type: 'number' },
                    { name: 'text', placeholder: 'Review Text' }
                ],
                { mentee: '', date: '', rating: 5, text: '' }
            )}

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">{isEditing ? 'Save Changes' : 'Save Mentor'}</Button>
            </div>
        </form>
    );
};

const MenteeForm = ({ mentee, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        interests: '',
        balance: 0,
        status: 'active',
        ...mentee,
        interests: mentee?.interests?.join(', ') || '',
    });

    const { toast } = useToast();
    
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };
    
    const handleStatusChange = (value) => {
        setFormData(prev => ({ ...prev, status: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const processedData = {
                ...formData,
                interests: formData.interests.split(',').map(i => i.trim()),
            };
            await onSave(processedData);
            toast({ title: "Success!", description: "Mentee profile updated." });
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to update mentee: ${error.message}` });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            <Input name="interests" placeholder="Interests (comma-separated)" value={formData.interests} onChange={handleChange} />
            <Input name="balance" type="number" placeholder="Account Balance" value={formData.balance} onChange={handleChange} required />

            <Select onValueChange={handleStatusChange} value={formData.status}>
                <SelectTrigger>
                    <SelectValue placeholder="Select account status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
};


const SessionForm = ({ mentors, onSave, onClose }) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [formData, setFormData] = useState({
        title: '',
        mentorId: '',
        date: '',
        time: '',
        durationMinutes: 60,
        type: 'Free',
        price: 0,
        maxParticipants: 10,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
            return;
        }
        if (!formData.mentorId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a mentor.' });
            return;
        }
        
        const selectedMentor = mentors.find(m => m.id === formData.mentorId);
        if (!selectedMentor) {
             toast({ variant: 'destructive', title: 'Error', description: 'Selected mentor not found.' });
            return;
        }

        try {
            const jitsiRoomName = `GuidelabSession-${uuidv4()}`;
            const jitsiLink = `https://meet.jit.si/${jitsiRoomName}`;

            const newSession = {
                ...formData,
                mentorName: selectedMentor.name,
                isFree: formData.type === 'Free',
                price: Number(formData.price),
                maxParticipants: Number(formData.maxParticipants),
                durationMinutes: Number(formData.durationMinutes),
                jitsiLink: jitsiLink,
                bookedBy: [],
                status: 'scheduled',
            };
        
            await onSave(newSession);
            toast({
                title: 'Success!',
                description: 'New exclusive session has been created.',
            });
            onClose();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to save session: ${error.message}`,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" placeholder="Session Title" value={formData.title} onChange={handleChange} required />
            
            <Select onValueChange={(value) => handleSelectChange('mentorId', value)} value={formData.mentorId}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a mentor" />
                </SelectTrigger>
                <SelectContent>
                    {mentors.map(mentor => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                            {mentor.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input name="date" type="text" placeholder="Date (e.g., 25th December)" value={formData.date} onChange={handleChange} required />
            <Input name="time" type="text" placeholder="Time (e.g., 11:00 AM)" value={formData.time} onChange={handleChange} required />
            <Input name="durationMinutes" type="number" placeholder="Duration (in minutes)" value={formData.durationMinutes} onChange={handleChange} required />
            
            <Select onValueChange={(value) => handleSelectChange('type', value)} value={formData.type}>
                <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
            </Select>

            {formData.type === 'Paid' && (
                <Input name="price" type="number" placeholder="Price (e.g., 50)" value={formData.price} onChange={handleChange} required />
            )}

            <Input name="maxParticipants" type="number" placeholder="Max Participants" value={formData.maxParticipants} onChange={handleChange} required />

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Session</Button>
            </div>
        </form>
    );
};

const TipForm = ({ onSave, onClose }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        type: 'Article',
        title: '',
        summary: '',
        content: '',
        link: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (value) => {
        setFormData(prev => ({ ...prev, type: value, content: '', link: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newTip = {
                type: formData.type,
                title: formData.title,
                summary: formData.summary,
                ...(formData.type === 'Article' ? { content: formData.content } : { link: formData.link }),
            };
            
            await onSave(newTip);
            toast({
                title: 'Success!',
                description: 'New tip has been created.',
            });
            onClose();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to save tip: ${error.message}`,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Select onValueChange={handleTypeChange} defaultValue={formData.type}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a tip type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                </SelectContent>
            </Select>
            <Input name="title" placeholder="Tip Title" value={formData.title} onChange={handleChange} required />
            <Input name="summary" placeholder="Brief Summary" value={formData.summary} onChange={handleChange} required />
            {formData.type === 'Article' ? (
                <Textarea name="content" placeholder="Full article content..." value={formData.content} onChange={handleChange} rows={6} required />
            ) : (
                <Input name="link" placeholder="URL (e.g., https://youtube.com/...)" value={formData.link} onChange={handleChange} required type="url" />
            )}
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Tip</Button>
            </div>
        </form>
    );
};


const DataListView = ({ title, data, isLoading, icon: Icon, renderItem }) => (
    <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Icon className="w-6 h-6 mr-3 text-primary" />
            {title}
        </h2>
        {isLoading ? (
             <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-t-4 border-primary/50 space-y-3">
                {data && data.length > 0 ? (
                    data.map((item) => renderItem(item))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No data available.</p>
                )}
            </div>
        )}
    </div>
);


export default function AdminPage() {
  const [modalState, setModalState] = useState({ type: null, data: null });
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);

  const [isLoadingMentors, setIsLoadingMentors] = useState(true);
  const [isLoadingMentees, setIsLoadingMentees] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!firestore) return;
    setIsLoadingMentors(true);
    setIsLoadingMentees(true);
    setIsLoadingPayments(true);

    try {
        const [mentorsSnap, menteesSnap, paymentsSnap] = await Promise.all([
            getDocs(collection(firestore, 'mentors')),
            getDocs(collection(firestore, 'users')),
            getDocs(collection(firestore, 'pending_payments')),
        ]);

        setMentors(mentorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentor)));
        setMentees(menteesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentee)));
        setPendingPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingPayment)));

    } catch (error) {
        toast({ variant: 'destructive', title: 'Error fetching data', description: error.message });
        console.error("Error fetching data:", error);
    } finally {
        setIsLoadingMentors(false);
        setIsLoadingMentees(false);
        setIsLoadingPayments(false);
    }
  };


  useEffect(() => {
    if (user && firestore) {
      fetchData();
    }
  }, [user, firestore]);

  const handleSaveMentor = async (mentorData) => {
    if (!firestore) return;
    const mentorRef = doc(firestore, 'mentors', mentorData.id);
    await setDoc(mentorRef, mentorData, { merge: true });
    fetchData(); // Refresh data
  };
  
  const handleSaveMentee = async (menteeData) => {
    if (!firestore) return;
    const menteeRef = doc(firestore, 'users', menteeData.id);
    await updateDoc(menteeRef, menteeData);
    fetchData(); // Refresh data
  };
  
  const handleDelete = async (collectionName, docId, name) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, collectionName, docId));
        toast({ title: 'Success!', description: `${name} has been deleted.` });
        fetchData(); // Refresh data
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: `Failed to delete: ${error.message}` });
    }
  };

  const handleSaveSession = async (sessionData) => {
    if (!firestore) return;
    const sessionsCol = collection(firestore, 'sessions');
    await addDoc(sessionsCol, sessionData);
    // No need to refresh sessions data as it's not displayed on this page
  };
  
  const handleSaveTip = async (tipData) => {
    if (!firestore) return;
    const tipsCol = collection(firestore, 'tips');
    await addDoc(tipsCol, tipData);
    // No need to refresh tips data
  };

  const handleSaveCoupon = async (couponData) => {
    if (!firestore) return;
    const couponRef = doc(firestore, 'coupons', couponData.id);
    await setDoc(couponRef, couponData, { merge: true });
     // No need to refresh coupon data
  };

  const handleApprovePayment = async (payment) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
        return;
    }
    const userRef = doc(firestore, 'users', payment.userId);
    const paymentRef = doc(firestore, 'pending_payments', payment.id);

    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User does not exist!");
            }
            const currentBalance = userDoc.data().balance || 0;
            const newBalance = currentBalance + payment.amount;
            
            transaction.update(userRef, { balance: newBalance });
            transaction.delete(paymentRef);
        });
        toast({ title: 'Success!', description: `Payment approved. User ${payment.userId} balance updated.` });
        fetchData(); // Refresh data
    } catch (error) {
        toast({ variant: 'destructive', title: 'Transaction Failed', description: error.message });
    }
  };

  const openModal = (type, data = null) => setModalState({ type, data });
  const closeModal = () => setModalState({ type: null, data: null });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        currentView="admin"
      />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage Guidelab content and users.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-primary">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Content Management</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <UsersIcon className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Mentors</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create, edit, and view mentor profiles.
                </p>
                <Button
                  onClick={() => openModal('mentor')}
                  className="mt-2"
                >
                  Create New Mentor
                </Button>
              </div>
              <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <FilePlus className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Sessions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create unique, bookable sessions offered by mentors.
                </p>
                <Button
                  onClick={() => openModal('session')}
                  className="mt-2"
                >
                  Create New Session
                </Button>
              </div>
               <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Lightbulb className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Tips</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                   Create articles, and add links to videos and websites.
                </p>
                <Button
                  onClick={() => openModal('tip')}
                  className="mt-2"
                >
                  Create New Tip
                </Button>
              </div>
               <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Ticket className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Coupons</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                   Create and manage promotional coupon codes for users.
                </p>
                <Button
                  onClick={() => openModal('coupon')}
                  className="mt-2"
                >
                  Create Coupon
                </Button>
              </div>
            </div>
          </div>
          
          <PaymentApprovalList payments={pendingPayments} onApprove={handleApprovePayment} isLoading={isLoadingPayments} />
          
          <DataListView
            title="All Mentors"
            data={mentors}
            isLoading={isLoadingMentors}
            icon={Briefcase}
            renderItem={(mentor) => (
                <div key={mentor.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                    <div className="flex-grow">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${mentor.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={mentor.status}></span>
                        <span className="font-bold text-primary">{mentor.id}</span>
                        <span className="ml-4 font-semibold text-gray-800 dark:text-white">{mentor.name}</span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({mentor.title})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/mentors/${mentor.id}`} className="text-sm text-primary hover:underline">View</Link>
                        <Button variant="ghost" size="sm" onClick={() => openModal('mentor', mentor)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the mentor profile for {mentor.name}.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete('mentors', mentor.id, mentor.name)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )}
           />

            <DataListView
                title="All Mentees (Users)"
                data={mentees}
                isLoading={isLoadingMentees}
                icon={User}
                renderItem={(mentee) => (
                    <div key={mentee.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                       <div className="flex-grow">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${mentee.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={mentee.status}></span>
                            <span className="ml-4 font-semibold text-gray-800 dark:text-white">{mentee.name || 'Anonymous User'}</span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({mentee.email || mentee.id})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/account?userId=${mentee.id}`} className="text-sm text-primary hover:underline">View</Link>
                            <Button variant="ghost" size="sm" onClick={() => openModal('mentee', mentee)}><Edit className="w-4 h-4" /></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the account for {mentee.name || mentee.id}.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete('users', mentee.id, mentee.name || mentee.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}
            />

        </div>
      </main>

        {modalState.type === 'mentor' && (
            <Modal title={modalState.data ? "Edit Mentor" : "Create New Mentor"} onClose={closeModal}>
                <MentorForm mentor={modalState.data} onSave={handleSaveMentor} onClose={closeModal} />
            </Modal>
        )}

        {modalState.type === 'mentee' && (
            <Modal title="Edit Mentee" onClose={closeModal}>
                <MenteeForm mentee={modalState.data} onSave={handleSaveMentee} onClose={closeModal} />
            </Modal>
        )}

        {modalState.type === 'session' && (
            <Modal title="Create New Session" onClose={closeModal}>
                <SessionForm mentors={mentors} onSave={handleSaveSession} onClose={closeModal} />
            </Modal>
        )}

        {modalState.type === 'tip' && (
            <Modal title="Create New Tip" onClose={closeModal}>
                <TipForm onSave={handleSaveTip} onClose={closeModal} />
            </Modal>
        )}
        
        {modalState.type === 'coupon' && (
            <Modal title="Create New Coupon" onClose={closeModal}>
                <CouponForm onSave={handleSaveCoupon} onClose={closeModal} />
            </Modal>
        )}
    </div>
  );
}
