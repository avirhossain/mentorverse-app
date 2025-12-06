
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useAdminUser } from '@/firebase';
import { signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const adminLoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function AdminLoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { isAdmin, isAuthCheckComplete } = useAdminUser();

    const form = useForm<z.infer<typeof adminLoginSchema>>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: 'mmavir89@gmail.com',
            password: '123456',
        },
    });

    useEffect(() => {
        if (isAuthCheckComplete && isAdmin) {
            router.push('/admin');
        }
    }, [isAdmin, isAuthCheckComplete, router]);

    const handleAdminLogin = async (values: z.infer<typeof adminLoginSchema>) => {
        if (!auth) {
            toast({ variant: 'destructive', title: 'Authentication service not available.' });
            return;
        }
        
        setIsLoading(true);

        try {
            // This just signs the user in. The useAdminUser hook will handle verification.
            await signInWithEmailAndPassword(auth, values.email, values.password);

            // After login, the useAdminUser hook will automatically run,
            // get the token, check claims, and update its state,
            // which will trigger the useEffect above to redirect if successful.
            toast({ title: 'Login Successful', description: 'Verifying admin status...' });
            
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Admin Login Failed',
                description: 'Invalid credentials or an unexpected error occurred.',
            });
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
            toast({ title: 'Logged Out', description: 'You have been successfully signed out.' });
        }
    };
    
    const renderContent = () => {
        if (!isAuthCheckComplete) {
            return (
                <div className="text-center">
                    <p>Loading...</p>
                </div>
            );
        }

        // This case handles a non-admin who is already logged in, or a failed admin login.
        if (isAuthCheckComplete && !isAdmin) {
             return (
                <>
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
                                            <Input type="email" placeholder="admin@example.com" {...field} />
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
                                {isLoading ? 'Verifying...' : 'Sign in as Admin'}
                            </Button>
                        </form>
                    </Form>

                    {auth?.currentUser && (
                         <div className="text-center mt-6">
                            <p className="text-sm text-gray-600 mb-2">
                                Signed in as a non-admin user.
                            </p>
                            <Button onClick={handleLogout} className="w-full" variant="destructive">
                                <LogOut className="w-4 h-4 mr-2" />
                                Log Out and Try Again
                            </Button>
                        </div>
                    )}
                </>
            );
        }

        return null;
    }

    if (isAuthCheckComplete && isAdmin) {
        return (
             <div className="flex items-center justify-center min-h-screen">
                <p>Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header currentView="admin" />
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
