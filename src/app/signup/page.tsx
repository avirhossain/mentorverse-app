
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { GoogleAuthProvider, PhoneAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { Header } from '@/components/common/Header';

// Dynamically import firebaseui to ensure it's only run on the client
import('firebaseui/dist/firebaseui.css');

export default function SignUpPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [firebaseui, setFirebaseui] = useState(null);
    const elementRef = useRef(null);
    const [authCompat, setAuthCompat] = useState(null);

    useEffect(() => {
        import('firebaseui').then(firebaseui => {
            setFirebaseui(firebaseui);
        });
        
        const { authCompat: compatInstance } = initializeFirebase();
        setAuthCompat(compatInstance);

    }, []);

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/account'); // Redirect logged-in users to their account
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        if (!authCompat || !firebaseui || !elementRef.current) {
            return;
        }

        let ui = firebaseui.auth.AuthUI.getInstance();
        if (!ui) {
            ui = new firebaseui.auth.AuthUI(authCompat);
        }

        const uiConfig = {
            signInFlow: 'redirect',
            signInSuccessUrl: '/account',
            signInOptions: [
                GoogleAuthProvider.PROVIDER_ID,
                {
                    provider: PhoneAuthProvider.PROVIDER_ID,
                    recaptchaParameters: {
                        type: 'image',
                        size: 'invisible',
                        badge: 'bottomleft'
                    },
                    defaultCountry: 'BD'
                },
                {
                    provider: EmailAuthProvider.PROVIDER_ID,
                    requireDisplayName: true, // Ask for name on sign-up
                }
            ],
            callbacks: {
                signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                    const user = authResult.user;
                    // Check if it's a new user and create their profile document
                    if (authResult.additionalUserInfo.isNewUser && firestore) {
                        const userDocRef = doc(firestore, "users", user.uid);
                        getDoc(userDocRef).then(userDocSnap => {
                            if (!userDocSnap.exists()) {
                                setDoc(userDocRef, {
                                    id: user.uid,
                                    email: user.email,
                                    name: user.displayName,
                                    phone: user.phoneNumber,
                                    balance: 0,
                                    interests: [],
                                    mentorshipGoal: '',
                                    status: 'active',
                                });
                            }
                        });
                    }
                    // Let FirebaseUI handle the redirect on success.
                    return true;
                },
            },
        };

        ui.start(elementRef.current, uiConfig);
        
        return () => {
             if (ui) {
                try {
                    ui.reset();
                } catch (e) {
                    console.error('Error resetting FirebaseUI:', e);
                }
            }
        };

    }, [authCompat, firebaseui, firestore, router]);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Create an Account
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Join Guidelab to start your journey
                        </p>
                    </div>

                    <div ref={elementRef} id="firebaseui-auth-container" />
                    
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
