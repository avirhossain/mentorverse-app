
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
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
            // 1. Attempt to sign in the user
            await signInWithEmailAndPassword(auth, values.email, values.password);
        } catch (error: any) {
            // 2. If sign-in fails because the user doesn't exist, create them
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                try {
                    await createUserWithEmailAndPassword(auth, values.email, values.password);
                } catch (creationError: any) {
                    toast({
                        variant: 'destructive',
                        title: 'Admin Creation Failed',
                        description: creationError.message || 'Could not create the admin account.',
                    });
                    setIsLoading(false);
                    return;
                }
            } else {
                // Handle other sign-in errors
                toast({
                    variant: 'destructive',
                    title: 'Admin Login Failed',
                    description: error.message || 'Could not sign in. Please check credentials.',
                });
                setIsLoading(false);
                return;
            }
        }
        
        // 3. On success (either login or creation), redirect to the admin dashboard.
        // The AdminLayout will handle the final authorization check.
        toast({
            title: 'Login Successful',
            description: 'Redirecting to the dashboard...',
        });
        router.push('/admin');
        
        setIsLoading(false);
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
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
