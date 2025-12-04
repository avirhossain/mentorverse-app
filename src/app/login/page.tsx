
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/Header';

const GoogleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();

    const handleGoogleSignIn = async () => {
        if (!auth || !firestore) {
            console.error("Auth or Firestore service is not available.");
            return;
        }

        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore, if not, create them
            const userDocRef = doc(firestore, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                    balance: 0,
                    interests: [],
                    mentorshipGoal: '',
                    status: 'active',
                });
            }
            
            // Redirect based on admin email
            if (user.email === 'mmavir89@gmail.com') {
                router.push('/admin');
            } else {
                router.push('/');
            }

        } catch (error) {
            console.error("Error during Google Sign-In:", error);
            // Handle errors here, e.g., show a toast notification
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
                <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Sign in to continue to Guidelab
                        </p>
                    </div>

                    <Button 
                        onClick={handleGoogleSignIn} 
                        className="w-full text-lg font-semibold py-6 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    >
                        <GoogleIcon className="mr-3"/>
                        Sign in with Google
                    </Button>
                </div>
            </div>
        </div>
    );
}
