
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function AdminLoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof adminLoginSchema>>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const setAdminClaim = async (user: User) => {
        try {
            const response = await fetch('/api/set-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid }),
            });
            const data = await response.json();
            if (!response.ok) {
                console.error("Server returned:", response.status, data);
                throw new Error(data.error || 'Failed to set admin claim.');
            }
        } catch (error) {
            console.error('Error setting admin claim:', error);
            throw error; // re-throw to be caught by the caller
        }
    };

    const handleAdminLogin = async (values: z.infer<typeof adminLoginSchema>) => {
        if (!auth) return;
        
        const hardcodedAdminEmail = 'mmavir89@gmail.com';
        if (values.email.toLowerCase() !== hardcodedAdminEmail) {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'This email is not authorized for admin access.',
            });
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            
            if (!userCredential) {
                throw new Error("Could not sign in admin user.");
            }

            // Set the custom claim and then force a token refresh.
            await setAdminClaim(userCredential.user);
            await userCredential.user.getIdTokenResult(true); 

            toast({
                title: 'Admin Access Granted',
                description: 'Redirecting to the dashboard...',
            });

            router.push('/admin');

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Admin Login Failed',
                description: error.message || 'Could not grant admin access. Please check credentials.',
            });
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-background">
            <Header currentView="admin" />
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                    <div className="text-center">
                        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Admin Access
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Sign in to the admin dashboard.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAdminLogin)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin@example.com" {...field} />
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
                                {isLoading ? 'Signing In...' : 'Sign In as Admin'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 pt-6 border-t">
                         <Button variant="secondary" className="w-full" onClick={() => router.push('/')}>
                            Go to Homepage
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
