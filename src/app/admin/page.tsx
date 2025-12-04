'use client';
import React, { useState, useEffect } from 'react';
import { FilePlus, Users as UsersIcon, X, PlusCircle, Trash2 } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

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

const MentorForm = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        company: '',
        intro: '',
        skills: '',
        avatar: 'https://placehold.co/150x150/4F46E5/FFFFFF?text=New',
        professionalExperience: [],
        education: [],
        sessions: [],
        availability: [],
        reviews: [],
    });
    const { toast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        const newMentor = {
            ...formData,
            id: uuidv4(),
            rating: formData.reviews.length > 0 ? formData.reviews.reduce((acc, r) => acc + Number(r.rating), 0) / formData.reviews.length : 0,
            ratingsCount: formData.reviews.length,
            skills: formData.skills.split(',').map(s => s.trim()),
            sessions: formData.sessions.map(s => ({...s, price: Number(s.price), duration: Number(s.duration)})),
            availability: formData.availability.map(a => ({...a, id: Math.random()})),
            reviews: formData.reviews.map(r => ({...r, rating: Number(r.rating)})),
        };
        
        try {
            await onSave(newMentor);
            toast({
                title: 'Success!',
                description: 'New mentor profile has been created.',
            });
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
            <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            <Input name="title" placeholder="Job Title (e.g., Staff Software Engineer)" value={formData.title} onChange={handleChange} required />
            <Input name="company" placeholder="Company (e.g., Google)" value={formData.company} onChange={handleChange} required />
            <Input name="avatar" placeholder="Profile Picture URL" value={formData.avatar} onChange={handleChange} />
            <Input name="skills" placeholder="Skills (comma-separated, e.g., React, System Design)" value={formData.skills} onChange={handleChange} required />
            <Textarea name="intro" placeholder="Mentor Introduction" value={formData.intro} onChange={handleChange} required />

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
                <Button type="submit">Save Mentor</Button>
            </div>
        </form>
    );
};

const SessionForm = ({ onSave, onClose }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        mentorName: '',
        date: '',
        time: '',
        seats: 10,
        durationMinutes: 60,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newSession = {
            ...formData,
            id: uuidv4(),
            isFree: true,
            seats: Number(formData.seats),
            durationMinutes: Number(formData.durationMinutes),
        };
        
        try {
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
            <Input name="mentorName" placeholder="Mentor Name" value={formData.mentorName} onChange={handleChange} required />
            <Input name="date" type="text" placeholder="Date (e.g., 25th December)" value={formData.date} onChange={handleChange} required />
            <Input name="time" type="text" placeholder="Time (e.g., 11:00 AM)" value={formData.time} onChange={handleChange} required />
            <Input name="seats" type="number" placeholder="Available Seats" value={formData.seats} onChange={handleChange} required />
            <Input name="durationMinutes" type="number" placeholder="Duration (in minutes)" value={formData.durationMinutes} onChange={handleChange} required />
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Session</Button>
            </div>
        </form>
    );
};


export default function AdminPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!user && !isUserLoading && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleSaveMentor = (mentorData) => {
    if (!firestore) return;
    const mentorsCol = collection(firestore, 'mentors');
    return addDocumentNonBlocking(mentorsCol, mentorData);
  };
  
  const handleSaveSession = (sessionData) => {
    if (!firestore) return;
    const sessionsCol = collection(firestore, 'sessions');
    return addDocumentNonBlocking(sessionsCol, sessionData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <UsersIcon className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Mentors</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create, edit, and view mentor profiles. Data is saved directly to Firestore.
                </p>
                <Button
                  onClick={() => setShowMentorModal(true)}
                  className="mt-2"
                >
                  Create New Mentor
                </Button>
              </div>
              <div className="flex flex-col items-start gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <FilePlus className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold dark:text-white">Manage Sessions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create unique, bookable sessions offered by mentors, saved to Firestore.
                </p>
                <Button
                  onClick={() => setShowSessionModal(true)}
                  className="mt-2"
                >
                  Create New Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showMentorModal && (
        <Modal title="Create New Mentor" onClose={() => setShowMentorModal(false)}>
          <MentorForm onSave={handleSaveMentor} onClose={() => setShowMentorModal(false)} />
        </Modal>
      )}

      {showSessionModal && (
        <Modal title="Create New Session" onClose={() => setShowSessionModal(false)}>
          <SessionForm onSave={handleSaveSession} onClose={() => setShowSessionModal(false)} />
        </Modal>
      )}
    </div>
  );
}
