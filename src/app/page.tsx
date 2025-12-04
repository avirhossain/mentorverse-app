'use client';
import React from 'react';
import { User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 font-sans">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border-t-8 border-primary transform hover:scale-[1.01] transition duration-300 space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Guidelab</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Your journey to mastery starts here.</p>
                    </div>

                    <div className="space-y-6">
                        <Link href="/home" passHref>
                            <button className="w-full flex items-center justify-center p-4 font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition duration-150 shadow-lg transform hover:scale-[1.02]">
                                <User className="w-6 h-6 mr-3" />
                                <span className="flex-1 text-left">Explore as a Guest</span>
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </Link>
                    </div>
                     <div className="text-center text-xs text-gray-500">
                        <p>Admin access is available at the <Link href="/admin" className="text-primary hover:underline">/admin</Link> route.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
