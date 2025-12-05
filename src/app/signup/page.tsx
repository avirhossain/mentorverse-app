
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useUser, useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  identifier: z.string().min(1, { message: 'Email or phone number is required.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

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
    
    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/account');
        }
    }, [user, isUserLoading, router]);
    
    const createUserProfile = async (user, extraData = {}) => {
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
                role: 'user',
                ...extraData,
            });
        }
    };

    const handleSignUp = async (values: z.infer<typeof signupSchema>) => {
        if (!auth) return;
        setIsLoading(true);

        const { name, identifier, password } = values;
        const isPhoneNumber = /^\d+$/.test(identifier);

        if (isPhoneNumber) {
            alert('Phone number sign-up is coming soon! Please use an email address.');
            setIsLoading(false);
            // Example of how it might work in the future:
            // const fullPhoneNumber = `+88${identifier}`;
            // ... logic for SMS verification ...
            // After verification, create user and profile
            // const userCredential = await ...;
            // await createUserProfile(userCredential.user, { phone: fullPhoneNumber });
            return;
        }

        // Treat as email
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, identifier, password);
            await updateProfile(userCredential.user, { displayName: name });
            await createUserProfile(userCredential.user);
            toast({ title: 'Success', description: 'Account created successfully!' });
            router.push('/account');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: error.code === 'auth/email-already-in-use' 
                    ? 'This email is already registered. Please sign in.'
                    : error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        if (!auth) return;
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await createUserProfile(result.user);
            toast({ title: 'Success', description: 'Account created successfully!' });
            router.push('/account');
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
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
                                            <Input placeholder="name@example.com or 01..." {...field} />
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
                        <Mail className="mr-2 h-4 w-4" /> Google
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
