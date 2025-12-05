
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { GoogleAuthProvider, PhoneAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { Header } from '@/components/common/Header';

// Dynamically import firebaseui to ensure it's only run on the client
import('firebaseui/dist/firebaseui.css');

export default function LoginPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const [firebaseui, setFirebaseui] = useState(null);
    const elementRef = useRef(null);

    useEffect(() => {
        // Using dynamic import for firebaseui
        import('firebaseui').then(ui => setFirebaseui(ui));
    }, []);

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/account');
        }
    }, [user, isUserLoading, router]);


    useEffect(() => {
        if (!auth || !firebaseui || !elementRef.current) {
            return;
        }

        let ui = firebaseui.auth.AuthUI.getInstance();
        if (!ui) {
            ui = new firebaseui.auth.AuthUI(auth);
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
                    signInMethod: EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
                    requireDisplayName: false, // Explicitly false for sign-in
                }
            ],
            callbacks: {
                signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                    // This callback is not invoked with a redirect flow.
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

    }, [auth, firebaseui]);

    return (
        <div className="min-h-screen bg-background">
            <Header currentView="login"/>
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Sign in to continue to Guidelab
                        </p>
                    </div>

                    <div ref={elementRef} id="firebaseui-auth-container" />
                    
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-medium text-primary hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
