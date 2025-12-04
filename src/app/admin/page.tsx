'use client';
import React, { useState, useEffect } from 'react';
import { FilePlus, Users as UsersIcon, X } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useUser } from '@/firebase';


const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
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
    skills: '',
    intro: '',
    avatar: 'https://placehold.co/150x150/4F46E5/FFFFFF?text=New',
  });
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newMentor = {
      ...formData,
      id: uuidv4(), // Generate a unique string ID
      rating: 0,
      ratingsCount: 0,
      skills: formData.skills.split(',').map(s => s.trim()),
      professionalExperience: [],
      education: [],
      sessions: [],
      availability: [],
      reviews: [],
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
      <Input name="title" placeholder="Job Title (e.g., Staff Software Engineer)" value={formData.title} onChange={handleChange} required />
      <Input name="company" placeholder="Company (e.g., Google)" value={formData.company} onChange={handleChange} required />
      <Input name="skills" placeholder="Skills (comma-separated, e.g., React, System Design)" value={formData.skills} onChange={handleChange} required />
      <Textarea name="intro" placeholder="Mentor Introduction" value={formData.intro} onChange={handleChange} required />
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
            id: uuidv4(), // Generate a unique string ID
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
    // If there's no user and we're not in the middle of loading one, sign in anonymously.
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleSaveMentor = (mentorData) => {
    const mentorsCol = collection(firestore, 'mentors');
    return addDocumentNonBlocking(mentorsCol, mentorData);
  };
  
  const handleSaveSession = (sessionData) => {
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
