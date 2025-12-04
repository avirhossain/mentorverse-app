'use client';

import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Phone, FileText as ProfileIcon, Send, CheckCircle } from 'lucide-react';

export default function BecomeAMentorPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [summary, setSummary] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate an API call to submit the application
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
            setName('');
            setPhone('');
            setSummary('');
        }, 1000);
    };

    return (
        <div className="bg-background dark:bg-gray-900 min-h-screen">
            <Header />
            <main className="max-w-2xl mx-auto p-4 sm:p-8">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">Become a Mentor</h1>
                    <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Join our community of experts and help shape the next generation of talent.</p>
                </header>

                <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-xl shadow-xl border-t-4 border-primary">
                    {isSubmitted ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Application Received!</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Thank you for your interest in becoming a mentor. We have received your application and will get back to you within 24 hours.
                            </p>
                            <Button onClick={() => setIsSubmitted(false)} className="mt-6">
                                Submit Another Application
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="name" className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    <User className="w-5 h-5 mr-2 text-primary" /> Full Name
                                </Label>
                                <Input 
                                    id="name" 
                                    type="text" 
                                    placeholder="Enter your full name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone" className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    <Phone className="w-5 h-5 mr-2 text-primary" /> Phone Number
                                </Label>
                                <Input 
                                    id="phone" 
                                    type="tel" 
                                    placeholder="Enter your contact number" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required 
                                />
                            </div>
                            <div>
                                <Label htmlFor="summary" className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    <ProfileIcon className="w-5 h-5 mr-2 text-primary" /> Profile Summary
                                </Label>
                                <Textarea 
                                    id="summary"
                                    placeholder="Briefly describe your experience, expertise, and why you want to be a mentor..." 
                                    rows={6}
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <Button type="submit" className="w-full font-bold text-lg" disabled={isLoading}>
                                    {isLoading ? 'Submitting...' : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" /> Submit Application
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
