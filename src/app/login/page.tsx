
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { initializeFirebase } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { GoogleAuthProvider, PhoneAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { Header } from '@/components/common/Header';

// Dynamically import firebaseui to ensure it's only run on the client
import('firebaseui/dist/firebaseui.css');

export default function LoginPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [firebaseui, setFirebaseui] = useState(null);
    const elementRef = useRef(null);

    // This state will hold the compat auth instance
    const [authCompat, setAuthCompat] = useState(null);

    // Load firebaseui and the compat auth instance on mount
    useEffect(() => {
        // Asynchronously import the firebaseui library
        import('firebaseui').then(firebaseui => {
            setFirebaseui(firebaseui);
        });
        
        // Get the compat auth instance from our initialized services
        const { authCompat: compatInstance } = initializeFirebase();
        setAuthCompat(compatInstance);

    }, []);

    // If user is logged in, redirect them
    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);


    useEffect(() => {
        // Wait until all dependencies are loaded
        if (!authCompat || !firebaseui || !elementRef.current) {
            return;
        }

        // Get the firebaseui instance
        let ui = firebaseui.auth.AuthUI.getInstance();
        if (!ui) {
            // Pass the COMPAT auth instance here
            ui = new firebaseui.auth.AuthUI(authCompat);
        }

        const uiConfig = {
            signInFlow: 'popup',
            signInSuccessUrl: '/',
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
                    requireDisplayName: false
                }
            ],
            callbacks: {
                signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                    const user = authResult.user;
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
                                    role: 'user'
                                });
                            }
                        });
                    }
                    // We handle the redirect ourselves in the main useEffect hook.
                    return false;
                },
            },
            tosUrl: '/terms',
            privacyPolicyUrl: '/privacy'
        };

        // Start the FirebaseUI Auth interface
        ui.start(elementRef.current, uiConfig);
        
        // Cleanup function
        return () => {
             if (ui) {
                try {
                    ui.reset();
                } catch (e) {
                    console.error('Error resetting FirebaseUI:', e);
                }
            }
        };

    }, [authCompat, firebaseui, firestore]);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Welcome
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Sign in to continue to Guidelab
                        </p>
                    </div>

                    <div ref={elementRef} id="firebaseui-auth-container" />
                </div>
            </div>
        </div>
    );
}
