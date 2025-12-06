'use client';
import React from 'react';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header currentView="home" />

            <main className="flex-grow">
                <section className="bg-primary/10 py-20 md:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            Find Your Perfect Mentor
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                            Connect with experienced professionals who can guide you on your career journey. Our AI-powered platform helps you find the ideal match.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Button asChild size="lg">
                                <Link href="#">Browse Mentors</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="#">Get Started</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="p-6 border rounded-lg shadow-sm">
                                <h3 className="text-xl font-semibold mb-2">1. Create Profile</h3>
                                <p className="text-gray-600">Tell us about your goals and interests.</p>
                            </div>
                            <div className="p-6 border rounded-lg shadow-sm">
                                <h3 className="text-xl font-semibold mb-2">2. Get Matched</h3>
                                <p className="text-gray-600">Our AI finds the best mentors for you.</p>
                            </div>
                            <div className="p-6 border rounded-lg shadow-sm">
                                <h3 className="text-xl font-semibold mb-2">3. Start Learning</h3>
                                <p className="text-gray-600">Schedule sessions and grow your skills.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
