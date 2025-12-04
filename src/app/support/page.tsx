
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Phone, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function SupportPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
            setName('');
            setPhone('');
            setDetails('');
        }, 1000);
    };

    return (
        <div className="bg-background dark:bg-gray-900 min-h-screen">
            <Header />
            <main className="max-w-2xl mx-auto p-4 sm:p-8">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">Support Center</h1>
                    <p className="mt-2 text-md text-gray-500 dark:text-gray-400">We're here to help. Fill out the form below and we'll get back to you.</p>
                </header>

                <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-xl shadow-xl border-t-4 border-primary">
                    {isSubmitted ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Thank You!</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Your request has been submitted successfully. We will look into it and get back to you as soon as possible.
                            </p>
                            <Button onClick={() => setIsSubmitted(false)} className="mt-6">
                                Submit Another Request
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
                                    placeholder="Enter your phone number" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required 
                                />
                            </div>
                            <div>
                                <Label htmlFor="details" className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    <MessageSquare className="w-5 h-5 mr-2 text-primary" /> Support Details
                                </Label>
                                <Textarea 
                                    id="details"
                                    placeholder="Please describe your issue in detail..." 
                                    rows={6}
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <Button type="submit" className="w-full font-bold text-lg" disabled={isLoading}>
                                    {isLoading ? 'Submitting...' : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" /> Submit Request
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
