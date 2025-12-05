'use client';
import React, { useState, useEffect } from 'react';
import { FilePlus, Users as UsersIcon, X, PlusCircle, Trash2, User, Briefcase, Lightbulb, Ticket, Banknote, Edit, ShieldCheck, ShieldX, Calendar, CreditCard, Inbox, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, doc, runTransaction, deleteDoc, setDoc, updateDoc, addDoc, writeBatch } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import type { Mentor, Mentee, Session, Tip, Coupon, PendingPayment, MentorApplication, SupportRequest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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

const CouponForm = ({ onSave, onClose, firestore }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ code: '', amount: 0, expiresAt: '' });
    const [bulkCodes, setBulkCodes] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSingleSubmit = async (e) => {
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
    
    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        const codes = bulkCodes.split(/[\n, ]+/).filter(c => c.trim() !== '');
        if (codes.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter at least one coupon code.' });
            return;
        }

        const batch = writeBatch(firestore);
        codes.forEach(code => {
            const couponRef = doc(firestore, 'coupons', code.toUpperCase());
            batch.set(couponRef, {
                id: code.toUpperCase(),
                amount: Number(formData.amount),
                expiresAt: formData.expiresAt,
                isUsed: false,
                createdAt: new Date().toISOString(),
            });
        });

        try {
            await batch.commit();
            toast({ title: 'Success!', description: `${codes.length} coupons created successfully.` });
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to create coupons: ${error.message}` });
        }
    };

    return (
        <Tabs defaultValue="single">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Coupon</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Create</TabsTrigger>
            </TabsList>
            <TabsContent value="single">
                 <form onSubmit={handleSingleSubmit} className="space-y-4 pt-4">
                    <Input name="code" placeholder="Coupon Code (e.g., WELCOME50)" value={formData.code} onChange={handleChange} required />
                    <Input name="amount" type="number" placeholder="Amount (e.g., 500)" value={formData.amount} onChange={handleChange} required />
                    <Input name="expiresAt" type="date" placeholder="Expiry Date" value={formData.expiresAt} onChange={handleChange} />
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Coupon</Button>
                    </div>
                </form>
            </TabsContent>
            <TabsContent value="bulk">
                <form onSubmit={handleBulkSubmit} className="space-y-4 pt-4">
                     <p className="text-sm text-gray-500 dark:text-gray-400">Paste multiple coupon codes separated by new lines, commas, or spaces. All will have the same amount and expiry date.</p>
                    <Textarea 
                        placeholder="CODE1, CODE2, CODE3..." 
                        value={bulkCodes}
                        onChange={(e) => setBulkCodes(e.target.value)}
                        rows={6}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="amount" type="number" placeholder="Amount for all coupons" value={formData.amount} onChange={handleChange} required />
                        <Input name="expiresAt" type="date" placeholder="Expiry Date for all" value={formData.expiresAt} onChange={handleChange} />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Create {bulkCodes.split(/[\n, ]+/).filter(c => c.trim() !== '').length} Coupons</Button>
                    </div>
                </form>
            </TabsContent>
        </Tabs>
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

     const handleNestedDynamicChange = (section, parentIndex, nestedSection, index, e) => {
        const { name, value } = e.target;
        const list = [...formData[section]];
        const nestedList = [...list[parentIndex][nestedSection]];
        nestedList[index][name] = value;
        list[parentIndex][nestedSection] = nestedList;
        setFormData(prev => ({ ...prev, [section]: list }));
    };

    const addDynamicItem = (section, item) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], item]
        }));
    };
    
    const addNestedDynamicItem = (section, parentIndex, nestedSection, item) => {
        const list = [...formData[section]];
        list[parentIndex][nestedSection] = [...list[parentIndex][nestedSection], item];
        setFormData(prev => ({ ...prev, [section]: list }));
    };

    const removeDynamicItem = (section, index) => {
        const list = [...formData[section]];
        list.splice(index, 1);
        setFormData(prev => ({ ...prev, [section]: list }));
    };

    const removeNestedDynamicItem = (section, parentIndex, nestedSection, index) => {
        const list = [...formData[section]];
        const nestedList = [...list[parentIndex][nestedSection]];
        nestedList.splice(index, 1);
        list[parentIndex][nestedSection] = nestedList;
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
                sessions: formData.sessions.map(s => ({
                    ...s, 
                    price: Number(s.price), 
                    duration: Number(s.duration),
                    availability: s.availability.map(a => ({...a, id: a.id || uuidv4() }))
                })),
                reviews: formData.reviews.map(r => ({...r, rating: Number(r.rating)})),
            };

            const rating = processedData.reviews.length > 0 ? processedData.reviews.reduce((acc, r) => acc + Number(r.rating), 0) / processedData.reviews.length : 0;
            const ratingsCount = processedData.reviews.length;
            
            let finalData;

            if (isEditing) {
                finalData = { ...processedData, rating, ratingsCount };
                await onSave(finalData);
                toast({ title: 'Success!', description: 'Mentor profile updated.' });
            } else {
                const mentorsCol = collection(firestore, 'mentors');
                const newMentorRef = doc(mentorsCol); 
                finalData = {
                    ...processedData,
                    id: newMentorRef.id,
                    rating,
                    ratingsCount,
                };
                await onSave(finalData);
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
                             {item.availability.map((avail, availIndex) => (
                                <div key={avail.id || availIndex} className="flex items-center gap-2">
                                    <Input name="date" placeholder="Date (e.g., 18th November)" value={avail.date} onChange={(e) => handleNestedDynamicChange(sectionKey, index, 'availability', availIndex, e)} />
                                    <Input name="time" placeholder="Time (e.g., 7:00 PM - 8:00 PM)" value={avail.time} onChange={(e) => handleNestedDynamicChange(sectionKey, index, 'availability', availIndex, e)} />
                                    <Button type="button" size="sm" variant="ghost" className="p-1 h-auto" onClick={() => removeNestedDynamicItem(sectionKey, index, 'availability', availIndex)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addNestedDynamicItem(sectionKey, index, 'availability', { id: uuidv4(), date: '', time: ''})}>
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
                    { name: 'id', placeholder: 'Session ID (e.g., interview-prep)' },
                    { name: 'name', placeholder: 'Session Name (e.g., 60 min Interview Prep)' },
                    { name: 'price', placeholder: 'Price', type: 'number' },
                    { name: 'currency', placeholder: 'Currency (e.g., ৳)' },
                    { name: 'duration', placeholder: 'Duration (in minutes)', type: 'number' },
                    { name: 'description', placeholder: 'Session Description' }
                ],
                { id: '', name: '', price: 0, currency: '৳', duration: 60, description: '', availability: [] }
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
    
    const handleStatusChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
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
            <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required readOnly />
            <Input name="interests" placeholder="Interests (comma-separated)" value={formData.interests} onChange={handleChange} />
            <Input name="balance" type="number" placeholder="Account Balance" value={formData.balance} onChange={handleChange} required />

            <div className="grid grid-cols-1 gap-4">
                <Select onValueChange={(value) => handleStatusChange('status', value)} value={formData.status}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select account status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
};


const SessionForm = ({ session, mentors, onSave, onClose }) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const isEditing = !!session;

    const [formData, setFormData] = useState({
        title: '',
        mentorId: '',
        date: '',
        time: '',
        durationMinutes: 60,
        type: 'Free',
        price: 0,
        maxParticipants: 10,
        ...session,
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
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
            let sessionData;
            if (isEditing) {
                sessionData = {
                    ...formData,
                    mentorName: selectedMentor.name,
                    isFree: formData.type === 'Free',
                    price: Number(formData.price),
                    maxParticipants: Number(formData.maxParticipants),
                    durationMinutes: Number(formData.durationMinutes),
                };
            } else {
                const jitsiRoomName = `GuidelabSession-${uuidv4()}`;
                const jitsiLink = `https://meet.jit.si/${jitsiRoomName}`;
                sessionData = {
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
            }
        
            await onSave(sessionData);
            toast({
                title: 'Success!',
                description: isEditing ? 'Session updated successfully.' : 'New exclusive session has been created.',
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
                <Button type="submit">{isEditing ? 'Save Changes' : 'Save Session'}</Button>
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
            const tipRef = doc(collection(useFirestore(), 'tips'));
            const newTip = {
                id: tipRef.id,
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


const DataListView = ({ title, data, isLoading, icon: Icon, renderItem, emptyMessage = "No data available." }) => (
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
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">{emptyMessage}</p>
                )}
            </div>
        )}
    </div>
);


export default function AdminPage() {
  const [modalState, setModalState] = useState({ type: null, data: null });
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [mentorApps, setMentorApps] = useState<MentorApplication[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);

  const [isLoadingMentors, setIsLoadingMentors] = useState(true);
  const [isLoadingMentees, setIsLoadingMentees] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingTips, setIsLoadingTips] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [isLoadingMentorApps, setIsLoadingMentorApps] = useState(true);
  const [isLoadingSupport, setIsLoadingSupport] = useState(true);

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
        user.getIdTokenResult().then((idTokenResult) => {
            const isAdminClaim = !!idTokenResult.claims.admin;
            setIsAdmin(isAdminClaim);
        });
    } else {
        setIsAdmin(false);
    }
  }, [user]);

  const fetchData = async () => {
    if (!firestore) return;
    setIsLoadingMentors(true);
    setIsLoadingMentees(true);
    setIsLoadingSessions(true);
    setIsLoadingTips(true);
    setIsLoadingPayments(true);
    setIsLoadingCoupons(true);
    setIsLoadingMentorApps(true);
    setIsLoadingSupport(true);

    try {
        const [mentorsSnap, menteesSnap, sessionsSnap, tipsSnap, paymentsSnap, couponsSnap, mentorAppsSnap, supportRequestsSnap] = await Promise.all([
            getDocs(collection(firestore, 'mentors')),
            getDocs(collection(firestore, 'users')),
            getDocs(collection(firestore, 'sessions')),
            getDocs(collection(firestore, 'tips')),
            getDocs(collection(firestore, 'pending_payments')),
            getDocs(collection(firestore, 'coupons')),
            getDocs(collection(firestore, 'mentor_applications')),
            getDocs(collection(firestore, 'support_requests')),
        ]);

        setMentors(mentorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentor)));
        setMentees(menteesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentee)));
        setSessions(sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session)));
        setTips(tipsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tip)));
        setPendingPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingPayment)));
        setCoupons(couponsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
        setMentorApps(mentorAppsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MentorApplication)));
        setSupportRequests(supportRequestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportRequest)));

    } catch (error) {
        toast({ variant: 'destructive', title: 'Error fetching data', description: error.message });
        console.error("Error fetching data:", error);
    } finally {
        setIsLoadingMentors(false);
        setIsLoadingMentees(false);
        setIsLoadingSessions(false);
        setIsLoadingTips(false);
        setIsLoadingPayments(false);
        setIsLoadingCoupons(false);
        setIsLoadingMentorApps(false);
        setIsLoadingSupport(false);
    }
  };


  useEffect(() => {
    if (isAdmin && firestore) {
      fetchData();
    }
  }, [isAdmin, firestore]);

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
  
  const handleDelete = async (collectionName: string, docId: string, name: string) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
      return;
    }
    try {
      await deleteDoc(doc(firestore, collectionName, docId));
      toast({ title: 'Success!', description: `${name} has been deleted.` });
      fetchData(); // Refresh data after deletion
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to delete ${name}: ${error.message}` });
      console.error(`Failed to delete ${name}:`, error);
    }
  };

  const handleSaveSession = async (sessionData) => {
    if (!firestore) return;
    if (sessionData.id) { // Editing existing session
      const sessionRef = doc(firestore, 'sessions', sessionData.id);
      await setDoc(sessionRef, sessionData, { merge: true });
    } else { // Creating new session
      const sessionsCol = collection(firestore, 'sessions');
      await addDoc(sessionsCol, sessionData);
    }
    fetchData(); // Refresh data
  };
  
  const handleSaveTip = async (tipData) => {
    if (!firestore) return;
    const tipRef = doc(firestore, 'tips', tipData.id);
    await setDoc(tipRef, tipData);
    fetchData();
  };

  const handleSaveCoupon = async (couponData) => {
    if (!firestore) return;
    const couponRef = doc(firestore, 'coupons', couponData.id);
    await setDoc(couponRef, couponData, { merge: true });
    fetchData();
  };

  const handleApprovePayment = async (payment) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Services not available.' });
        return;
    }

    const userRef = doc(firestore, 'users', payment.userId);
    const paymentRef = doc(firestore, 'pending_payments', payment.id);
    const transactionRef = doc(collection(firestore, 'balance_transactions'));

    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw new Error("User does not exist!");
            
            const currentBalance = userDoc.data().balance || 0;
            const newBalance = currentBalance + payment.amount;
            
            transaction.update(userRef, { balance: newBalance });
            transaction.delete(paymentRef);
            transaction.set(transactionRef, {
                id: transactionRef.id,
                userId: payment.userId,
                amount: payment.amount,
                source: 'bkash',
                description: `bKash TrxID: ${payment.transactionId}`,
                createdAt: new Date().toISOString(),
            });
        });

        toast({ title: 'Success!', description: `Payment approved. User balance updated.` });
        fetchData();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Transaction Failed', description: error.message });
    }
};

  const openModal = (type, data = null) => setModalState({ type, data });
  const closeModal = () => setModalState({ type: null, data: null });
  
  if (isUserLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Skeleton className="w-24 h-24 rounded-full" />
        </div>
      );
  }
  
  if (!isAdmin) {
       return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-background">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-t-4 border-destructive">
                <ShieldX className="w-16 h-16 text-destructive mx-auto mb-6" />
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Access Denied</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-sm">
                    You do not have permission to view this page.
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
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage Guidelab content and users.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-primary">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Content Management</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <UsersIcon className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Mentors</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create, edit, and view mentor profiles.
                </p>
                <Button onClick={() => openModal('mentor')} className="mt-2">
                  Create New Mentor
                </Button>
              </div>
              <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <FilePlus className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Sessions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create unique, bookable sessions offered by mentors.
                </p>
                <Button onClick={() => openModal('session')} className="mt-2">
                  Create New Session
                </Button>
              </div>
               <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Lightbulb className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Tips</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                   Create articles, and add links to videos and websites.
                </p>
                <Button onClick={() => openModal('tip')} className="mt-2">
                  Create New Tip
                </Button>
              </div>
               <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Ticket className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Coupons</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                   Create and manage promotional coupon codes.
                </p>
                <Button onClick={() => openModal('coupon')} className="mt-2">
                  Create Coupons
                </Button>
              </div>
              <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <CreditCard className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">User Balances</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                   View mentee balances and transaction history.
                </p>
                <Button asChild className="mt-2">
                  <Link href="/admin/balances">View Balances</Link>
                </Button>
              </div>
            </div>
          </div>
          
          <PaymentApprovalList payments={pendingPayments.filter(p => p.status === 'pending')} onApprove={handleApprovePayment} isLoading={isLoadingPayments} />

          <DataListView
                title="Mentor Applications"
                data={mentorApps}
                isLoading={isLoadingMentorApps}
                icon={Inbox}
                renderItem={(app) => (
                    <div key={app.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white">{app.name} <span className="font-normal text-gray-500">- {app.phone}</span></p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{app.summary}</p>
                            </div>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will delete the application from {app.name}. This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete('mentor_applications', app.id, `application from ${app.name}`)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}
                 emptyMessage="No new mentor applications."
            />
            
            <DataListView
                title="Support Requests"
                data={supportRequests}
                isLoading={isLoadingSupport}
                icon={MessageSquare}
                renderItem={(req) => (
                    <div key={req.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-bold text-gray-800 dark:text-white">{req.name} <span className="font-normal text-gray-500">- {req.phone}</span></p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{req.details}</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will delete the support request from {req.name}. This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete('support_requests', req.id, `request from ${req.name}`)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}
                emptyMessage="No new support requests."
            />
          
          <DataListView
            title="All Mentors"
            data={mentors}
            isLoading={isLoadingMentors}
            icon={Briefcase}
            renderItem={(mentor) => (
                <div key={mentor.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                    <div className="flex-grow">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${mentor.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={mentor.status}></span>
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
                title="All Sessions"
                data={sessions}
                isLoading={isLoadingSessions}
                icon={Calendar}
                renderItem={(session) => (
                    <div key={session.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="flex-grow mb-2 sm:mb-0">
                            <p className="font-bold text-primary">{session.title}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <span>by {session.mentorName}</span>
                                <span>{session.date} at {session.time}</span>
                                <span className={`font-semibold ${session.isFree ? 'text-accent' : 'text-blue-600'}`}>
                                    {session.isFree ? 'Free' : `৳${session.price}`}
                                </span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {session.bookedBy?.length || 0}/{session.maxParticipants} booked
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => openModal('session', session)}><Edit className="w-4 h-4" /></Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the session: {session.title}.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete('sessions', session.id, session.title)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}
            />

            <DataListView
              title="All Tips"
              data={tips}
              isLoading={isLoadingTips}
              icon={Lightbulb}
              renderItem={(tip) => (
                <div key={tip.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-bold text-primary">{tip.type}</span>
                    <span className="ml-4 font-semibold text-gray-800 dark:text-white">{tip.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openModal('tip', tip)}><Edit className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the tip: {tip.title}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete('tips', tip.id, tip.title)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            />
            
            <DataListView
                title="All Coupons"
                data={coupons}
                isLoading={isLoadingCoupons}
                icon={Ticket}
                renderItem={(coupon) => (
                    <div key={coupon.id} className={`p-3 rounded-lg flex justify-between items-center ${coupon.isUsed ? 'bg-gray-200 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
                        <div>
                            <p className="font-bold text-primary">{coupon.id}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount: ৳{coupon.amount}</p>
                        </div>
                        {coupon.isUsed ? (
                            <div className="text-right text-sm">
                                <p className="font-semibold text-red-500">Redeemed</p>
                                <p className="text-gray-500 dark:text-gray-400">by {coupon.usedBy}</p>
                            </div>
                        ) : (
                            <p className="text-sm font-semibold text-green-600">Available</p>
                        )}
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
                <MenteeForm 
                    mentee={modalState.data} 
                    onSave={handleSaveMentee} 
                    onClose={closeModal}
                />
            </Modal>
        )}

        {modalState.type === 'session' && (
            <Modal title={modalState.data ? "Edit Session" : "Create New Session"} onClose={closeModal}>
                <SessionForm session={modalState.data} mentors={mentors} onSave={handleSaveSession} onClose={closeModal} />
            </Modal>
        )}

        {modalState.type === 'tip' && (
            <Modal title={modalState.data ? "Edit Tip" : "Create New Tip"} onClose={closeModal}>
                <TipForm onSave={handleSaveTip} onClose={closeModal} />
            </Modal>
        )}
        
        {modalState.type === 'coupon' && (
            <Modal title="Manage Coupons" onClose={closeModal}>
                <CouponForm onSave={handleSaveCoupon} onClose={closeModal} firestore={firestore} />
            </Modal>
        )}
    </div>
  );
}