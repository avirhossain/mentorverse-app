'use client';
import React from 'react';
import { Shield, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
    const auth = useAuth();

    const handleLogin = (role: 'admin' | 'user') => {
        if (!auth) {
            console.error("Auth service is not available.");
            // Optionally, show a toast or alert to the user
            return;
        }

        const email = role === 'admin' ? 'admin@mentees.com' : 'user@mentees.com';
        const password = 'password123'; // A dummy password for this simulated login

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                console.log(`${role} signed in:`, userCredential.user);
                // Navigation will be handled by the Link component's href
            })
            .catch((error) => {
                // If the user doesn't exist, create it for this simulation
                if (error.code === 'auth/user-not-found') {
                    console.log('User not found, creating a new one for simulation...');
                    import('firebase/auth').then(({ createUserWithEmailAndPassword }) => {
                        createUserWithEmailAndPassword(auth, email, password)
                            .then((userCredential) => {
                                console.log(`New ${role} user created and signed in:`, userCredential.user);
                            })
                            .catch((createError) => {
                                console.error(`Error creating ${role} user:`, createError);
                            });
                    });
                } else {
                    console.error(`Error signing in as ${role}:`, error);
                }
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 font-sans">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border-t-8 border-primary transform hover:scale-[1.01] transition duration-300 space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Guidelab</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Select your role to continue.</p>
                    </div>

                    <div className="space-y-6">
                        <Link href="/admin" passHref>
                            <button
                                onClick={() => handleLogin('admin')}
                                className="w-full flex items-center justify-center p-4 font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition duration-150 shadow-lg transform hover:scale-[1.02]"
                            >
                                <Shield className="w-6 h-6 mr-3" />
                                <span className="flex-1 text-left">Login as Admin</span>
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </Link>

                        <Link href="/home" passHref>
                            <button
                                onClick={() => handleLogin('user')}
                                className="w-full flex items-center justify-center p-4 font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition duration-150 shadow-lg transform hover:scale-[1.02]"
                            >
                                <User className="w-6 h-6 mr-3" />
                                <span className="flex-1 text-left">Login as User / Mentee</span>
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
