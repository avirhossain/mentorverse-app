
'use client';
import React, { useState, useEffect } from 'react';
import { FilePlus, Users as UsersIcon, X, PlusCircle, Trash2, User, Briefcase, Lightbulb, Ticket, Banknote, Edit, ShieldCheck, ShieldX, Calendar, CreditCard, Inbox, MessageSquare, Check, ThumbsDown, Eye, Phone, PlayCircle, UserCog } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, doc, runTransaction, deleteDoc, setDoc, updateDoc, addDoc, writeBatch } from 'firebase/firestore';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Mentor, Mentee, Session, Tip, Coupon, PendingPayment, MentorApplication, SupportRequest, AdminUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start">
        <Icon className="w-5 h-5 mr-3 text-primary flex-shrink-0 mt-1" />
        <div>
            <p className="font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);


const MentorApplicationDetails = ({ application }) => (
    <div className="space-y-4">
        <DetailItem icon={User} label="Applicant Name" value={application.name} />
        <DetailItem icon={Phone} label="Phone Number" value={application.phone} />
        <DetailItem icon={MessageSquare} label="Profile Summary" value={application.summary} />
    </div>
);

const SupportRequestDetails = ({ request }) => (
    <div className="space-y-4">
        <DetailItem icon={User} label="User Name" value={request.name} />
        <DetailItem icon={Phone} label="Phone Number" value={request.phone} />
        <DetailItem icon={MessageSquare} label="Support Details" value={request.details} />
    </div>
);

const PendingPaymentDetails = ({ payment }) => (
     <div className="space-y-4">
        <DetailItem icon={User} label="User ID" value={payment.userId} />
        <DetailItem icon={Ticket} label="bKash Transaction ID" value={payment.transactionId} />
        <DetailItem icon={Banknote} label="Amount" value={`৳${payment.amount.toLocaleString()}`} />
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

const PaymentApprovalList = ({ payments, onApprove, isLoading, onDetails, canWrite }) => (
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount: ৳{payment.amount}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onDetails(payment)}><Eye className="w-4 h-4"/></Button>
                            {canWrite && <Button onClick={() => onApprove(payment)}>Approve</Button>}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No pending payments.</p>
            )}
        </div>
    </div>
);


