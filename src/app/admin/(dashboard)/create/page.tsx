
'use client';
import React, { useState, useEffect } from 'react';
import { FilePlus, Users as UsersIcon, X, PlusCircle, Trash2, Lightbulb, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Mentor, Session, Tip, Coupon } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

const MentorForm = ({ mentor, onSave, onClose }) => {
    const getInitialFormData = () => {
        if (mentor) {
            return {
                ...mentor,
                expertise: mentor.expertise?.join(', ') || '',
                skills: mentor.skills?.join(', ') || '',
            };
        }
        return {
            id: undefined, name: '', email: '', bio: '', expertise: '', status: 'active',
            reviews: [], sessionCost: 0, title: '', company: '', skills: '',
            rating: 0, ratingsCount: 0, avatar: '', intro: '',
            professionalExperience: [], education: [],
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
        setFormData(prev => ({ ...prev, [section]: [...(prev[section] || []), item] }));
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
            toast({ title: 'Success!', description: isEditing ? 'Mentor updated.' : 'New mentor created.' });
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to save mentor: ${error.message}` });
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
                        <Textarea key={field.name} name={field.name} placeholder={field.placeholder} value={item[field.name]} onChange={(e) => handleDynamicChange(sectionKey, index, e)} rows={3} />
                        :
                         <Input key={field.name} name={field.name} type={field.type || 'text'} placeholder={field.placeholder} value={item[field.name]} onChange={(e) => handleDynamicChange(sectionKey, index, e)} />
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
                <SelectTrigger><SelectValue placeholder="Select account status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
            </Select>
             {renderDynamicSection('Professional Experience', 'professionalExperience',
                [{ name: 'title', placeholder: 'Job Title' }, { name: 'company', placeholder: 'Company' }, { name: 'duration', placeholder: 'Duration (e.g., 2020 - Present)' }, { name: 'description', placeholder: 'Description' }],
                { title: '', company: '', duration: '', description: '' }
            )}
            {renderDynamicSection('Education', 'education',
                [{ name: 'degree', placeholder: 'Degree' }, { name: 'institution', placeholder: 'Institution' }, { name: 'duration', placeholder: 'Duration (e.g., 2016 - 2020)' }],
                { degree: '', institution: '', duration: '' }
            )}
            {renderDynamicSection('Mentees Reviews', 'reviews',
                [{ name: 'mentee', placeholder: 'Mentee Name' }, { name: 'date', placeholder: 'Date (e.g., Nov 1, 2025)' }, { name: 'rating', placeholder: 'Rating (1-5)', type: 'number' }, { name: 'text', placeholder: 'Review Text' }],
                { mentee: '', date: '', rating: 5, text: '' }
            )}
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">{isEditing ? 'Save Changes' : 'Save Mentor'}</Button>
            </div>
        </form>
    );
};

const SessionForm = ({ session, mentors, onSave, onClose }) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const isEditing = !!session;

    const [formData, setFormData] = useState({
        title: '', mentorId: '', date: '', time: '', durationMinutes: 60, type: 'Free',
        price: 0, maxParticipants: 10, learningObjectives: '', whoIsItFor: '',
        setupRequirements: '', specialRequests: [], ...session,
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
        if (!firestore || !formData.mentorId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore or Mentor ID not available.' });
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
                mentorName: selectedMentor.name, isFree: formData.type === 'Free',
                price: Number(formData.price), maxParticipants: Number(formData.maxParticipants),
                durationMinutes: Number(formData.durationMinutes),
                learningObjectives: formData.learningObjectives.split('\n').map(s => s.trim()).filter(s => s),
                createdAt: sessionDateTime.toISOString(),
            };

            let sessionData;
            if (isEditing) {
                sessionData = commonData;
            } else {
                const jitsiRoomName = `MenteesSession-${uuidv4()}`;
                const jitsiLink = `https://meet.jit.si/${jitsiRoomName}`;
                sessionData = { ...commonData, jitsiLink: jitsiLink, bookedBy: [], status: 'scheduled' };
            }
        
            await onSave(sessionData, isEditing);
            toast({ title: 'Success!', description: isEditing ? 'Session updated.' : 'Session created.' });
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to save session: ${error.message}` });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" placeholder="Session Title" value={formData.title} onChange={handleChange} required />
            <Select onValueChange={(value) => handleSelectChange('mentorId', value)} value={formData.mentorId}>
                <SelectTrigger><SelectValue placeholder="Select a mentor" /></SelectTrigger>
                <SelectContent>{mentors.map(mentor => (<SelectItem key={mentor.id} value={mentor.id}>{mentor.name}</SelectItem>))}</SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
                <Input name="date" type="date" value={formData.date} onChange={handleChange} required />
                <Input name="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>
            <Input name="durationMinutes" type="number" placeholder="Duration (in minutes)" value={formData.durationMinutes} onChange={handleChange} required />
            <Select onValueChange={(value) => handleSelectChange('type', value)} value={formData.type}>
                <SelectTrigger><SelectValue placeholder="Select session type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
            </Select>
            {formData.type === 'Paid' && (<Input name="price" type="number" placeholder="Price (e.g., 50)" value={formData.price} onChange={handleChange} required />)}
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
    const [formData, setFormData] = useState({ type: 'Article', title: '', summary: '', content: '', link: '', ...tip });
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
            toast({ title: 'Success!', description: isEditing ? 'Tip updated.' : 'New tip created.' });
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to save tip: ${error.message}` });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Select onValueChange={handleTypeChange} value={formData.type}>
                <SelectTrigger><SelectValue placeholder="Select a tip type" /></SelectTrigger>
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

