
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useUser, useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const loginSchema = z.object({
  identifier: z.string().min(1, { message: 'Email or phone number is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const ADMIN_EMAIL = 'mmavir89@gmail.com';

export default function LoginPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    });

    const setAdminClaim = async (uid: string) => {
        try {
            const response = await fetch('/api/set-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to set admin claim.');
            }
        } catch (error) {
            console.error("Failed to set admin claim:", error);
            // Non-blocking, but shows an error to the user
            toast({ variant: 'destructive', title: 'Admin Grant Failed', description: error.message });
        }
    };

    const createUserProfile = async (user: User): Promise<{ isNewUser: boolean }> => {
        if (!firestore) return { isNewUser: false };
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let isNewUser = !userDocSnap.exists();

        if (isNewUser) {
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
        
        return { isNewUser };
    };

    const handleRedirect = async (user: User) => {
        const { isNewUser } = await createUserProfile(user);

        if (user.email === ADMIN_EMAIL) {
            await setAdminClaim(user.uid);
        }

        const idTokenResult = await user.getIdTokenResult(true); 
        
        if (idTokenResult.claims.admin) {
            router.push('/admin');
        } else if (isNewUser) {
            router.push('/account');
        } else {
            router.push('/');
        }
    }

    useEffect(() => {
        if (!isUserLoading && user) {
            handleRedirect(user);
        }
    }, [user, isUserLoading]);

    const handleLogin = async (values: z.infer<typeof loginSchema>) => {
        if (!auth) return;
        setIsLoading(true);

        const { identifier, password } = values;
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
            await handleRedirect(userCredential.user);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials'
                    ? 'Invalid email or password. Please try again.'
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
                title: 'Login Failed',
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

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
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
                                        <div className="flex justify-between items-center">
                                            <FormLabel>Password</FormLabel>
                                            <Link href="/forgot-password" passHref>
                                                <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                                                    Forgot Password?
                                                </span>
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
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