const MentorForm = ({ mentor, onSave, onClose }) => {
    const getInitialFormData = () => {
        if (mentor) {
            return {
                ...mentor,
                expertise: mentor.expertise?.join(', ') || '',
                skills: mentor.skills?.join(', ') || '',
            };
        }
        // Return a clean, empty state for new mentors
        return {
            id: undefined,
            name: '',
            email: '',
            bio: '',
            expertise: '',
            status: 'active',
            reviews: [],
            sessionCost: 0,
            title: '',
            company: '',
            skills: '',
            rating: 0,
            ratingsCount: 0,
            avatar: '',
            intro: '',
            professionalExperience: [],
            education: [],
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());
    const { toast } = useToast();
    const isEditing = !!mentor;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAvatarChange = (e) => {
        setFormData(prev => ({ ...prev, avatar: e.target.value }));
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
            [section]: [...(prev[section] || []), item]
        }));
    };
    
    const removeDynamicItem = (section, index) => {
        const list = [...formData[section]];
        list.splice(index, 1);
        setFormData(prev => ({ ...prev, [section]: list }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const processedData = {
                ...formData,
                expertise: formData.expertise.split(',').map(s => s.trim()),
                skills: formData.skills.split(',').map(s => s.trim()),
                sessionCost: Number(formData.sessionCost),
                rating: Number(formData.rating),
                ratingsCount: Number(formData.ratingsCount),
                reviews: (formData.reviews || []).map(r => ({...r, rating: Number(r.rating)})),
            };
            
            await onSave(processedData, isEditing);

            if (isEditing) {
                toast({ title: 'Success!', description: 'Mentor profile updated.' });
            } else {
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
            {(formData[sectionKey] || []).map((item, index) => (
                <div key={index} className="p-3 border rounded-md space-y-2 relative bg-gray-50 dark:bg-gray-700/50">
                     <Button type="button" size="sm" variant="ghost" className="absolute top-2 right-2 p-1 h-auto" onClick={() => removeDynamicItem(sectionKey, index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                    {fields.map(field => (
                        field.type === 'textarea' ?
                        <Textarea
                            key={field.name}
                            name={field.name}
                            placeholder={field.placeholder}
                            value={item[field.name]}
                            onChange={(e) => handleDynamicChange(sectionKey, index, e)}
                            rows={3}
                        />
                        :
                         <Input 
                            key={field.name}
                            name={field.name}
                            type={field.type || 'text'}
                            placeholder={field.placeholder}
                            value={item[field.name]}
                            onChange={(e) => handleDynamicChange(sectionKey, index, e)}
                        />
                    ))}
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
                <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="title" placeholder="Job Title (e.g., Software Engineer)" value={formData.title} onChange={handleChange} />
                <Input name="company" placeholder="Company (e.g., Google)" value={formData.company} onChange={handleChange} />
            </div>

            <Textarea name="avatar" placeholder="Paste Image Data URI (Base64)" value={formData.avatar} onChange={handleAvatarChange} rows={3} />
            <Textarea name="intro" placeholder="Short Introduction (for cards)" value={formData.intro} onChange={handleChange} />
            <Textarea name="bio" placeholder="Detailed Mentor Bio" value={formData.bio} onChange={handleChange} required />
            
            <Input name="skills" placeholder="Skills (comma-separated, e.g., React, Node.js)" value={formData.skills} onChange={handleChange} required />
            <Input name="expertise" placeholder="Expertise (comma-separated, e.g., System Design, AI)" value={formData.expertise} onChange={handleChange} required />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="sessionCost" type="number" placeholder="Cost per session" value={formData.sessionCost} onChange={handleChange} required />
                <Input name="rating" type="number" step="0.1" placeholder="Rating (e.g., 4.9)" value={formData.rating} onChange={handleChange} />
                <Input name="ratingsCount" type="number" placeholder="Number of Ratings" value={formData.ratingsCount} onChange={handleChange} />
            </div>
            
            <Select onValueChange={handleStatusChange} value={formData.status}>
                <SelectTrigger>
                    <SelectValue placeholder="Select account status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
            </Select>

             {renderDynamicSection('Professional Experience', 'professionalExperience',
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
                    { name: 'duration', placeholder: 'Duration (e.g., 2016 - 2020)' }
                ],
                { degree: '', institution: '', duration: '' }
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
        learningObjectives: '',
        whoIsItFor: '',
        setupRequirements: '',
        specialRequests: [],
        ...session,
        learningObjectives: Array.isArray(session?.learningObjectives) ? session.learningObjectives.join('\n') : '',
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
        
        const sessionDateTime = new Date(`${formData.date}T${formData.time}`);
        if (isNaN(sessionDateTime.getTime())) {
            toast({ variant: 'destructive', title: 'Error', description: 'Invalid date or time.' });
            return;
        }

        try {
            const commonData = {
                ...formData,
                mentorName: selectedMentor.name,
                isFree: formData.type === 'Free',
                price: Number(formData.price),
                maxParticipants: Number(formData.maxParticipants),
                durationMinutes: Number(formData.durationMinutes),
                learningObjectives: formData.learningObjectives.split('\n').map(s => s.trim()).filter(s => s),
                createdAt: sessionDateTime.toISOString(), // Standardized timestamp
            };

            let sessionData;
            if (isEditing) {
                sessionData = commonData;
            } else {
                const jitsiRoomName = `MenteesSession-${uuidv4()}`;
                const jitsiLink = `https://meet.jit.si/${jitsiRoomName}`;
                sessionData = {
                    ...commonData,
                    jitsiLink: jitsiLink,
                    bookedBy: [],
                    status: 'scheduled',
                };
            }
        
            await onSave(sessionData, isEditing);
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

            <div className="grid grid-cols-2 gap-4">
                <Input name="date" type="date" value={formData.date} onChange={handleChange} required />
                <Input name="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>

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
            
            <Textarea name="learningObjectives" placeholder="What will they learn? (one per line)" value={formData.learningObjectives} onChange={handleChange} rows={4} />
            <Textarea name="whoIsItFor" placeholder="Who is this session for?" value={formData.whoIsItFor} onChange={handleChange} />
            <Textarea name="setupRequirements" placeholder="Setup requirements (e.g., Laptop, Specific software)" value={formData.setupRequirements} onChange={handleChange} />

            {isEditing && formData.specialRequests && formData.specialRequests.length > 0 && (
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="font-semibold text-lg text-gray-800 dark:text-white">Special Requests from Mentees</h4>
                    {formData.specialRequests.map((req, index) => (
                        <div key={index} className="p-3 border rounded-md bg-white dark:bg-gray-800">
                             <p className="text-sm text-gray-700 dark:text-gray-200">"{req.request}"</p>
                             <p className="text-xs text-right text-gray-500 dark:text-gray-400 font-medium">- {req.userName}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">{isEditing ? 'Save Changes' : 'Save Session'}</Button>
            </div>
        </form>
    );
};

const TipForm = ({ tip, onSave, onClose }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        type: 'Article',
        title: '',
        summary: '',
        content: '',
        link: '',
        ...tip,
    });
    const isEditing = !!tip;

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
            await onSave(formData, isEditing);
            toast({
                title: 'Success!',
                description: isEditing ? 'Tip updated successfully.' : 'New tip has been created.',
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
            <Select onValueChange={handleTypeChange} value={formData.type}>
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


const DataListView = ({ title, data, isLoading, icon: Icon, columns, emptyMessage = "No data available.", renderActions, idPrefix, onSeeAll }) => (
    <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <Icon className="w-6 h-6 mr-3 text-primary" />
                {title}
            </h2>
             {onSeeAll && <Button variant="outline" onClick={onSeeAll}>See All</Button>}
        </div>
        
        {isLoading ? (
             <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-t-4 border-primary/50">
                <div className="hidden md:grid grid-cols-12 gap-4 p-2 text-sm font-bold text-gray-500 uppercase">
                    {columns.map((col, index) => (
                        <div key={index} className={`col-span-${col.span}`}>{col.header}</div>
                    ))}
                    <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="space-y-2">
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <div className="col-span-12 md:col-span-1 font-semibold">{index + 1}</div>
                                <div className="col-span-6 md:col-span-2 text-sm text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</div>
                                <div className="col-span-6 md:col-span-2 font-mono text-primary">{idPrefix}{index + 1}</div>
                                <div className="col-span-12 md:col-span-5 font-semibold text-gray-800 dark:text-white">{item.name || item.title || item.phone || item.transactionId || item.id}</div>
                                <div className="col-span-12 md:col-span-2 flex justify-end items-center gap-2">
                                    {renderActions(item)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">{emptyMessage}</p>
                    )}
                </div>
            </div>
        )}
    </div>
);

const AdminManagement = ({ firestore, toast, openModal, fetchAdmins, currentAdmin }) => {
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [permissions, setPermissions] = useState({ canRead: true, canWrite: false, canDelete: false });
    const [isAdding, setIsAdding] = useState(false);

    const adminsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'admins') : null, [firestore, fetchAdmins]);
    const { data: admins, isLoading, error } = useCollection<AdminUser>(adminsQuery);
    
    useEffect(() => {
        if (!isLoading && (!admins || admins.length === 0) && firestore) {
            const initialAdminEmail = 'mmavir89@gmail.com';
            const adminRef = doc(firestore, 'admins', initialAdminEmail);
            setDoc(adminRef, { 
                email: initialAdminEmail, 
                createdAt: new Date().toISOString(),
                canRead: true,
                canWrite: true,
                canDelete: true
            });
        }
    }, [admins, isLoading, firestore]);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !newAdminEmail) return;
        setIsAdding(true);
        const adminRef = doc(firestore, 'admins', newAdminEmail);
        try {
            await setDoc(adminRef, { 
                email: newAdminEmail, 
                createdAt: new Date().toISOString(),
                ...permissions
            });
            toast({ title: 'Success!', description: `${newAdminEmail} has been added as an admin.` });
            setNewAdminEmail('');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add admin.' });
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveAdmin = async (email: string) => {
        if (!firestore) return;
        if (email === 'mmavir89@gmail.com') {
            toast({ variant: 'destructive', title: 'Action Forbidden', description: 'Cannot remove the primary administrator.' });
            return;
        }
        const adminRef = doc(firestore, 'admins', email);
        try {
            await deleteDoc(adminRef);
            toast({ title: 'Success!', description: `${email} has been removed from admins.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove admin.' });
        }
    };
    
    const PermissionIcon = ({ granted }) => (
        <Check className={`w-4 h-4 ${granted ? 'text-green-500' : 'text-gray-300'}`} />
    );

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <UserCog className="w-6 h-6 mr-3 text-primary" />
                Administrator Management
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-primary/50">
                <form onSubmit={handleAddAdmin} className="space-y-4 mb-6 pb-6 border-b">
                     <Input 
                        type="email"
                        placeholder="new.admin@example.com"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        required
                    />
                    <div className="flex items-center space-x-6">
                        <Label>Permissions:</Label>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="canRead" checked={permissions.canRead} onCheckedChange={(checked) => setPermissions(p => ({...p, canRead: !!checked}))} />
                            <Label htmlFor="canRead">Read</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="canWrite" checked={permissions.canWrite} onCheckedChange={(checked) => setPermissions(p => ({...p, canWrite: !!checked}))} />
                            <Label htmlFor="canWrite">Write</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="canDelete" checked={permissions.canDelete} onCheckedChange={(checked) => setPermissions(p => ({...p, canDelete: !!checked}))} />
                            <Label htmlFor="canDelete">Delete</Label>
                        </div>
                    </div>
                    <Button type="submit" disabled={isAdding}>{isAdding ? 'Adding...' : 'Add Admin'}</Button>
                </form>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Current Admins</h3>
                     {isLoading ? (
                        <Skeleton className="h-8 w-full" />
                    ) : (
                        admins?.map(admin => (
                            <div key={admin.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                <span className="col-span-4 font-mono text-gray-800 dark:text-gray-200">{admin.email}</span>
                                <div className="col-span-5 flex items-center gap-4 text-xs">
                                     <span className="flex items-center gap-1"><PermissionIcon granted={admin.canRead} /> Read</span>
                                     <span className="flex items-center gap-1"><PermissionIcon granted={admin.canWrite} /> Write</span>
                                     <span className="flex items-center gap-1"><PermissionIcon granted={admin.canDelete} /> Delete</span>
                                </div>
                                <div className="col-span-3 flex justify-end items-center gap-2">
                                     <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => openModal('admin_perms', admin)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700" 
                                        onClick={() => handleRemoveAdmin(admin.email)}
                                        disabled={admin.email === 'mmavir89@gmail.com'}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const EditAdminPermsForm = ({ admin, onSave, onClose }) => {
    const [permissions, setPermissions] = useState({
        canRead: admin.canRead || false,
        canWrite: admin.canWrite || false,
        canDelete: admin.canDelete || false,
    });
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSave(admin.email, permissions);
            toast({ title: 'Success!', description: 'Admin permissions updated.' });
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update permissions.' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="font-semibold text-lg">Editing permissions for: <span className="font-mono text-primary">{admin.email}</span></p>
            <div className="flex flex-col space-y-4">
                 <div className="flex items-center space-x-3 p-3 border rounded-md">
                    <Checkbox id="editCanRead" checked={permissions.canRead} onCheckedChange={(checked) => setPermissions(p => ({...p, canRead: !!checked}))} />
                    <Label htmlFor="editCanRead" className="text-base">Can Read: View all data in the admin panel.</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-md">
                    <Checkbox id="editCanWrite" checked={permissions.canWrite} onCheckedChange={(checked) => setPermissions(p => ({...p, canWrite: !!checked}))} />
                    <Label htmlFor="editCanWrite" className="text-base">Can Write: Create and edit mentors, sessions, and other content.</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-md">
                    <Checkbox id="editCanDelete" checked={permissions.canDelete} onCheckedChange={(checked) => setPermissions(p => ({...p, canDelete: !!checked}))} />
                    <Label htmlFor="editCanDelete" className="text-base">Can Delete: Remove mentors, sessions, and other content.</Label>
                </div>
            </div>
             <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Permissions</Button>
            </div>
        </form>
    );
};


export default function AdminPage() {
  const { user, isUserLoading, currentAdmin } = useUser();
  const router = useRouter();
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
  
  const [adminFetchTrigger, setAdminFetchTrigger] = useState(0);

  const superAdminEmail = 'mmavir89@gmail.com';
  const isSuperAdmin = user?.email === superAdminEmail;

  const firestore = useFirestore();
  const { toast } = useToast();

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
    if (firestore) {
      fetchData();
    }
  }, [firestore, isUserLoading, user, router]);

    const handleSaveMentor = async (mentorData: Omit<Mentor, 'id'> & { id?: string }, isEditing: boolean) => {
        if (!firestore) return;

        let mentorId = mentorData.id;
        if (!isEditing) {
            mentorId = uuidv4();
        }

        if (!mentorId) {
            toast({ variant: "destructive", title: "Save Failed", description: "Mentor ID is missing." });
            return;
        }

        const mentorRef = doc(firestore, 'mentors', mentorId);
        const dataToSave = { ...mentorData, id: mentorId };
        
        try {
            await setDoc(mentorRef, dataToSave, { merge: true });
            fetchData();
        } catch (error) {
            console.error("Error saving mentor:", error);
            toast({ variant: "destructive", title: "Save Failed", description: error.message });
        }
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

  const handleSaveSession = async (sessionData, isEditing) => {
    if (!firestore) return;
    let finalId;
    if (isEditing) {
      finalId = sessionData.id;
      const sessionRef = doc(firestore, 'sessions', finalId);
      await setDoc(sessionRef, sessionData, { merge: true });
    } else { // Creating new session
      const newDocRef = doc(collection(firestore, 'sessions'));
      finalId = newDocRef.id;
      await setDoc(newDocRef, {...sessionData, id: finalId });
    }
    fetchData(); // Refresh data
  };

  const handleUpdateSessionStatus = async (session: Session, status: 'active' | 'completed') => {
      if (!firestore) return;
      const sessionRef = doc(firestore, 'sessions', session.id);
      try {
          await updateDoc(sessionRef, { status: status });
          toast({ title: 'Success!', description: `Session "${session.title}" is now ${status}.` });
          fetchData();
      } catch (error) {
          toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
      }
  };
  
  const handleSaveTip = async (tipData, isEditing) => {
    if (!firestore) return;
    let finalId;
     if (isEditing) {
        finalId = tipData.id;
        const tipRef = doc(firestore, 'tips', finalId);
        await setDoc(tipRef, tipData, { merge: true });
    } else {
        const newDocRef = doc(collection(firestore, 'tips'));
        finalId = newDocRef.id;
        await setDoc(newDocRef, {...tipData, id: finalId, createdAt: new Date().toISOString()});
    }
    fetchData();
  };

  const handleSaveCoupon = async (couponData) => {
    if (!firestore) return;
    const couponRef = doc(firestore, 'coupons', couponData.id);
    await setDoc(couponRef, couponData, { merge: true });
    fetchData();
  };

  const handleApprovePayment = async (payment) => {
    if (!firestore) {
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

    const handleUpdateApplicationStatus = async (application: MentorApplication, status: 'approved' | 'rejected') => {
        if (!firestore) return;
        const appRef = doc(firestore, 'mentor_applications', application.id);
        try {
            await updateDoc(appRef, { status: status });
            toast({
                title: 'Application Updated!',
                description: `Application from ${application.name} has been ${status}.`,
            });
            fetchData();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message,
            });
        }
    };
    
    const handleUpdateAdminPermissions = async (email: string, permissions: { canRead: boolean, canWrite: boolean, canDelete: boolean }) => {
        if (!firestore) return;
        const adminRef = doc(firestore, 'admins', email);
        await updateDoc(adminRef, permissions);
        setAdminFetchTrigger(t => t + 1); // Trigger a re-fetch in the child component
    };


  const openModal = (type, data = null) => setModalState({ type, data });
  const closeModal = () => setModalState({ type: null, data: null });
  
  const canWrite = currentAdmin?.canWrite ?? false;
  const canDelete = currentAdmin?.canDelete ?? false;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header currentView="admin" />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage Mentees content and users.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-primary">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Content Management</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {canWrite && <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <UsersIcon className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Mentors</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create, edit, and view mentor profiles.
                </p>
                <Button onClick={() => openModal('mentor')} className="mt-2">
                  Create New Mentor
                </Button>
              </div>}
              {canWrite && <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <FilePlus className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Sessions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create unique, bookable sessions offered by mentors.
                </p>
                <Button onClick={() => openModal('session')} className="mt-2">
                  Create New Session
                </Button>
              </div>}
               {canWrite && <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Lightbulb className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Tips</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                   Create articles, and add links to videos and websites.
                </p>
                <Button onClick={() => openModal('tip')} className="mt-2">
                  Create New Tip
                </Button>
              </div>}
               {canWrite && <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Ticket className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Coupons</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                   Create and manage promotional coupon codes.
                </p>
                <Button onClick={() => openModal('coupon')} className="mt-2">
                  Create Coupons
                </Button>
              </div>}
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
          
          {isSuperAdmin && <AdminManagement firestore={firestore} toast={toast} openModal={openModal} fetchAdmins={adminFetchTrigger} currentAdmin={currentAdmin} />}

          <PaymentApprovalList 
            payments={pendingPayments.filter(p => p.status === 'pending')} 
            onApprove={handleApprovePayment} 
            isLoading={isLoadingPayments}
            onDetails={(payment) => openModal('payment_details', payment)}
            canWrite={canWrite}
          />

          <DataListView
                title="Mentor Applications"
                data={mentorApps}
                isLoading={isLoadingMentorApps}
                icon={Inbox}
                idPrefix="MA"
                columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Name', span: 5 },
                ]}
                renderActions={(app) => {
                    switch (app.status) {
                        case 'pending':
                            return (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => openModal('mentor_app_details', app)}><Eye className="w-4 h-4"/></Button>
                                    {canWrite && <>
                                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleUpdateApplicationStatus(app, 'approved')}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleUpdateApplicationStatus(app, 'rejected')}>
                                        <ThumbsDown className="w-4 h-4" />
                                    </Button>
                                    </>}
                                </>
                            );
                        case 'approved':
                            return <span className="text-sm font-semibold text-green-600">Approved</span>;
                        case 'rejected':
                            return <span className="text-sm font-semibold text-red-600">Rejected</span>;
                        default:
                            return null;
                    }
                }}
                 emptyMessage="No new mentor applications."
            />
            
            <DataListView
                title="Support Requests"
                data={supportRequests}
                isLoading={isLoadingSupport}
                icon={MessageSquare}
                idPrefix="SR"
                columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Name', span: 5 },
                ]}
                renderActions={(req) => (
                     <>
                        <Button variant="ghost" size="sm" onClick={() => openModal('support_details', req)}><Eye className="w-4 h-4"/></Button>
                        {canDelete && <AlertDialog>
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
                        </AlertDialog>}
                    </>
                )}
                emptyMessage="No new support requests."
            />
          
          <DataListView
            title="All Mentors"
            data={mentors}
            isLoading={isLoadingMentors}
            icon={Briefcase}
            idPrefix="M"
            columns={[
                { header: 'SL', span: 1 },
                { header: 'Date', span: 2 },
                { header: 'ID', span: 2 },
                { header: 'Name', span: 5 },
            ]}
            renderActions={(mentor) => (
                <>
                    <Link href={`/mentors/${mentor.id}`} className="text-sm text-primary hover:underline">View</Link>
                    {canWrite && <Button variant="ghost" size="sm" onClick={() => openModal('mentor', mentor)}><Edit className="w-4 h-4" /></Button>}
                    {canDelete && <AlertDialog>
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
                    </AlertDialog>}
                </>
            )}
           />

            <DataListView
                title="All Sessions"
                data={sessions}
                isLoading={isLoadingSessions}
                icon={Calendar}
                idPrefix="S"
                columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Title', span: 5 },
                ]}
                renderActions={(session) => (
                     <>
                        <Link href={`/admin/sessions/${session.id}`} className="text-sm text-primary hover:underline">View</Link>
                        {session.status === 'scheduled' && canWrite && (
                            <Button size="sm" onClick={() => handleUpdateSessionStatus(session, 'active')}>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Start Session
                            </Button>
                        )}
                        {session.status === 'active' && canWrite && (
                             <Button size="sm" variant="destructive" onClick={() => handleUpdateSessionStatus(session, 'completed')}>
                                End Session
                            </Button>
                        )}
                        {session.status === 'completed' && (
                            <span className="text-sm font-semibold text-gray-500">Completed</span>
                        )}
                    </>
                )}
            />

            <DataListView
              title="All Tips"
              data={tips}
              isLoading={isLoadingTips}
              icon={Lightbulb}
              idPrefix="T"
              columns={[
                { header: 'SL', span: 1 },
                { header: 'Date', span: 2 },
                { header: 'ID', span: 2 },
                { header: 'Title', span: 5 },
              ]}
              renderActions={(tip) => (
                <>
                    {canWrite && <Button variant="ghost" size="sm" onClick={() => openModal('tip', tip)}><Edit className="w-4 h-4" /></Button>}
                    {canDelete && <AlertDialog>
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
                    </AlertDialog>}
                </>
              )}
            />
            
            <DataListView
                title="All Coupons"
                data={coupons}
                isLoading={isLoadingCoupons}
                icon={Ticket}
                idPrefix="C"
                 columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Code', span: 5 },
                ]}
                renderActions={(coupon) => (
                    <p className={`text-sm font-semibold ${coupon.isUsed ? 'text-red-500' : 'text-green-600'}`}>
                        {coupon.isUsed ? 'Redeemed' : 'Available'}
                    </p>
                )}
            />

            <DataListView
                title="All Mentees (Users)"
                data={mentees}
                isLoading={isLoadingMentees}
                icon={User}
                idPrefix="U"
                 columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Name', span: 5 },
                ]}
                renderActions={(mentee) => (
                    <>
                        <Link href={`/account?userId=${mentee.id}`} className="text-sm text-primary hover:underline">View</Link>
                        {canWrite && <Button variant="ghost" size="sm" onClick={() => openModal('mentee', mentee)}><Edit className="w-4 h-4" /></Button>}
                        {canDelete && <AlertDialog>
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
                        </AlertDialog>}
                    </>
                )}
            />

        </div>
      </main>

        {modalState.type === 'mentor' && canWrite && (
            <Modal title={modalState.data ? "Edit Mentor" : "Create New Mentor"} onClose={closeModal}>
                <MentorForm mentor={modalState.data} onSave={handleSaveMentor} onClose={closeModal} />
            </Modal>
        )}
        
        {modalState.type === 'admin_perms' && isSuperAdmin && (
            <Modal title="Edit Admin Permissions" onClose={closeModal}>
                <EditAdminPermsForm admin={modalState.data} onSave={handleUpdateAdminPermissions} onClose={closeModal} />
            </Modal>
        )}

        {modalState.type === 'mentee' && canWrite && (
            <Modal title="Edit Mentee" onClose={closeModal}>
                <MenteeForm 
                    mentee={modalState.data} 
                    onSave={handleSaveMentee} 
                    onClose={closeModal}
                />
            </Modal>
        )}

        {modalState.type === 'session' && canWrite && (
            <Modal title={modalState.data ? "Edit Session" : "Create New Session"} onClose={closeModal}>
                <SessionForm session={modalState.data} mentors={mentors} onSave={handleSaveSession} onClose={closeModal} />
            </Modal>
        )}

        {modalState.type === 'tip' && canWrite && (
            <Modal title={modalState.data ? "Edit Tip" : "Create New Tip"} onClose={closeModal}>
                <TipForm tip={modalState.data} onSave={handleSaveTip} onClose={closeModal} />
            </Modal>
        )}
        
        {modalState.type === 'coupon' && canWrite && (
            <Modal title="Manage Coupons" onClose={closeModal}>
                <CouponForm onSave={handleSaveCoupon} onClose={closeModal} firestore={firestore} />
            </Modal>
        )}

        {modalState.type === 'mentor_app_details' && (
             <Modal title="Mentor Application Details" onClose={closeModal}>
                <MentorApplicationDetails application={modalState.data} />
            </Modal>
        )}
        {modalState.type === 'support_details' && (
             <Modal title="Support Request Details" onClose={closeModal}>
                <SupportRequestDetails request={modalState.data} />
            </Modal>
        )}
        {modalState.type === 'payment_details' && (
             <Modal title="Payment Details" onClose={closeModal}>
                <PendingPaymentDetails payment={modalState.data} />
            </Modal>
        )}
    </div>
  );
}