export default function AdminCreatePage() {
    const { isAdmin } = useUser();
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSaveMentor = async (mentorData: Omit<Mentor, 'id'> & { id?: string }, isEditing: boolean) => {
        if (!firestore) return;
        const mentorId = isEditing ? mentorData.id : uuidv4();
        if (!mentorId) {
            toast({ variant: "destructive", title: "Save Failed", description: "Mentor ID is missing." });
            return;
        }
        const mentorRef = doc(firestore, 'mentors', mentorId);
        await setDoc(mentorRef, { ...mentorData, id: mentorId }, { merge: true });
        // Optionally re-fetch mentors if needed on this page
    };

    const handleSaveSession = async (sessionData, isEditing) => {
        if (!firestore) return;
        const finalId = isEditing ? sessionData.id : doc(collection(firestore, 'sessions')).id;
        const sessionRef = doc(firestore, 'sessions', finalId);
        await setDoc(sessionRef, { ...sessionData, id: finalId }, { merge: true });
    };

    const handleSaveTip = async (tipData, isEditing) => {
        if (!firestore) return;
        const finalId = isEditing ? tipData.id : doc(collection(firestore, 'tips')).id;
        const tipRef = doc(firestore, 'tips', finalId);
        await setDoc(tipRef, { ...tipData, id: finalId, createdAt: new Date().toISOString() }, { merge: true });
    };

    const handleSaveCoupon = async (couponData) => {
        if (!firestore) return;
        const couponRef = doc(firestore, 'coupons', couponData.id);
        await setDoc(couponRef, couponData, { merge: true });
    };

    const openModal = (type, data = null) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null, data: null });
  
    const canWrite = isAdmin;

    return (
        <>
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-2 mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Content</h1>
                        <p className="text-gray-500 dark:text-gray-400">Add new mentors, sessions, tips, and coupons to the platform.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border-t-4 border-primary">
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
                        </div>
                    </div>
                </div>
            </main>
    
            {modalState.type === 'mentor' && canWrite && (
                <Modal title={modalState.data ? "Edit Mentor" : "Create New Mentor"} onClose={closeModal}>
                    <MentorForm mentor={modalState.data} onSave={handleSaveMentor} onClose={closeModal} />
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
        </>
    );
}
