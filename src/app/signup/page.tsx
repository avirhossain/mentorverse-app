
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useUser, useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';


const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  identifier: z.string().min(1, { message: 'Email or phone number is required.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const FIRST_ADMIN_EMAIL = 'mmavir89@gmail.com';

export default function SignUpPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: '',
            identifier: '',
            password: '',
        },
    });

    const setAdminClaim = async (uid: string) => {
        try {
            await fetch('/api/set-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, admin: true }),
            });
        } catch (error) {
            console.error("Failed to set admin claim:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to set admin claim.' });
        }
    };
    
    const createUserProfile = async (user: User, extraData = {}) => {
        if (!firestore) return;
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
                ...extraData,
            });
        }
    };

    const handleRedirect = async (user: User) => {
        await createUserProfile(user);
        
        if (user.email === FIRST_ADMIN_EMAIL) {
            await setAdminClaim(user.uid);
        }

        const idTokenResult = await user.getIdTokenResult(true); // Force refresh claims
        
        if (idTokenResult.claims.admin) {
            router.push('/admin');
        } else {
            // All users from sign-up are new, so redirect to account page
            router.push('/account');
        }
    }
    
    useEffect(() => {
        if (!isUserLoading && user) {
            handleRedirect(user);
        }
    }, [user, isUserLoading, router]);

    const handleSignUp = async (values: z.infer<typeof signupSchema>) => {
        if (!auth) return;
        setIsLoading(true);

        const { name, identifier, password } = values;
        const isPhoneNumber = /^\d+$/.test(identifier);

        if (isPhoneNumber) {
            alert('Phone number sign-up is coming soon! Please use an email address.');
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, identifier, password);
            await updateProfile(userCredential.user, { displayName: name });
            await handleRedirect(userCredential.user);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: error.code === 'auth/email-already-in-use' 
                    ? 'This email is already registered. Please sign in.'
                    : error.message || 'An unexpected error occurred.',
            });
             setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        if (!auth) return;
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await handleRedirect(result.user);
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: error.message || 'An unexpected error occurred.',
            });
             setIsLoading(false);
        }
    };

    if (isUserLoading || user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-background">
            <Header currentView="signup"/>
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

                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="identifier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email or Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com or +88..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>
                    </Form>

                     <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.4l-64.3 64.3c-35.2-30.3-81.2-48.4-112.9-48.4-98.2 0-178.5 80.3-178.5 178.5s80.3 178.5 178.5 178.5c110.3 0 162-72.7 167-109.8H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg> Google
                    </Button>

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

    