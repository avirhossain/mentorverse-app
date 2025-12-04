
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
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

const FacebookIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" {...props}>
        <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path>
        <path fill="#fff" d="M26.572,29.036h4.917l0.772-5.694h-5.689v-3.642c0-1.646,0.455-2.768,2.816-2.768l3.023,0v-5.094c-0.523-0.069-2.311-0.224-4.389-0.224c-4.438,0-7.486,2.713-7.486,7.696v4.033H16v5.694h4.593v13.729C21.902,42.87,22.939,43,24,43c0.41,0,0.814-0.02,1.21-0.057V29.036z"></path>
    </svg>
);


export default function LoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();

    const handleProviderSignIn = async (provider) => {
        if (!auth || !firestore) {
            console.error("Auth or Firestore service is not available.");
            return;
        }

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

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
            
            if (user.email === 'mmavir89@gmail.com') {
                router.push('/admin');
            } else {
                router.push('/');
            }

        } catch (error) {
            console.error(`Error during ${provider.providerId} Sign-In:`, error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
                <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Welcome
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Sign in to continue to Guidelab
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button 
                            onClick={() => handleProviderSignIn(new GoogleAuthProvider())} 
                            className="w-full text-lg font-semibold py-6 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        >
                            <GoogleIcon className="mr-3"/>
                            Sign in with Google
                        </Button>

                        <Button 
                            onClick={() => handleProviderSignIn(new FacebookAuthProvider())} 
                            className="w-full text-lg font-semibold py-6 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        >
                            <FacebookIcon className="mr-3"/>
                            Sign in with Facebook
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
