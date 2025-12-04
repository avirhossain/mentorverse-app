'use client';
import React from 'react';
import { Shield, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 font-sans">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border-t-8 border-primary transform hover:scale-[1.01] transition duration-300 space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Guidelab</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Welcome! Please select your entry point.</p>
                    </div>

                    <div className="space-y-6">
                        <Link href="/admin" passHref>
                            <button className="w-full flex items-center justify-center p-4 font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition duration-150 shadow-lg transform hover:scale-[1.02]">
                                <Shield className="w-6 h-6 mr-3" />
                                <span className="flex-1 text-left">Login as Admin</span>
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </Link>

                        <Link href="/" passHref>
                            <button className="w-full flex items-center justify-center p-4 font-bold rounded-xl text-primary bg-primary/10 hover:bg-primary/20 transition duration-150 shadow-lg transform hover:scale-[1.02]">
                                <User className="w-6 h-6 mr-3" />
                                <span className="flex-1 text-left">Continue as Guest User</span>
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
